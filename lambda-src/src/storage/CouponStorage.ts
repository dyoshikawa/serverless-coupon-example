export interface CouponStorage {
  save: (buf: Buffer, fileName: string) => Promise<string>
}
