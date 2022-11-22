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
