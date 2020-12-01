# paxios

axios库的上层封装

## 安装

在 html 中引入，首先下载代码，然后通过script标签引入
```html
<script src="your local directory/paxios.min.js"></script>
```

通过 npm 安装
```bash
npm install --save @lf/paxios --registry=http://192.168.10.152:4873
```

## 使用

基本用法与axios一致，并且参数也一致
```js
import paxios from 'paxios'

paxios({
  url: 'http://example.com/get',
  method: 'get'
})
  .then((res) => {})
  .catch((error) => {})
```

## API

### paxios(config)
`config` 配置项参考：https://github.com/axios/axios

### paxios.axios
返回`axios`原始对象

### paxios.service

返回封装后的 axios 实例，可以通过该实例修改默认配置项等其他 axios 支持的操作

```js
// 修改默认配置项
paxios.service.defaults.baseURL = 'https://api.example.com';
paxios.service.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
```

### 取消请求

```js
const request = paxios({
  url: 'http://example.com/get',
  method: 'get'
})

request.cancel()
```

### 请求方式简写

- paxios.get(url[, config])
- paxios.delete(url[, config])
- paxios.head(url[, config])
- paxios.options(url[, config])
- paxios.post(url[, data[, config]])
- paxios.put(url[, data[, config]])
- paxios.patch(url[, data[, config]])


### 拦截器 - paxios.interceptor

#### paxios.interceptor.request(fn)

fn: (config) => void
```js
paxios.interceptor.request((config) => {
  console.log(config.method)
})
```

#### paxios.interceptor.response.use(fn)
对响应数据做出处理，可以添加多个

```js
paxios.interceptor.response.use((response, next) => {
  response.test = '测试拦截'
  next()
  // next(true)
  // 如果next参数为true，则后面的拦截都不会执行
})

paxios.interceptor.response.use((response, next) => {
  console.log(response.test) // 请求执行成功后会打印上面值
  next()
})
```

#### paxios.interceptor.error(fn)

http 错误码及 response拦截器中抛出的异常都会在这里被拦截
```js
paxios.interceptor.error((error) => {
  // 可以打印出 http 会返回的状态码
  console.log(error.response.status)

  // 可以抛出reject，以便自定义请求可以自定义错误处理，也可以不返回
  return Promise.reject(error)
})
```

### 请求池 - paxios.requestPool

所有用 `paxios` 发起的请求都会添加到请求池中，请求结束会从池中删除。
该属性用于统一关闭当前未结束的请求。

```js
paxios.requestPool.clear()
```