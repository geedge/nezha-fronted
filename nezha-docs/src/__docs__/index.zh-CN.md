---
map:
  path: /
---

## 简介
1. 开发规范 https://docs.geedge.net/pages/viewpage.action?pageId=8034494
2. 思维导图 https://docs.geedge.net/pages/viewpage.action?pageId=67209306 可以查看解压后的纯文字版Html
3. 字体图标替换 https://docs.geedge.net/pages/viewpage.action?pageId=67214849


# 目录结构
```
│  http.js   axios 请求的实例 处理请求头等公共参数
│  permission.js 权限
│
├─assets   部分静态资源
│  ├─css 公共css
│  │  │
│  │  ├─common  组件css
│  │  │
│  │  ├─components 组件css
│  │  │
│  │  ├─font  字体图标css
│  │  │
│  │  └─themes 主题css
│  │  │
│  ├─img  图片文件
│  │  │
│  └─stylus 对外暴露的css （所有css)
│  
├─components 组件
│  ├─chart 所有  chart 主要相关的组件
│  │
│  ├─cli  前端shell组件
│  │
│  ├─common 公共组件
│  │  │
│  │  ├─alert hover弹窗相关组件
│  │  │
│  │  ├─bottomBox 底弹窗
│  │  │  └─tabs 底弹窗分页面
│  │  │
│  │  ├─detailView 详细视图组件
│  │  │ 
│  │  ├─elSelect  重写element select
│  │  │
│  │  │
│  │  ├─globalSearch 公关稿搜索组件
│  │  │
│  │  ├─js  部分公用js
│  │  │  │  common.js  工具函数
│  │  │  │  constants.js 静态数据
│  │  │  │  divResize.js  div改变宽高
│  │  │  │  example.js  工具函数 处理 处理legend的别名
│  │  │  │  htmlToPdf.js  将 html 转为pdf
│  │  │  │  iconList.js  部分字体图标静态数据
│  │  │  │  tools.js   工具函数
│  │  │  │  validate.js  element 校验函数
│  │  │  │  Xterm.js  前端shell 引用文件
│  │  │  │
│  │  │  └─radomcolor  随机颜色
│  │  │          color.txt  颜色数据
│  │  │          randomcolor.js  随机颜色函数
│  │  │
│  │  ├─labelFilter  asset endpoint 筛选组件
│  │  │
│  │  ├─language  国际化文件
│  │  │
│  │  │
│  │  ├─mixin  vue混合
│  │  │
│  │  ├─myDatePicker  重构 el-data
│  │  │
│  │  ├─project   拓扑图相关
│  │  │
│  │  ├─rightBox  右侧新增修改
│  │  │
│  │  ├─searchBox  搜索组件
│  │  │
│  │  ├─snapshotProgress 快照蒙版
│  │  │      snapshotProgress.vue
│  │  │
│  │  ├─table  table组件
│  │  │
│  │  ├─v-selectpagenew  重构的 v-selectpage
│  │  │
│  │  └─vueQR  二维码
│  │
│  ├─layout  布局
│  │      container.vue 主体
│  │      header.vue 头部
│  │      home.vue  容器
│  │      leftMenu.vue 左侧菜单
│  │
│  └─page 页面
│
├─entrance 打包入口
│  ├─app 基础
│  │
│  └─exportHtml 快照
│
├─libs 工具函数
│
├─router 路由
│
└─store vuex
```