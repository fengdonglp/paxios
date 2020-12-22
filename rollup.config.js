// 处理 node npm 安装的模块
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import replace from '@rollup/plugin-replace'

const pkg = require('./package.json')
const version = pkg.version

if (!version) {
  throw new Error('版本信息获取失败')
}

const PLUGIN_NAME = 'paxios'

export default {
  input: 'src/index.js',
  output: [
    {
      file: `dist/${PLUGIN_NAME}.js`,
      name: PLUGIN_NAME,
      format: 'umd',
      sourcemap: false,
      plugins: [],
      globals: {
        axios: 'axios'
      }
    },
    {
      file: `dist/${PLUGIN_NAME}.min.js`,
      name: PLUGIN_NAME,
      format: 'umd',
      sourcemap: true,
      plugins: [
        terser()
      ],
      globals: {
        axios: 'axios'
      }
    },
    {
      file: `dist/${PLUGIN_NAME}.esm.js`,
      name: PLUGIN_NAME,
      format: 'esm',
      sourcemap: true,
      plugins: [],
      globals: {
        axios: 'axios'
      }
    }
  ],
  plugins: [
    commonjs(),
    resolve({
      external: ['axios']
    }),
    babel({ babelHelpers: 'bundled' }),
    replace({
      __version__: version
    })
  ]
}
