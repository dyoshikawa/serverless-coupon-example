import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { bootstrap } from '../../bootstrap'
import { requestError, response, serverError } from '../http/response'
import {
  decodeCreateCouponParams,
  DecodeCreateCouponParamsResult,
} from '../parameter_decoder/ParameterDecoder'
import {
  COUPON_DESCRIPTION_EMPTY,
  COUPON_DESCRIPTION_NOT_GIVEN,
  COUPON_ID_EMPTY,
  COUPON_ID_NOT_GIVEN,
  COUPON_IMAGE_EMPTY,
  COUPON_IMAGE_NOT_GIVEN,
  COUPON_QR_CODE_EMPTY,
  COUPON_QR_CODE_NOT_GIVEN,
  COUPON_TITLE_EMPTY,
  COUPON_TITLE_NOT_GIVEN,
  INVALID_JSON,
  PARAMS_NOT_GIVEN,
} from '../../constant/error'
import { ParameterDecodeError } from '../parameter_decoder/ParameterDecodeError'

export const createCoupon = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let decodedResult: DecodeCreateCouponParamsResult | undefined = undefined
  try {
    decodedResult = decodeCreateCouponParams(event.body)
  } catch (e) {
    if (e instanceof ParameterDecodeError) {
      const msgs = e.errors.map((err) => {
        switch (err) {
          case PARAMS_NOT_GIVEN:
            return 'Must have JSON body.'
          case INVALID_JSON:
            return 'Invalid JSON parameter.'
          case COUPON_ID_NOT_GIVEN:
            return 'Must have "coupon_id"'
          case COUPON_ID_EMPTY:
            return 'Must have value "coupon_id"'
          case COUPON_TITLE_NOT_GIVEN:
            return 'Must have "title".'
          case COUPON_TITLE_EMPTY:
            return 'Must have value "title".'
          case COUPON_DESCRIPTION_NOT_GIVEN:
            return 'Must have "description".'
          case COUPON_DESCRIPTION_EMPTY:
            return 'Must have value "description".'
          case COUPON_IMAGE_NOT_GIVEN:
            return 'Must have "image".'
          case COUPON_IMAGE_EMPTY:
            return 'Must have value "image".'
          case COUPON_QR_CODE_NOT_GIVEN:
            return 'Must have "coupon".'
          case COUPON_QR_CODE_EMPTY:
            return 'Must have value "coupon".'
          default: {
            console.error(err)
            return undefined
          }
        }
      })
      if (msgs.includes(undefined)) return serverError()
      return requestError(msgs as Array<string>)
    } else {
      console.error(e)
      return serverError()
    }
  }
  const { id, title, description, image, qrCode } = decodedResult

  const { couponService } = bootstrap()
  return await couponService
    .create({
      id,
      title,
      description,
      imageBase64: image,
      qrCodeBase64: qrCode,
    })
    .then((coupon) => response(coupon))
    .catch((e) => {
      console.error(e)
      return serverError()
    })
}
