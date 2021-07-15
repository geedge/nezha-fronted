<template>
  <div class="right-box right-box-module" v-clickoutside="{obj:editModule,func:clickOutside}">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{editModule.id ? $t("project.module.editModule") : $t("project.module.createModule")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: editModule, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="moduleForm" :model="editModule" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label='$t("project.module.moduleName")' label-width="125px" prop="name">
            <el-input id="module-box-input-name" v-model="editModule.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
          </el-form-item>
          <!--project-->
          <el-form-item :label='$t("project.project.projectName")' prop="projectId">
            <el-select id="module-box-input-project" v-model="editModule.projectId" :disabled="!!editModule.id" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id">
              <el-option v-for="item in projectList" :id="'module-project-'+item.id" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <!--remark-->
          <el-form-item :label='$t("overall.remark")' prop="remark">
            <el-input
              id="module-box-input-remark"
              v-model="editModule.remark"
              :autosize="{ minRows: 1, maxRows: 6}"
              class="not-fixed-height no-resize"
              maxlength="256"
              show-word-limit
              placeholder=""
              size="small"
              type="textarea"></el-input>
          </el-form-item>

          <!--type-->
          <el-form-item :label='$t("project.endpoint.type")' prop="type">
            <el-select id="module-box-input-type" v-model="editModule.type" :disabled="!!editModule.id" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id" @change="changeAuthType">
              <el-option v-for="item in typetList" :id="'module-type-'+item.id" :key="item.value" :label="item.name" :value="item.value"></el-option>
            </el-select>
          </el-form-item>

          <!-- snmp表单 -->
          <span v-if="editModule.type && editModule.type == 'snmp'" class="snmp-form">
            <div class="right-box-sub-title">SNMP settings</div>
            <div class="right-box-line"></div>

            <el-row>
              <el-col :span="6">
                <div class="sub-label sub-label-required">{{$t('project.module.walk')}}</div>
              </el-col>
              <el-col :span="24">
                <el-form-item prop="walk">
                  <select-walk ref="selectWalk" :currentWalk="editModule.walk" :expandedWalk="expandedWalkData" :placement="'bottom-start'" :walkData="walkData" @selectWalk="selectWalk">
                    <template v-slot:trigger>
                      <div class="el-cascader">
                        <div class="el-input">
                          <input aria-expanded="false" autocomplete="off" class="el-input__inner" readonly="readonly" type="text">
                        </div>
                        <div class="el-cascader__tags">
                          <div ref="walkScrollbar" style="height: 100%; overflow: auto;">
                            <span v-for="(item, index) in editModule.walk" :key="index" class="el-tag el-tag--info el-tag--small el-tag--light">
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
            <el-select id="module-box-input-credentials" v-model="editModule.configs.snmpCredentialsId" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id">
              <el-option v-for="item in credentialList" :id="'module-type-'+item.id" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          </span>

          <!-- ChartTemplate  -->
          <el-form-item :label="$t('config.model.ChartTemplate')" prop="ChartTemplate">
            <v-selectpage
              v-model="editModule.chartIds"
              :data="chartlList"
              :language="language"
              :multiple="true"
              :params="{
                varType: 2, panelId: 0,
                returnChildren:0,groupId:0,
              }"
              :result-format="resultFormat"
              :tb-columns="ChartSearchShowFields"
              class="form-control"
              key-field="id"
              show-field="name"
              title="ChartSearch"
              @values="(data) => {editModule.chartIds = data.map(d => d.id).join(',')}"
            ></v-selectpage>
          </el-form-item>
          <!--Enpoint template-->
          <div class="right-box-sub-title">{{ $t("overall.endpointTemplate") }}
            <el-tooltip effect="light" placement="top">
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
              <el-form-item :label='$t("project.endpoint.path")' class="half-form-item" prop="configs.metrics_path">
                <el-input id="module-box-input-path" v-model="editModule.configs.metrics_path" placeholder="" size="small"></el-input>
              </el-form-item>
              <!--port-->
              <el-form-item :label='$t("project.endpoint.port")' class="half-form-item" prop="port">
                <el-input id="module-box-input-port" v-model.number="editModule.port" placeholder="" size="small"></el-input>
              </el-form-item>
              <!--host-->
              <el-form-item :label='$t("project.endpoint.host")' prop="host">
                <el-input id="module-box-input-host" v-model="editModule.configs.host" placeholder="" size="small"></el-input>
              </el-form-item>
              <transition name="el-zoom-in-top">
                <div v-show="showAllBasicOption" >
                  <!--name pattern-->
                  <el-form-item :label='$t("project.endpoint.pattern")' class="half-form-item" prop="pattern">
                    <!--              <el-input placeholder="" v-model=""></el-input>-->
                    <el-autocomplete
                      id="module-box-input-pattern"
                      v-model="editModule.endpointNameTmpl"
                      :fetch-suggestions="querySearch"
                      :placeholder="$t('overall.placeHolder')"
                      class="inline-input"
                      size="small"
                    ></el-autocomplete>
                  </el-form-item>
                  <!--scrape_interval-->
                  <el-form-item :label='$t("project.endpoint.scrape_interval")' class="half-form-item" prop="scrape_interval">
                    <el-input id="module-box-input-scrape_interval" v-model.number="editModule.configs.scrape_interval" :placeholder='$t("project.endpoint.scrape_interval_placeholder")' size="small">
                     <template slot="append">s</template>
                    </el-input>
                  </el-form-item>
                  <!--scrape_timeout-->
                  <el-form-item :label='$t("project.endpoint.scrape_timeout")' class="half-form-item" prop="scrape_timeout">
                    <el-input id="module-box-input-scrape_timeout" v-model.number="editModule.configs.scrape_timeout" :placeholder='$t("project.endpoint.scrape_timeout_placeholder")' size="small">
                      <template slot="append">s</template>
                    </el-input>
                  </el-form-item>
                </div>
              </transition>

              <div style="text-align: center">
                <span class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" style="border: none" @click="showAllBasicOption=!showAllBasicOption">
                  {{$t('overall.moreOption')}}
                  <i :class="showAllBasicOption?'is-active':''" class="nz-icon nz-icon-arrow-down need-rotate" ></i>
                </span>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Parameter" name="Parameter">
              <div id="module-box-params" ref="labelBoxScrollbar" style="height: 100%; overflow: auto;">
                <div v-for="(item, index) in editModule.paramObj" :key="index" class="param-box-row">
                  <el-form-item :prop="'paramObj.' + index + '.key'" class="param-box-row-key">
                    <el-input v-model="item.key" placeholder="key" size="mini" ></el-input>
                  </el-form-item>
                  <span class="param-box-row-eq">=</span>
                  <el-form-item :prop="'paramObj.' + index + '.value'" class="param-box-row-value">
                    <vue-tags-input
                      v-model="item.tags"
                      :maxlength="32"
                      :placeholder="'add parameter'"
                      :tags="item.value"
                      @tags-changed="(newTags)=>{tagsChange(newTags, index)}"
                    />
                  </el-form-item>
                  <span :id="'moduel-remove-param-'+index" class="param-box-row-symbol" @click="removeParam(index)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
                </div>
              </div>
              <div style="text-align: center">
                 <span id="module-add-param" class="right-box-form-add module-add-label" type="button" @click="addParam">
                <span><i class="nz-icon nz-icon-create-square" style="font-size: 16px;"></i></span>
              </span>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Labels" name="Labels">
              <div id="module-box-labels" ref="labelBoxScrollbar" style="height: 100%; overflow: auto;">
                <div v-for="(item, index) in editModule.labelModule" :key="index" class="param-box-row">
                  <el-form-item :prop="'labelModule.' + index + '.key'" :rules="[{ pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('validate.key') ,trigger: 'blur'}]" class="param-box-row-key">
                    <el-input v-model="item.key" placeholder="key" size="mini"></el-input>
                  </el-form-item>
                  <span class="param-box-row-eq">=</span>
                  <el-form-item :prop="'labelModule.' + index + '.value'" class="param-box-row-value">
                    <el-input v-model="item.value" placeholder="value" size="mini"></el-input>
                  </el-form-item>
                  <span :id="'moduel-remove-label-'+index" class="param-box-row-symbol" @click="removeLabel(index)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
                </div>
              </div>
              <div style="text-align: center">
                 <span id="module-add-label" class="right-box-form-add module-add-label" type="button" @click="addLabel">
                <span><i class="nz-icon nz-icon-create-square" style="font-size: 16px;"></i></span>
              </span>
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="editModule.type !== 'snmp'" label="Auth" name="Auth">
              <!--authtype-->
              <el-form-item :label='$t("project.endpoint.type")' prop="authtype">
                <el-select id="module-box-input-auth-type" v-model="authType" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id" @change="changeAuthType">
                  <el-option v-for="item in authTypeList" :id="'module-type-'+item.id" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>

              <!--authtype 1-->
              <el-form-item v-if="authType === 1" :label='$t("project.endpoint.username")' class="half-form-item" prop="authtype">
                <el-input id="module-box-input-uername" v-model.number="editModule.configs.basic_auth.username" placeholder='' size="small"></el-input>
              </el-form-item>

              <el-form-item v-if="authType === 1" :label='$t("project.endpoint.pin")' class="half-form-item" prop="authtype">
                <el-input id="module-box-input-password" v-model.number="editModule.configs.basic_auth.password" placeholder='' size="small"></el-input>
              </el-form-item>

              <!--authtype 2-->
              <el-form-item v-if="authType === 2" :label='$t("project.endpoint.bearer_token")' prop="authtype">
                <el-input id="module-box-input-bearer_token" v-model.number="editModule.configs.bearer_token" placeholder='' size="small"></el-input>
              </el-form-item>

            </el-tab-pane>
          </el-tabs>
          <div class="configs-copy-value">
            <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue"></i></span>
            <pre style="overflow-y: auto;height:100%">{{configsCopyValue}}</pre>
          </div>
        </el-form>
      </div>
    </div>

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editModule,func:esc}" id="module-box-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" v-has="'monitor_module_add'" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="module-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { noSpecialChar, port, nzNumber } from '../js/validate'
import selectWalk from '../popBox/selectWalk'
import editRigthBox from '../mixin/editRigthBox'
import VueTagsInput from '@johmun/vue-tags-input'

