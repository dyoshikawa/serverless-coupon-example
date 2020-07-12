import { Coupon, CouponIndex } from '../entity/Coupon'
import { CouponIndexKey } from '../entity/CouponIndexKey'
import { PagePer } from '../entity/PagePer'
import { StartKey } from '../entity/StartKey'
import { Base64 } from '../entity/Base64'
import { CouponDescription } from '../entity/CouponDescription'
import { CouponTitle } from '../entity/CouponTitle'
import { CouponId } from '../entity/CouponId'

export type SearchCouponResult = {
  coupons: Array<Coupon>
  startKey: StartKey | undefined
}

export interface CouponAppService {
  findById: (couponId: CouponId) => Promise<Coupon>
  search: (params: {
    keyword: CouponIndexKey
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
