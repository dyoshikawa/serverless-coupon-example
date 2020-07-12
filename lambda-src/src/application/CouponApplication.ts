import { Coupon, CouponIndex } from '../domain/entity/Coupon'
import { Keyword } from '../domain/entity/Keyword'
import { PagePer } from '../domain/entity/PagePer'
import { StartKey } from '../domain/entity/StartKey'
import { Base64 } from '../domain/entity/Base64'
import { CouponDescription } from '../domain/entity/CouponDescription'
import { CouponTitle } from '../domain/entity/CouponTitle'
import { CouponId } from '../domain/entity/CouponId'

export type SearchCouponResult = {
  coupons: Array<Coupon>
  startKey: StartKey | undefined
}

export interface CouponApplication {
  findById: (couponId: CouponId) => Promise<Coupon>
  search: (params: {
    keyword: Keyword
    per?: PagePer
    startKey?: StartKey
  }) => Promise<SearchCouponResult>
  create: (params: {
    id: CouponId
    title: CouponTitle
    description: CouponDescription
    imageBase64: Base64
    qrCodeBase64: Base64
  }) => Promise<Coupon>
  createIndexes: (
    id: CouponId,
    title: CouponTitle
  ) => Promise<Array<CouponIndex>>
  updateIndexes: (
    id: CouponId,
    title: CouponTitle
  ) => Promise<Array<CouponIndex>>
  destroyIndexes: (id: CouponId) => Promise<void>
}
