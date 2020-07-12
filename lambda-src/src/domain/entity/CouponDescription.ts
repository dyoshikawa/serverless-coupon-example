import { COUPON_TITLE_INVALID } from '../../constant/error'

export const MAX_DESCRIPTION_LENGTH = 100

export class CouponDescription {
  private readonly description

  constructor(description: string) {
    if (description === '' || description.length > MAX_DESCRIPTION_LENGTH)
      throw new Error(COUPON_TITLE_INVALID)
    this.description = description
  }

  toString(): string {
    return this.description
  }
}
