const unwrapEnv = (key: string): string => {
  const value = process.env[key]
  if (value === undefined) {
    throw new Error(`Undefined env: ${key}`)
  }
  return value
}

export const couponTableName = (): string => unwrapEnv('COUPON_TABLE_NAME')
export const couponIndexTableName = (): string =>
  unwrapEnv('COUPON_INDEX_TABLE_NAME')
export const bucketName = (): string => unwrapEnv('BUCKET_NAME')
export const domainName = (): string => unwrapEnv('DOMAIN_NAME')
export const allowOrigin = (): string => unwrapEnv('ALLOW_ORIGIN')
