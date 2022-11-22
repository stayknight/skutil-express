const methods = require('methods')
const _ = require('lodash')
const jwtUtil = require('skutil-express-jwt')
const respUtil = require('./response')
const { REQUEST_VALIDATION_KEYS, useValidator } = require('./validation')
const { rolesValidator, permissonsValidator } = require('./permission')

module.exports = function useController(router, name, c) {
  if (!c || typeof c !== 'object') {
    throw Error(`controller ${name} is invalid, please check!!`)
  }
  if (methods.indexOf(c.method) === -1) {
    throw Error(`controller ${name}.method is missing or invalid!!`)
  }
  if (typeof c.path !== 'string') {
    throw Error(`controller ${name}.path is missing or invalid!!`)
  }
  if (!_.isFunction(c.handler)) {
    throw Error(`controller ${name}.handler is not a function!!`)
  }
  let midwares = []
  if (c.jwt) {
    midwares.push(jwtUtil.createMidware())
  }
  if (c.roles) {
    midwares.push(rolesValidator(c.roles))
  }
  if (c.permissions) {
    midwares.push(permissonsValidator(c.permissions))
  }
  if (Array.isArray(c.midwares)) {
    midwares = midwares.concat(c.midwares)
  }
  if (typeof c.schema === 'object') {
    for (const key of REQUEST_VALIDATION_KEYS) {
      if (Object.prototype.hasOwnProperty.call(c.schema, key)) {
        midwares.push(useValidator(c.schema[key], key))
      }
    }
  }
  if (c.querySchema) {
    midwares.push(useValidator(c.querySchema, 'query'))
  }
  if (c.paramsSchema) {
    midwares.push(useValidator(c.paramsSchema, 'params'))
  }
  if (c.bodySchema) {
    midwares.push(useValidator(c.bodySchema, 'body'))
  }
  midwares.push(midwareFromHandler(c.handler))

  router[c.method](c.path, ...midwares)
}

function midwareFromHandler(handler) {
  return function(req, res, next) {
    Promise.resolve(handler(req, res)).then(data => {
      // 已经发送回应则不再调用
      if (!res.writableEnded && !res.headersSent) {
        respUtil.sendOk(res, data)
      }
    }).catch(next)
  }
}
