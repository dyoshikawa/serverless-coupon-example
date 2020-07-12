import {
  decodeCreateCouponInput,
  decodeFindCouponByIdInput,
  decodeSearchCouponInput,
  DecodeSearchCouponInputParams,
} from './ParameterDecoder'
import {
  COUPON_ID_NOT_GIVEN,
  COUPON_TITLE_EMPTY,
  COUPON_TITLE_INVALID,
  COUPON_TITLE_NOT_GIVEN,
  INVALID_JSON,
  PARAMS_NOT_GIVEN,
  PER_INVALID,
  SEARCH_KEYWORD_NOT_GIVEN,
  START_KEY_INVALID,
} from '../../constant/error'
import { jpgBase64, pngBase64 } from '../../test/Base64String'
import { CouponIndexKey } from '../../entity/CouponIndexKey'
import { CouponId } from '../../entity/CouponId'
import { CouponIndex } from '../../entity/Coupon'
import { PagePer } from '../../entity/PagePer'
import { CouponTitle } from '../../entity/CouponTitle'
import { CouponDescription } from '../../entity/CouponDescription'
import { Base64 } from '../../entity/Base64'

describe('ParameterDecoder', () => {
  describe('decodeFindCouponByIdInput', () => {
    it('クーポンIDの文字列を渡した場合、CouponIdインスタンスとして返す', () => {
      expect(decodeFindCouponByIdInput('0000001')).toEqual(
        new CouponId('0000001')
      )
    })

    it('undefinedを渡した場合、エラーを投げる', () => {
      expect(() => {
        decodeFindCouponByIdInput(undefined)
      }).toThrow(new Error(COUPON_ID_NOT_GIVEN))
    })
  })

  describe('decodeSearchCouponInput', () => {
    it('全パラメータを満たして渡した場合、変換して返す', () => {
      const params: DecodeSearchCouponInputParams = {
        keyword: 'キーワード',
        per: '5',
        startKeyKey: 'キーワード',
        startKeyCouponId: '0000001',
      }
      expect(decodeSearchCouponInput(params)).toEqual({
        keyword: new CouponIndexKey('キーワード'),
        per: new PagePer(5),
        startKey: {
          key: new CouponIndexKey('キーワード'),
          couponId: new CouponId('0000001'),
        },
      })
    })

    it('nullを渡した場合、エラーを投げる', () => {
      expect(() => {
        decodeSearchCouponInput(null)
      }).toThrow(new Error(PARAMS_NOT_GIVEN))
    })

    it('キーワードを渡さなかった場合、エラーを投げる', () => {
      expect(() => {
        decodeSearchCouponInput({
          keyword: undefined,
        })
      }).toThrow(new Error(SEARCH_KEYWORD_NOT_GIVEN))
    })

    it('perを数値変換できない文字列で渡した場合、エラーを投げる', () => {
      expect(() => {
        decodeSearchCouponInput({
          keyword: 'キーワード',
          per: '五',
        })
      }).toThrow(new Error(PER_INVALID))
    })

    it('startKeyを片方だけ渡した場合、エラーを投げる', () => {
      expect(() => {
        decodeSearchCouponInput({
          keyword: 'キーワード',
          startKeyKey: 'キーワード',
        })
      }).toThrow(new Error(START_KEY_INVALID))
    })
  })

  describe('decodeCreateCouponInput', () => {
    it('全パラメータを満たし、文字列で渡した場合、Objectに変換して返す', () => {
      const params = {
        id: '0000001',
        title: 'タイトル',
        description: '説明',
        image: pngBase64,
        qrCode: jpgBase64,
      }
      const [ok, res] = decodeCreateCouponInput(JSON.stringify(params))
      expect(ok).toBe(true)
      expect(res).toEqual({
        id: new CouponId('0000001'),
        title: new CouponTitle('タイトル'),
        description: new CouponDescription('説明'),
        image: new Base64(pngBase64),
        qrCode: new Base64(jpgBase64),
      })
    })

    it('JSONでない文字列を渡した場合、エラー配列を返す', () => {
      const [ok, res] = decodeCreateCouponInput('JSONでない文字列')
      expect(ok).toBe(false)
      expect(res).toEqual([INVALID_JSON])
    })

    it('titleが欠けた場合、エラー配列を返す', () => {
      const params = {
        id: '0000001',
        description: '説明',
        image: pngBase64,
        qrCode: jpgBase64,
      }
      const [ok, res] = decodeCreateCouponInput(JSON.stringify(params))
      expect(ok).toBe(false)
      expect(res).toEqual([COUPON_TITLE_NOT_GIVEN])
    })

    it('titleが空文字の場合、エラーを投げる', () => {
      const params = {
        id: '0000001',
        title: '',
        description: '説明',
        image: pngBase64,
        qrCode: jpgBase64,
      }
      const [ok, res] = decodeCreateCouponInput(JSON.stringify(params))
      expect(ok).toBe(false)
      expect(res).toEqual([COUPON_TITLE_INVALID])
    })
  })
})
