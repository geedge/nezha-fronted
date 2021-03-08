<template>
    <div :class="['delete-button',(deleteObjs.length<1?'':'delete-button-light')]">
      <el-button class="nz-btn nz-btn-size-normal nz-btn-style-light" :class="{'nz-btn-disabled' : deleteObjs.length<1}" @click="batchDelete" :id="id"><span><i class="nz-icon nz-icon-delete" ></i></span></el-button>
    </div>
</template>

<script>
  export default {
    name: "deleteButton",
    props:{
      filterFunction:Function,
      //deleteObjs: Object,
      deleteObjs: Array,
      api:String,
      clickFunction:Function,
      id:String
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
          this.$emit('before');
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
    opacity: 0.7;
    border-radius: 2px;
  }
  .delete-button .nz-btn-disabled .nz-icon-delete{
    opacity: 0.5;
    color: #D14A2B;
  }
  .delete-button-light.delete-button{
    border-radius: 2px;
  }
  .delete-button-light .nz-icon-delete{
    color:  #D14A2B;
  }
</style>
