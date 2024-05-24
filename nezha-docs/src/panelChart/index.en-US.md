---
map:
  path: /panelChart
---
# 关联组件
1. chartHeader chart-header相关设置
2. chart  去除头部的组件实例
3. ChartScreenHeader 全屏chart-header相关设置



# 示例代码
```
 <div>
    <chart-header v-if= '!isFullscreen' />
    <chart-screen-header v-if= 'isFullscreen' />
    <chart />
 </div>
```

<API src="./panelChart.vue" lang="zh"></API>
