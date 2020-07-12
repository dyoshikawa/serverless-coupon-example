import { anything, instance, mock, resetCalls, verify, when } from 'ts-mockito'
import { CouponAppServiceImpl } from './CouponAppServiceImpl'
import { CouponRepository } from '../repository/CouponRepository'
import { ImageEncoder } from '../encoder/ImageEncoder'
import { Tokenizer } from '../tokenier/Tokenizer'
import { COUPON_NOT_FOUND } from '../constant/error'
import { CouponId } from '../entity/CouponId'
import { CouponTitle } from '../entity/CouponTitle'
import { buildCoupon, buildCouponIndex } from '../test/factory/CouponFactory'
import { Keyword } from '../entity/Keyword'
import { CouponDescription } from '../entity/CouponDescription'
import { Base64 } from '../entity/Base64'
import { jpgBase64, pngBase64 } from '../test/Base64String'

describe('CouponServiceImpl', () => {
  const mockedCouponRepository = mock<CouponRepository>()
  const mockedImageEncoder = mock<ImageEncoder>()
  const mockedTokenizer = mock<Tokenizer>()

  beforeEach(() => {
    resetCalls(mockedCouponRepository)
    resetCalls(mockedImageEncoder)
    resetCalls(mockedTokenizer)
  })

  describe('findById', () => {
    it('指定IDのクーポンを取得する', async () => {
      const couponId = new CouponId('0000001')
      when(mockedCouponRepository.findById(couponId)).thenResolve(buildCoupon())

      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponAppServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const foundCoupon = await couponServiceImpl.findById(couponId)
      expect(foundCoupon).toEqual(buildCoupon())
      verify(mockedCouponRepository.findById(couponId)).once()
    })

    it('指定IDのクーポンが存在しなかった場合、COUPON_NOT_FOUNDエラーを投げる', async () => {
      const couponId = new CouponId('0000001')
      when(mockedCouponRepository.findById(couponId)).thenReject(
        new Error(COUPON_NOT_FOUND)
      )

      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponAppServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      await expect(couponServiceImpl.findById(couponId)).rejects.toThrow(
        COUPON_NOT_FOUND
      )
      verify(mockedCouponRepository.findById(couponId)).once()
    })
  })

  describe('search', () => {
    const coupons = [buildCoupon()]
    when(mockedCouponRepository.findByKeyword(anything())).thenResolve({
      coupons,
      startKey: undefined,
    })

    it('キーワード検索でクーポンを取得する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponAppServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const searchRes = await couponServiceImpl.search({
        keyword: new Keyword('キーワード'),
      })
      expect(searchRes).toEqual({
        coupons,
        startKey: undefined,
      })
      verify(mockedCouponRepository.findByKeyword(anything())).once()
    })
  })

  describe('create', () => {
    when(mockedCouponRepository.save(anything())).thenResolve(buildCoupon())

    const jpgBase64Data = new Base64(jpgBase64)
    when(mockedImageEncoder.base64Decode(jpgBase64Data)).thenResolve({
      file: Buffer.from('DUMMY'),
      ext: 'jpg',
    })

    const pngBase64Data = new Base64(pngBase64)
    when(mockedImageEncoder.base64Decode(pngBase64Data)).thenResolve({
      file: Buffer.from('DUMMY'),
      ext: 'jpg',
    })

    it('クーポンを作成し取得する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponAppServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const coupon = await couponServiceImpl.create({
        id: new CouponId('0000001'),
        title: new CouponTitle('タイトル'),
        description: new CouponDescription('説明'),
        imageBase64: jpgBase64Data,
        qrCodeBase64: pngBase64Data,
      })
      expect(coupon).toEqual(buildCoupon())
      verify(mockedImageEncoder.base64Decode(jpgBase64Data)).once()
      verify(mockedImageEncoder.base64Decode(pngBase64Data)).once()
      verify(mockedCouponRepository.save(anything())).once()
    })
  })

  describe('createIndexes', () => {
    when(mockedCouponRepository.saveIndexes(anything())).thenResolve([
      buildCouponIndex(),
    ])

    const couponTitle = new CouponTitle('タイトル')
    when(mockedTokenizer.pickWords(couponTitle.toString())).thenResolve([
      'キーワード',
    ])

    it('クーポンインデックスを作成し取得する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponAppServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const indexes = await couponServiceImpl.createIndexes(
        new CouponId('0000001'),
        couponTitle
      )
      expect(indexes).toEqual([buildCouponIndex()])
      verify(mockedTokenizer.pickWords(couponTitle.toString())).once()
      verify(mockedCouponRepository.saveIndexes(anything())).once()
    })
  })

  describe('updateIndexes', () => {
    const couponIndexes = [buildCouponIndex()]

    const couponId = new CouponId('0000001')
    when(mockedCouponRepository.findIndexesByCouponId(couponId)).thenResolve(
      couponIndexes
    )
    when(mockedCouponRepository.destroyIndexes(anything())).thenResolve()
    when(mockedCouponRepository.saveIndexes(anything())).thenResolve(
      couponIndexes
    )

    const keyword = new Keyword('タイトル')
    when(mockedTokenizer.pickWords(keyword.toString())).thenResolve([
      'キーワード',
    ])

    it('クーポンインデックスを再作成し取得する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponAppServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const indexes = await couponServiceImpl.updateIndexes(
        couponId,
        new CouponTitle('タイトル')
      )
      expect(indexes).toEqual(couponIndexes)
      verify(mockedTokenizer.pickWords(keyword.toString())).once()
      verify(mockedCouponRepository.findIndexesByCouponId(couponId)).once()
      verify(mockedCouponRepository.destroyIndexes(anything())).once()
      verify(mockedCouponRepository.saveIndexes(anything())).once()
    })
  })

  describe('destroyIndexes', () => {
    const couponIndexes = [buildCouponIndex()]

    const couponId = new CouponId('0000001')
    when(mockedCouponRepository.findIndexesByCouponId(couponId)).thenResolve(
      couponIndexes
    )

    when(mockedCouponRepository.destroyIndexes(anything())).thenResolve()

    it('指定クーポンIDのインデックスを削除する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponAppServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      await couponServiceImpl.destroyIndexes(couponId)
      verify(mockedCouponRepository.findIndexesByCouponId(couponId)).once()
      verify(mockedCouponRepository.destroyIndexes(anything())).once()
    })
  })
})
