import { COUPON_ID_INVALID } from '../constant/error'

export const ID_LENGTH = 7

export class CouponId {
  private readonly id: string

  constructor(id: string) {
    if (id.length !== ID_LENGTH || isNaN(Number(id)))
      throw new Error(COUPON_ID_INVALID)
    this.id = id
  }

  toString(): string {
    return this.id
  }
}
