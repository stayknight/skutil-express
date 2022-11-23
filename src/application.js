const fs = require('fs')
const fsUtil = require('skutil').fs
const express = require('express')
require('express-async-support')
const httpError = require('http-errors')
const http = require('http')
const mixin = require('merge-descriptors')
const respUtil = require('./response')
const {
  KEY_USER_AUTHORIZATION,
  KEY_USER_AUTHORIZATION_FUNC,
  JWT_APPEND_REQUEST_PROP
} = require('./permission')
const useController = require('./controller')
const jwtUtil = require('skutil-express-jwt')

const appExtend = {}

exports = module.exports = function createApp() {
  const app = express()
  mixin(app, appExtend, false)
  return app
}
mixin(exports, express, false)

appExtend.setUserAuth = function(key, fn) {
  this.set(KEY_USER_AUTHORIZATION, key)
  this.set(KEY_USER_AUTHORIZATION_FUNC, fn)
}

appExtend.initJWT = function(secret, signOpts, verifyOpts) {
  signOpts = signOpts || {}
  verifyOpts = verifyOpts || {}
  verifyOpts.requestProperty = verifyOpts.requestProperty || 'user'
  const algorithms = signOpts.algorithm ? [signOpts.algorithm] : ['HS256']
  jwtUtil.init({
    secret: secret,
    algorithms: algorithms,
    sign: signOpts,
    verify: verifyOpts
  })
  this.set(JWT_APPEND_REQUEST_PROP, verifyOpts.requestProperty)
}

appExtend.jwtSign = function(payload, signOpts) {
  jwtUtil.sign(payload, signOpts)
}

appExtend.startServe = function(port) {
  this.useLastMiddlewares()
  const server = http.createServer(this)
  server.listen(port)
  server.on('listening', () => {
    const addr = server.address()
    console.debug(`server is listening on ${addr.address}:${addr.port}`)
  })
  /**
   * Event listener for HTTP server "error" event.
   */
  server.on('error', function onError(error) {
    if (error.syscall !== 'listen') {
      throw error
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${port} requires elevated privileges`)
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(`Port ${port} is already in use`)
        process.exit(1)
        break
      default:
        throw error
    }
  })
}

appExtend.useLastMiddlewares = function() {
  const app = this
  app.use((req, res, next) => {
    next(new httpError.NotImplemented())
  })
  app.use((err, req, res, next) => {
    respUtil.sendError(res, err)
  })
}

appExtend.loadControllers = function(controllersPath) {
  controllersPath = fs.realpathSync(controllersPath)
  const files = fsUtil.listFiles(controllersPath)
  for (const file of files) {
    const controller = require(file.path)
    if (Array.isArray(controller)) {
      controller.forEach((item, index) => {
        useController(this, `${file.name}[${index}]`, item)
      })
    } else if (typeof controller === 'object') {
      for (const key in controller) {
        useController(this, `${file.name}.${key}`, controller[key])
      }
    }
  }
}
