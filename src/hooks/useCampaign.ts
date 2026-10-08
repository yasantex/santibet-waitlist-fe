'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  apiClient,
  useSantibetQuery,
  useSantibetMutation,
} from '../data_layer/utils'
import { shallowEqual } from 'react-redux'
import { useAppSelector } from '../redux/hooks'
import {
  selectDeviceTokens,
  selectHasVerifiedDevice,
} from '../redux/campaignSlice'
import type {
  ActivityItem,
  ActivityToasts,
  Campaign,
  CampaignRules,
  CampaignStats,
  LeaderboardEntry,
  ParticipantStanding,
  PredictionResult,
  PreviousQuestion,
  SendVerificationResult,
  TodayQuestion,
  Winning,
} from '../types/campaign'

const CAMPAIGNS_BASE = '/api/campaigns'
const ACTIVE_CAMPAIGN_SLUG = process.env.NEXT_PUBLIC_CAMPAIGN_SLUG

/** Reads the first AWAITING_CODE-friendly message off an axios error from the campaigns API. */
export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

/** Every key this device holds, newest first. Web gets them all from the cookie instead. */
function useCampaignAuthHeaders(): Record<string, string> {
  const deviceTokens = useAppSelector(selectDeviceTokens, shallowEqual)
  return deviceTokens.length > 0
    ? { 'X-Campaign-Token': deviceTokens.join(',') }
    : {}
}

/**
 * The campaign this coming-soon site plays, fixed by NEXT_PUBLIC_CAMPAIGN_SLUG.
 */
