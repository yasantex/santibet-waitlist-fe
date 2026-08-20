export interface UserData {
  uuid: string
  first_name: string
  last_name: string
  email: string
  mobile: string
  email_verified: boolean
  last_login: string
  prev_login: string | null
  created_at: string
  updated_at: string
  two_fa_enabled: boolean
  user_uuid: string
  pre_auth_token: string
}
export interface BaseApiResponse {
  success: boolean
  message: string
}