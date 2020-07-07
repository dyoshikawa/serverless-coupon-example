import dayjs from 'dayjs'
import { TimeImpl } from './TimeImpl'

describe('TimeImpl', () => {
  const timeImpl = new TimeImpl()

  describe('now', () => {
    it('現在のDateインスタンスを取得する', () => {
      const now = timeImpl.now()
      expect(now instanceof Date).toBe(true)
    })
  })

  describe('format', () => {
    it('Dateインスタンスを指定書式に変換する', () => {
      const formatted = timeImpl.format(
        dayjs('2020-01-01').toDate(),
        'YYYY-MM-DD'
      )
      expect(formatted).toBe('2020-01-01')
    })
  })

  describe('fromString', () => {
    it('文字列をDateインスタンスに変換する', () => {
      const isoStr = '2020-01-01T00:00:00.000Z'
      const date = timeImpl.fromString(isoStr)
      expect(date instanceof Date).toBe(true)
    })
  })
})
