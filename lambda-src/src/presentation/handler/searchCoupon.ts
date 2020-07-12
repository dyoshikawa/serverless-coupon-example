import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { bootstrap } from '../../bootstrap'
import { requestError, response, serverError } from '../http/response'
import {
  decodeSearchCouponInput,
  DecodeSearchCouponInputResult,
} from '../parameter_decoder/ParameterDecoder'
import {
  PARAMS_NOT_GIVEN,
  PER_INVALID,
  SEARCH_KEYWORD_NOT_GIVEN,
  START_KEY_INVALID,
} from '../../constant/error'

export const searchCoupon = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = event.queryStringParameters as {
    keyword?: string
    per?: string
    startKeyKey?: string
    startKeyCouponId?: string
  } | null
  let decodedParams: DecodeSearchCouponInputResult
  try {
    decodedParams = decodeSearchCouponInput(params)
  } catch (e) {
    switch (e.message) {
      case PARAMS_NOT_GIVEN:
        return requestError(['Must have params.'])
      case SEARCH_KEYWORD_NOT_GIVEN:
        return requestError(['Must have parameter "keyword"'])
      case START_KEY_INVALID:
        return requestError([
          'Invalid parameters "startKeyKey" and "startKeyCouponId"',
        ])
      case PER_INVALID:
        return requestError(['Invalid parameter "per"'])
      default:
        console.error(e)
        return serverError()
    }
  }

  const { couponApplication, jsonSerializer } = bootstrap()
  return await couponApplication
    .search({
      keyword: decodedParams.keyword,
      per: decodedParams.per,
      startKey: decodedParams.startKey,
    })
    .then((res) =>
      response(
        res.coupons.map((coupon) => jsonSerializer.toCouponJson(coupon)),
        {
          headers: {
            'x-coupon-start-key-key': encodeURI(
              res.startKey?.toObject().key || ''
            ),
            'x-coupon-start-key-coupon-id':
              res.startKey?.toObject().couponId || '',
          },
        }
      )
    )
    .catch((e) => {
      console.error(e)
      return serverError()
    })
}
