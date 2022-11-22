const httpError = require('http-errors')
const _ = require('lodash')

const KEY_USER_AUTHORIZATION = '__user_authorization__'
const KEY_USER_AUTHORIZATION_FUNC = '__user_authorization_func__'
const JWT_APPEND_REQUEST_PROP = '__jwt_append_prop__'

module.exports = {
  KEY_USER_AUTHORIZATION,
  KEY_USER_AUTHORIZATION_FUNC,
  JWT_APPEND_REQUEST_PROP,
  rolesValidator,
  permissonsValidator
}

function rolesValidator(requiredRoles) {
  if (requiredRoles && typeof requiredRoles === 'string') {
    requiredRoles = [requiredRoles]
  } else if (!requiredRoles || !Array.isArray(requiredRoles)) {
    throw new Error('角色校验参数不正确')
  }
  return async function(req, res, next) {
    const jwtAuthKey = req.app.settings[JWT_APPEND_REQUEST_PROP] || 'auth'
    if (!req[jwtAuthKey]) {
      throw new httpError.Unauthorized('请登录')
    }
    const getUserAuthorization = req.app.settings[KEY_USER_AUTHORIZATION_FUNC]
    if (!_.isFunction(getUserAuthorization)) {
      throw new Error('获取权限信息失败')
    }
    const { isAdmin, roles } = await getUserAuthorization(req[jwtAuthKey])

    if (!isAdmin) {
      let canProceed = false
      if (Array.isArray(roles)) {
        canProceed = roles.some(r => requiredRoles.includes(r))
      }
      if (!canProceed) {
        throw new httpError.Forbidden(`权限不足`)
      }
    }
    const userAuthKey = req.app.settings[KEY_USER_AUTHORIZATION]
    req[userAuthKey] = _.merge({ isAdmin, roles }, req[userAuthKey] || {})
    next()
  }
}

function permissonsValidator(requiredPermissions) {
  if (requiredPermissions && typeof requiredPermissions === 'string') {
    requiredPermissions = [requiredPermissions]
  } else if (!requiredPermissions || !Array.isArray(requiredPermissions)) {
    throw new Error('权限校验参数不正确')
  }
  return async function(req, res, next) {
    const jwtAuthKey = req.app.settings[JWT_APPEND_REQUEST_PROP] || 'auth'
    if (!req[jwtAuthKey]) {
      throw new httpError.Unauthorized('请登录')
    }
    const getUserAuthorization = req.app.settings[KEY_USER_AUTHORIZATION_FUNC]
    if (!_.isFunction(getUserAuthorization)) {
      throw new Error('获取权限信息失败')
    }
    const { isAdmin, permissions } = await getUserAuthorization(req[jwtAuthKey])

    if (!isAdmin) {
      let canProceed = false
      if (Array.isArray(permissions)) {
        canProceed = permissions.some(r => requiredPermissions.includes(r))
      }
      if (!canProceed) {
        throw new httpError.Forbidden(`权限不足`)
      }
    }
    const userAuthKey = req.app.settings[KEY_USER_AUTHORIZATION]
    req[userAuthKey] = _.merge({ isAdmin, permissions }, req[userAuthKey] || {})
    next()
  }
}
