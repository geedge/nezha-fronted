<template>
  <div class="pagination">
    <el-pagination
      ref="page"
      background
      @size-change="size"
      @prev-click="prev"
      @next-click="next"
      @current-change="current"
      :page-sizes="[20, 50, 100, 300]"
      :page-size="20"
      layout="prev, pager, next, jumper, sizes, total"
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
      }
    },
  }
};
</script>

<style>
.pagination {
  display: inline-block;
  margin-top: 10px;
  margin-left: 50%;
  transform: translate(-50%);
}
</style>
