import { Url } from './Url'
import { CouponId } from './CouponId'
import { CouponTitle } from './CouponTitle'
import { CouponDescription } from './CouponDescription'
import { CouponIndexKey } from './CouponIndexKey'

export class Coupon {
  id: CouponId
  title: CouponTitle
  description: CouponDescription
  imageUrl: Url
  qrCodeUrl: Url
  savedAt: Date

  constructor({
    id,
    title,
    description,
    imageUrl,
    qrCodeUrl,
    savedAt,
  }: {
    id: CouponId
    title: CouponTitle
    description: CouponDescription
    imageUrl: Url
    qrCodeUrl: Url
    savedAt: Date
  }) {
    this.id = id
    this.title = title
    this.description = description
    this.imageUrl = imageUrl
    this.qrCodeUrl = qrCodeUrl
    this.savedAt = savedAt
  }
}

export class CouponIndex {
  key: CouponIndexKey
  couponId: CouponId
  savedAt: Date

  constructor({
    key,
    couponId,
    savedAt,
  }: {
    key: CouponIndexKey
    couponId: CouponId
    savedAt: Date
  }) {
    this.key = key
    this.couponId = couponId
    this.savedAt = savedAt
  }
}