export function useActiveCampaign() {
  const query = useSantibetQuery<Campaign>({
    path: `${CAMPAIGNS_BASE}/${ACTIVE_CAMPAIGN_SLUG}`,
    enabled: Boolean(ACTIVE_CAMPAIGN_SLUG),
    queryOptions: {
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  })

  const activeCampaign = useMemo(() => query.data ?? null, [query.data])

  return { ...query, activeCampaign }
}

export function useCampaignStats(slug: string | null | undefined) {
  return useSantibetQuery<CampaignStats>({
    path: `${CAMPAIGNS_BASE}/${slug}/stats`,
    enabled: Boolean(slug),
    queryOptions: { refetchInterval: 30_000 },
  })
}

export function useCampaignRules(slug: string | null | undefined) {
  return useSantibetQuery<CampaignRules>({
    path: `${CAMPAIGNS_BASE}/${slug}/rules`,
    enabled: Boolean(slug),
    queryOptions: { staleTime: 5 * 60_000 },
  })
}

export function useCampaignActivity(
  slug: string | null | undefined,
  limit = 8,
) {
  return useSantibetQuery<{ data: ActivityItem[] }>({
    path: `${CAMPAIGNS_BASE}/${slug}/activity`,
    enabled: Boolean(slug),
    params: { limit },
    queryOptions: { refetchInterval: 20_000 },
  })
}

/** Stable identity for an activity row, so stream frames and /activity refetches can be merged. */
export function activityKey(item: ActivityItem) {
  return `${item.type}|${item.player}|${item.at}`
}

const STREAM_REOPEN_MIN_MS = 5_000
const STREAM_REOPEN_MAX_MS = 60_000

/**
 * Keeps one live connection to the campaign's activity stream for as long as the caller is
 * mounted. `activity` frames are prepended into the cached /activity lists the ticker reads;
 * `toasts` frames are handed to `onToasts`.
 *
 * EventSource reconnects by itself (sending Last-Event-ID, so the server catches us up) after a
 * dropped connection. It gives up for good on a non-200 such as the 503 STREAM_CAPACITY, so in
 * that case we reopen it ourselves with backoff, resuming from the last `asOf` we saw.
 */
export function useCampaignActivityStream(
  slug: string | null | undefined,
  onToasts: (toasts: ActivityToasts) => void,
) {
  const queryClient = useQueryClient()
  const onToastsRef = useRef(onToasts)

  useEffect(() => {
    onToastsRef.current = onToasts
  }, [onToasts])

  useEffect(() => {
    if (!slug || typeof EventSource === 'undefined') return

    const activityPath = `${CAMPAIGNS_BASE}/${slug}/activity`
    const streamUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}${activityPath}/stream`
    let source: EventSource | null = null
    let reopenTimer: ReturnType<typeof setTimeout> | undefined
    let reopenDelay = STREAM_REOPEN_MIN_MS
    let lastAsOf: string | null = null
    let closed = false

    const prependActivity = (items: ActivityItem[]) => {
      if (items.length === 0) return
      queryClient
        .getQueryCache()
        .findAll({ queryKey: [activityPath] })
        .forEach(({ queryKey }) => {
          // Each cached list keeps the length it was asked for.
          const limit = (queryKey[1] as { limit?: number } | undefined)?.limit
          queryClient.setQueryData<{ data: ActivityItem[] }>(queryKey, (old) => {
            if (!old) return old
            // A focus refetch may already hold what a catch-up frame replays.
            const seen = new Set(old.data.map(activityKey))
            const fresh = items.filter((item) => !seen.has(activityKey(item)))
            if (fresh.length === 0) return old
            const data = [...fresh, ...old.data]
            return { ...old, data: limit ? data.slice(0, limit) : data }
          })
        })
    }

    const open = () => {
      const url = lastAsOf
        ? `${streamUrl}?since=${encodeURIComponent(lastAsOf)}`
        : streamUrl
      source = new EventSource(url)

      source.addEventListener('hello', (event) => {
        reopenDelay = STREAM_REOPEN_MIN_MS
        const { asOf } = JSON.parse((event as MessageEvent).data) as { asOf: string }
        lastAsOf ??= asOf
      })

      source.addEventListener('activity', (event) => {
        const frame = JSON.parse((event as MessageEvent).data) as {
          asOf: string
          data: ActivityItem[]
        }
        lastAsOf = frame.asOf
        prependActivity(frame.data)
      })

      source.addEventListener('toasts', (event) => {
        const frame = JSON.parse((event as MessageEvent).data) as ActivityToasts
        lastAsOf = frame.asOf
        onToastsRef.current(frame)
      })

      source.onerror = () => {
        // CONNECTING means the browser is already retrying; only step in once it has given up.
        if (closed || source?.readyState !== EventSource.CLOSED) return
        source.close()
        reopenTimer = setTimeout(open, reopenDelay)
        reopenDelay = Math.min(reopenDelay * 2, STREAM_REOPEN_MAX_MS)
      }
    }

    open()

    return () => {
      closed = true
      clearTimeout(reopenTimer)
      source?.close()
    }
  }, [slug, queryClient])
}

export function useTodayQuestion(slug: string | null | undefined) {
  return useSantibetQuery<TodayQuestion>({
    path: `${CAMPAIGNS_BASE}/${slug}/questions/today`,
    enabled: Boolean(slug),
    queryOptions: { retry: false, refetchInterval: 30_000 },
  })
}

export function usePreviousQuestion(slug: string | null | undefined) {
  return useSantibetQuery<PreviousQuestion>({
    path: `${CAMPAIGNS_BASE}/${slug}/questions/previous`,
    enabled: Boolean(slug),
    queryOptions: { retry: false },
  })
}

export function useLeaderboard(slug: string | null | undefined, limit = 5) {
  return useSantibetQuery<{ data: LeaderboardEntry[] }>({
    path: `${CAMPAIGNS_BASE}/${slug}/leaderboard`,
    enabled: Boolean(slug),
    params: { limit },
    queryOptions: { refetchInterval: 30_000 },
  })
}

/** Standing of the number the player is predicting as (or the device's most recent number
 *  when we don't know it). Only worth asking once this device looks verified — web clients
 *  only ever get their keys as a cookie, so a remembered number or standing is the signal. */
export function useMe(slug: string | null | undefined) {
  const verified = useAppSelector(selectHasVerifiedDevice)
  const currentPhone = useAppSelector((state) => state.campaign.currentPhone)
  const headers = useCampaignAuthHeaders()
  return useSantibetQuery<ParticipantStanding>({
    path: `${CAMPAIGNS_BASE}/${slug}/me`,
    enabled: Boolean(slug) && verified,
    params: { phone: currentPhone },
    headers,
    queryOptions: { retry: false },
  })
}

/** Prizes across every number this device holds a key for, newest first. */
export function useWinnings() {
  const verified = useAppSelector(selectHasVerifiedDevice)
  const headers = useCampaignAuthHeaders()
  return useSantibetQuery<{ data: Winning[] }>({
    path: `${CAMPAIGNS_BASE}/winnings`,
    enabled: verified,
    headers,
  })
}

function useInvalidateCampaign(slug: string | null | undefined) {
  const queryClient = useQueryClient()
  return () => {
    if (!slug) return
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0]
        return typeof key === 'string' && key.startsWith(`${CAMPAIGNS_BASE}/${slug}`)
      },
    })
  }
}

export function useSendVerification(slug: string | null | undefined) {
  return useSantibetMutation<SendVerificationResult, { phone: string }>({
    path: `${CAMPAIGNS_BASE}/${slug}/verifications`,
    method: 'POST',
  })
}

/** Fallback for players SMS never reached — the phone number is still what gets verified. */
export function useSendEmailVerification(slug: string | null | undefined) {
  return useSantibetMutation<
    SendVerificationResult,
    { phone: string; email: string }
  >({
    path: `${CAMPAIGNS_BASE}/${slug}/verifications/email`,
    method: 'POST',
  })
}

export function useConfirmVerification(slug: string | null | undefined) {
  const invalidate = useInvalidateCampaign(slug)
  return useSantibetMutation<
    ParticipantStanding,
    { phone: string; code: string }
  >({
    path: `${CAMPAIGNS_BASE}/${slug}/verifications/confirm`,
    method: 'POST',
    mutationOptions: {
      onSuccess: invalidate,
    },
  })
}

export function usePredict(slug: string | null | undefined) {
  const headers = useCampaignAuthHeaders()
  const invalidate = useInvalidateCampaign(slug)
  return useSantibetMutation<
    PredictionResult,
    { choice: 'YES' | 'NO'; phone?: string; referralCode?: string }
  >({
    path: `${CAMPAIGNS_BASE}/${slug}/predictions`,
    method: 'POST',
    headers,
    mutationOptions: {
      onSuccess: (result) => {
        if (result.status === 'COMPLETE') invalidate()
      },
    },
  })
}

export function useClaimWinning() {
  const headers = useCampaignAuthHeaders()
  const queryClient = useQueryClient()
  return useSantibetMutation<Winning, { winnerId: string }>({
    path: `${CAMPAIGNS_BASE}/winnings/claim`,
    mutationFn: async ({ winnerId }) => {
      const response = await apiClient.request<Winning>({
        url: `${CAMPAIGNS_BASE}/winnings/${winnerId}/claim`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        },
        withCredentials: true,
      })
      return response.data
    },
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          predicate: (query) => {
            const key = query.queryKey[0]
            return (
              typeof key === 'string' &&
              key.startsWith(`${CAMPAIGNS_BASE}/winnings`)
            )
          },
        })
      },
    },
  })
}
