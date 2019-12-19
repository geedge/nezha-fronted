<template>
  <transition name="right-box">
    <div class="right-box right-box-endpoint" v-if="rightBox.show" @click.stop>
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <div class="right-box-top-btn right-box-top-btn-full" @click="esc">
          <div class="right-box-btn-icon">
            <i class="el-icon-close"></i>
          </div>
          <span>{{$t('overall.esc')}}</span>
        </div>
        <div class="right-box-top-btn right-box-top-btn-full" @click="save">
          <div class="right-box-btn-icon">
            <i class="el-icon-edit-outline"></i>
          </div>
          <span>{{$t('overall.save')}}</span>
        </div>
        <div class="right-box-top-btn" v-if="module.id != ''" @click="del">
          <div class="right-box-btn-icon">
            <i class="el-icon-delete"></i>
          </div>
          <span>{{$t('overall.delete')}}</span>
        </div>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box-form">
        <!--project-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.project.project")}}</div>
          <div class="right-box-form-content">
            <el-select value-key="id" popper-class="config-dropdown" v-model="module.project" placeholder="" size="small">
              <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
          </div>
        </div>
        <!--name-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.module.moduleName")}}</div>
          <div class="right-box-form-content">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="module.name" size="small"></el-input>
          </div>
        </div>
        <!--description-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.module.description")}}</div>
          <div class="right-box-form-content">
            <el-input type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="module.remark" size="small"></el-input>
          </div>
        </div>
        <!--tip-->
        <div class="right-box-form-row">
          <div class="right-box-form-content">
            <div class="right-box-form-tip">
              {{$t('project.module.tip.defaultEndpointSet')}}
              <div class="line-100"></div>
              {{$t('project.module.tip.relation')}}
            </div>
          </div>
        </div>
        <!--port-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.endpoint.port")}}</div>
          <div class="right-box-form-content">
            <el-input placeholder="" v-model="module.port" size="small"></el-input>
          </div>
        </div>
        <!--path-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.endpoint.path")}}</div>
          <div class="right-box-form-content">
            <el-input placeholder="" v-model="module.path" size="small"></el-input>
          </div>
        </div>
        <!--param-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">
            {{$t("project.endpoint.param")}}
            <el-button class="param-btn param-btn-active margin-l-10" size="mini" @click="addParam"><i class="el-icon-plus"></i>{{$t('overall.add')}}</el-button>
            <el-button class="param-btn param-btn-clear" size="mini" @click="clearAllParam">{{$t('overall.clearAll')}}</el-button>
          </div>
          <div class="right-box-form-content">
            <div class="param-box param-box-module">
              <div class="param-box-row" v-for="(item, index) in module.paramObj">
                <el-input placeholder="key" class="param-box-row-key" size="mini" v-model="item.key"></el-input>
                <span class="param-box-row-eq">=</span>
                <el-input placeholder="value" class="param-box-row-value" size="mini" v-model="item.value"></el-input>
                <span class="param-box-row-symbol" @click="removeParam(index)"><i class="el-icon-minus"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- begin--底部按钮-->
      <div class="right-box-bottom-btns">
        <div @click="esc" class="right-box-bottom-btn right-box-bottom-btn-cancel right-box-bottom-btn-50">{{$t('overall.cancel')}}</div><div @click="save" class="right-box-bottom-btn right-box-bottom-btn-50">{{module.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
      </div>
      <!-- end--底部按钮-->
    </div>
  </transition>
</template>

<script>
  export default {
    name: "moduleBox",
    props: {
      module: Object,
      currentProject: Object
    },
    data() {
      return {
        rightBox: {
          show: false,
          title: ''
        },
        projectList: [],
      }
    },
    methods: {
      show(show) {
        this.rightBox.show = show;
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
      },

      /*保存*/
      save() {
        this.module.param = this.paramToJson(this.module.paramObj);
        if (this.module.id) {
          this.$put('module', this.module).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.$emit("reload");
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          });
        } else {
          this.module.projectId = this.module.project.id;
          this.$post('module', this.module).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              this.$emit("reload");
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          });
        }
      },

      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("module?ids=" + this.module.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.rightBox.show = false;
              this.$emit("reload");
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },

      /*获取project列表*/
      getProjectList: function() {
        this.$get('project', {pageSize: 999, pageNo: 1}).then(response => {
          if (response.code === 200) {
            this.projectList = response.data.list;
            if (this.currentProject && this.currentProject.id) {
              /*for (let i = 0; i < this.projectList.length; i++) {
                if (this.projectList[i].id == this.currentProject.id) {
                  this.currentProject = this.projectList[i];
                  break;
                }
              }*/
            } else {

            }
          }
        });
      },

      // 清除param
      clearAllParam: function() {
        this.module.paramObj = [];
      },

      // 新增param
      addParam: function() {
        this.module.paramObj.push({key: '', value: ''});
      },

      // 移除单个param
      removeParam: function(index) {
        this.module.paramObj.splice(index, 1);
      },

      //将param转为json字符串格式
      paramToJson: function(param) {
        let tempParam = {};
        for (let i = 0; i < param.length; i++) {
          eval('tempParam.' + param[i].key + '="' + param[i].value + '"');
        }
        let jsonString = JSON.stringify(tempParam);
        if (jsonString == '{}') {
          return "";
        } else {
          return jsonString;
        }
      },
    },
    created() {
      this.getProjectList();
    },
    watch: {
      module: {
        immediate: true,
        handler(n, o) {
          if (n && n.id) {
            this.rightBox.title = this.$t("project.module.editModule") + "  ID：" + n.id;
          } else {
            this.rightBox.title = this.$t("project.module.createModule");
          }
        }
      }
    }
  }
</script>

<style scoped>
  /* start--param*/
  .param-btn {
    float: right;
    height: 27px;
    margin-top: -3px;
  }
  .param-btn-active {
    background-color: #656565;
    color: white;
    border: 1px solid #656565;
  }
  .param-btn-active:hover, .param-btn-active:focus {
    background-color: #656565;
    color: white;
  }
  .param-btn-clear {
    background-color: #D4D4D4;
    border: 1px solid #D4D4D4;
    color: white;
  }
  .param-btn-clear:hover, .param-btn-clear:focus {
    background-color: #D4D4D4;
    color: white;
  }

  .param-box {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 10px;
  }
  .param-box-endpoint {
    height: 325px;
  }
  .param-box-module {
    height: 227px;
  }
  .param-box-row {
    padding: 7px 0 0 0;
    position: relative;
  }
  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }
  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 41.5%;
  }
  .param-box-row-eq {
    display: inline-block;
    width: 22px;
    text-align: center;
    height: 32px;
    line-height: 32px;
    color: #c4c7cF;
  }
  .param-box-row-symbol {
    font-size: 12px;
    color: #c4c7cF;
    border: 1px solid #c4c7cF;
    text-align: center;
    height: 12px;
    width: 14px;
    display: inline-block;
    position: absolute;
    top: 17px;
    right: 25px;
    cursor: pointer;
  }
  .param-box-row-symbol>i {
    position: absolute;
    top: 1px;
    right: 1px;
  }
  /* end--param*/
</style>
