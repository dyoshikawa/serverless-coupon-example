import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { bootstrap } from '../../bootstrap'
import { requestError, response, serverError } from '../http/response'
import { COUPON_ID_NOT_GIVEN, COUPON_NOT_FOUND } from '../../constant/error'
import { decodeFindCouponById } from '../parameter_decoder/ParameterDecoder'

export const findCouponById = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { couponId } = event.pathParameters as {
    couponId: string | undefined
  }
  let decodedCouponId: string
  try {
    decodedCouponId = decodeFindCouponById(couponId)
  } catch (e) {
    switch (e.message) {
      case COUPON_ID_NOT_GIVEN:
        return requestError(['Invalid coupon id.'])
      default:
        return serverError()
    }
  }

  const { couponService } = bootstrap()
  return await couponService
    .findById(decodedCouponId)
    .then((coupon) => response(coupon))
    .catch((e: Error) => {
      switch (e.message) {
        case COUPON_NOT_FOUND: {
          return requestError(['Coupon not found.'])
        }
        default: {
          console.error(e)
          return serverError()
        }
      }
    })
}
