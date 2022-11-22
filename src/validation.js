const httpError = require('http-errors')
const _ = require('lodash')
const Ajv = require('ajv')
const addFormats = require('ajv-formats')

const REQUEST_VALIDATION_KEYS = ['query', 'body', 'params']

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true
})
addFormats(ajv)

function validate(schema, data) {
  const validate = ajv.compile(schema)
  const valid = validate(data)
  if (!valid) {
    throw validate.errors[0]
  }
}

function useValidator(schema, reqKey) {
  if (!REQUEST_VALIDATION_KEYS.includes(reqKey)) {
    throw new Error('参数校验定义错误')
  }
  return function(req, res, next) {
    const data = _.cloneDeep(req[reqKey])
    try {
      validate(schema, data)
    } catch (err) {
      throw httpError(400, err)
    }
    req['validated' + _.upperFirst(reqKey)] = data
    next()
  }
}

module.exports = {
  REQUEST_VALIDATION_KEYS,
  useValidator
}
