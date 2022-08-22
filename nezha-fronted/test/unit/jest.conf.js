const path = require('path')

module.exports = {
  verbose: true,
  // testURL: 'http://localhost/',
  rootDir: path.resolve(__dirname, '../../'),
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest'
  },
  moduleFileExtensions: [
    'js',
    'json',
    'vue'
  ],
  transformIgnorePatterns: ['/node_modules/(?!vue-awesome)', 'element-ui'],
  moduleNameMapper: { // 处理引入报错的文件 将其改为引入空文件 或者自定义的 function
    'element-ui/*': '<rootDir>/test/unit/__mocks__/fileMock.js',
    'css/font/*': '<rootDir>/test/unit/__mocks__/fileMock.js',
    'store/*': '<rootDir>/test/unit/__mocks__/fileMock.js',
    'elSelect/MyElSelect': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '/chartList': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '/myDatePicker': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '/promqlInput': '<rootDir>/test/unit/__mocks__/fileMock.js',
    'v-selectpage/': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '@topology/': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '/diagram': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '/topology': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '@svgdotjs': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '@interactjs': '<rootDir>/test/unit/__mocks__/fileMock.js',
    'pl-table': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '/htmlToPdf': '<rootDir>/test/unit/__mocks__/fileMock.js',
    'maplibre-gl': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '\/*\/http': '<rootDir>/test/unit/__mocks__/axios.js',
    // '\/*\/permission': '<rootDir>/test/unit/__mocks__/fileMock.js',
    '/i18n': '<rootDir>/test/unit/__mocks__/i18nMock.js',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/test/unit/__mocks__/fileMock.js', // 模拟加载静态文件
    '\\.(css|less|scss|sass)$': '<rootDir>/test/unit/__mocks__/styleMock.js', // 模拟加载样式文件
    '\\.(css|less|scss|sass|style)$': 'jest-css-modules',
    '^@\/(.*?\.?(js|vue)?|)$': '<rootDir>/src/$1' // @路径转换，例如：@/components/Main.vue -> rootDir/src/components/Main.vue
  },
  testMatch: [ // 匹配测试用例的文件
    '<rootDir>/test/unit/specs/*.spec.js',
    '<rootDir>/test/unit/specs/lib/*.spec.js',
    '<rootDir>/test/unit/specs/components/*.spec.js',
    '<rootDir>/test/unit/specs/components/chart/*.spec.js'
  ],
  moduleDirectories: [
    'node_modules'
  ],
  // testPathIgnorePatterns: [
  //   '<rootDir>/test/e2e'
  // ],
  setupFiles: ['<rootDir>/test/unit/jest.setup'],
  // snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  coverageDirectory: '<rootDir>/test/unit/coverage', // 覆盖率报告的目录
  collectCoverageFrom: [ // 测试报告想要覆盖那些文件，目录，前面加！是避开这些文件
    // 'test/unit/specs/*.(js)',
    'src/components/common/js/example.js',
    'src/libs/bus.js',
    'src/components/common/mixin/*.js',
    'src/components/chart/chart.vue',
    // 'src/components/common/js/tools.js',
    // '!src/*.(js)',
    '!src/http.js',
    '!src/router/index.js',
    '!**/node_modules/**'
  ]
}
