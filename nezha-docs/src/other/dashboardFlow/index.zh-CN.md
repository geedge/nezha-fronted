---
map:
  path: /dashboardFlow
---


1. dashboard 简单加载流程
   <img src='/dashboard.jpg' /> <br>
2. dashboard 滚动加载<br>
   根据当前组件所在高度 是否小于 当前页面宽加滚动距离判断 <br>
   group 内为 当前组高度 加 组件在group内的位置判断是否加载 <br>
