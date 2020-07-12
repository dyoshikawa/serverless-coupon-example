import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { bootstrap } from '../../bootstrap'
import { requestError, response, serverError } from '../http/response'
import {
  decodeCreateCouponInput,
  DecodeCreateCouponInputErrors,
  DecodeCreateCouponInputResult,
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

export const createCoupon = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const [ok, decodedResult] = decodeCreateCouponInput(event.body)

  if (!ok) {
    const msgs = (decodedResult as DecodeCreateCouponInputErrors).map((err) => {
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
          return 'Must have "qr_code".'
        case COUPON_QR_CODE_EMPTY:
          return 'Must have value "qr_code".'
        default: {
          console.warn(`Uncatched error message: ${err}`)
        }
      }
    })
    return requestError(msgs as Array<string>)
  }

  const {
    id,
    title,
    description,
    image,
    qrCode,
  } = decodedResult as DecodeCreateCouponInputResult

  const { couponApplication, jsonSerializer } = bootstrap()
  return await couponApplication
    .create({
      id,
      title,
      description,
      imageBase64: image,
      qrCodeBase64: qrCode,
    })
    .then((coupon) => response(jsonSerializer.toCouponJson(coupon)))
    .catch((e) => {
      console.error(e)
      return serverError()
    })
}
