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
  UNDEFINED_ERROR,
} from '../../constant/error'

import { CouponDescription } from '../../entity/CouponDescription'
import { CouponTitle } from '../../entity/CouponTitle'
import { CouponId } from '../../entity/CouponId'
import { Base64 } from '../../entity/Base64'
import { StartKey } from '../../entity/StartKey'
import { Keyword } from '../../entity/Keyword'
import { PagePer } from '../../entity/PagePer'

export const decodeFindCouponByIdInput = (
  couponId: string | undefined
): CouponId => {
  if (couponId === undefined) throw new Error(COUPON_ID_NOT_GIVEN)
  let id: CouponId | undefined = undefined
  try {
    id = new CouponId(couponId)
  } catch (e) {
    throw new Error(e)
  }
  return id
}

export type DecodeSearchCouponInputParams = {
  keyword?: string
  per?: string
  startKeyKey?: string
  startKeyCouponId?: string
} | null

export type DecodeSearchCouponInputResult = {
  keyword: Keyword
  per: PagePer | undefined
  startKey: StartKey | undefined
}

export const decodeSearchCouponInput = (
  params: DecodeSearchCouponInputParams
): DecodeSearchCouponInputResult => {
  if (params === null) throw new Error(PARAMS_NOT_GIVEN)
  if (params.keyword === undefined || params.keyword === '')
    throw new Error(SEARCH_KEYWORD_NOT_GIVEN)

  let keyword: Keyword | undefined = undefined
  try {
    keyword = new Keyword(params.keyword)
  } catch (e) {
    throw new Error(e.message)
  }

  const startKeysCount = [params.startKeyKey, params.startKeyCouponId].filter(
    (item) => item !== undefined
  ).length

  let startKey: StartKey | undefined = undefined
  switch (startKeysCount) {
    case 0:
      break
    case 1: {
      // 2つのStartKeyの片方だけ渡されるのはNG
      if (startKeysCount === 1) throw new Error(START_KEY_INVALID)
      break
    }
    case 2: {
      let key: Keyword | undefined = undefined
      let couponId: CouponId | undefined = undefined
      try {
        key = new Keyword(params.startKeyKey as string)
        couponId = new CouponId(params.startKeyCouponId as string)
      } catch (e) {
        throw new Error(e.message)
      }
      startKey = new StartKey(key, couponId)
      break
    }
    default:
      throw new Error(UNDEFINED_ERROR)
  }

  let per: PagePer | undefined = undefined
  if (params.per !== undefined) {
    if (isNaN(Number(params.per))) throw new Error(PER_INVALID)
    per = new PagePer(parseInt(params.per))
  }

  return {
    keyword,
    per,
    startKey,
  }
}

export type DecodeCreateCouponInputResult = {
  id: CouponId
  title: CouponTitle
  description: CouponDescription
  image: Base64
  qrCode: Base64
}

export type DecodeCreateCouponInputErrors = Array<string>
export type Ok = boolean

export const decodeCreateCouponInput = (
  body: string | null
): [Ok, DecodeCreateCouponInputResult | DecodeCreateCouponInputErrors] => {
  if (body === null) return [false, [PARAMS_NOT_GIVEN]]

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
    return [false, [INVALID_JSON]]
  }

  const errs: Array<string> = []

  let id: CouponId | undefined = undefined
  if (params.id === undefined) {
    errs.push(COUPON_ID_NOT_GIVEN)
  } else {
    try {
      id = new CouponId(params.id)
    } catch (e) {
      errs.push(e.message)
    }
  }

  let title: CouponTitle | undefined = undefined
  if (params.title === undefined) {
    errs.push(COUPON_TITLE_NOT_GIVEN)
  } else {
    try {
      title = new CouponTitle(params.title)
    } catch (e) {
      errs.push(e.message)
    }
  }

  let description: CouponDescription | undefined = undefined
  if (params.description === undefined) {
    errs.push(COUPON_DESCRIPTION_NOT_GIVEN)
  } else {
    try {
      description = new CouponDescription(params.description)
    } catch (e) {
      errs.push(e.message)
    }
  }

  let image: Base64 | undefined = undefined
  if (params.image === undefined) {
    errs.push(COUPON_IMAGE_NOT_GIVEN)
  } else {
    try {
      image = new Base64(params.image)
    } catch (e) {
      errs.push(e.message)
    }
  }

  let qrCode: Base64 | undefined = undefined
  if (params.qrCode === undefined) {
    errs.push(COUPON_QR_CODE_NOT_GIVEN)
  } else {
    try {
      qrCode = new Base64(params.qrCode)
    } catch (e) {
      errs.push(e.message)
    }
  }

  if (errs.length > 0) {
    return [false, errs]
  } else {
    return [
      true,
      {
        id,
        title,
        description,
        image,
        qrCode,
      } as DecodeCreateCouponInputResult,
    ]
  }
}
