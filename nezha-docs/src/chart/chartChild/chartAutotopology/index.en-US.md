---
map:
  path: /chartAutotopology
---

# 关联组件
1. meta2dMain topo图组件

```vue
 <el-carousel>
  <el-carousel-item v-for="(item,index) in allProject">
    <meta2dMain/>
  </el-carousel-item>
</el-carousel>
```

props 跟chartTimeSeries 一致

<API src="./chartAutotopology.vue" lang="en"></API>
