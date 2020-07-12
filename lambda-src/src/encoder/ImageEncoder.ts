import { Base64 } from '../entity/Base64'

export type DecodeResult = {
  file: Buffer
  ext: string
}

export interface ImageEncoder {
  base64Encode: (path: string) => Promise<string | Buffer>
  base64Decode: (base64: Base64) => Promise<DecodeResult>
}
