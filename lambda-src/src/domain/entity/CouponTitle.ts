import { COUPON_TITLE_INVALID } from '../../constant/error'

export const MAX_TITLE_LENGTH = 20

export class CouponTitle {
  private readonly title: string

  constructor(title: string) {
    if (title === '' || title.length > MAX_TITLE_LENGTH)
      throw new Error(COUPON_TITLE_INVALID)
    this.title = title
  }

  toString(): string {
    return this.title
  }
}
