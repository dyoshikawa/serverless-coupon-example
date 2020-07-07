export type Coupon = {
  id: string
  title: string
  description: string
  imageUrl: string
  qrCodeUrl: string
  savedAt: Date
  savedAtDay: string
}

export type CouponIndex = {
  key: string
  couponId: string
  savedAt: Date
}
