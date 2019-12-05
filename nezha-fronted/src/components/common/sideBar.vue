<template>
    <div class="sidebar">
        <div class="sidebar-title">
            <div>Project</div>
            <div class="sidebar-info">
                <div class="sidebar-info-header">ALL</div>
                <div class="sidebar-info-footer">
                    <el-checkbox-group v-model="checkList" size="small">
                        <el-checkbox v-for="(item,key) in checkListData" :key="key" border :label=item.id>{{item.name}}
                            <div class="checkbox-edit" @click.prevent="edit(item.id)">编辑</div>
                        </el-checkbox>
                    </el-checkbox-group>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: "SiderBar",
  data() {
    return {
      checkList: [0],
      checkListData: [],
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total: 0
      },
    }
  },
  computed:{
    getData(){
      return this.$store.state.assetSelect
    }
  },
  watch:{
    getData(newVal,oldVal){
      this.checkList.splice(1,1,newVal)
    }
  },
  methods: {
    edit(data) {
      console.log(data)
    },
    getAssetData() {
      this.$get('idc', this.pageObj).then(response => {
        if (response.code == 200) {
          this.checkListData = response.data.list
          console.log(this.checkListData)
        }
      })
    }
  },
  mounted() {
    this.getAssetData()
    function aa() {
      console.log(this.$router.query)
    }
  }
}

</script>

<style>
.el-checkbox.is-bordered + .el-checkbox.is-bordered {
    margin-left: 0px;
    margin-top: 20px;
}

.el-checkbox-group {
    padding-top: 10px;
}

.el-checkbox {
    width: 270px;
}
</style>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    width: 370px;
    left: 0;
    top: 60px;
    bottom: 0;
    box-shadow: 0 10px 16px #ccc;
    overflow-y: scroll;
    background: rgba(242, 242, 242, 0.94);
}

.sidebar-title {
    padding-left: 30px;
    padding-top: 20px;
}

.sidebar-info {
    margin-top: 20px;
    border: 1px solid #acacac;
    border-radius: 8px;
    height: calc(90vh - 55px);
    width: calc(100% - 30px);
}

.sidebar-info-header {
    background: #acacac;
    text-align: center;
    line-height: 50px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    height: 60px;
    width: 100%;
}

.sidebar-info-footer {
    padding-top: 15px;
    padding-left: 15px;
}

.checkbox-edit {
    position: absolute;
    top: 8px;
    left: 230px;

}
</style>