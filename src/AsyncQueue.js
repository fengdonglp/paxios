export function dropElements (arr, func) {
  return arr.filter(item => !func(item))
}

/**
 * @description 异步执行队列
 * 注意: 如果处理程序中需要用到该实例, 则use的参数不能是箭头函数
 * @export
 * @class AsyncQueue
 */
export default class AsyncQueue {
  constructor () {
    this.chain = []
    this.index = -1
  }

  /**
   * @description 添加中间件
   * @param {function} fn 中间件处理函数
   * @memberof AsyncQueue
   */
  use (fn) {
    this.chain.push(fn)
  }

  delete (fn) {
    this.chain = dropElements(this.chain, (item) => {
      return item === fn
    })
  }

  /**
   * @description 用于队列函数按顺序执行
   * @param {Boolean} isEnd 是否终端执行
   * @memberof AsyncQueue
   */
  next (isEnd) {
    this.index++
    if (!isEnd && this.chain[this.index]) {
      this.chain[this.index].call(this, this.data, this.next.bind(this))
    } else {
      typeof this.cb === 'function' && this.cb()
    }
  }

  /**
   * @description 开始执行队列任务
   * @param {any} data 队列中需要传递的数据
   * @param {function} cb 队列执行结束后的回调
   * @memberof AsyncQueue
   */
  run (data, cb) {
    this.index = -1
    this.data = data
    this.cb = cb
    this.next()
  }
}
