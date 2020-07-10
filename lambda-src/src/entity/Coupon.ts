import { COUPON_ID_INVALID, COUPON_TITLE_INVALID } from '../constant/error'

export const ID_LENGTH = 7
export const MAX_TITLE_LENGTH = 20
export const MAX_DESCRIPTION_LENGTH = 100

export class Coupon {
  id: string
  title: string
  description: string
  imageUrl: string
  qrCodeUrl: string
  savedAt: Date

  constructor({
    id,
    title,
    description,
    imageUrl,
    qrCodeUrl,
    savedAt,
  }: {
    id: string
    title: string
    description: string
    imageUrl: string
    qrCodeUrl: string
    savedAt: Date
  }) {
    if (id.length !== ID_LENGTH) throw new Error(COUPON_ID_INVALID)
    this.id = id
    if (title.length > MAX_TITLE_LENGTH) throw new Error(COUPON_TITLE_INVALID)
    this.title = title
    if (description.length > MAX_DESCRIPTION_LENGTH)
      throw new Error(COUPON_TITLE_INVALID)
    this.description = description
    this.imageUrl = imageUrl
    this.qrCodeUrl = qrCodeUrl
    this.savedAt = savedAt
  }
}

export class CouponIndex {
  key: string
  couponId: string
  savedAt: Date

  constructor({
    key,
    couponId,
    savedAt,
  }: {
    key: string
    couponId: string
    savedAt: Date
  }) {
    this.key = key
    this.couponId = couponId
    this.savedAt = savedAt
  }
}
