module.exports = {
  presets: [
    [require('@babel/preset-env'), {
      "modules": false,
      "useBuiltIns": "usage",
      "corejs": { version: 3 }
    }]
  ],
  plugins: [
    // require('@babel/plugin-syntax-dynamic-import')
  ],
  ignore: [
    'dist/*.js',
    'packages/**/*.js',
    'test/**'
  ]
}