---
map:
  path: /table
---

# 关联组件
以asset为例子 其他表格 将asset换为对应名称

1. deleteButton 删除组件
2. nzDataList table组件公共部分
3. assetBox 对应的新增 编辑
4. detailViewTopSearch 详细视图搜索框
5. assetDetail 详细视图
6. assetTable 对应table组件
7. clickSearch 详细搜索框
8. topToolMoreOptions 右侧工具菜单
9. alertSilenceBox 告警静默弹窗
10. nzDetailView 详细视图 公共部分


# 示例
```vue
<div>
  <nz-detail-view>
    <template v-slot:top-tool-left>
      <detailViewTopSearch />
    </template>
    <template v-slot:top-tool-right>
      <top-tool-more-options></top-tool-more-options>
    </template>
    <template v-slot:nz-detail-view-list>
      <asset-detail></asset-detail>
    </template>
    <!-- 分页组件 -->
    <template v-slot:pagination>
      <el-pagination></el-pagination>
    </template>
  </nz-detail-view>
  <nz-data-list>
    <template v-slot:top-tool-right>
      <top-tool-more-options></top-tool-more-options>
    </template>
    <template v-slot:search >
      <click-search />
      <click-search />
    </template>
    <template v-slot:default="slotProps">
      <asset-table></asset-table>
    </template>
    <!-- 分页组件 -->
    <template v-slot:pagination>
      <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
    </template>
  </nz-data-list>
  <transition name="right-box">
    <asset-box />
  </transition>
</div>
```