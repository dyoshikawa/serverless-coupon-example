import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { bootstrap } from '../bootstrap'
import { requestError, response, serverError } from '../http/response'
import { COUPON_NOT_FOUND } from '../constant/error'

export const findCouponById = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { couponId } = event.pathParameters as {
    couponId: string | undefined
  }
  if (couponId === undefined) return requestError(['Invalid coupon id.'])

  const { couponService } = bootstrap()
  return await couponService
    .findById(couponId)
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
