import {
  decodeFindCouponById,
  DecodeSearchCouponParams,
  decodeSearchCouponParams,
} from './ParameterDecoder'
import {
  COUPON_ID_NOT_GIVEN,
  PARAMS_NOT_GIVEN, PER_INVALID,
  SEARCH_KEYWORD_NOT_GIVEN, START_KEY_INVALID,
} from '../../constant/error'

describe('ParameterDecoder', () => {
  describe('decodeFindCouponId', () => {
    it('クーポンIDの文字列を渡した場合、文字列をそのまま返す', () => {
      expect(decodeFindCouponById('0000001')).toBe('0000001')
    })

    it('undefinedを渡した場合、エラーを投げる', () => {
      expect(() => {
        decodeFindCouponById(undefined)
      }).toThrow(new Error(COUPON_ID_NOT_GIVEN))
    })
  })

  describe('decodeFindCouponId', () => {
    it('全パラメータを満たして渡した場合、変換して返す', () => {
      const params: DecodeSearchCouponParams = {
        keyword: 'キーワード',
        per: '5',
        startKeyKey: 'キーワード',
        startKeyCouponId: '0000001',
      }
      expect(decodeSearchCouponParams(params)).toEqual({
        keyword: 'キーワード',
        per: 5,
        startKey: {
          key: 'キーワード',
          couponId: '0000001',
        },
      })
    })

    it('nullを渡した場合、エラーを投げる', () => {
      expect(() => {
        decodeSearchCouponParams(null)
      }).toThrow(new Error(PARAMS_NOT_GIVEN))
    })

    it('キーワードを渡さなかった場合、エラーを投げる', () => {
      expect(() => {
        decodeSearchCouponParams({
          keyword: undefined,
        })
      }).toThrow(new Error(SEARCH_KEYWORD_NOT_GIVEN))
    })

    it('perを数値変換できない文字列で渡した場合、エラーを投げる', () => {
      expect(() => {
        decodeSearchCouponParams({
          keyword: 'キーワード',
          per: '五',
        })
      }).toThrow(new Error(PER_INVALID))
    })

    it('startKeyを片方だけ渡した場合、エラーを投げる', () => {
      expect(() => {
        decodeSearchCouponParams({
          keyword: 'キーワード',
          startKeyKey: 'キーワード',
        })
      }).toThrow(new Error(START_KEY_INVALID))
    })
  })
})
