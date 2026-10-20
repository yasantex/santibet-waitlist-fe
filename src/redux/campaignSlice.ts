import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ParticipantStanding } from '../types/campaign'
import type { RootState } from './store'

/** The device holds a key for at most this many numbers (matches the backend's cookie). */
export const MAX_DEVICE_NUMBERS = 5

export interface VerifiedNumber {
  /** National digits without the leading 0, as sent to the API (e.g. 8012345678). */
  phone: string
  /** Only mobile-style clients get this in the confirm body; web relies on the cookie. */
  deviceToken: string | null
  standing: ParticipantStanding | null
}

export interface CampaignState {
  /** Numbers this device has verified, most recently verified first. */
  numbers: VerifiedNumber[]
  /** The number predictions and /me are sent for. Null means "the device's most recent". */
  currentPhone: string | null
  /** Token from before numbers were tracked, so we don't know which number it belongs to. */
  deviceToken: string | null
  /** Standing of the current number. */
  standing: ParticipantStanding | null
  /** The number this browser's player joined or predicted with — shown, never sent. */
  displayPhone: string | null
}

const initialState: CampaignState = {
  numbers: [],
  currentPhone: null,
  deviceToken: null,
  standing: null,
  displayPhone: null,
}

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    setStanding: (state, action: PayloadAction<ParticipantStanding>) => {
      state.standing = action.payload
      const entry = state.numbers.find((n) => n.phone === state.currentPhone)
      if (entry) {
        entry.standing = action.payload
        if (action.payload.deviceToken) entry.deviceToken = action.payload.deviceToken
      } else if (action.payload.deviceToken) {
        state.deviceToken = action.payload.deviceToken
      }
    },
    /**
     * A join, code confirm or prediction reply named the player this browser now plays as.
     * The browser's token (cookie on web) decides who that is, so a typed number never becomes
     * `currentPhone` — it's kept in `displayPhone` for "Predicting as …" only.
     * `displayPhone`: undefined leaves it as is; null clears it (an email joiner).
     */
    playerJoined: (
      state,
      action: PayloadAction<{ standing: ParticipantStanding; displayPhone?: string | null }>,
    ) => {
      const { standing, displayPhone } = action.payload
      state.standing = standing
      state.currentPhone = null
      if (displayPhone !== undefined) state.displayPhone = displayPhone
      if (standing.deviceToken) state.deviceToken = standing.deviceToken
    },
    switchNumber: (state, action: PayloadAction<string>) => {
      const entry = state.numbers.find((n) => n.phone === action.payload)
      if (!entry) return
      state.currentPhone = entry.phone
      state.standing = entry.standing
    },
    clearCampaignAuth: () => initialState,
  },
})

/** Every device token we hold, newest first, for the x-campaign-token header. */
export const selectDeviceTokens = (state: RootState) =>
  [
    ...state.campaign.numbers.map((n) => n.deviceToken),
    state.campaign.deviceToken,
  ]
    .filter((t, i, all): t is string => Boolean(t) && all.indexOf(t) === i)
    .slice(0, MAX_DEVICE_NUMBERS)

/** True once this device has verified a number or email (web only learns this from a standing). */
export const selectHasVerifiedDevice = (state: RootState) =>
  state.campaign.numbers.length > 0 ||
  Boolean(state.campaign.deviceToken) ||
  Boolean(state.campaign.standing)

export const {
  setStanding,
  playerJoined,
  switchNumber,
  clearCampaignAuth,
} = campaignSlice.actions
export default campaignSlice.reducer
