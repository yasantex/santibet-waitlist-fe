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
}

const initialState: CampaignState = {
  numbers: [],
  currentPhone: null,
  deviceToken: null,
  standing: null,
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
    /** A code was confirmed for `phone`: it moves to the front and becomes current. */
    numberVerified: (
      state,
      action: PayloadAction<{ phone: string; standing: ParticipantStanding }>,
    ) => {
      const { phone, standing } = action.payload
      const previous = state.numbers.find((n) => n.phone === phone)
      state.numbers = [
        {
          phone,
          deviceToken: standing.deviceToken ?? previous?.deviceToken ?? null,
          standing,
        },
        ...state.numbers.filter((n) => n.phone !== phone),
      ].slice(0, MAX_DEVICE_NUMBERS)
      state.currentPhone = phone
      state.standing = standing
    },
    /** A proven prediction for `phone` shows the device already holds its key. */
    numberProven: (state, action: PayloadAction<string>) => {
      const phone = action.payload
      if (!state.numbers.some((n) => n.phone === phone)) {
        state.numbers = [
          ...state.numbers,
          { phone, deviceToken: null, standing: null },
        ].slice(0, MAX_DEVICE_NUMBERS)
      }
      if (state.currentPhone !== phone) {
        state.currentPhone = phone
        state.standing =
          state.numbers.find((n) => n.phone === phone)?.standing ?? null
      }
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

/** True once this device has verified any number (web only ever learns this from a standing). */
export const selectHasVerifiedDevice = (state: RootState) =>
  state.campaign.numbers.length > 0 ||
  Boolean(state.campaign.deviceToken) ||
  Boolean(state.campaign.standing)

export const {
  setStanding,
  numberVerified,
  numberProven,
  switchNumber,
  clearCampaignAuth,
} = campaignSlice.actions
export default campaignSlice.reducer
