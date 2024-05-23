# nezha-fronted

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build -- dev

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

# 启动项目

需要配置 config.json 为 {"baseUrl":"http://192.168.40.42:8080/", "version": "21.04"}

# 自动化测试
npm run unit
根目录下 /test/jest.conf.js collectCoverageFrom 变量配置需要测试报告的文件 （因为暂时不测所有 只能一个个引入）
specs 配置对应的测试用例 （https://docs.geedge.net/pages/viewpage.action?pageId=58310079 参考匹配器）

# 思维导图
https://docs.geedge.net/pages/viewpage.action?pageId=67209306

# 配置多入口
dev  正常启动
dev:html   导出为html

# 部分组件Api

nezha-docs目录下 运行 npm i && npm run dev 若无法运行 尝试切换不同的node版本

新增  参考其中一个src下任意一个文件夹， 创建对应文件。 或者可以根据项目目录创建

之后再docs sidebar.js 创建相应的目录 link 关联到对应index.md里面的 'path'
