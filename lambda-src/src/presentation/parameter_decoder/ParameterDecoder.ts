import {
  COUPON_ID_NOT_GIVEN,
  PARAMS_NOT_GIVEN,
  PER_INVALID,
  SEARCH_KEYWORD_NOT_GIVEN,
  START_KEY_INVALID,
} from '../../constant/error'

export const decodeFindCouponById = (couponId: string | undefined): string => {
  if (couponId === undefined) throw new Error(COUPON_ID_NOT_GIVEN)
  return couponId
}

export type DecodeSearchCouponResult = {
  keyword: string
  per: number | undefined
  startKey: { key: string; couponId: string } | undefined
}

export const decodeSearchCouponParams = (
  params: {
    keyword?: string
    per?: string
    startKeyKey?: string
    startKeyCouponId?: string
  } | null
): {
  keyword: string
  per: number | undefined
  startKey: { key: string; couponId: string } | undefined
} => {
  if (params === null) throw new Error(PARAMS_NOT_GIVEN)
  if (params.keyword === undefined || params.keyword === '')
    throw new Error(SEARCH_KEYWORD_NOT_GIVEN)

  const startKeysCount = [params.startKeyKey, params.startKeyCouponId].filter(
    (item) => item !== undefined
  ).length

  // 2つのStartKeyの片方だけ渡されるのはNG
  if (startKeysCount === 1) throw new Error(START_KEY_INVALID)

  const startKey =
    startKeysCount === 2
      ? {
          key: params.startKeyKey as string,
          couponId: params.startKeyCouponId as string,
        }
      : undefined

  let per: number | undefined = undefined
  if (params.per !== undefined) {
    try {
      per = parseInt(params.per)
    } catch (e) {
      console.error(e)
      throw new Error(PER_INVALID)
    }
  }

  return {
    keyword: params.keyword,
    per,
    startKey,
  }
}
