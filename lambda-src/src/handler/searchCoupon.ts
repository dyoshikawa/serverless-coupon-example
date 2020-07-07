import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { bootstrap } from '../bootstrap'
import { requestError, response, serverError } from '../http/response'

export const searchCoupon = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const params = event.queryStringParameters as {
    keyword?: string
    per?: string
    startKeyKey?: string
    startKeyCouponId?: string
  } | null
  if (params === null)
    return requestError(['Must have parameters. ex: keyword'])
  if (params.keyword === undefined || params.keyword === '')
    return requestError(['Must have keyword.'])

  const startKey =
    params.startKeyKey !== undefined && params.startKeyCouponId !== undefined
      ? {
          key: params.startKeyKey,
          couponId: params.startKeyCouponId,
        }
      : undefined
  let per: number | undefined = undefined
  if (params.per !== undefined) {
    try {
      per = parseInt(params.per)
    } catch (e) {
      console.error(e)
      return requestError(['Invalid value per.'])
    }
  }

  const { couponService } = bootstrap()
  return await couponService
    .search({
      keyword: params.keyword,
      per,
      startKey,
    })
    .then((res) =>
      response(res.coupons, {
        headers: {
          'x-coupon-start-key-key': encodeURI(res.startKey?.key || ''),
          'x-coupon-start-key-coupon-id': res.startKey?.couponId || '',
        },
      })
    )
    .catch((e) => {
      console.error(e)
      return serverError()
    })
}
