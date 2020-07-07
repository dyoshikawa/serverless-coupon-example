import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { bootstrap } from '../bootstrap'
import { response, serverError } from '../http/response'

export const createCoupon = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const reqBody = event.body
  if (reqBody === null) throw new Error('')

  const { couponService } = bootstrap()

  const { id, title, description, image, qrCode } = JSON.parse(reqBody) as {
    id: string
    title: string
    description: string
    image: string
    qrCode: string
  }

  return await couponService
    .create({
      id,
      title,
      description,
      imageBase64: image,
      qrCodeBase64: qrCode,
    })
    .then((coupon) => response(coupon))
    .catch((e) => {
      console.error(e)
      return serverError()
    })
}
