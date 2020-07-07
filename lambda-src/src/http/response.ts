import { APIGatewayProxyResult } from 'aws-lambda'

export const response = (
  value: any,
  opt?: {
    headers?: { [key: string]: string }
  }
): APIGatewayProxyResult => {
  const res: APIGatewayProxyResult = {
    statusCode: 200,
    body: JSON.stringify(value, null, 2),
  }
  if (opt?.headers !== undefined) {
    res.headers = opt.headers
  }
  return res
}

export type ErrorResponseBody = Array<{ message: string }>

export const requestError = (
  messages: Array<string>
): APIGatewayProxyResult => {
  return {
    statusCode: 400,
    body: JSON.stringify(
      messages.map((message) => ({ message })) as ErrorResponseBody,
      null,
      2
    ),
  }
}

export const serverError = (
  messages?: Array<string>
): APIGatewayProxyResult => {
  return {
    statusCode: 500,
    body: JSON.stringify(
      messages === undefined
        ? 'Internal server error.'
        : (messages.map((message) => ({ message })) as ErrorResponseBody),
      null,
      2
    ),
  }
}
