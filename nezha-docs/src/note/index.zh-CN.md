---
map:
  path: /note
---

1. 图表类型新增 需要后端增加相应的类型<br>
2. 新增颜色类型相关的样式 需要同事增加两个主题色 或者使用原有主题色 <br>
   位置<br> src/assets/css/themes/theme-dark.scss <br> src/assets/css/themes/theme-light.scss<br>
3. 国际化更改后需要跟告知后端 后端需要更新相应数据库<br>
4. 图表相关的国际化 需要保存到本地 或者一直维持最新避免快照国际化错误<br>
5. 快照图标需要转化为base64，才能显示对应图标。 所以iconfont 需要将相应内容转化为base64 <br>
6. 搜索框新增查询条件时 无法回显 需要查看 routerPathParams.js 以及 查看 datalist.js 的 created <br>位置<br> /src/components/common/mixin<br>
7. element-ui 的表格组件的气泡组件不建议使用 容易引起表格卡顿 建议换为一个弹窗组件 传对应的实例完成<br>
8. 

   

