const httpError = require('http-errors')

module.exports = {
  sendOk,
  sendError
}

function sendOk(res, data) {
  const statusCode = res.statusCode || 200
  const resContent = { code: statusCode, message: 'ok' }
  if (data) {
    resContent.data = data
  }
  res.status(statusCode).json(resContent)
}

function sendError(res, error) {
  let statusCode = 500
  let customCode = statusCode
  let message = '服务器内部错误'
  if (httpError.isHttpError(error)) {
    statusCode = error.statusCode
    customCode = statusCode
    message = error.message
  } else if (typeof error === 'object') {
    statusCode = error.statusCode || error.status || error.code || 500
    customCode = error.customCode || error.code || statusCode
    if (statusCode < 500) {
      message = error.message
    }
  } else if (typeof error === 'string') {
    message = error
  }
  res.status(statusCode).json({ code: customCode, message })
}
