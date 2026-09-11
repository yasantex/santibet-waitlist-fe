'use client'

import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import {
  apiClient,
  useSantibetQuery,
  useSantibetMutation,
} from '../data_layer/utils'
import { useAppSelector } from '../redux/hooks'
import type {
  ActivityItem,
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

/** Reads the first AWAITING_CODE-friendly message off an axios error from the campaigns API. */
export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
  }
  return fallback
}

function useCampaignAuthHeaders(): Record<string, string> {
  const deviceToken = useAppSelector((state) => state.campaign.deviceToken)
  return deviceToken ? { 'X-Campaign-Token': deviceToken } : {}
}

/**
 * Picks the campaign this coming-soon site should play — the running one if there
 * is one, otherwise the soonest upcoming one. Drafts/cancelled campaigns never show up here.
 */
export function useActiveCampaign() {
  const query = useSantibetQuery<{ data: Campaign[] }>({
    path: `${CAMPAIGNS_BASE}/`,
    queryOptions: {
      staleTime: 30_000,
      refetchInterval: 60_000,
    },
  })

  const activeCampaign = useMemo(() => {
    const campaigns = query.data?.data ?? []
    if (campaigns.length === 0) return null
    const active = campaigns.find((c) => c.phase === 'ACTIVE')
    if (active) return active
    const upcoming = campaigns
      .filter((c) => c.phase === 'UPCOMING')
      .sort((a, b) => a.startsOn.localeCompare(b.startsOn))
    return upcoming[0] ?? campaigns[0]
  }, [query.data])

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

/** The caller's own standing. Only worth asking once this device looks verified — either we
 *  hold a device token (mobile clients get one in the confirm response body), or we already
 *  have a standing in Redux from a previous confirm/me on this device (web clients only ever
 *  get their token as a cookie, never in the body, so `standing` is the fallback signal). */
export function useMe(slug: string | null | undefined) {
  const deviceToken = useAppSelector((state) => state.campaign.deviceToken)
  const standing = useAppSelector((state) => state.campaign.standing)
  const headers = useCampaignAuthHeaders()
  return useSantibetQuery<ParticipantStanding>({
    path: `${CAMPAIGNS_BASE}/${slug}/me`,
    enabled: Boolean(slug) && (Boolean(deviceToken) || Boolean(standing)),
    headers,
    queryOptions: { retry: false },
  })
}

export function useWinnings() {
  const deviceToken = useAppSelector((state) => state.campaign.deviceToken)
  const standing = useAppSelector((state) => state.campaign.standing)
  const headers = useCampaignAuthHeaders()
  return useSantibetQuery<{ data: Winning[] }>({
    path: `${CAMPAIGNS_BASE}/winnings`,
    enabled: Boolean(deviceToken) || Boolean(standing),
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
