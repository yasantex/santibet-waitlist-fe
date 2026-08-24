import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ParticipantStanding } from '../types/campaign'

export interface CampaignState {
  deviceToken: string | null
  standing: ParticipantStanding | null
}

const initialState: CampaignState = {
  deviceToken: null,
  standing: null,
}

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    setStanding: (state, action: PayloadAction<ParticipantStanding>) => {
      state.standing = action.payload
      if (action.payload.deviceToken) {
        state.deviceToken = action.payload.deviceToken
      }
    },
    clearCampaignAuth: (state) => {
      state.deviceToken = null
      state.standing = null
    },
  },
})

export const { setStanding, clearCampaignAuth } = campaignSlice.actions
export default campaignSlice.reducer
