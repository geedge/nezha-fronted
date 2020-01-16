<template>
  <transition name="right-box">
    <div class="right-box right-box-module" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button id="module-del" type="button" v-if="module.id != '' && rightBox.isEdit" @click="del" class="nz-btn nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="top-tool-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button v-if="!rightBox.isEdit" id="module-save" type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="top-tool-btn-txt">{{$t('overall.edit')}}</span>
        </button>

        <!--<button id="module-esc" type="button" @click="esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
        </button>-->
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form" :model="module" label-position="top" :rules="rules" ref="moduleForm">
          <el-form-item :label='$t("project.project.project")' prop="project">
            <el-select v-if="rightBox.isEdit" value-key="id" popper-class="config-dropdown" v-model="module.project" placeholder="" size="small">
              <el-option :id="'module-project-'+item.id" v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{module.project.name}}</div>
          </el-form-item>
          <el-form-item :label='$t("project.module.moduleName")' prop="name">
            <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model="module.name" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{module.name}}</div>
          </el-form-item>
          <el-form-item :label='$t("project.module.description")' prop="remark">
            <el-input v-if="rightBox.isEdit" type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="module.remark" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{module.remark}}</div>
          </el-form-item>
          <div class="right-box-form-tip" v-if="rightBox.isEdit">
            {{$t('project.module.tip.defaultEndpointSet')}}
            <div class="line-100"></div>
            {{$t('project.module.tip.relation')}}
          </div>
          <el-form-item :label='$t("project.endpoint.port")' prop="port">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model.number="module.port" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{module.port}}</div>
          </el-form-item>
          <el-form-item :label='$t("project.endpoint.path")' prop="path">
            <el-input  v-if="rightBox.isEdit" placeholder="" v-model="module.path" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{module.path}}</div>
          </el-form-item>
          <el-form-item class="right-box-form-param">
            <template slot="label">
              <span>{{$t('project.endpoint.param')}}</span>
              <div class="right-box-form-btns" v-if="rightBox.isEdit">
                <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
                <button id="module-clear-all" type="button" @click="clearAllParam" class="nz-btn nz-btn-size-normal nz-btn-style-light">
                  <span class="top-tool-btn-txt">{{$t('overall.clearAll')}}</span>
                </button>
                <button id="module-add-param" type="button" @click="addParam" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
                  <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                </button>
              </div>
            </template>
            <div class="param-box param-box-module">
              <div class="param-box-row" v-for="(item, index) in module.paramObj" v-if="rightBox.isEdit">
                <el-form-item class="param-box-row-key" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.key'">
                  <el-input placeholder="key" size="mini" v-model="item.key"></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item class="param-box-row-value" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.value'">
                  <el-input placeholder="value" size="mini" v-model="item.value"></el-input>
                </el-form-item>
                <span class="param-box-row-symbol" :id="'moduel-remove-param-'+index" @click="removeParam(index)"><i class="nz-icon nz-icon-minus-square"></i></span>
              </div>
              <div class="param-box-row" v-for="(item, index) in module.paramObj" v-if="!rightBox.isEdit">
                <div  class="right-box-form-content-txt">{{item.key}}={{item.value}}</div>
              </div>
            </div>

          </el-form-item>

        </el-form>
      </el-scrollbar>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="module-box-esc" class="nz-btn nz-btn-size-large nz-btn-style-light nz-btn-min-width-120">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button v-if="rightBox.isEdit" @click="saveOrToEdit" id="module-box-save" class="nz-btn nz-btn-size-large nz-btn-style-normal nz-btn-min-width-120">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
      <!--<div class='right-box-form'>
      &lt;!&ndash;project&ndash;&gt;
      <div class="right-box-form-row">
        <div class="right-box-form-label">{{$t("project.project.project")}}</div>
        <div class="right-box-form-content">
          <el-select value-key="id" popper-class="config-dropdown" v-model="module.project" placeholder="" size="small">
            <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
          </el-select>
        </div>
      </div>
      &lt;!&ndash;name&ndash;&gt;
      <div class="right-box-form-row">
        <div class="right-box-form-label">{{$t("project.module.moduleName")}}</div>
        <div class="right-box-form-content">
          <el-input placeholder="" maxlength="64" show-word-limit v-model="module.name" size="small"></el-input>
        </div>
      </div>
      &lt;!&ndash;description&ndash;&gt;
      <div class="right-box-form-row">
        <div class="right-box-form-label">{{$t("project.module.description")}}</div>
        <div class="right-box-form-content">
          <el-input type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="module.remark" size="small"></el-input>
        </div>
      </div>
      &lt;!&ndash;tip&ndash;&gt;
      <div class="right-box-form-row">
        <div class="right-box-form-content">
          <div class="right-box-form-tip">
            {{$t('project.module.tip.defaultEndpointSet')}}
            <div class="line-100"></div>
            {{$t('project.module.tip.relation')}}
          </div>
        </div>
      </div>
      &lt;!&ndash;port&ndash;&gt;
      <div class="right-box-form-row">
        <div class="right-box-form-label">{{$t("project.endpoint.port")}}</div>
        <div class="right-box-form-content">
          <el-input placeholder="" v-model="module.port" size="small"></el-input>
        </div>
      </div>
      &lt;!&ndash;path&ndash;&gt;
      <div class="right-box-form-row">
        <div class="right-box-form-label">{{$t("project.endpoint.path")}}</div>
        <div class="right-box-form-content">
          <el-input placeholder="" v-model="module.path" size="small"></el-input>
        </div>
      </div>
      &lt;!&ndash;param&ndash;&gt;
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
    </div>-->

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
          title: '',
          isEdit:false
        },
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          project: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          port: [
            {type: 'number', message: this.$t('validate.number'), trigger: 'blur'}
          ],
        },
        projectList: [],
      }
    },
    methods: {
      show(show, isEdit) {
        this.rightBox.show = show;
        this.rightBox.isEdit = isEdit;
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
      },

      /*保存*/
      save() {
        this.module.param = this.paramToJson(this.module.paramObj);
        this.$refs.moduleForm.validate((valid) => {
          if (valid) {
            this.module.projectId = this.module.project.id;
            if (this.module.id) {
              this.$put('module', this.module).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$store.commit('moduleListChange');
                  this.rightBox.show = false;
                  this.$emit('reload');
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('module', this.module).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$store.commit('moduleListChange');
                  this.rightBox.show = false;
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            return false;
          }
        });
      },
      saveOrToEdit: function() {
        if (!this.rightBox.isEdit) {
          this.rightBox.isEdit = true;
          this.rightBox.title = this.$t("project.module.editModule") + "  ID：" + this.module.id;
        } else {
          this.save();
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
              this.$store.commit('moduleListChange');
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
          eval('tempParam["' + param[i].key + '"]="' + param[i].value + '"');
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
    computed: {
      projectListReloadWatch() {
        return this.$store.state.projectListChange;
      },
    },
    watch: {
      module: {
        immediate: true,
        deep:true,
        handler(n, o) {
          if (n && n.id) {
            this.rightBox.title =this.rightBox.isEdit? this.$t("project.module.editModule") + "  ID：" + n.id : this.$t("project.module.module") + "  ID：" + n.id ;
          } else {
            this.rightBox.title = this.$t("project.module.createModule");
          }
        }
      },
      projectListReloadWatch(n, o) {
        this.getProjectList();
      }
    }
  }
</script>

<style scoped>
</style>
