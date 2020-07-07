import Axios from 'axios'
import * as Faker from 'faker/locale/ja'
import * as Querystring from 'querystring'
import * as Dotenv from 'dotenv'
import { ImageEncoderImpl } from './infrastructure/ImageEncoderImpl'
import { ImageEncoder } from './encoder/ImageEncoder'

type Container = {
  imageEncoder: ImageEncoder
}

const clientBootstrap = (): Container => ({
  imageEncoder: new ImageEncoderImpl(),
})

const findById = async (baseUrl: string, couponId: string): Promise<any> => {
  return (
    await Axios.get(`${baseUrl}/coupons/${couponId}`).catch((e) =>
      Promise.reject(e)
    )
  ).data
}

const create = async (container: Container, baseUrl: string): Promise<any> => {
  const { imageEncoder } = container
  const imageBase64 = await imageEncoder.base64Encode(
    './resource/coupon_image.png'
  )
  const qrCodeBase64 = await imageEncoder.base64Encode(
    './resource/coupon_qr_code.jpg'
  )

  const res = await Axios.post(`${baseUrl}/coupons`, {
    id: Faker.random.number(9999999).toString(),
    title: '【秋葉原店】全商品 10% OFF!',
    description:
      'ご利用一回限り。他のクーポンとの併用はできません。クーポンをご利用いただいた場合、ポイントはつきません。',
    image: imageBase64,
    qrCode: qrCodeBase64,
  } as {
    id: string
    title: string
    description: string
    image: string
    qrCode: string
  }).catch((e) => {
    return Promise.reject(e)
  })

  return res.data
}

const search = async (baseUrl): Promise<any> => {
  const rec = async (
    data: Array<any>,
    cnt: number,
    opt?: {
      startKeyKey: string
      startKeyCouponId: string
    }
  ) => {
    if (cnt > 0) console.log(`${cnt}ページ目取得完了`)
    if (
      cnt > 0 &&
      ([opt?.startKeyKey, opt?.startKeyCouponId].includes(undefined) ||
        [opt?.startKeyKey, opt?.startKeyCouponId].includes(''))
    )
      return data
    console.log(`${cnt + 1}ページ目取得開始`)
    const urlParams: {
      keyword: string
      startKeyKey?: string
      startKeyCouponId?: string
    } = {
      keyword: '商品',
    }
    if (opt?.startKeyKey !== undefined)
      urlParams.startKeyKey = decodeURI(opt.startKeyKey)
    if (opt?.startKeyCouponId !== undefined)
      urlParams.startKeyCouponId = opt.startKeyCouponId
    const urlParamsStr = Querystring.stringify(urlParams)
    const res = await Axios.get(
      `${baseUrl}/coupons/search?${urlParamsStr}`
    ).catch((e) => Promise.reject(e))
    return await rec(data.concat(res.data), cnt + 1, {
      startKeyKey: res.headers['x-coupon-start-key-key'],
      startKeyCouponId: res.headers['x-coupon-start-key-coupon-id'],
    })
  }

  const res = await rec([], 0)
  console.log(`結果: ${res.length}件`)
  return res
}

export const main = async (): Promise<any> => {
  Dotenv.config({ path: './client.env' })
  const baseUrl = process.env['BASE_URL']
  if (baseUrl === undefined) throw new Error('Undefined: baseUrl')

  const container = clientBootstrap()
  const arg = process.argv[2]
  if (arg === undefined) return Promise.reject(new Error('Undefined: arg'))
  switch (arg) {
    case 'findById': {
      const couponId = process.argv[3]
      if (couponId === undefined) throw new Error('Undefined: couponId')
      return await findById(baseUrl, couponId).catch((e) => Promise.reject(e))
    }
    case 'create': {
      return await create(container, baseUrl).catch((e) => Promise.reject(e))
    }
    case 'search': {
      return await search(baseUrl).catch((e) => Promise.reject(e))
    }
    default: {
      return Promise.reject(new Error('Invalid value: arg'))
    }
  }
}

main()
  .then((res) => console.log(res))
  .catch((e) => console.log(e))
