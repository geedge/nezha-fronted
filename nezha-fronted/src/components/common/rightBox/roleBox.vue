<template>
  <div class="right-box right-box-role" v-clickoutside="{obj:editRole,func:clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="roles-edit-del"
              type="button" v-has="'role_delete'"
              v-if="editRole.id && !detail">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editRole.id ? ($t("config.roles.editRole") + "  ID：" + editRole.id) : $t("config.roles.createRole")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form :disabled="detail" :model="editRole" :rules="rules" class="right-box-form right-box-form-left" label-position="right" label-width="120px" ref="roleForm">
        <!--name-->
        <el-form-item :label="$t('config.roles.name')" prop="name">
          <el-input  maxlength="64" placeholder=""
                    show-word-limit size="small" type="text" v-model="editRole.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.roles.remark')">
          <el-input :rows="2" size='mini' type="textarea" v-model="editRole.remark"/>
        </el-form-item>

        <el-form-item :label="$t('config.roles.permission')">
          <!--<div class="tree-option">
            <button type="button" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new option-btn" style="margin-left: 0px;" @click="expandAllOrNone" :class="{'btn-active':expandAllFlag}">展开/收缩</button>
            <button type="button" class="nz-btn nz-btn-size-small-new nz-btn-style-light-new option-btn" @click="selectAllOrNone" :class="{'btn-active':selectAllFlag}"><span ><i class="nz-icon nz-icon-delete"></i></span></button>
          </div>-->
          <el-tree :data="menus" :default-expand-all="expandAllFlag" :props="{label:labelFormatter}"  @check-change="selectChange" class="tree-border" node-key="id" ref="menuTree" show-checkbox>
            <div slot-scope="{node, data}" >
              <span>
                <i class="el-icon-menu" v-if="data.type == '1'"></i>
                <i class="el-icon-edit" v-if="data.type == '2'"></i>
              </span>
              {{$t(data.i18n)}}
            </div>
          </el-tree>
        </el-form-item>
      </el-form>
    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box-bottom-btns" v-if="!detail">
      <button v-cancel="{obj:editRole,func:esc}" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new"
              id="roles-esc">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" v-has="'role_save'" :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}"
              id="roles-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
  export default {
    name: "roleBox",
    props: {
      role: Object,
      detail:Boolean,
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
            this.prevent_opt.save=true;
            if (this.editRole.id) {
              this.$put('sys/role', this.editRole).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
                this.prevent_opt.save=false;
              });
            } else {
              this.$post('sys/role', this.editRole).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
                this.prevent_opt.save=false;
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

        this.$get("sys/menu").then(response=>{
          if (response.code  == 200){
            this.menus = response.data.list;
          }else{
            this.$message.error("load menu faild")
          }
        })

      },
      labelFormatter:function(data,node){
        return data&&data.i18n?this.$t(data.i18n):data.name;
      },
      selectChange:function(data,isCheck,childIsCheck){
        if(this.$refs.menuTree){
          this.editRole.menuIds=this.$refs.menuTree.getCheckedKeys(true);
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
    created() {
      this.getMenus();
    },
    mounted() {

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
