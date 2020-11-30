/**
 * @description 请求池，用于控制当前正在连接的请求（新增，删除，清空）
 * @export
 * @class RequestPool
 */
export default class RequestPool {
  constructor () {
    this.pool = new Map()
  }

  add (id, request) {
    this.pool.set(id, request)
  }

  remove (id) {
    const request = this.pool.get(id)
    if (request) {
      request.cancel()
      this.pool.delete(id)
    }
  }

  clear () {
    this.pool.forEach(request => {
      request.cancel()
    })

    this.pool.clear()
  }
}
