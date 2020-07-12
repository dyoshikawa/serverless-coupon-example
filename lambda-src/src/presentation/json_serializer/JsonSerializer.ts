import { Coupon } from '../../entity/Coupon'

export type CouponJson = {
  id: string
  title: string
  description: string
  imageUrl: string
  qrCodeUrl: string
  savedAt: Date
}

export interface JsonSerializer {
  toCouponJson: (coupon: Coupon) => CouponJson
}
