<template>
  <div class="right-box right-box-module" v-clickoutside="{obj:editEndpoint,func:clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button v-if="editEndpoint.id" id="module-del" v-has="'module_delete'" class="nz-btn nz-btn-size-normal nz-btn-size-alien" type="button" @click="del">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editEndpoint.id ? $t("project.module.editEndpoint") + "  ID：" + editEndpoint.id : $t("project.module.createModule")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box" ref="scrollbar">
      <el-form class="right-box-form right-box-form-left" :model="editEndpoint" label-position = "top" label-width="120px" :rules="rules" ref="moduleForm">
        <!--name-->
        <el-form-item :label='$t("project.module.moduleName")' prop="name" label-width="125px">
          <el-input placeholder="" maxlength="64" show-word-limit v-model="editEndpoint.name" size="small" id="module-box-input-name"></el-input>
        </el-form-item>
        <!--project-->
        <el-form-item :label='$t("project.project.project")' prop="projectId">
          <el-select value-key="id" popper-class="config-dropdown" v-model="editEndpoint.projectId" placeholder="" size="small" id="module-box-input-project" @change="changeProject" :disabled="disabled">
            <el-option :id="'module-project-'+item.id" v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <!--asset-->
        <el-form-item :label='$t("project.module.asset")' prop="asset" label-width="125px">
          <el-input placeholder="" maxlength="64" show-word-limit v-model="editEndpoint.assetName" size="small" id="module-box-input-assetName" :disabled="disabled"></el-input>
        </el-form-item>
        <!--module-->
        <el-form-item :label='$t("project.module.module")' prop="remark">
          <el-select value-key="id" popper-class="config-dropdown" v-model="editEndpoint.moduleId" placeholder="" size="small" :disabled="!editEndpoint.projectId || disabled " id="module-box-input-module">
            <el-option :id="'module-'+item.id" v-for="item in moduleList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>

        <!--type-->
        <el-form-item :label='$t("project.endpoint.type")' prop="type">
          <el-select value-key="id" popper-class="config-dropdown" v-model="editEndpoint.type" placeholder="" size="small" id="module-box-input-type" :disabled="!!editEndpoint.id || disabled" @change="changeAuthType" >
            <el-option :id="'module-type-'+item.id" v-for="item in typetList" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>

        <!-- snmp表单 -->
        <span class="snmp-form" v-if="editEndpoint.type && editEndpoint.type == 'snmp'">
          <div class="right-box-sub-title">SNMP settings
          </div>
          <div class="right-box-line"></div>

          <el-row>
            <el-col :span="6">
              <div class="sub-label sub-label-required">{{$t('project.module.walk')}}</div>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="walk">
                <select-walk ref="selectWalk" :walkData="walkData" :expandedWalk="expandedWalkData" :placement="'bottom-start'" @selectWalk="selectWalk" :currentWalk="editEndpoint.walk">
                  <template v-slot:trigger>
                    <div class="el-cascader">
                      <div class="el-input">
                        <input type="text" readonly="readonly" autocomplete="off" class="el-input__inner" aria-expanded="false">
                      </div>
                      <div class="el-cascader__tags">
                        <div ref="walkScrollbar" style="height: 100%; overflow: auto;">
                          <span v-for="(item, index) in editEndpoint.walk" :key="index" class="el-tag el-tag--info el-tag--small el-tag--light">
                            <span v-html="mibName(item)"></span>
                            <div class="walk-close-box" @click.stop="removeWalk(item)">
                              <i class="el-tag__close nz-icon nz-icon-close walk-close"></i>
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                  </template>
                </select-walk>
              </el-form-item>
            </el-col>
          </el-row>
          <!--credentials-->
        <el-form-item :label='$t("project.endpoint.credentials")' prop="credentials">
          <el-select value-key="id" popper-class="config-dropdown" v-model="editEndpoint.configs.snmpCredentialsId" placeholder="" size="small" id="module-box-input-credentials">
            <el-option :id="'module-type-'+item.id" v-for="item in credentialList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        </span>

        <!--Enpoint template-->
        <div class="right-box-sub-title">Enpoint template
          <el-tooltip placement="top" effect="light">
            <div slot="content">
              {{$t('project.module.tip.defaultEndpointSet')}}
              <div></div>
              {{$t('project.module.tip.relation')}}
            </div>
            <i class="nz-icon nz-icon-info-normal"></i>
          </el-tooltip>
        </div>
        <div class="right-box-line"></div>

        <el-tabs v-model="activeName">
          <el-tab-pane label="Basic" name="Basic">
            <!--path-->
            <el-form-item :label='$t("project.endpoint.path")' prop="configs.metrics_path" class="half-form-item">
              <el-input placeholder="" v-model="editEndpoint.configs.metrics_path" size="small" id="module-box-input-path"></el-input>
            </el-form-item>
            <!--port-->
            <el-form-item :label='$t("project.endpoint.port")' prop="port" class="half-form-item">
              <el-input placeholder="" v-model.number="editEndpoint.port" size="small" id="module-box-input-port"></el-input>
            </el-form-item>
            <!--host-->
            <el-form-item :label='$t("project.endpoint.host")' prop="host">
              <el-input placeholder="" v-model.number="editEndpoint.configs.host" size="small" id="module-box-input-host"></el-input>
            </el-form-item>
            <transition name="el-zoom-in-top">
              <div v-show="showAllBasicOption" >
                <!--name pattern-->
                <el-form-item :label='$t("project.endpoint.pattern")' prop="pattern" class="half-form-item">
                  <!--              <el-input placeholder="" v-model=""></el-input>-->
                  <el-autocomplete
                    class="inline-input"
                    size="small"
                    id="module-box-input-pattern"
                    v-model="editEndpoint.endpointNameTmpl"
                    :fetch-suggestions="querySearch"
                    placeholder="请输入内容"
                  ></el-autocomplete>
                </el-form-item>
                <!--scrape_interval-->
                <el-form-item :label='$t("project.endpoint.scrape_interval")' prop="scrape_interval" class="half-form-item">
                  <el-input :placeholder='$t("project.endpoint.scrape_interval_placeholder")' v-model.number="editEndpoint.configs.scrape_interval" size="small" id="module-box-input-scrape_interval">
                   <template slot="append">s</template>
                  </el-input>
                </el-form-item>
                <!--scrape_timeout-->
                <el-form-item :label='$t("project.endpoint.scrape_timeout")' prop="scrape_timeout" class="half-form-item">
                  <el-input :placeholder='$t("project.endpoint.scrape_timeout_placeholder")' v-model.number="editEndpoint.configs.scrape_timeout" size="small" id="module-box-input-scrape_timeout">
                    <template slot="append">s</template>
                  </el-input>
                </el-form-item>
              </div>
            </transition>

            <div style="text-align: center"><i class="nz-icon nz-icon-drop-down need-rotate" :class="showAllBasicOption?'is-active':''" @click="showAllBasicOption=!showAllBasicOption"></i></div>
          </el-tab-pane>
          <el-tab-pane label="Parameter" name="Parameter">
            <div ref="labelBoxScrollbar" style="height: 100%; overflow: auto;" id="module-box-params">
              <div v-for="(item, index) in editEndpoint.paramObj" :key="index" class="param-box-row">
                <el-form-item class="param-box-row-key" :prop="'paramObj.' + index + '.key'">
                  <el-input placeholder="key" size="mini" v-model="item.key" ></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item class="param-box-row-value" :prop="'paramObj.' + index + '.value'">
                  <el-select
                    v-model="item.value"
                    multiple
                    filterable
                    allow-create
                    :ref="'select'+ index"
                    placeholder="value" size="mini"
                    default-first-option
                    popper-class="config-dropdown hide-element"
                  >
                    <span slot="empty" class=""></span>
                  </el-select>
                </el-form-item>
                <span class="param-box-row-symbol" :id="'moduel-remove-param-'+index" @click="removeParam(index)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
              </div>
            </div>
            <div style="text-align: center">
               <span id="module-add-param" type="button" @click="addParam" class="right-box-form-add module-add-label">
              <span><i style="font-size: 16px;" class="nz-icon nz-icon-create-square"></i></span>
            </span>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Labels" name="Labels">
            <div ref="labelBoxScrollbar" style="height: 100%; overflow: auto;" id="module-box-labels">
              <div v-for="(item, index) in editEndpoint.labelModule" :key="index" class="param-box-row">
                <el-form-item class="param-box-row-key" :rules="[{ pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('validate.key') ,trigger: 'blur'}]" :prop="'labelModule.' + index + '.key'">
                  <el-input placeholder="key" size="mini" v-model="item.key"></el-input>
                </el-form-item>
                <span class="param-box-row-eq">=</span>
                <el-form-item class="param-box-row-value" :prop="'labelModule.' + index + '.value'">
                  <el-input placeholder="value" size="mini" v-model="item.value"></el-input>
                </el-form-item>
                <span class="param-box-row-symbol" :id="'moduel-remove-label-'+index" @click="removeLabel(index)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
              </div>
            </div>
            <div style="text-align: center">
               <span id="module-add-label" type="button" @click="addLabel" class="right-box-form-add module-add-label">
              <span><i style="font-size: 16px;" class="nz-icon nz-icon-create-square"></i></span>
            </span>
            </div>
          </el-tab-pane>
          <el-tab-pane label="Auth" name="Auth" v-if="editEndpoint.type !== 'snmp'">
            <!--authtype-->
            <el-form-item :label='$t("project.endpoint.type")' prop="authtype">
              <el-select @change="changeAuthType" value-key="id" popper-class="config-dropdown" v-model="authType" placeholder="" size="small" id="module-box-input-auth-type">
                <el-option :id="'module-type-'+item.id" v-for="item in authTypeList" :key="item.value" :label="item.name" :value="item.value"></el-option>
              </el-select>
            </el-form-item>

            <!--authtype 1-->
            <el-form-item :label='$t("project.endpoint.username")' prop="authtype" v-if="authType === 1" class="half-form-item">
              <el-input placeholder='' v-model.number="editEndpoint.configs.basic_auth.username" size="small" id="module-box-input-uername"></el-input>
            </el-form-item>

            <el-form-item :label='$t("project.endpoint.password")' prop="authtype" v-if="authType === 1" class="half-form-item">
              <el-input placeholder='' v-model.number="editEndpoint.configs.basic_auth.password" size="small" id="module-box-input-password"></el-input>
            </el-form-item>

            <!--authtype 2-->
            <el-form-item :label='$t("project.endpoint.bearer_token")' prop="authtype" v-if="authType === 2">
              <el-input placeholder='' v-model.number="editEndpoint.configs.bearer_token" size="small" id="module-box-input-bearer_token"></el-input>
            </el-form-item>

          </el-tab-pane>
        </el-tabs>
        <div class="configs-copy-value">
          <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue"></i></span>
          <pre style="overflow-y: auto;height:100%">{{configsCopyValue}}</pre>
        </div>
      </el-form>
    </div>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button v-cancel="{obj:editEndpoint,func:esc}" id="module-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="module-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { noSpecialChar, port, nzNumber } from '../js/validate'
