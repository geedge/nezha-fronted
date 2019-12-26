<template>
  <div class="pagination">
    <el-pagination
      ref="page"
      @size-change="size"
      @prev-click="prev"
      @next-click="next"
      @current-change="current"
      :current-page="pageObj.pageNo"
      :page-sizes="[20, 50, 100, 300]"
      :page-size="20"
      layout="prev, pager, next, jumper, total"
      :total="this.pageObj.total"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  name: "pagination",
  props: ['pageObj'],
  data() {
    return {};
  },
  methods: {
    background() {
      this.backgroundColor();
    },
    //点击上一页箭头
    prev() {
      this.backgroundColor();
    },
    //点击下一页箭头
    next(val) {
      this.backgroundColor();
    },
    //currentPage 改变时会触发
    current(val) {
      this.$emit("pageNo", val);
      this.backgroundColor();
    },
    size(val) {
      this.$emit("pageSize", val);
      this.backgroundColor();
    },
    //设置当前页的样式
    backgroundColor() {
      this.list = this.$refs.page.$el.children[2].children;
      for (let i = 0; i < this.list.length; i++) {
        const element = this.list[i];
        console.info(element)
      }
    },
  }
};
</script>

<style>
  .el-pager li.active {
    color: #f90;
    cursor: default;
  }
  .el-pager li:hover, .el-pagination .btn-next:hover, .el-pagination .btn-prev:hover {
    color: #f90;
  }
</style>
