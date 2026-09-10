import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CampaignState {
  deviceToken: string | null
}

const initialState: CampaignState = {
  deviceToken: null,
}

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    setDeviceToken: (state, action: PayloadAction<string>) => {
      state.deviceToken = action.payload
    },
    clearCampaignAuth: (state) => {
      state.deviceToken = null
    },
  },
})

export const { setDeviceToken, clearCampaignAuth } = campaignSlice.actions
export default campaignSlice.reducer
