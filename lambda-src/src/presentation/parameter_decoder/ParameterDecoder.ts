import {
  COUPON_DESCRIPTION_NOT_GIVEN,
  COUPON_ID_NOT_GIVEN,
  COUPON_IMAGE_NOT_GIVEN,
  COUPON_QR_CODE_NOT_GIVEN,
  COUPON_TITLE_NOT_GIVEN,
  INVALID_JSON,
  PARAMS_NOT_GIVEN,
  PER_INVALID,
  SEARCH_KEYWORD_NOT_GIVEN,
  START_KEY_INVALID,
} from '../../constant/error'
import { ParameterDecodeError } from './ParameterDecodeError'

export const decodeFindCouponById = (couponId: string | undefined): string => {
  if (couponId === undefined) throw new Error(COUPON_ID_NOT_GIVEN)
  return couponId
}

export type DecodeSearchCouponParams = {
  keyword?: string
  per?: string
  startKeyKey?: string
  startKeyCouponId?: string
} | null

export type DecodeSearchCouponResult = {
  keyword: string
  per: number | undefined
  startKey: { key: string; couponId: string } | undefined
}

export const decodeSearchCouponParams = (
  params: DecodeSearchCouponParams
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
    if (isNaN(Number(params.per))) throw new Error(PER_INVALID)
    per = parseInt(params.per)
  }

  return {
    keyword: params.keyword,
    per,
    startKey,
  }
}

export type DecodeCreateCouponParamsResult = {
  id: string
  title: string
  description: string
  image: string
  qrCode: string
}

export const decodeCreateCouponParams = (
  body: string | null
): DecodeCreateCouponParamsResult => {
  if (body === null) throw new ParameterDecodeError([PARAMS_NOT_GIVEN])

  let params:
    | {
        id?: string
        title?: string
        description?: string
        image?: string
        qrCode?: string
      }
    | undefined = undefined
  try {
    params = JSON.parse(body) as {
      id?: string
      title?: string
      description?: string
      image?: string
      qrCode?: string
    }
  } catch (e) {
    console.error(e)
    throw new ParameterDecodeError([INVALID_JSON])
  }

  const errs: Array<string> = []
  if (params.id === undefined) errs.push(COUPON_ID_NOT_GIVEN)
  if (params.title === undefined) errs.push(COUPON_TITLE_NOT_GIVEN)
  if (params.description === undefined) errs.push(COUPON_DESCRIPTION_NOT_GIVEN)
  if (params.image === undefined) errs.push(COUPON_IMAGE_NOT_GIVEN)
  if (params.qrCode === undefined) errs.push(COUPON_QR_CODE_NOT_GIVEN)

  if (errs.length > 0) {
    throw new ParameterDecodeError(errs)
  } else {
    return params as DecodeCreateCouponParamsResult
  }
}
