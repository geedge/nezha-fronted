<template>
  <div :class="['delete-button',(deleteObjs.length<1?'':'delete-button-light')]">
    <button :id="id" :class="{'nz-btn-disabled' : deleteObjs.length<1}" class="top-tool-btn top-tool-btn--delete" @click="batchDelete"><span><i class="nz-icon nz-icon-delete" ></i></span></button>
  </div>
</template>

<script>
export default {
  name: 'deleteButton',
  props: {
    filterFunction: Function,
    deleteObjs: Array,
    api: String,
    clickFunction: Function,
    id: String
  },
  methods: {
    batchDelete: function () {
      if (this.deleteObjs.length < 1) return
      if (this.clickFunction) {
        this.clickFunction()
        return
      }
      this.$confirm(this.$t('tip.confirmBatchDelete', [this.deleteObjs.length]), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$emit('before')
        const params = this.filterParam()
        this.$delete(this.api + params).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.$emit('after')
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    filterParam: function () {
      let filterFunction = this.filterFunction
      if (!filterFunction) {
        filterFunction = (arr) => { return '?ids=' + arr.map(t => t.id).join(',') }
      }

      return filterFunction(this.deleteObjs)
    }
  }
}
</script>

<style scoped>
  .delete-button{
    margin-left: 10px;
    opacity: 0.7;
    border-radius: 2px;
  }
  .delete-button .nz-btn-disabled .nz-icon-delete{
    opacity: 0.5;
  }
  .delete-button-light.delete-button{
    border-radius: 2px;
  }
</style>
