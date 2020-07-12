import { Coupon, CouponIndex } from '../entity/Coupon'

export type StartKey = { key: string; couponId: string }
export type SearchCouponResult = {
  coupons: Array<Coupon>
  startKey: StartKey | undefined
}

export interface CouponAppService {
  findById: (couponId: string) => Promise<Coupon>
  search: (params: {
    keyword: string
    per?: number
    startKey?: StartKey
  }) => Promise<SearchCouponResult>
  create: (params: {
    id: string
    title: string
    description: string
    imageBase64: string
    qrCodeBase64: string
  }) => Promise<Coupon>
  createIndexes: (id: string, title: string) => Promise<Array<CouponIndex>>
  updateIndexes: (id: string, title: string) => Promise<Array<CouponIndex>>
  destroyIndexes: (id: string) => Promise<void>
}
