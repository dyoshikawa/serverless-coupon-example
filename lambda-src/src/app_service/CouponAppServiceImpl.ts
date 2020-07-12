import { v4 as uuidv4 } from 'uuid'
import { CouponRepository } from '../repository/CouponRepository'
import { ImageEncoder } from '../encoder/ImageEncoder'
import { Tokenizer } from '../tokenier/Tokenizer'
import { Coupon, CouponIndex } from '../entity/Coupon'
import { CouponAppService, SearchCouponResult, StartKey } from './CouponAppService'

export class CouponAppServiceImpl implements CouponAppService {
  private couponRepository: CouponRepository
  private imageEncoder: ImageEncoder
  private tokenizer: Tokenizer

  constructor({
    couponRepository,
    imageEncoder,
    tokenizer,
  }: {
    couponRepository: CouponRepository
    imageEncoder: ImageEncoder
    tokenizer: Tokenizer
  }) {
    this.couponRepository = couponRepository
    this.imageEncoder = imageEncoder
    this.tokenizer = tokenizer
  }

  async findById(couponId: string): Promise<Coupon> {
    return await this.couponRepository
      .findById(couponId)
      .catch((e) => Promise.reject(e))
  }

  async search({
    keyword,
    per,
    startKey,
  }: {
    keyword: string
    per?: number
    startKey?: StartKey
  }): Promise<SearchCouponResult> {
    return await this.couponRepository
      .findByWord({
        word: keyword,
        per,
        startKey,
      })
      .catch((e) => Promise.reject(e))
  }

  async create({
    id,
    title,
    description,
    imageBase64,
    qrCodeBase64,
  }: {
    id: string
    title: string
    description: string
    imageBase64: string
    qrCodeBase64: string
  }): Promise<Coupon> {
    const [decodedImage, decodedQrCode] = await Promise.all([
      this.imageEncoder.base64Decode(imageBase64),
      this.imageEncoder.base64Decode(qrCodeBase64),
    ]).catch((errs) => Promise.reject(errs))
    const imageName = `${uuidv4()}.${decodedImage.ext}`
    const qrCodeName = `${uuidv4()}.${decodedQrCode.ext}`

    return await this.couponRepository
      .save({
        id,
        title,
        description,
        imageFile: decodedImage.file,
        imageName,
        qrCodeFile: decodedQrCode.file,
        qrCodeName,
      })
      .catch((e) => Promise.reject(e))
  }

  async createIndexes(id: string, title: string): Promise<Array<CouponIndex>> {
    const keys = await this.tokenizer
      .pickWords(title)
      .catch((e) => Promise.reject(e))
    if (keys.length === 0) return []

    return await this.couponRepository
      .saveIndexes(keys.map((key) => ({ key, couponId: id })))
      .catch((e) => Promise.reject(e))
  }

  async updateIndexes(id: string, title: string): Promise<Array<CouponIndex>> {
    const keys = await this.tokenizer
      .pickWords(title)
      .catch((e) => Promise.reject(e))
    if (keys.length === 0) return []

    const oldIndexes = await this.couponRepository
      .findIndexesByCouponId(id)
      .catch((e) => Promise.reject(e))
    await this.couponRepository
      .destroyIndexes(
        oldIndexes.map(({ key, couponId }) => ({ key, couponId }))
      )
      .catch((e) => Promise.reject(e))
    return await this.couponRepository
      .saveIndexes(keys.map((key) => ({ key, couponId: id })))
      .catch((e) => Promise.reject(e))
  }

  async destroyIndexes(id: string): Promise<void> {
    const oldIndexes = await this.couponRepository
      .findIndexesByCouponId(id)
      .catch((e) => Promise.reject(e))
    await this.couponRepository
      .destroyIndexes(
        oldIndexes.map(({ key, couponId }) => ({ key, couponId }))
      )
      .catch((e) => Promise.reject(e))
  }
}