import selectWalk from '../popBox/selectWalk'

export default {
  name: 'editEndpointBoxNew',
  props: {
    module: Object,
    currentProject: Object,
    disabled: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'add'
    }
  },
  components: {
    'select-walk': selectWalk
  },
  data () {
    return {
      walkData: [],
      activeName: 'Basic',
      expandedWalkData: [],
      radio: 'password',
      editEndpoint: {},
      restaurants: [
        { value: '{{module.name}}-{{asset.name}}' },
        { value: '{{module.name}}-{{asset.manageIp}}' }
      ],
      showAllBasicOption: false,
      rules: {
        name: [
          { validator: noSpecialChar, trigger: 'change' }
        ],
        projectId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        moduleId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        walk: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        port: [
          { validator: port, trigger: 'blur' }
        ]
      },
      projectList: [],
      moduleList: [],
      credentialList: [],
      typetList: [
        {
          value: 'http',
          name: 'HTTP'
        },
        {
          value: 'snmp',
          name: 'SNMP'
        }
      ],
      authType: 0,
      authTypeList: [
        { name: this.$t('project.endpoint.authTypeNull'), value: 0 },
        { name: this.$t('project.endpoint.authTypeWord'), value: 1 },
        { name: this.$t('project.endpoint.authTypeToken'), value: 2 }
      ],
      configsCopyValue: ''
    }
  },
  methods: {
    selectWalk (walk) {
      if (this.editEndpoint.walk.indexOf(walk) != -1) {
        this.editEndpoint.walk.splice(this.editEndpoint.walk.indexOf(walk), 1)
      } else {
        this.editEndpoint.walk.push(walk)
      }
    },
    // 从mibData里取得oid对应的mib名称
    getMibName (walkData, walk) {
      let mibName = ''
      let objectName = ''
      walkData.forEach((item, index) => {
        if (!mibName && item.subTree && item.subTree.length > 0) {
          item.subTree.forEach((item2, index2) => {
            if (!mibName && getMibName(item2, walk)) {
              mibName = item.name
            }
          })
        }
      })
      function getMibName (tree, oid) {
        if (oid.indexOf(tree.objectID) > -1) {
          if (tree.objectID == oid) {
            objectName = tree.name
            return true
          } else {
            if (tree.subTree && tree.subTree.length > 0) {
              let result = false
              for (let i = 0; i < tree.subTree.length; i++) {
                if (getMibName(tree.subTree[i], oid)) {
                  result = true
                  break
                }
              }
              return result
            } else {
              return false
            }
          }
        } else {
          return false
        }
      }
      if (!objectName) {
        objectName = walk
      }
      objectName = "<span style='font-weight:bold'>" + objectName + '</span>'
      return mibName ? mibName + '：' + objectName : objectName
    },

    removeWalk (walk) {
      this.editEndpoint.walk.splice(this.editEndpoint.walk.indexOf(walk), 1)
      this.$refs.selectWalk.$refs.walkTree.setChecked(walk, false)
    },

    initWalk () {
      this.$nextTick(() => {
        if (this.$refs.selectWalk) {
          this.$refs.selectWalk.show()
        }
      })
    },

    getWalkData () {
      this.$get('mib/tree', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          const obj = JSON.parse(response.data)
          this.walkData = []
          for (const item in obj) {
            setAttr(obj[item], 'detailShow', false)
            this.walkData.push({ name: item, detailShow: false, subTree: obj[item] })
          }
        }
      })
      function setAttr (tree, name, value) {
        if (tree && tree.length > 0) {
          for (let i = 0; i < tree.length; i++) {
            tree[i][name] = value
            if (tree[i].subTree && tree[i].subTree.length > 0) {
              setAttr(tree[i].subTree, name, value)
            }
          }
        }
      }
    },

    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },

    clickOutside () {
      this.esc(false)
    },
    changeType (type) {
      if (this.editEndpoint.id) {
        return
      }
      this.editEndpoint.type = type
      if (type == 'http') {
        this.editEndpoint.port = 9100
      } else {
        this.$nextTick(() => {
          this.$refs.selectWalk.show()
        })
        this.editEndpoint.port = 161
      }
    },
    /* 保存 */
    save () {
      this.editEndpoint.configs.params = this.paramToJson(this.editEndpoint.paramObj)
      this.editEndpoint.configs.labels = this.labelsToJson(this.editEndpoint.labelModule)
      this.editEndpoint.paramObj = this.editEndpoint.paramObj.filter(item => item.value && item.value.length)
      this.editEndpoint.labelModule = this.editEndpoint.labelModule.filter(item => item.value)
      const params = { ...this.editEndpoint }
      params.configs.walk = params.walk
      params.configs.port = params.port
      params.configs = JSON.stringify(params.configs)
      if (this.authType === 2 && !this.editEndpoint.configs.bearer_token) {
        this.$message.error("'token' is required")
      } else if (this.authType === 1 && !(this.editEndpoint.configs.basic_auth.username && this.editEndpoint.configs.basic_auth.password)) {
        this.$message.error("'username' and 'password' is required")
      } else {
        this.authType = 0
      }
      this.$nextTick(() => {
        this.$refs.moduleForm.validate((valid) => {
          if (valid) {
            if (this.type === 'add') {
              this.prevent_opt.save = true
              if (this.editEndpoint.assetId) {
                this.$emit('close', true, this.editEndpoint, false)
                this.prevent_opt.save = false
              } else {
                this.$emit('close', true, this.editEndpoint, true)
                this.prevent_opt.save = false
              }
            } else if (this.type === 'edit') {
              if (this.editEndpoint.id) {
                this.$put('monitor/endpoint', [params]).then(response => {
                  if (response.code === 200) {
                    this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                    this.$store.commit('setReloadFacade')
                    this.esc(true)
                  } else {
                    this.$message.error(response.msg)
                  }
                  this.prevent_opt.save = false
                })
              }
            }
          } else {
            return false
          }
        })
      })
    },
    /* 删除 */
    del () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('monitor/endpoint?ids=' + this.editEndpoint.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.$store.commit('setReloadFacade')
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },

    /* 获取project列表 */
    getProjectList () {
      this.$get('monitor/project', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.projectList = response.data.list
        }
      })
    },
    changeProject () {
      this.getModuleList()
    },
    /* 获取module列表 */
    getModuleList () {
      if (!this.editEndpoint.projectId) {
        return
      }
      this.$get('monitor/module', { pageSize: -1, pageNo: 1, projectIds: this.editEndpoint.projectId }).then(response => {
        if (response.code === 200) {
          this.moduleList = response.data.list
        }
      })
    },
    // get snmp
    getCredential () {
      this.$get('/snmp/credential', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.credentialList = response.data.list
        }
      })
    },
    // 清除param
    clearAllParam () {
      this.editEndpoint.paramObj = []
    },

    // 新增param
    addParam () {
      this.editEndpoint.paramObj.push({ key: '', value: [], showList: false })
    },
    // 移除单个param
    removeParam (index) {
      if (this.editEndpoint.paramObj.length === 1) {
        this.editEndpoint.paramObj = [{ key: '', value: [] }]
      }
      this.editEndpoint.paramObj.splice(index, 1)
    },
    // 新增label
    addLabel () {
      this.editEndpoint.labelModule.push({ key: '', value: '' })
    },
    // 移除单个Label
    removeLabel (index) {
      if (this.editEndpoint.labelModule.length === 1) {
        this.editEndpoint.labelModule = [{ key: '', value: '' }]
      }
      this.editEndpoint.labelModule.splice(index, 1)
    },
    // 将param转为json字符串格式
    paramToJson (param) {
      const tempParam = {}
      for (let i = 0; i < param.length; i++) {
        if (!param[i].key || !param[i].value.length) {
          continue
        }
        tempParam[param[i].key] = param[i].value
      }
      return tempParam
    },
    // 将labels转为json字符串格式
    labelsToJson (param) {
      const tempParam = {}
      for (let i = 0; i < param.length; i++) {
        if (!param[i].key || !param[i].value) {
          continue
        }
        eval('tempParam["' + param[i].key + '"]="' + param[i].value + '"')
      }
      return tempParam
    },
    // 输入建议
    querySearch (queryString, cb) {
      const restaurants = this.restaurants
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    changeAuthType () {
      this.editEndpoint.configs.bearer_token = ''
      this.editEndpoint.configs.basic_auth = {
        username: '',
        password: ''
      }
    },
    copyValue () {
      const domUrl = document.createElement('input')
      domUrl.value = this.configsCopyValue
      domUrl.id = 'creatDom'
      document.body.appendChild(domUrl)
      domUrl.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      const creatDom = document.getElementById('creatDom')
      creatDom.parentNode.removeChild(creatDom)
      this.$message.success(this.$t('overall.copySuccess'))
    },
    syntaxHighlight (json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2)
      }
      json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
          let cls = 'number'
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key'
            } else {
              cls = 'string'
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean'
          } else if (/null/.test(match)) {
            cls = 'null'
          }
          return '<span class="' + cls + '">' + match + '</span>'
        }
      )
    }
  },
  mounted () {
    this.getWalkData()
  },
  created () {
    this.getProjectList()
    this.getCredential()
  },
  computed: {
    mibName () {
      return (value) => {
        return this.getMibName(this.walkData, value)
      }
    }
  },
  watch: {
    module: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.editEndpoint = JSON.parse(JSON.stringify(n))
        this.activeName = 'Basic'
        this.changeProject()
        if (this.editEndpoint.configs.bearer_token) {
          this.authType = 2
        } else if (this.editEndpoint.configs.basic_auth.username) {
          this.authType = 1
        } else {
          this.authType = 0
        }
        if (n.type && n.type.toLowerCase() == 'snmp') {
          this.$refs.selectWalk.show()
          for (let i = 0; i < this.editEndpoint.walk.length; i++) {
            this.expandedWalkData.push(this.editEndpoint.configs.walk[i].substring(0, this.editEndpoint.configs.walk[i].lastIndexOf('.')))
          }
        }
        // if (n.id) {
        // } else {
        //   if (n.type && n.type.toLowerCase() == 'snmp') {
        //     this.$refs.selectWalk.show()
        //     for (let i = 0; i < this.editEndpoint.walk.length; i++) {
        //       this.expandedWalkData.push(this.editEndpoint.walk[i].substring(0, this.editEndpoint.walk[i].lastIndexOf('.')))
        //     }
        //   }
        // }
      }
    },
    editEndpoint: {
      deep: true,
      immediate: true,
      handler (n) {
        if (n && n.configs) {
          const params = Object.assign({}, n.configs)
          params.params = this.paramToJson(this.editEndpoint.paramObj)
          params.labels = this.labelsToJson(this.editEndpoint.labelModule)
          params.walk = n.walk
          params.port = n.port
          Object.keys(params).forEach(key => {
            if (!params[key]) {
              delete params[key]
            }
            if (Array.isArray(params[key]) && !params[key].length) {
              delete params[key]
            }
          })
          if (params.basic_auth && !params.basic_auth.username) {
            delete params.basic_auth
          }
          if (params.basic_auth && !params.basic_auth.password) {
            delete params.basic_auth
          }
          if (!Object.keys(params.param).length) {
            delete params.param
          }
          if (!Object.keys(params.labels).length) {
            delete params.labels
          }
          this.configsCopyValue = JSON.stringify(params, null, 2)
        }
      }
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
  .right-box-form-tip{
    color: #999999;
    line-height: 21px;
  }
  .half-form-item {
    width: calc(50% - 30px);
    display: inline-block;
    padding: 0 18px 0 8px;
  }
  .half-form-item:nth-child(even){
    padding-left: 0;
  }
  /deep/ .el-tabs__item{
    width: 90px;
    padding: 0;
    text-align: center;
  }
  /deep/ .el-tabs__item.is-active{
    color: #FA901C
  }
  /deep/ .el-tabs__active-bar{
    background-color: #FA901C
  }
  /deep/ .el-radio-group{
    width: 100%;
  }
  /deep/ .el-radio{
    width: 100%;
  }
  /deep/ .el-autocomplete{
    width: 100%;
  }
  /deep/ .el-tabs__content{
    padding-left: 18px;
  }
  .need-rotate.nz-icon-drop-down{
    display: inline-block;
    transition: transform .3s;
  }
  .need-rotate.nz-icon-drop-down.is-active{
    transform: rotate(
      -180deg
    );
  }
  .module-add-label{
    display: inline-block;
    width: 300px;
    height: 18px;
    background: #FFFCF9;
    border: 1px solid #FFE0BD;
    border-radius: 2px;
    text-align: center;
    line-height: 18px;
    margin-right: 80px;
  }
  .configs-copy-value{
    opacity: 0.9;
    background: #F6F8FA;
    border: 1px solid #E7EAED;
    border-radius: 2px;
    height: 140px;
    position: relative;
    margin-top: 10px;
    padding: 10px 0px 10px 15px;
    width: calc(100% - 40px);
    margin-left: 20px;
  }
  .configs-copy-value .copy-value-content{
    position: absolute;
    right: 20px;
    top: 14px;
    cursor: pointer;
  }
</style>
<style>
  .sub-label {
    padding-right: 15px;
    font-size: 14px;
    color: #666;
    text-align: left;
    line-height: 30px;
    padding-left: 15px;
    font-weight: bold;
  }
  .sub-label-required::after {
    content: '*';
    color: #F56C6C;
    margin-left: 4px;
  }
  .module-box-type {
    margin: 25px 0 10px -15px;
  }
  .walk-close-box {
    margin-left: 6px;
    width: 14px;
  }
  .walk-close {
    font-size: 12px;
  }
  .config-dropdown.hide-element{
    border: none!important;
  }
</style>
