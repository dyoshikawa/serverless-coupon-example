import { CouponId } from '../../entity/CouponId'
import { CouponTitle } from '../../entity/CouponTitle'
import { CouponDescription } from '../../entity/CouponDescription'
import { Url } from '../../entity/Url'
import { Coupon, CouponIndex } from '../../entity/Coupon'
import dayjs from 'dayjs'
import { Keyword } from '../../entity/Keyword'

export const buildCoupon = (params?: {
  id?: CouponId
  title?: CouponTitle
  description?: CouponDescription
  imageUrl?: Url
  qrCodeUrl?: Url
  savedAt?: Date
}): Coupon =>
  new Coupon({
    id: params?.id || new CouponId('0000001'),
    title: params?.title || new CouponTitle('タイトル'),
    description: params?.description || new CouponDescription('説明'),
    imageUrl: params?.imageUrl || new Url('https://example.com/image.png'),
    qrCodeUrl: params?.qrCodeUrl || new Url('https://example.com/qrcode.jpg'),
    savedAt: params?.savedAt || dayjs('2020-01-01').toDate(),
  })

export const buildCouponIndex = (params?: {
  key: Keyword
  couponId: CouponId
  savedAt: Date
}): CouponIndex =>
  new CouponIndex({
    key: params?.key || new Keyword('キーワード'),
    couponId: params?.couponId || new CouponId('0000001'),
    savedAt: params?.savedAt || dayjs('2020-01-01').toDate(),
  })
