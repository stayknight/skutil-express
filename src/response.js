const httpError = require('http-errors')
const statuses = require('statuses')

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
    statusCode = getStatusCodeFromError(error, 500)
    customCode = getCustomCodeFromError(error, statusCode)
    if (statusCode < 500) {
      message = error.message
    }
  } else if (typeof error === 'string') {
    message = error
  }
  res.status(statusCode).json({ code: customCode, message })
}

function getStatusCodeFromError(error, defaultCode) {
  if (error.statusCode) return error.statusCode
  if (error.status && statuses.codes.indexOf(error.status) !== -1) {
    return error.status
  }
  if (error.code && statuses.codes.indexOf(error.code) !== -1) {
    return error.code
  }
  return defaultCode
}

function getCustomCodeFromError(error, defaultCode) {
  if (error.customCode) return error.customCode
  if (typeof error.code === 'number') {
    return error.code
  }
  return defaultCode
}
