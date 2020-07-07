import { decode, encode } from 'node-base64-image'
import { v4 as uuidv4 } from 'uuid'
import { fromBuffer } from 'file-type'
import { DecodeResult, ImageEncoder } from '../encoder/ImageEncoder'
import { readFileSync } from 'fs'
import { INVALID_BASE64, FILE_TYPE_NOT_FOUND } from '../constant/error'

export class ImageEncoderImpl implements ImageEncoder {
  private readonly workingDir: string

  constructor(workingDir?: string) {
    this.workingDir = workingDir || '/tmp'
  }

  async base64Encode(path: string): Promise<string | Buffer> {
    return await encode(path, {
      local: true,
      string: true,
    }).catch((e) => Promise.reject(e))
  }

  async base64Decode(base64: string): Promise<DecodeResult> {
    const tmpName = uuidv4()
    await decode(base64, {
      fname: `${this.workingDir}/${tmpName}`,
      ext: 'buf',
    }).catch((e) => {
      console.error(e)
      return Promise.reject(INVALID_BASE64)
    })
    const file = readFileSync(`${this.workingDir}/${tmpName}.buf`)
    const fileTypeRes = await fromBuffer(file)
    if (fileTypeRes === undefined)
      return Promise.reject(new Error(FILE_TYPE_NOT_FOUND))
    return {
      file,
      ext: fileTypeRes.ext,
    }
  }
}
