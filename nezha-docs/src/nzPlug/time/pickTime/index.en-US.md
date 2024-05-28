---
map:
  path: /pickTime
---

时间选择器组件

# 示例代码
```vue

<pick-time 
    v-model="searchTime"
    sign="message"
    :default-pick="defaultPick"
    :refresh-data-func="dateChange" 
    :show-empty="true" 
    :use-chart-unit="false"
    :use-refresh="true"
></pick-time>
```



# 注意事项

回显需要赋值之后再次设置相应时间


<API src="./index.vue" lang="en"></API>

