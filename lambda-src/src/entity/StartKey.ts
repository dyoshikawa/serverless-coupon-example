import { CouponId } from './CouponId'
import { Keyword } from './Keyword'

export class StartKey {
  private readonly key: Keyword
  private readonly couponId: CouponId

  constructor(key: Keyword, couponId: CouponId) {
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
