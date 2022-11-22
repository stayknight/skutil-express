A further encapsulation of express app, support convenient route definition.

- extend with little change from expressJS
- support async middlewares
- define controllers similar to nestjs, automatic load all controllers
- support jwt by express-jwt
- support ajv validation of query, params, body
- support an implementation of RDBC and CASL
- uniform json response by controller return, while support full customization

## Install
```bash
yarn add skutil-express
```

## Usage example

```javascript
/////////////////////////////////////////
// server.js
const express = require('skutil-express');
const bodyParser = require('body-parser')

const app = express();
app.initJWT('123456', { expiresIn: '2h' }, { requestProperty: 'user' })
app.setUserAuth('userAuth', async (jwtAuth) => {
  return { isAdmin: false, roles: ['reader'], permissions: ['book.query'] }
})
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.loadControllers(path.join(__dirname, 'controllers'))
app.startServe(3000)

/////////////////////////////////////////
// controllers/demo.js
const jwtUtil = require('skutil-express-jwt')
module.exports = {
  hello: {
    method: 'get',
    path: '/api/hello',
    handler: function(req, res) {
      res.status(200).send('hello, world')
    }
  },
  helloAgain: {
    method: 'get',
    path: '/api/helloAgain',
    handler: function(req, res) {
      return 'hello, again'
    }
  },
  login: {
    method: 'post',
    path: '/api/user/login',
    bodySchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          pattern: '^[a-zA-Z0-9_-]{5,16}$'
        },
        password: {
          type: 'string',
          format: 'password'
        }
      }
    },
    handler: async function(req, res) {
      const { username, password } = req.validatedBody
      const token = jwtUtil.sign({ id: 1, username })
      return { token }
    }
  },

  getBook: {
    method: 'get',
    path: '/api/books/:id',
    paramsSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    },
    jwt: true,
    permissions: ['book.query'],
    handler: async function(req, res) {
      const { id } = req.validatedParams
      return { id, title: 'Fly' }
    }
  },

  getUser: {
    method: 'get',
    path: '/api/users/:id',
    paramsSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' }
      }
    },
    jwt: true,
    permissions: ['user.query'],
    handler: async function(req, res) {
      const { id } = req.validatedParams
      return { id, username: 'Kevin' }
    }
  }
}
```

## Controller explaination

1. Controller files are loaded recursively
2. A controller file contains group of routes, supports array and object(like in the examples above). For object, the key of route is useless.
3. A Controller route is an object with the following fields:
  - `method`: String. The http method supported by express
  - `path`: String. The route path
  - `schema`: Object. Contains at least one of `query, params, body` fields, each field is a valid ajv schema.
  - `querySchema`, `paramsSchema`, `bodySchema`: a convenient way to define schema.
    * The `query, params, body` of request will not change after ajv validation. Instead, the validated data will be appended to the request as `validatedQuery, validatedParams, validateBody`.
  - `jwt`: Boolean. Use jwt verification or not.
  - `roles`: Array<string>. The keys of roles allowed to access. if `roles` is used, then the function provided by `app.setUserAuth` must return the roles assigned to the user, or the authorization will fail.
  - `permissions`: Array<string>. The keys of permissions allowed to access. if `permissions` is used, then the function provided by `app.setUserAuth` must return the permissions assigned to the user, or the authorization will fail. 
  - `handler`: the function handling the request in format. async function and error thrown are supported. the result returned by the handler will be send to the client.
    * the default response body is in json format of `{ code, message, data }`, the result of function return is the data part.

## Maintainers

- [StayKnight](https://github.com/stayknight)
