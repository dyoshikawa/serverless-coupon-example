import { Url } from '../entity/Url'

export interface CouponStorage {
  save: (buf: Buffer, fileName: string) => Promise<Url>
}
