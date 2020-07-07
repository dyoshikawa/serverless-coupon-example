import {
  anyString,
  anything,
  instance,
  mock,
  resetCalls,
  verify,
  when,
} from 'ts-mockito'
import dayjs from 'dayjs'
import { CouponServiceImpl } from './CouponServiceImpl'
import { CouponRepository } from '../repository/CouponRepository'
import { ImageEncoder } from '../encoder/ImageEncoder'
import { Tokenizer } from '../tokenier/Tokenizer'
import { COUPON_NOT_FOUND } from '../constant/error'

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
    const coupon = {
      id: '0000001',
      title: 'タイトル',
      description: '説明',
      imageUrl: 'https://example.com/image.png',
      qrCodeUrl: 'https://example.com/qrcode.jpg',
      savedAt: dayjs('2020-01-01').toDate(),
      savedAtDay: '2020-01-01',
    }

    it('指定IDのクーポンを取得する', async () => {
      when(mockedCouponRepository.findById(anyString())).thenResolve(coupon)

      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const foundCoupon = await couponServiceImpl.findById('0000001')
      expect(foundCoupon).toEqual(coupon)
      verify(mockedCouponRepository.findById(anyString())).once()
    })

    it('指定IDのクーポンが存在しなかった場合、COUPON_NOT_FOUNDエラーを投げる', async () => {
      when(mockedCouponRepository.findById(anyString())).thenReject(
        new Error(COUPON_NOT_FOUND)
      )

      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      await expect(couponServiceImpl.findById('0000001')).rejects.toThrow(
        COUPON_NOT_FOUND
      )
      verify(mockedCouponRepository.findById(anyString())).once()
    })
  })

  describe('search', () => {
    const coupons = [
      {
        id: '0000001',
        title: 'タイトル',
        description: '説明',
        imageUrl: 'https://example.com/image.png',
        qrCodeUrl: 'https://example.com/qrcode.jpg',
        savedAt: dayjs('2020-01-01').toDate(),
        savedAtDay: '2020-01-01',
      },
    ]
    when(mockedCouponRepository.findByWord(anything())).thenResolve({
      coupons,
      startKey: undefined,
    })

    it('キーワード検索でクーポンを取得する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const searchRes = await couponServiceImpl.search({
        keyword: 'キーワード',
      })
      expect(searchRes).toEqual({
        coupons,
        startKey: undefined,
      })
      verify(mockedCouponRepository.findByWord(anything())).once()
    })
  })

  describe('create', () => {
    when(mockedCouponRepository.save(anything())).thenResolve({
      id: '0000001',
      title: 'タイトル',
      description: '説明',
      imageUrl: 'https://example.com/image.png',
      qrCodeUrl: 'https://example.com/qrcode.jpg',
      savedAt: dayjs('2020-01-01').toDate(),
      savedAtDay: '2020-01-01',
    })
    when(mockedImageEncoder.base64Decode(anyString())).thenResolve({
      file: Buffer.from('DUMMY'),
      ext: 'jpg',
    })

    it('クーポンを作成し取得する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const coupon = await couponServiceImpl.create({
        id: '0000001',
        title: 'タイトル',
        description: '説明',
        imageBase64: 'DUMMY',
        qrCodeBase64: 'DUMMY',
      })
      expect(coupon).toEqual({
        id: '0000001',
        title: 'タイトル',
        description: '説明',
        imageUrl: 'https://example.com/image.png',
        qrCodeUrl: 'https://example.com/qrcode.jpg',
        savedAt: dayjs('2020-01-01').toDate(),
        savedAtDay: '2020-01-01',
      })
      verify(mockedImageEncoder.base64Decode(anyString())).twice()
      verify(mockedCouponRepository.save(anything())).once()
    })
  })

  describe('createIndexes', () => {
    when(mockedCouponRepository.saveIndexes(anything())).thenResolve([
      {
        key: 'キーワード',
        couponId: '0000001',
        savedAt: dayjs('2020-01-01').toDate(),
      },
    ])
    when(mockedTokenizer.pickWords(anyString())).thenResolve(['キーワード'])

    it('クーポンインデックスを作成し取得する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const indexes = await couponServiceImpl.createIndexes(
        '0000001',
        'タイトル'
      )
      expect(indexes).toEqual([
        {
          key: 'キーワード',
          couponId: '0000001',
          savedAt: dayjs('2020-01-01').toDate(),
        },
      ])
      verify(mockedTokenizer.pickWords(anyString())).once()
      verify(mockedCouponRepository.saveIndexes(anything())).once()
    })
  })

  describe('updateIndexes', () => {
    const couponIndexes = [
      {
        key: 'キーワード',
        couponId: '0000001',
        savedAt: dayjs('2020-01-01').toDate(),
      },
    ]
    when(mockedCouponRepository.findIndexesByCouponId(anyString())).thenResolve(
      couponIndexes
    )
    when(mockedCouponRepository.destroyIndexes(anything())).thenResolve()
    when(mockedCouponRepository.saveIndexes(anything())).thenResolve(
      couponIndexes
    )
    when(mockedTokenizer.pickWords(anyString())).thenResolve(['キーワード'])

    it('クーポンインデックスを再作成し取得する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      const indexes = await couponServiceImpl.updateIndexes(
        '0000001',
        'タイトル'
      )
      expect(indexes).toEqual(couponIndexes)
      verify(mockedTokenizer.pickWords(anyString())).once()
      verify(mockedCouponRepository.findIndexesByCouponId(anyString())).once()
      verify(mockedCouponRepository.destroyIndexes(anything())).once()
      verify(mockedCouponRepository.saveIndexes(anything())).once()
    })
  })

  describe('destroyIndexes', () => {
    const couponIndexes = [
      {
        key: 'キーワード',
        couponId: '0000001',
        savedAt: dayjs('2020-01-01').toDate(),
      },
    ]
    when(mockedCouponRepository.findIndexesByCouponId(anyString())).thenResolve(
      couponIndexes
    )
    when(mockedCouponRepository.destroyIndexes(anything())).thenResolve()

    it('指定クーポンIDのインデックスを削除する', async () => {
      const couponRepository = instance(mockedCouponRepository)
      const imageEncoder = instance(mockedImageEncoder)
      const tokenizer = instance(mockedTokenizer)
      const couponServiceImpl = new CouponServiceImpl({
        couponRepository,
        imageEncoder,
        tokenizer,
      })
      await couponServiceImpl.destroyIndexes('0000001')
      verify(mockedCouponRepository.findIndexesByCouponId(anyString())).once()
      verify(mockedCouponRepository.destroyIndexes(anything())).once()
    })
  })
})
