import { Coupon } from '../../domain/entity/Coupon'
import { CouponJson } from './JsonSerializer'

export class JsonSerializerImpl {
  toCouponJson(coupon: Coupon): CouponJson {
    return {
      id: coupon.id.toString(),
      title: coupon.title.toString(),
      description: coupon.description.toString(),
      imageUrl: coupon.qrCodeUrl.toString(),
      qrCodeUrl: coupon.qrCodeUrl.toString(),
      savedAt: coupon.savedAt,
    }
  }
}
