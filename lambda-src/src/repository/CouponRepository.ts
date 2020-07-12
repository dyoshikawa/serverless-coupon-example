import { Coupon, CouponIndex } from '../entity/Coupon'
import { SearchCouponResult } from '../app_service/CouponAppService'
import { StartKey } from '../entity/StartKey'
import { PagePer } from '../entity/PagePer'
import { Keyword } from '../entity/Keyword'
import { CouponId } from '../entity/CouponId'
import { CouponTitle } from '../entity/CouponTitle'
import { CouponDescription } from '../entity/CouponDescription'

export interface CouponRepository {
  findAll: () => Promise<Array<Coupon>>
  findById: (id: CouponId) => Promise<Coupon>
  findByWord: (params: {
    word: Keyword
    startKey?: StartKey
    per?: PagePer
  }) => Promise<SearchCouponResult>
  save: (params: {
    id: CouponId
    title: CouponTitle
    description: CouponDescription
    imageFile: Buffer
    imageName: string
    qrCodeFile: Buffer
    qrCodeName: string
  }) => Promise<Coupon>
  destroy: (id: CouponId) => Promise<void>
  findAllIndexes: () => Promise<Array<CouponIndex>>
  saveIndexes: (
    params: Array<{ key: Keyword; couponId: CouponId }>
  ) => Promise<Array<CouponIndex>>
  findIndexesByCouponId: (couponId: CouponId) => Promise<Array<CouponIndex>>
  destroyIndexes: (
    params: Array<{
      key: Keyword
      couponId: CouponId
    }>
  ) => Promise<void>
}
