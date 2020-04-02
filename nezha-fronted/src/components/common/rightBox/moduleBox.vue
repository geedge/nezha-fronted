<template>
  <transition name="right-box">
    <div class="right-box right-box-module" v-if="rightBox.show" v-clickoutside="clickos">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button id="module-del" type="button" v-if="currentModule.id != '' && rightBox.isEdit" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button v-if="!rightBox.isEdit && currentModule.buildIn != 1" id="module-save" type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.edit')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box" ref="scrollbar">
        <el-form class="right-box-form" :model="currentModule" label-position="top" :rules="rules" ref="moduleForm">
          <el-form-item :label='$t("project.project.project")' prop="project">
            <el-select v-if="rightBox.isEdit" value-key="id" popper-class="config-dropdown" v-model="currentModule.project" placeholder="" size="small">
              <el-option :id="'module-project-'+item.id" v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit && currentModule.project" class="right-box-form-content-txt">{{currentModule.project.name}}</div>
          </el-form-item>
          <el-form-item :label='$t("project.module.moduleName")' prop="name">
            <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model="currentModule.name" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentModule.name}}</div>
          </el-form-item>

          <!--<el-form-item :label="$t('overall.type')" prop="type">
            <el-radio-group v-model="module.type" size="small" @change="updateScrollbar" :disabled="module.id ? true : false">
              <el-radio-button label="http"></el-radio-button>
              <el-radio-button label="snmp"></el-radio-button>
            </el-radio-group>
          </el-form-item>-->

          <div class="nz-tab module-box-type">
            <div class="nz-tab-item-box" @click="changeType('http')" id="module-type-1">
              <div class="nz-tab-item" :class="{'nz-tab-item-active' : currentModule.type.toLowerCase() == 'http', 'unclickable': currentModule.id}">HTTP</div>
            </div>
            <div @click="changeType('snmp')" class="nz-tab-item-box" id="module-type-2">
              <div class="nz-tab-item" :class="{'nz-tab-item-active' : currentModule.type.toLowerCase() == 'snmp', 'unclickable': currentModule.id}">SNMP</div>
            </div>
          </div>

          <!-- snmp表单 -->
          <template v-if="currentModule.type && currentModule.type == 'snmp'">
            <div class="right-box-sub-title">SNMP setting</div>
            <div class="line-100 right-box-line"></div>

            <el-row>
              <el-col :span="6">
                <div class="sub-label sub-label-required">{{$t('project.module.walk')}}</div>
              </el-col>
              <el-col :span="18">
                <el-form-item prop="walkStr">
                  <el-input class="snmp-walk" v-model="currentModule.walkStr" autosize type="textarea" :placeholder="$t('tip.pressEnterToAdd')"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="6">
                <div class="sub-label">{{$t('project.module.version')}}</div>
              </el-col>
              <el-col :span="18">
                <el-form-item prop="version">
                  <el-radio-group v-model.number="currentModule.version" size="small">
                    <el-radio-button :label="2"></el-radio-button>
                    <el-radio-button :label="3"></el-radio-button>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="6">
                <div class="sub-label">{{$t('project.module.maxRepetitions')}}</div>
              </el-col>
              <el-col :span="18">
                <el-form-item prop="max_repetitions">
                  <el-input v-model.number="currentModule.max_repetitions" size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="6">
                <div class="sub-label">{{$t('project.module.retries')}}</div>
              </el-col>
              <el-col :span="18">
                <el-form-item prop="retries">
                  <el-input v-model.number="currentModule.retries" size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="6">
                <div class="sub-label">{{$t('project.module.timeout')}}</div>
              </el-col>
              <el-col :span="18">
                <el-form-item prop="timeout">
                  <el-input v-model.number="currentModule.timeout" size="small">
                    <template slot="append">second</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="1">&nbsp;</el-col>
              <el-col :span="23">
                <div class="right-box-sub-title">Auth</div>
                <div class="line-100 right-box-line"></div>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="6">
                <div class="sub-label sub-label-required">{{$t('project.module.community')}}</div>
              </el-col>
              <el-col :span="18">
                <el-form-item prop="community">
                  <el-input v-model.trim="currentModule.community" maxlength="64" show-word-limit size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>

            <!--SNMP V3 setting-->
            <template v-if="currentModule.version == 3">
              <el-row>
                <el-col :span="6">
                  <div class="sub-label sub-label-required">{{$t('login.username')}}</div>
                </el-col>
                <el-col :span="18">
                  <el-form-item prop="username">
                    <el-input v-model.trim="currentModule.username" maxlength="64" show-word-limit size="small"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="6">
                  <div class="sub-label">{{$t('project.module.securityLevel')}}</div>
                </el-col>
                <el-col :span="18">
                  <el-form-item prop="security_level">
                    <el-radio-group v-model="currentModule.security_level" size="small" @change="updateScrollbar">
                      <el-radio-button label="noAuthNoPriv"></el-radio-button>
                      <el-radio-button label="authNoPriv"></el-radio-button>
                      <el-radio-button label="authPriv"></el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="currentModule.security_level == 'authNoPriv' || currentModule.security_level == 'authPriv'">
                <el-col :span="6">
                  <div class="sub-label sub-label-required">{{$t('login.password')}}</div>
                </el-col>
                <el-col :span="18">
                  <el-form-item prop="password">
                    <el-input v-model.trim="currentModule.password" maxlength="64" show-word-limit size="small"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="currentModule.security_level == 'authNoPriv' || currentModule.security_level == 'authPriv'">
                <el-col :span="6">
                  <div class="sub-label">{{$t('project.module.authProtocol')}}</div>
                </el-col>
                <el-col :span="18">
                  <el-form-item prop="auth_protocol">
                    <el-radio-group v-model="currentModule.auth_protocol" size="small">
                      <el-radio-button label="MD5"></el-radio-button>
                      <el-radio-button label="SHA"></el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="currentModule.security_level == 'authPriv'">
                <el-col :span="6">
                  <div class="sub-label">{{$t('project.module.privProtocol')}}</div>
                </el-col>
                <el-col :span="18">
                  <el-form-item prop="priv_protocol">
                    <el-radio-group v-model="currentModule.priv_protocol" size="small">
                      <el-radio-button label="DES"></el-radio-button>
                      <el-radio-button label="AES"></el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row v-if="currentModule.security_level == 'authPriv'">
                <el-col :span="6">
                  <div class="sub-label sub-label-required">{{$t('project.module.privPassword')}}</div>
                </el-col>
                <el-col :span="18">
                  <el-form-item prop="priv_password">
                    <el-input v-model.trim="currentModule.priv_password" maxlength="64" show-word-limit size="small"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>

            <el-row>
              <el-col :span="6">
                <div class="sub-label">{{$t('project.module.contextName')}}</div>
              </el-col>
              <el-col :span="18">
                <el-form-item prop="context_name">
                  <el-input v-model.trim="currentModule.context_name" maxlength="64" show-word-limit size="small"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </template>

          <el-form-item :label='$t("project.module.description")' prop="remark">
            <el-input v-if="rightBox.isEdit" type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="currentModule.remark" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentModule.remark}}</div>
          </el-form-item>

          <div class="right-box-form-tip" v-if="rightBox.isEdit">
            {{$t('project.module.tip.defaultEndpointSet')}}
            <div class="line-100"></div>
            {{$t('project.module.tip.relation')}}
          </div>

          <el-form-item :label='$t("project.endpoint.port")' prop="port" >
            <el-input v-if="rightBox.isEdit" placeholder="" v-model.number="currentModule.port" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentModule.port}}</div>
          </el-form-item>

          <el-form-item v-if="currentModule.type && currentModule.type.toLowerCase() == 'http'" :label='$t("project.endpoint.path")' prop="path">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="currentModule.path" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentModule.path}}</div>
          </el-form-item>

          <el-form-item class="right-box-form-param">
            <template slot="label">
              <span>{{$t('project.endpoint.param')}}</span>
              <div class="right-box-form-btns" v-if="rightBox.isEdit">
                <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
                <button id="module-clear-all" type="button" @click="clearAllParam" class="nz-btn nz-btn-size-normal nz-btn-style-light">
                  <span class="top-tool-btn-txt">{{$t('overall.clear')}}</span>
                </button>
                <button id="module-add-param" type="button" @click="addParam" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
                  <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
                </button>
              </div>
            </template>

            <div v-if="rightBox.isEdit" class="param-box param-box-module">
              <div class="param-box-row" v-for="(item, index) in currentModule.paramObj">
                <el-form-item class="param-box-row-key" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.key'">
                  <el-input placeholder="key" size="mini" v-model="item.key"></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item class="param-box-row-value" :rules="{required: true, message: $t('validate.required'), trigger: 'blur'}" :prop="'paramObj.' + index + '.value'">
                  <el-input placeholder="value" size="mini" v-model="item.value"></el-input>
                </el-form-item>
                <span class="param-box-row-symbol" :id="'moduel-remove-param-'+index" @click="removeParam(index)"><i class="nz-icon nz-icon-minus-square"></i></span>
              </div>
            </div>
            <div v-for="(item, index) in currentModule.paramObj" v-if="!rightBox.isEdit">
              <div  class="right-box-form-content-txt">{{item.key}}={{item.value}}</div>
            </div>

          </el-form-item>

        </el-form>
      </el-scrollbar>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="module-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button v-if="rightBox.isEdit" @click="saveOrToEdit" id="module-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
  import {noSpecialChar, port, nzNumber} from "../js/validate";

  export default {
    name: "moduleBox",
    props: {
      module: Object,
      currentProject: Object
    },
    data() {
      return {
        currentModule: {},
        rightBox: {
          show: false,
          title: '',
          isEdit:false
        },
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'},
            {validator:noSpecialChar,trigger: "change"}
          ],
          project: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          port: [
            {validator:port, trigger: 'blur'},
          ],
          walk: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          username: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          password: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          priv_password: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          max_repetitions: [
            {validator:nzNumber, trigger: 'blur'},
          ],
          retries: [
            {validator:nzNumber, trigger: 'blur'},
          ],
          timeout: [
            {validator:nzNumber, trigger: 'blur'},
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

      clickos() {
        this.esc();
      },
      changeType(type) {
        if (this.currentModule.id) {
          return;
        }
        this.currentModule.type = type;
        this.updateScrollbar();
      },
      //转化snmpParam属性
      parseSnmpParam(module) {
        let snmpObj = { //下划线命名是因为业务需求
          walk: module.walkStr.split(/\n/),
          version: module.version, //2/3
          max_repetitions: module.max_repetitions ? module.max_repetitions : 25,
          retries: module.retries ? module.retries : 3,
          timeout: module.timeout ? module.timeout + "s" : "10s", //s
          auth: {
            community: module.community,
          }
        };
        if (module.version == 3) {
          snmpObj.auth.username = module.username;
          snmpObj.auth.security_level = module.security_level;
          snmpObj.auth.context_name = module.context_name;
        }
        if (module.security_level == "authNoPriv" || module.security_level == "authPriv") {
          snmpObj.auth.password = module.password;
          snmpObj.auth.auth_protocol = module.auth_protocol;
          if (module.security_level != "authNoPriv") {
            snmpObj.auth.priv_password = module.priv_password;
            snmpObj.auth.priv_protocol = module.priv_protocol;
          }
        }
        module.snmpParam = JSON.stringify(snmpObj);
      },
      //回显时解析snmpParam
      reparseSnmpParam(module) {
        let snmpObj = JSON.parse(module.snmpParam);
        module.walkStr = snmpObj.walk.join("\n");
        module.version = snmpObj.version;
        module.max_repetitions = snmpObj.max_repetitions;
        module.retries = snmpObj.retries;
        module.timeout = parseInt(snmpObj.timeout.replace("s", ""));
        module.community = snmpObj.auth.community;
        if (snmpObj.version == 3) {
          module.username = snmpObj.auth.username;
          module.security_level = snmpObj.auth.security_level;
          module.context_name = snmpObj.auth.context_name;
        }
        if (snmpObj.auth.security_level == "authNoPriv" || snmpObj.auth.security_level == "authPriv") {
          module.password = snmpObj.auth.password;
          module.auth_protocol = snmpObj.auth.auth_protocol;
          if (snmpObj.auth.security_level != "authNoPriv") {
            module.priv_password = snmpObj.auth.priv_password;
            module.priv_protocol = snmpObj.auth.priv_protocol;
          }
        }
      },
      /*保存*/
      save() {
        this.currentModule.param = this.paramToJson(this.currentModule.paramObj);
        this.$refs.moduleForm.validate((valid) => {
          if (valid) {
            if (this.currentModule.type.toLowerCase() == 'snmp') {
              this.parseSnmpParam(this.currentModule);
            } else {
              if (this.currentModule.snmpParam) {
                this.currentModule.snmpParam = "";
              }
            }
            this.currentModule.projectId = this.currentModule.project.id;
            if (this.currentModule.id) {
              this.$put('module', this.currentModule).then(response => {
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
              this.$post('module', this.currentModule).then(response => {
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
          this.rightBox.title = this.$t("project.module.editModule") + "  ID：" + this.currentModule.id;
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
          this.$delete("module?ids=" + this.currentModule.id).then(response => {
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
        this.currentModule.paramObj = [];
      },

      // 新增param
      addParam: function() {
        this.currentModule.paramObj.push({key: '', value: ''});
      },

      // 移除单个param
      removeParam: function(index) {
        this.currentModule.paramObj.splice(index, 1);
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
      updateScrollbar() {
        this.$refs.scrollbar.update();
      }
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
        deep: true,
        handler(n, o) {
          if (n && n.id) {
            this.rightBox.title =this.rightBox.isEdit? this.$t("project.module.editModule") + "  ID：" + n.id : this.$t("project.module.module") + "  ID：" + n.id ;
            if (n.snmpParam) {
              this.reparseSnmpParam(n);
            }
            this.currentModule = JSON.parse(JSON.stringify(n));
          } else if (n) {
            if (!n.type) {
              n.type = 'http';
            } else if (n.type.toLowerCase() == 'snmp') {
              if (n.snmpParam) {
                this.reparseSnmpParam(n);
              }
            }
            this.rightBox.title = this.$t("project.module.createModule");
            this.currentModule = JSON.parse(JSON.stringify(n));
          }
        }
      },
      currentModule: {
        immediate: true,
        deep: true,
        handler(n, o) {
          if (n.type.toLowerCase() == 'snmp') {
            n.port = 161;
          }
        }
      },
      projectListReloadWatch(n, o) {
        this.getProjectList();
      }
    }
  }
</script>

<style>
  .sub-label {
    padding-right: 15px;
    font-size: 14px;
    color: #666;
    text-align: right;
    line-height: 32px
  }
  .sub-label-required::before {
    content: '*';
    color: #F56C6C;
    margin-right: 4px;
  }
  .module-box-type {
    margin: 25px 0 10px -15px;
  }
</style>
