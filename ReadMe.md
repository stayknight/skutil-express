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

## Express extended functions

```typescript
  interface Express extends express.Express {
    /**
     * The jwt is required by the controller's implementation, and thus need to be initiallized from the app
     * The default algorithm is HS256
     * @param secret
     * @param signOpts the sign options supported by jsonwebtoken, such as `expiresIn`
     * @param verifyOpts the verify options supported by express-jwt, such as `requestProperty`
     * */
    initJWT(secret: string, signOpts?: SignOptions, verifyOpts?: VerifyOpts): undefined;

    /**
     * The jwt sign method to get a token. Use the default sign options from `initJWT` and merged with the options provided.
     * @param payload 
     * @param signOpts 
     */
    jwtSign(payload: string | Buffer | object, signOpts?: SignOpts): string;

    /**
     * @param port http listen port
     */
    startServe: (port: number) => undefined;

    /**
     * @param key the key of fetched user authorizaton data appending to request
     * @param fn the function to fetch user authorizaton data. the in param `jwtAuth` is the decoded data from jwt
     */
    setUserAuth: (key: string, fn: (jwtAuth: object) => UserAuthorization | Promise<UserAuthorization>) => undefined;

    /**
     * @param path directory of controllers
     */
    loadControllers: (path: string) => undefined;
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
  - `midwares:` The additional middlewares of express.

4. The fields of a controller route take effect in the order of `jwt -> roles/permissions -> midwares -> schema/querySchema/paramsSchema/bodySchema ->handler`. Once a part throws an error, the process stops and a http error response is returned to the client. The default error response body is in json form of `{ code, message }`. The suggested error module used in your application is the well-known `http-errors` package.


## Resonse and Errors

1. The default success/error response is in json format of `{ code, message, data }`. 
  - `code` is generally the same as `statusCode`. You can also specify a custom code in errors through a `customCode` or `code` field. If you use a `code` field in errors for custom code, then a `statusCode` or `status` field can be used to specify the statusCode.
  - `message` is the message of the error, or `ok`.
  - `data` is the result of the `handler` function return. An error response has no data field.
  - A string thrown is also allowed, in which case the statusCode would be 500.

## Maintainers

- [StayKnight](https://github.com/stayknight)
