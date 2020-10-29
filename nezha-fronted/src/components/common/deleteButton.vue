<template>
    <div class="delete-button">
      <el-button class="nz-btn nz-btn-size-normal nz-btn-style-light" :class="{'nz-btn-disabled' : deleteObjs.length<1}" @click="batchDelete"><span><i class="nz-icon nz-icon-delete"></i></span></el-button>
    </div>
</template>

<script>
  export default {
    name: "deleteButton",
    props:{
      filterFunction:Function,
      deleteObjs:Array,
      api:String,
      clickFunction:Function
    },
    methods:{
      batchDelete:function(){
        if(this.deleteObjs.length<1) return;
        if(this.clickFunction){
          this.clickFunction();
          return;
        }
        this.$confirm(this.$t("tip.confirmBatchDelete",[this.deleteObjs.length]), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          let params=this.filterParam();
          this.$delete(this.api+params).then(response => {
            if (response.code === 200) {
              this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.$emit('after')
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      filterParam:function(){
        let filterFunction=this.filterFunction
        if(!filterFunction){
          filterFunction=(arr)=>{return "?ids="+arr.map(t=>t.id).join(',')};
        }

        return filterFunction(this.deleteObjs);

      },
    }
  }
</script>

<style scoped>
  .delete-button{
    margin-left: 16px;
  }
  .delete-button .nz-icon-delete{
    color: #ee6723;
  }
  .delete-button .nz-btn-disabled .nz-icon-delete{
    color: #e5e5e5;
  }
</style>
