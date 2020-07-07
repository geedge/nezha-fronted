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
        <el-form class="right-box-form right-box-form-left" :model="currentModule" label-position="right" label-width="120px" :rules="rules" ref="moduleForm">
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

          <div class="nz-tab module-box-type">
            <div class="nz-tab-item-box" @click="changeType('http')" id="module-type-1">
              <div class="nz-tab-item" :class="{'nz-tab-item-active' : currentModule.type.toLowerCase() == 'http', 'unclickable': currentModule.id}">HTTP</div>
            </div>
            <div @click="changeType('snmp')" class="nz-tab-item-box" id="module-type-2">
              <div class="nz-tab-item" :class="{'nz-tab-item-active' : currentModule.type.toLowerCase() == 'snmp', 'unclickable': currentModule.id}">SNMP</div>
            </div>
          </div>

          <!-- snmp表单 -->
          <span class="snmp-form" v-if="currentModule.type && currentModule.type == 'snmp'">
            <div class="right-box-sub-title">SNMP settings</div>
            <div class="line-100 right-box-line"></div>

            <el-row>
              <el-col :span="6">
                <div class="sub-label sub-label-required">{{$t('project.module.walk')}}</div>
              </el-col>
              <el-col :span="18">
                <el-form-item prop="walk">
                  <select-walk ref="selectWalk" :walkData="walkData" :expandedWalk="expandedWalkData" :placement="'bottom-start'" @selectWalk="selectWalk" :currentWalk="currentModule.walk">
                    <template v-slot:trigger>
                      <div class="el-cascader">
                        <div class="el-input">
                          <input type="text" readonly="readonly" autocomplete="off" class="el-input__inner" aria-expanded="false">
                        </div>
                        <div class="el-cascader__tags">
                          <el-scrollbar style="height: 100%;" ref="walkScrollbar">
                            <span class="el-tag el-tag--info el-tag--small el-tag--light" v-for="item in currentModule.walk">
                              <span v-html="mibName(item)"></span>
                              <div class="walk-close-box" @click.stop="removeWalk(item)">
                                <i class="el-tag__close el-icon-close walk-close"></i>
                              </div>
                            </span>
                          </el-scrollbar>
                        </div>
                      </div>
                    </template>
                  </select-walk>
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

              <el-row class="same-label-width" v-if="currentModule.security_level == 'authNoPriv' || currentModule.security_level == 'authPriv'">
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

              <el-row class="same-label-width" v-if="currentModule.security_level == 'authPriv'">
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
          </span>

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

          <el-form-item class="right-box-form-param" v-if="currentModule.type.toLowerCase() == 'http'">
            <template slot="label">
              <span>{{$t('project.endpoint.param')}}</span>
              <div class="right-box-form-btns" v-if="rightBox.isEdit">
                <button style="display: none;">第一个button会出现意料之外的hover样式，找不到原因，只好加个不可见的button规避问题</button>
                <button id="module-clear-all" type="button" @click="clearAllParam" class="nz-btn nz-btn-size-normal nz-btn-style-light">
                  <span><i class="el-icon-delete"></i></span>
                </button>
                <button id="module-add-param" type="button" @click="addParam" class="nz-btn nz-btn-size-normal nz-btn-style-light">
                  <span><i style="font-size: 12px;" class="nz-icon nz-icon-create-square"></i></span>
                </button>
              </div>
            </template>

            <div v-if="rightBox.isEdit" class="param-box param-box-module">
              <el-scrollbar ref="paramBoxScrollbar" style="height: 100%">
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
              </el-scrollbar>
            </div>
            <div v-for="(item, index) in currentModule.paramObj" v-if="!rightBox.isEdit">
              <div  class="right-box-form-content-txt">{{item.key}}={{item.value}}</div>
            </div>

          </el-form-item>

          <el-form-item :label='$t("project.module.description")' prop="remark">
            <el-input v-if="rightBox.isEdit" type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="currentModule.remark" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentModule.remark}}</div>
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
  import selectWalk from "../popBox/selectWalk";

  export default {
    name: "moduleBox",
    props: {
      module: Object,
      currentProject: Object
    },
    components: {
      'select-walk': selectWalk
    },
    data() {
      return {
        walkData: [],
        expandedWalkData: [],
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
          /*walk: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],*/
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
      selectWalk(walk) {
        if (this.currentModule.walk.indexOf(walk) != -1) {
          this.currentModule.walk.splice(this.currentModule.walk.indexOf(walk), 1);
        } else {
          this.currentModule.walk.push(walk);
        }

        this.$refs.walkScrollbar.update();
      },
      //从mibData里取得oid对应的mib名称
      getMibName(walkData, walk) {
        let mibName = "";
        let objectName = "";
        walkData.forEach((item, index) => {
          if (!mibName && item.subTree && item.subTree.length > 0) {
            item.subTree.forEach((item2, index2) => {
              if (!mibName && getMibName(item2, walk)) {
                mibName = item.name;
              }
            });
          }
        });
        function getMibName(tree, oid) {
          if (oid.indexOf(tree.objectID) > -1) {
            if (tree.objectID == oid) {
              objectName = tree.name;
              return true;
            } else {
              if (tree.subTree && tree.subTree.length > 0) {
                let result = false;
                for (let i = 0; i < tree.subTree.length; i++) {
                  if (getMibName(tree.subTree[i], oid)) {
                    result = true;
                    break;
                  }
                }
                return result;
              } else {
                return false;
              }
            }
          } else {
            return false;
          }
        }
        if (!objectName) {
          objectName = walk;
        }
        objectName = "<span style='font-weight:bold'>" + objectName + "</span>";
        return mibName ? mibName + "：" + objectName : objectName;
      },

      removeWalk(walk) {
        this.currentModule.walk.splice(this.currentModule.walk.indexOf(walk), 1);
        this.$refs.selectWalk.$refs.walkTree.setChecked(walk, false);
      },

      initWalk() {
        this.$nextTick(() => {
          this.$refs.selectWalk.show();
        })
      },

      getWalkData() {
        this.$get('mib/tree', {pageSize: -1, pageNo: 1}).then(response => {
          if (response.code === 200) {
            let obj = JSON.parse(response.data);
            this.walkData = [];
            for (let item in obj) {
              setAttr(obj[item], "detailShow", false);
              this.walkData.push({name: item, detailShow: false, subTree: obj[item]});
            }
          }
        });
        function setAttr(tree, name, value) {
          if (tree && tree.length > 0) {
            for (let i = 0; i < tree.length; i++) {
              tree[i][name] = value;
              if (tree[i].subTree && tree[i].subTree.length > 0) {
                setAttr(tree[i].subTree, name, value);
              }
            }
          }
        }
      },

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
          walk: module.walk,
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
        module.walk = snmpObj.walk;
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
        this.$get('project', {pageSize: -1, pageNo: 1}).then(response => {
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
        this.$nextTick(() => {
          this.$refs.paramBoxScrollbar.update();
        });
      },

      // 新增param
      addParam: function() {
        this.currentModule.paramObj.push({key: '', value: ''});
        this.$nextTick(() => {
          this.$refs.paramBoxScrollbar.update();
        });
      },

      // 移除单个param
      removeParam: function(index) {
        this.currentModule.paramObj.splice(index, 1);
        this.$nextTick(() => {
          this.$refs.paramBoxScrollbar.update();
        });
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
    mounted() {
      this.getWalkData();
    },
    created() {
      this.getProjectList();
    },
    computed: {
      projectListReloadWatch() {
        return this.$store.state.projectListChange;
      },
      mibName() {
        return (value) => {
          return this.getMibName(this.walkData, value);
        }
      }
    },
    watch: {
      module: {
        immediate: true,
        deep: true,
        handler(n, o) {
          this.currentModule = JSON.parse(JSON.stringify(n));
          if (n && n.id) {
            this.rightBox.title =this.rightBox.isEdit? this.$t("project.module.editModule") + "  ID：" + n.id : this.$t("project.module.module") + "  ID：" + n.id ;
            if (n.snmpParam) {
              this.reparseSnmpParam(this.currentModule);
            }

          } else if (n) {
            this.rightBox.title = this.$t("project.module.createModule");
            if (!n.type) {
              n.type = 'http';
            } else if (n.type.toLowerCase() == 'snmp') {
              if (n.snmpParam) {
                this.reparseSnmpParam(this.currentModule);
              }
            }
          }
        }
      },
      currentModule: {
        immediate: true,
        deep: true,
        handler(n, o) {
          if (!n.id && n.type && n.type.toLowerCase() == 'snmp') {
            n.port = 161;
            this.expandedWalkData = [];
            this.$nextTick(() => {
              this.$refs.selectWalk.show();
            });
            for (let i = 0; i < n.walk.length; i++) {
              this.expandedWalkData.push(n.walk[i].substring(0, n.walk[i].lastIndexOf(".")));
            }
          } else if (!n.id && n.type && n.type.toLowerCase() == 'http') {
            n.port = 9100;
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
  .module-walk-box {
    width: 100%;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    min-height: 32px;
    margin-bottom: 22px;
    padding: 3px 0;
  }
  .module-walk-box i {
    color: #C0C4CC;
  }
  .walk-box-item {
    padding: 5px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .walk-box-item-txt {
    color: #606266;
  }
  .walk-box-item-op span:first-of-type {
    margin-right: 4px;
  }
  .walk-box-item-op span {
    cursor: pointer;
  }
  .walk-box-op {
    width: 18px;
    margin: 5px 0 5px 15px;
    cursor: pointer;
  }
  .el-cascader {
    width: 100%;
  }
  .el-cascader__tags {
    height: calc(100% - 10px);
    width: 100%;
  }
  .right-box-module .el-cascader .el-input__inner {
    height: 150px;
  }
</style>
<style>
  .sub-label {
    padding-right: 15px;
    font-size: 14px;
    color: #666;
    text-align: right;
    line-height: 30px
  }
  .sub-label-required::before {
    content: '*';
    color: #F56C6C;
    margin-right: 4px;
  }
  .module-box-type {
    margin: 25px 0 10px -15px;
  }
  .walk-close-box {
    margin-left: 6px;
    width: 14px;
  }
  .walk-close {
    margin-left: -6px;
  }
</style>
