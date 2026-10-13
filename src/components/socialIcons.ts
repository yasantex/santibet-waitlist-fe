import type { IconSvgElement } from '@hugeicons/react'
import {
  Facebook01Icon,
  InstagramIcon,
  Linkedin01Icon,
  NewTwitterIcon,
  TiktokIcon,
} from '@hugeicons/core-free-icons'
import type { SocialName } from '../utils/constants'

export const SOCIAL_ICON: Record<SocialName, IconSvgElement> = {
  instagram: InstagramIcon,
  x: NewTwitterIcon,
  tiktok: TiktokIcon,
  facebook: Facebook01Icon,
  linkedin: Linkedin01Icon,
}
