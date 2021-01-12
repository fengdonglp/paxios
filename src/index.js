import axios from 'axios'
import qs from 'query-string'
import filter from './filter'
import merge from 'lodash.merge'
import RequestPool from './RequestPool'

// no operation function
function noop () {}

// 请求池
const requestPool = new RequestPool()

// 支持的拦截器
const interceptor = {
  /**
   * 发起请求前更改配置
   * @param {object} config axios config 对象
   */
  request: noop,

  /**
   * 主要处理 http 非200状态码
   * @param {Error} error axios 错误对象
   * @param {boolean} isCancel 是否是被主动取消的
   */
  error: (error) => Promise.reject(error),

  /**
   * 响应返回拦截器
   */
  response: filter
}

// 创建axios实例
const service = axios.create({
  headers: { 'content-type': 'application/json;charset=UTF-8' }
})

/**
 * @description 请求包装体，所有的请求都应该调用该方法，因为封装了取消功能
 * @param {object} opts 详见axios的配置项，扩展选项 cancelable: 是否可以被手动取消
 * @returns
 */
function Request (opts) {
  const defaultOpts = {
    cancelable: true
  }
  opts = merge(defaultOpts, opts)
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()
  const token = source.token
  const cancelable = opts.cancelable

  delete opts.cancelable

  const ajaxRequest = service(merge(opts, {
    cancelToken: token
  }))
    .then(res => {
      requestPool.remove(token)
      return res
    })
    .catch(function (error) {
      requestPool.remove(token)
      return interceptor.error(error, axios.isCancel(error))
    })

  ajaxRequest.cancel = function cancelRequest () {
    cancelable && source.cancel()
  }

  requestPool.add(token, ajaxRequest)

  return ajaxRequest
}

Request.version = '__version__'
Request.axios = axios
Request.service = service
Request.requestPool = requestPool
Request.interceptor = {
  response: interceptor.response
}
Request.interceptor.error = function (fn) {
  if (typeof fn === 'function') {
    interceptor.error = fn
  }
}
Request.interceptor.request = function (fn) {
  if (typeof fn === 'function') {
    interceptor.request = fn
  }
}

service.interceptors.request.use(
  config => {
    if (!config.data) {
      return config
    }
    const defaultParams = {}
    if (config.method === 'get') {
      if (config.params) {
        config.params = Object.assign({}, config.params, defaultParams)
      } else {
        config.params = defaultParams
      }
    } else if (config.method === 'post') {
      if (config.headers['Content-Type'].indexOf('application/json') !== -1) {
        config.data = Object.assign({}, config.data, defaultParams)
      }

      if (config.headers['Content-Type'].indexOf('application/x-www-form-urlencoded') !== -1) {
        config.data = qs.stringify(config.data) // 模拟form表单提交时使用qs模块
      }
    }

    interceptor.request(config)

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use( // 拦截返回response
  response => {
    const res = response.data
    return new Promise((resolve, reject) => {
      interceptor.response.run(response, function () {
        resolve(res)
      })
    })
  },
  error => {
    return Promise.reject(error)
  }
)

// http 请求类型
const methods = [
  'get',
  'post',
  'put',
  'delete',
  'head',
  'options',
  'patch'
]

// 包含 body 数据的请求类型
const hasDataMethod = [
  'post',
  'put',
  'patch'
]

methods.forEach(method => {
  Request[method] = function (...argument) {
    const hasData = hasDataMethod.includes(method)
    const opts = (hasData ? argument[2] : argument[1]) || {}

    return Request(merge(opts, {
      url: argument[0],
      method
    }, hasData ? {
      data: argument[1]
    } : {}))
  }
})

export default Request
