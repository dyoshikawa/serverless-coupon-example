import { CouponId } from './CouponId'
import { CouponIndexKey } from './CouponIndexKey'

export class StartKey {
  private readonly key: CouponIndexKey
  private readonly couponId: CouponId

  constructor(key: CouponIndexKey, couponId: CouponId) {
    this.key = key
    this.couponId = couponId
  }

  toObject(): {
    key: string
    couponId: string
  } {
    return {
      key: this.key.toString(),
      couponId: this.couponId.toString(),
    }
  }
}
