const http = require('http')

function compose(middlewareList) { // 组合中间件
  return function (ctx) {
    function dispatch(i) {
      const fn = middlewareList[i]
      try {
        return Promise.resolve(
          fn(ctx, dispatch.bind(null, i + 1))  // promise
          // fn(ctx, function next() {
          //   return dispatch(i + 1)
          // })
        )
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return dispatch(0)
  }
}

class LikeKoa2 {
  constructor() {
    this.middlewareList = []
  }

  use(fn) {  // 接收中间件
    this.middlewareList.push(fn)
    return this
  }

  createContext(req, res) { // 创建 ctx 对象
    const ctx = {
      req,
      res
    }
    ctx.query = req.query
    return ctx
  }

  callback() {
    const fn = compose(this.middlewareList)
    return (req, res) => {
      const ctx = this.createContext(req, res)
      return fn(ctx);
    }
  }

  listen(...args) {
    const server = http.createServer(this.callback())
    server.listen(...args)
  }
}

module.exports = LikeKoa2
