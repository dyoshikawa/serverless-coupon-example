import { Coupon, CouponIndex } from '../entity/Coupon'
import { SearchCouponResult, StartKey } from '../service/CouponService'

export interface CouponRepository {
  findAll: () => Promise<Array<Coupon>>
  findById: (id: string) => Promise<Coupon>
  findByWord: (params: {
    word: string
    startKey?: StartKey
    per?: number
  }) => Promise<SearchCouponResult>
  save: (params: {
    id: string
    title: string
    description: string
    imageFile: Buffer
    imageName: string
    qrCodeFile: Buffer
    qrCodeName: string
  }) => Promise<Coupon>
  destroy: (id: string) => Promise<void>
  findAllIndexes: () => Promise<Array<CouponIndex>>
  saveIndexes: (
    params: Array<{ key: string; couponId: string }>
  ) => Promise<Array<CouponIndex>>
  findIndexesByCouponId: (couponId: string) => Promise<Array<CouponIndex>>
  destroyIndexes: (
    params: Array<{
      key: string
      couponId: string
    }>
  ) => Promise<void>
}