export default {
  name: 'moduleBox',
  props: {
    module: Object,
    currentProject: Object
  },
  components: {
    'select-walk': selectWalk,
    VueTagsInput
  },
  mixins: [editRigthBox],
  data () {
    return {
      walkData: [],
      chartlList: [],
      activeName: 'Basic',
      expandedWalkData: [],
      radio: 'password',
      editModule: {},
      restaurants: [
        { value: '{{module.name}}-{{asset.name}}' },
        { value: '{{module.name}}-{{asset.manageIp}}' }
      ],
      ChartSearchShowFields: [ // ChartSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        { title: this.$t('config.model.titleName'), data: 'name' },
        { title: this.$t('config.model.titleType'), data: 'type' },
        { title: this.$t('overall.remark'), data: 'remark' }
      ],
      language: localStorage.getItem('nz-language'),
      showAllBasicOption: false,
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'change' }
        ],
        projectId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        walk: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        port: [
          { validator: port, trigger: 'blur' },
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pin: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        priv_pin: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        max_repetitions: [
          { validator: nzNumber, trigger: 'blur' }
        ],
        retries: [
          { validator: nzNumber, trigger: 'blur' }
        ],
        timeout: [
          { validator: nzNumber, trigger: 'blur' }
        ]
      },
      projectList: [],
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
      if (this.editModule.walk.indexOf(walk) != -1) {
        this.editModule.walk.splice(this.editModule.walk.indexOf(walk), 1)
      } else {
        this.editModule.walk.push(walk)
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
      this.editModule.walk.splice(this.editModule.walk.indexOf(walk), 1)
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
      if (this.editModule.id) {
        return
      }
      this.editModule.type = type
      if (type !== 'http') {
        this.$refs.selectWalk.show()
      }
    },
    /* 保存 */
    save () {
      setTimeout(() => {
        this.editModule.configs.params = this.paramToJson(this.editModule.paramObj)
        this.editModule.configs.labels = this.labelsToJson(this.editModule.labelModule)
        const params = { ...this.editModule }
        params.configs.walk = params.walk
        params.configs.port = params.port
        params.configs = JSON.stringify(params.configs)
        if (this.authType === 2 && !this.editModule.configs.bearer_token) {
          this.$message.error("'token' is required")
        } else if (this.authType === 1 && !(this.editModule.configs.basic_auth.username && this.editModule.configs.basic_auth.pin)) {
          this.$message.error("'username' and 'password' is required")
        } else {
          this.authType = 0
        }
        this.$refs.moduleForm.validate((valid) => {
          if (valid) {
            this.prevent_opt.save = true
            if (this.editModule.id) {
              this.$put('monitor/module', params).then(response => {
                if (response.code === 200) {
                  this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                  this.$store.commit('setReloadFacade')
                  this.esc(true)
                } else {
                  this.$message.error(response.msg)
                }
                this.prevent_opt.save = false
              })
            } else {
              this.$post('monitor/module', params).then(response => {
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
          } else {
            this.prevent_opt.save = false
            return false
          }
        })
      }, 10)
    },
    /* 删除 */
    del () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('monitor/module?ids=' + this.editModule.id).then(response => {
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
      this.editModule.paramObj = []
    },

    // 新增param
    addParam () {
      this.editModule.paramObj.push({ key: '', value: [], showList: false })
    },
    // 移除单个param
    removeParam (index) {
      if (this.editModule.paramObj.length === 1) {
        this.editModule.paramObj = [{ key: '', value: [] }]
      }
      this.editModule.paramObj.splice(index, 1)
    },
    // 新增label
    addLabel () {
      this.editModule.labelModule.push({ key: '', value: '' })
    },
    // 移除单个Label
    removeLabel (index) {
      if (this.editModule.labelModule.length === 1) {
        this.editModule.labelModule = [{ key: '', value: '' }]
      }
      this.editModule.labelModule.splice(index, 1)
    },
    tagsChange (newTags, index) {
      this.editModule.paramObj[index].value = newTags.map(item => item.text)
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
      this.editModule.configs.bearer_token = ''
      this.editModule.configs.basic_auth = {
        username: '',
        pin: ''
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
    },
    paramObjchange (val, index) {
      this.editModule.paramObj[index].value = val.filter(item => item.trim())
    },
    resultFormat (resp) {
      if (resp && resp.data) {
        const assetData = {}
        assetData.list = resp.data.list
        assetData.totalRow = resp.data.total
        return assetData
      }
    },
    /* 获取chart列表数据 */
    ChartTemplateList () {
      this.$get('visual/panel/chart', { pageSize: -1, varType: 2, panelId: 0, returnChildren: 0, groupId: 0 }).then(res => {
        this.chartlList = res.data.list
      })
    }
  },
  mounted () {
    this.getWalkData()
    this.ChartTemplateList()
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
        this.isEdit = true
        this.editModule = JSON.parse(JSON.stringify(n))
        this.activeName = 'Basic'

        if (this.editModule.configs.bearer_token) {
          this.authType = 2
        } else if (this.editModule.configs.basic_auth.username) {
          this.authType = 1
        } else {
          this.authType = 0
        }
        if (n.type && n.type.toLowerCase() == 'snmp') {
          this.$refs.selectWalk.show()
          for (let i = 0; i < this.editModule.walk.length; i++) {
            this.expandedWalkData.push(this.editModule.configs.walk[i].substring(0, this.editModule.configs.walk[i].lastIndexOf('.')))
          }
        }
        // if (n.id) {
        // } else {
        //   if (n.type && n.type.toLowerCase() == 'snmp') {
        //     this.$refs.selectWalk.show()
        //     for (let i = 0; i < this.editModule.walk.length; i++) {
        //       this.expandedWalkData.push(this.editModule.walk[i].substring(0, this.editModule.walk[i].lastIndexOf('.')))
        //     }
        //   }
        // }
      }
    },
    editModule: {
      deep: true,
      immediate: true,
      handler (n) {
        if (n && n.configs) {
          const params = Object.assign({}, n.configs)
          params.params = this.paramToJson(this.editModule.paramObj)
          params.labels = this.labelsToJson(this.editModule.labelModule)
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
          if (params.basic_auth && !params.basic_auth.pin) {
            delete params.basic_auth
          }
          if (params.param && !Object.keys(params.param).length) {
            delete params.param
          }
          if (params.labels && !Object.keys(params.labels).length) {
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
    width: calc(50% - 21px);
    display: inline-block;
    padding: 0 0px 0 0px;
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
  .need-rotate.nz-icon-arrow-down{
    display: inline-block;
    transition: transform .3s;
  }
  .need-rotate.nz-icon-arrow-down.is-active{
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
  /deep/ .ti-input{
    min-height: 30px;
    overflow-x: hidden;
    border-radius: 2px;
    padding: 0 !important;
  }
  /deep/ .ti-tag{
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
    padding: 2px 4px!important;;
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
