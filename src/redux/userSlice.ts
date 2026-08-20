import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { UserData } from '../types/types'

// Slice

export interface UserState {
  user: UserData | null
  twoFaToken: string | null
}
const initialState: UserState = {
  user: null,
  twoFaToken: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload
    },
    clearUser: (state) => {
      state.user = null
    },
    setTwoFaToken: (state, action: PayloadAction<string>) => {
      state.twoFaToken = action.payload
    },
    clearTwoFaToken: (state) => {
      state.twoFaToken = null
    },
  },
})

// Actions
export const { setUser, clearUser, setTwoFaToken, clearTwoFaToken } =
  userSlice.actions

export default userSlice.reducer
