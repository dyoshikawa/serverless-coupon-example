import { APIGatewayProxyResult } from 'aws-lambda'
import * as Config from '../../config'

const defaultHeaders = {
  'Access-Control-Allow-Origin': Config.allowOrigin(),
}

export const response = (
  value: unknown,
  opt?: {
    headers?: { [key: string]: string }
  }
): APIGatewayProxyResult => {
  const res: APIGatewayProxyResult = {
    statusCode: 200,
    headers: {
      ...defaultHeaders,
    },
    body: JSON.stringify(value, null, 2),
  }
  if (opt?.headers !== undefined) {
    res.headers = {
      ...res.headers,
      ...opt.headers,
    }
  }
  return res
}

export type ErrorResponseBody = Array<{ message: string }>

export const requestError = (
  messages: Array<string>
): APIGatewayProxyResult => {
  return {
    statusCode: 400,
    headers: defaultHeaders,
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
    headers: defaultHeaders,
    body: JSON.stringify(
      messages === undefined
        ? 'Internal server error.'
        : (messages.map((message) => ({ message })) as ErrorResponseBody),
      null,
      2
    ),
  }
}
