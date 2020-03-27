<template>
  <div class="pagination">
    <el-pagination
      ref="page"
      @size-change="size"
      @prev-click="prev"
      @next-click="next"
      @current-change="current"
      :current-page="pageObj.pageNo"
      :page-sizes="pageSizes?pageSizes:[20, 50, 100]"
      :page-size="pageSize"
      layout="total, prev, pager, next, slot"
      :total="this.pageObj.total"
    >
      <el-select v-model="pageSize" :placeholder="pageSize+$t('pageSize')" size="mini"  :popper-append-to-body="appendToBody" class="pagination-size-select" @change="size">
        <el-option v-for="(item,index) in pageSizes" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>

    </el-pagination>
  </div>
</template>

<script>
export default {
  name: "pagination",
  // props: ['pageObj', 'tableId', 'postPageSizes'],
  props: {
    pageObj:{},
    tableId:{},
    postPageSizes:{},
    appendToBody:{default:true}
  },
  data() {
    return {
      pageSize: 20,
      pageSizes:[
        {
          label:'20'+this.$t('pageSize'),
          value:20
        },
        {
          label:'50'+this.$t('pageSize'),
          value:50
        },
        {
          label:'100'+this.$t('pageSize'),
          value:100
        },
      ]
    };
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
      this.pageObj.pageNo=1;
      this.$emit("pageSize", val);
      this.backgroundColor();
    },
    resetPageSizes:function(){
      if(this.postPageSizes){
        this.pageSizes=this.postPageSizes.map((item)=>{
          return {label:item+this.$t('pageSize'),value:item}
        })
      }
    },
    //设置当前页的样式
    backgroundColor() {
      this.list = this.$refs.page.$el.children[2].children;
      for (let i = 0; i < this.list.length; i++) {
        const element = this.list[i];
        //console.info(element)
      }
    },
  },
  mounted() {
    if(this.postPageSizes&&this.postPageSizes.length>0){
       this.pageSize=this.postPageSizes[0];
       this.resetPageSizes();
    }else{
      let pageSize = localStorage.getItem('nz-pageSize-' + localStorage.getItem('nz-username') + '-' + this.tableId);
      if(pageSize != 'undefined' && pageSize != null){
        this.pageSize=parseInt(pageSize);
      }
    }
    this.$nextTick(() => {
      // let input = document.querySelector(".el-pagination .el-select .el-input__inner");
      // input.value = this.pageSize + this.$t('pageSize');
    });
  },
  watch:{
    postPageSizes:{
      immediate:true,
      deep:true,
      handler(n,o){
        this.resetPageSizes();
      }
    }
  }
};
</script>

<style lang="scss">
  .el-pagination__total {
    float: left;
  }
  .pagination {
    padding-top: 8px;
    text-align: center;
    max-height: 42px;
  }
  .pagination-top .pagination {
    padding-top: 0;
  }
  /*.pagination .el-popper[x-placement^=bottom] .popper__arrow {
    bottom: -6px;
    margin-right: 3px;
    border-top-color: #fff;
    border-bottom-width: 0;
    border-top-width: 6px;
    top: unset;
  }
  .pagination .el-popper[x-placement^=bottom] .popper__arrow::after {
    bottom: 1px;
    margin-left: -6px;
    border-top-color: #FFF;
    border-bottom-width: 0;
  }
  .pagination .el-popper {
    top: -135px !important;
  }*/
  .pagination .el-pagination {
    max-height: 42px;
    padding-right: 0;
  }
  .pagination-size-select .el-input--mini .el-input__inner{
    height: 20px;
    line-height: 20px;
    margin: 5px 0 5px 5px;
  }
  .pagination-size-select input{

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
  .el-pagination .el-pager .more {
    background-color: $content-right-background-color;
  }
  .btn-next, .btn-prev {
    background-color: $content-right-background-color !important;
  }
  .pagination input {
    background-color: $content-right-background-color !important;
  }
  .el-pager li.number{
    font-family: NotoSansSC-Regular;
    color: #666666;
    letter-spacing: 0;
    font-weight:normal;
    background-color: $content-right-background-color;
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
