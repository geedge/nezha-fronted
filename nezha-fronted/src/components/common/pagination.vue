<template>
  <div class="pagination">
    <el-pagination
      ref="page"
      @size-change="size"
      @prev-click="prev"
      @next-click="next"
      @current-change="current"
      :current-page="pageObj.pageNo"
      :page-sizes="[20, 50, 100]"
      :page-size="20"
      layout="total, prev, pager, next,sizes,jumper"
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

<style lang="scss">
  .el-pagination__total {
    float: left;
  }
  .pagination {
    padding-top: 12px;
    text-align: center;
  }

  .el-pager li, .el-pagination .btn-next, .el-pagination .btn-prev {
    margin:5px 5px 0px 5px;
    padding: 0 4px;
    font-size: 13px;
    min-width: 20px;
    height: 20px;
    line-height: 20px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    text-align: center;
    border: 1px solid rgba(154,154,154,0.20);
    border-radius: 2px;
    border-radius: 2px;
  }
  .el-pagination .el-pager li.btn-quicknext, .el-pager li.btn-quickprev {
    line-height: 20px;
  }
  .el-pagination .el-pager .more::before {
    line-height: 20px;
  }
  .el-pager li.number{
    font-family: NotoSansSC-Regular;
    color: #666666;
    letter-spacing: 0;
    font-weight:normal;
  }
  .el-pager li.number.active{
    font-family: NotoSansSC-Regular;
    color: #FFFFFF;
    letter-spacing: 0;
  }

  .el-pagination .el-pager li.active {
    background-color: $global-text-color-active;
    border-radius: 2px;
    border-radius: 2px;
  }
  .el-pager li:hover, .el-pagination .btn-next:hover, .el-pagination .btn-prev:hover {
    font-family: NotoSansSC-Regular;
    color: #666666;
    letter-spacing: 0;
    font-weight:normal;
  }
  .el-pagination__sizes .el-input .el-input__inner,.el-pagination__editor.el-input .el-input__inner{
    height: 20px;
    border-color: rgba(154,154,154,0.20);
  }
  .el-pagination__sizes .el-input .el-input__inner:hover{
    border-color: rgba(154,154,154,0.20);
  }
</style>
