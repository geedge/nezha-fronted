<template>
  <div class="right-box right-box-role" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button type="button" v-if="editRole.id" @click="del"
              class="nz-btn nz-btn-size-normal nz-btn-size-alien"
              id="roles-edit-del">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editRole.id ? ($t("config.roles.editRole") + "  ID：" + editRole.id) : $t("config.roles.createRole")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" :model="editRole" :rules="rules" ref="roleForm" label-position="right" label-width="120px">
        <!--name-->
        <el-form-item :label="$t('config.roles.name')" prop="name">
          <el-input  type="text" placeholder=""
                    v-model="editRole.name" maxlength="64" show-word-limit size="small"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.roles.remark')">
          <el-input size='mini' v-model="editRole.remark" type="textarea" :rows="2"/>
        </el-form-item>

        <el-form-item :label="$t('config.roles.permission')">
          <!--<div class="tree-option">
            <button type="button" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new option-btn" style="margin-left: 0px;" @click="expandAllOrNone" :class="{'btn-active':expandAllFlag}">展开/收缩</button>
            <button type="button" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new option-btn" @click="selectAllOrNone" :class="{'btn-active':selectAllFlag}"><span ><i class="nz-icon nz-icon-delete"></i></span></button>
          </div>-->
          <el-tree :data="menus" node-key="id" show-checkbox  :default-expand-all="expandAllFlag" :props="{label:labelFormatter}" ref="menuTree" @check-change="selectChange" class="tree-border"></el-tree>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="roles-esc"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="roles-save"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
  export default {
    name: "roleBox",
    props: {
      role: Object
    },
    computed: {
    },
    data() {
      return {
        rules: { //表单校验规则
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
        },
        editRole: {},
        menus:[],
        selectAllFlag:false,
        expandAllFlag:true,
      }
    },
    methods: {
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },
      clickOutside() {
        this.esc(false);
      },
      /*保存*/
      save() {
        this.$refs.roleForm.validate(valid => {
          if (valid) {
            if (this.editRole.id) {
              this.$put('sys/role', this.editRole).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('sys/role', this.editRole).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            return false;
          }
        })
      },
      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("sys/role/?ids=" + this.editRole.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getMenus:function(){
        this.menus = [];
        if(this.editRole.id){
          this.$get("sys/role/menu/"+this.editRole.id).then(response=>{
            if(response.code == 200){
              this.menus = response.data.menus;
              this.editRole.menuIds = response.data.selectedIds;
              if(this.$refs.menuTree){
                this.$refs.menuTree.setCheckedKeys(this.editRole.menuIds,true);
              }
            }else{
              this.$message.error("load menu faild")
            }
          })
        }else{
          this.$get("sys/menu").then(response=>{
            if (response.code  == 200){
              this.menus = response.data.list;
            }else{
              this.$message.error("load menu faild")
            }
          })
        }
      },
      labelFormatter:function(data,node){
        return data&&data.i18n?this.$t(data.i18n):data.name;
      },
      selectChange:function(data,isCheck,childIsCheck){
        if(this.$refs.menuTree){
          this.editRole.menuIds=this.$refs.menuTree.getCheckedKeys(false);
        }
      },
      selectAllOrNone:function(){
        if(this.$refs.menuTree){
          if(!this.selectAllFlag){
            this.$refs.menuTree.setCheckedNodes(this.menus);
          }else{
            this.$refs.menuTree.setCheckedNodes([]);
          }
          this.selectAllFlag = !this.selectAllFlag;
        }
      },
      expandAllOrNone:function(){
        this.expandAllFlag = !this.expandAllFlag;
        let $self=this;
        if(this.$refs.menuTree){
          this.menus.forEach(t=>{
            $self.$refs.menuTree.store.nodesMap[t.id].expanded = $self.expandAllFlag;
          })
        }
      }
    },
    mounted() {
      this.getMenus();
    },
    watch: {
      //将prop里的user转为组件内部对象
      role: {
        immediate: true,
        deep: true,
        handler(n) {
          this.editRole = JSON.parse(JSON.stringify(n));
        }
      },
    },
  }
</script>
<style lang="scss">
  .right-box-role .tree-border{
    margin-top: 5px;
    border: 1px solid #e5e6e7;
    background: #fff none;
    border-radius: 4px;
    /*margin-top: 40px;*/
  }
  .right-box-role .tree-option{
    float: right;
  }
  .right-box-role .option-btn{
    margin: 6px 0 0 7px;
  }
  .right-box-role .btn-active{
    color: #ee9d3f;
    font-weight: bold;
    border-color: #ee9d3f !important;
  }
</style>
<style scoped>
  .form-item-title{
    position: absolute;
    left: -120px;
  }
</style>
