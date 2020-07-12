import * as AWS from 'aws-sdk'
import dayjs from 'dayjs'
import { DynamoTableDefiner } from './DynamoTableDefiner'
import { CouponDynamoRepository } from './CouponDynamoRepository'
import { CouponStorage } from '../storage/CouponStorage'
import { Time } from '../time/Time'
import {
  anyString,
  anything,
  instance,
  mock,
  resetCalls,
  when,
} from 'ts-mockito'
import { COUPON_NOT_FOUND } from '../constant/error'
import { CouponId } from '../entity/CouponId'
import { CouponTitle } from '../entity/CouponTitle'
import { CouponDescription } from '../entity/CouponDescription'
import { CouponIndexKey } from '../entity/CouponIndexKey'
import { Url } from '../entity/Url'

describe('CouponDynamoRepository', () => {
  const tableName = 'coupon-table'
  const indexTableName = 'coupon-index-table'
  const dynamoTableDefiner = new DynamoTableDefiner({
    dynamoClient: new AWS.DynamoDB({
      endpoint: 'http://localhost:4566',
      region: 'ap-northeast-1',
    }),
    tableName,
    indexTableName,
  })

  const dynamoClient = new AWS.DynamoDB.DocumentClient({
    endpoint: 'http://localhost:4566',
    region: 'ap-northeast-1',
  })

  const mockedCouponStorage = mock<CouponStorage>()
  const mockedTime = mock<Time>()

  beforeAll(async () => {
    await Promise.all([
      dynamoTableDefiner.createCouponTable().catch((e) => console.error(e)),
      dynamoTableDefiner
        .createCouponIndexTable()
        .catch((e) => console.error(e)),
    ]).catch((errs) => console.error(errs))
  })

  beforeEach(async () => {
    resetCalls(mockedCouponStorage)
    resetCalls(mockedTime)

    const couponStorage = instance(mockedCouponStorage)
    const time = instance(mockedTime)
    const couponDynamoRepository = new CouponDynamoRepository({
      dynamoClient,
      tableName,
      indexTableName,
      couponStorage,
      time,
    })
    const [coupons, couponIndexes] = await Promise.all([
      couponDynamoRepository.findAll(),
      couponDynamoRepository.findAllIndexes(),
    ])
    await Promise.all([
      Promise.all(
        coupons.map((coupon) => couponDynamoRepository.destroy(coupon.id))
      ),
      couponDynamoRepository.destroyIndexes(
        couponIndexes.map(({ key, couponId }) => ({ key, couponId }))
      ),
    ]).catch((e) => console.error(e))
  })

  it('クーポンを作成し、作成したクーポンをID指定で取得する', async () => {
    when(mockedCouponStorage.save(anything(), 'image.png')).thenResolve(
      'https://example.com/image.png'
    )
    when(mockedCouponStorage.save(anything(), 'qr_code.jpg')).thenResolve(
      'https://example.com/qr_code.png'
    )
    when(mockedTime.now()).thenReturn(dayjs('2020-01-01').toDate())
    when(mockedTime.format(anything(), anyString())).thenReturn('2020-01-01')
    when(mockedTime.fromString(anyString())).thenReturn(
      dayjs('2020-01-01').toDate()
    )

    const couponStorage = instance(mockedCouponStorage)
    const time = instance(mockedTime)
    const couponDynamoRepository = new CouponDynamoRepository({
      dynamoClient,
      tableName,
      indexTableName,
      couponStorage,
      time,
    })

    await couponDynamoRepository.save({
      id: new CouponId('0000001'),
      title: new CouponTitle('タイトル'),
      description: new CouponDescription('説明'),
      imageFile: Buffer.from('DUMMY'),
      imageName: 'image.png',
      qrCodeFile: Buffer.from('DUMMY'),
      qrCodeName: 'qr_code.jpg',
    })
    expect(
      await couponDynamoRepository.findById(new CouponId('0000001'))
    ).toEqual({
      id: new CouponId('0000001'),
      title: new CouponTitle('タイトル'),
      description: new CouponDescription('説明'),
      imageUrl: new Url('https://example.com/image.png'),
      qrCodeUrl: new Url('https://example.com/qr_code.png'),
      savedAt: dayjs('2020-01-01').toDate(),
    })
  })

  it('存在しないクーポンをID指定で取得しようとするとエラーを投げる', async () => {
    const couponStorage = instance(mockedCouponStorage)
    const time = instance(mockedTime)
    const couponDynamoRepository = new CouponDynamoRepository({
      dynamoClient,
      tableName,
      indexTableName,
      couponStorage,
      time,
    })
    await expect(
      couponDynamoRepository.findById(new CouponId('0000001'))
    ).rejects.toThrow(COUPON_NOT_FOUND)
  })

  it('クーポンとクーポンインデックスを作成し、キーワード検索でクーポンを取得する (1件)', async () => {
    when(mockedCouponStorage.save(anything(), 'image.png')).thenResolve(
      'https://example.com/image.png'
    )
    when(mockedCouponStorage.save(anything(), 'qr_code.jpg')).thenResolve(
      'https://example.com/qr_code.png'
    )
    when(mockedTime.now()).thenReturn(dayjs('2020-01-01').toDate())
    when(mockedTime.format(anything(), anyString())).thenReturn('2020-01-01')
    when(mockedTime.fromString(anyString())).thenReturn(
      dayjs('2020-01-01').toDate()
    )

    const couponStorage = instance(mockedCouponStorage)
    const time = instance(mockedTime)
    const couponDynamoRepository = new CouponDynamoRepository({
      dynamoClient,
      tableName,
      indexTableName,
      couponStorage,
      time,
    })

    await couponDynamoRepository.save({
      id: new CouponId('0000001'),
      title: new CouponTitle('【秋葉原店】全商品 10% OFF!'),
      description: new CouponDescription('説明'),
      imageFile: Buffer.from('DUMMY'),
      imageName: 'image.png',
      qrCodeFile: Buffer.from('DUMMY'),
      qrCodeName: 'qr_code.jpg',
    })
    await couponDynamoRepository
      .saveIndexes([
        {
          key: new CouponIndexKey('秋葉原店'),
          couponId: new CouponId('0000001'),
        },
        {
          key: new CouponIndexKey('商品'),
          couponId: new CouponId('0000001'),
        },
        {
          key: new CouponIndexKey('10%'),
          couponId: new CouponId('0000001'),
        },
      ])
      .catch((e) => console.error(e))
    const { coupons } = await couponDynamoRepository.findByWord({
      word: new CouponIndexKey('秋葉原店'),
    })
    expect(coupons).toEqual([
      {
        id: new CouponId('0000001'),
        title: new CouponTitle('【秋葉原店】全商品 10% OFF!'),
        description: new CouponDescription('説明'),
        imageUrl: new Url('https://example.com/image.png'),
        qrCodeUrl: new Url('https://example.com/qr_code.png'),
        savedAt: dayjs('2020-01-01').toDate(),
      },
    ])
  })

  it('ID指定したクーポンに紐づく既存インデックスを削除する', async () => {
    when(mockedCouponStorage.save(anything(), 'image.png')).thenResolve(
      'https://example.com/image.png'
    )
    when(mockedCouponStorage.save(anything(), 'qr_code.jpg')).thenResolve(
      'https://example.com/qr_code.png'
    )
    when(mockedTime.now()).thenReturn(dayjs('2020-01-01').toDate())
    when(mockedTime.format(anything(), anyString())).thenReturn('2020-01-01')
    when(mockedTime.fromString(anyString())).thenReturn(
      dayjs('2020-01-01').toDate()
    )

    const couponStorage = instance(mockedCouponStorage)
    const time = instance(mockedTime)
    const couponDynamoRepository = new CouponDynamoRepository({
      dynamoClient,
      tableName,
      indexTableName,
      couponStorage,
      time,
    })

    // 既存インデックス作成
    await couponDynamoRepository
      .saveIndexes([
        {
          key: new CouponIndexKey('秋葉原店'),
          couponId: new CouponId('0000001'),
        },
        {
          key: new CouponIndexKey('商品'),
          couponId: new CouponId('0000001'),
        },
        {
          key: new CouponIndexKey('OFF'),
          couponId: new CouponId('0000001'),
        },
        {
          key: new CouponIndexKey('広島店'),
          couponId: new CouponId('0000002'), // 削除対象外
        },
      ])
      .catch((e) => console.error(e))
    expect((await couponDynamoRepository.findAllIndexes()).length).toBe(4)

    // 検索と削除
    const couponIndexes = await couponDynamoRepository.findIndexesByCouponId(
      new CouponId('0000001')
    )
    await couponDynamoRepository.destroyIndexes(couponIndexes)
    // 削除対象外の1件は残る
    expect((await couponDynamoRepository.findAllIndexes()).length).toBe(1)
  })
})
