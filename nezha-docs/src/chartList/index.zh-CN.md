---
map:
  path: /chartList
---
# 关联组件
1. grid-layout 拖拽组件容器  参考链接 https://jbaysolutions.github.io/vue-grid-layout/zh/
2. grid-item 拖拽组件 该组件以拉取到本地 修改了高度不支持小数的问题
3. panel-chart 图表组件实例

# 示例代码
```
<grid-layout>
    <grid-item v-for="item in arr">
       <panel-chart />    
    </grid-item>
</grid-layout>
```


<API src="./chartList.vue" lang="zh"></API>
