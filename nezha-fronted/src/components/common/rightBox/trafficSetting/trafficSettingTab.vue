<template>
    <div class="asset-config-tab">
      <div class="asset-item">
        <span class="asset-item--label">{{$t("asset.asset")}}</span>
        <div class="asset-item--input">
          <el-autocomplete
             :class="{'input-error':hostInvalid || hostRepeat}"
             :debounce="1000"
             :fetch-suggestions="queryAssetHosts"
             :highlight-first-item="true"
             :trigger-on-focus="false"
             @blur="validateHostEmpty"
             @input="hostInputChange"
             class="asset-input right-box-row-with-btn"
             clearable
             id="traffic-setting-asset"
             popper-class="no-style-class"
             size="small"
             v-model="assetSetting.host"
           ></el-autocomplete>
          <el-popover @hide="popHide" @show="popShow" placement="bottom" popper-class="no-style-class" trigger="hover">
          <div class="mib-browser-ad-search">
            <el-row class="mib-browser-ad-search-item" style="font-weight: bold">{{$t('config.dc.traffic.snmpSetting')}}</el-row>
            <el-row class="mib-browser-ad-search-item">
              <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t("asset.port")}}</div></el-col>
              <el-col :span="17">
                <el-input class="input-x-mini-24" v-model.number="assetSetting.port" id="traffic-setting-port"></el-input>
              </el-col>
            </el-row>
            <el-row class="mib-browser-ad-search-item">
              <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t('project.module.community')}}</div></el-col>
              <el-col :span="17">
                <el-input class="input-x-mini-24" v-model="assetSetting.community" id="traffic-setting-community"></el-input>
              </el-col>
            </el-row>
            <el-row class="mib-browser-ad-search-item">
              <el-col :span="6"><div class="mib-browser-ad-search-label">{{$t('overall.version')}}</div></el-col>
              <el-col :span="17">
                <el-radio-group v-model.number="assetSetting.version" id="traffic-setting-version">
                  <el-radio-button :label="2"></el-radio-button>
                  <el-radio-button :label="3"></el-radio-button>
                </el-radio-group>
              </el-col>
            </el-row>
            <!--SNMP V3 setting-->
            <template v-if="assetSetting.version == 3">
              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('login.username')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model="assetSetting.auth.username" id="traffic-setting-username"></el-input>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('project.module.securityLevel')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-radio-group v-model="assetSetting.auth.securityLevel" size="small" id="traffic-setting-securityLevel">
                    <el-radio-button label="noAuthNoPriv"></el-radio-button>
                    <el-radio-button label="authNoPriv"></el-radio-button>
                    <el-radio-button label="authPriv"></el-radio-button>
                  </el-radio-group>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item" v-if="assetSetting.auth.securityLevel == 'authNoPriv' || assetSetting.auth.securityLevel == 'authPriv'">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('login.pin')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model="assetSetting.auth.pin" id="traffic-setting-password"></el-input>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item same-label-width" v-if="assetSetting.auth.securityLevel == 'authNoPriv' || assetSetting.auth.securityLevel == 'authPriv'">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('asset.authProtocol')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-radio-group v-model="assetSetting.auth.authProtocol" id="traffic-setting-authProtocol">
                    <el-radio-button label="MD5"></el-radio-button>
                    <el-radio-button label="SHA"></el-radio-button>
                  </el-radio-group>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item same-label-width" v-if="assetSetting.auth.securityLevel == 'authPriv'">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('project.module.privProtocol')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-radio-group v-model="assetSetting.auth.privProtocol" id="traffic-setting-privProtocol">
                    <el-radio-button label="DES"></el-radio-button>
                    <el-radio-button label="AES"></el-radio-button>
                  </el-radio-group>
                </el-col>
              </el-row>

              <el-row class="mib-browser-ad-search-item" v-if="assetSetting.auth.securityLevel == 'authPriv'">
                <el-col :span="6">
                  <div class="mib-browser-ad-search-label">{{$t('project.module.privPin')}}</div>
                </el-col>
                <el-col :span="17">
                  <el-input class="input-x-mini-24" v-model="assetSetting.auth.privPin" id="traffic-setting-privPassword"></el-input>
                </el-col>
              </el-row>
            </template>
          </div>
          <button type="button" slot="reference"  class="nz-btn nz-btn-size-normal nz-btn-style-light" id="snmp-advanced"  :title="$t('overall.more')">
            <i class="el-icon-more"></i>
          </button>
        </el-popover>
        </div>
        <span @click="delSelf" class="asset-item--btn right-box-form-minus-box" id="traffic-setting-delself" :title="$t('overall.delete')"><i class="nz-icon nz-icon-minus"></i></span>
      </div>
      <div>
        <span style="color:#F56C6C;font-size: 12px;" v-if="hostRepeat">{{$t('validate.repeat')}}</span>
        <span style="color:#F56C6C;font-size: 12px;" v-if="hostInvalid">{{$t('validate.host')}}</span>
        <span style="color:#F56C6C;font-size: 12px;" v-if="hostEmpty">{{$t('validate.required')}}</span>
      </div>
      <div class="endpoints-box-endpoints">
        <el-table :data="assetSetting.configs"
                  tooltip-effect="light"
                  max-height="300"
                  height="200"
                  :row-class-name="assetSetting.host == null?'not-allowed':''"
                  @row-dblclick="changeRowEditState"
                  @row-click="validateRows"
                  class="taffic-setting-tab"
                  v-if="refreshTab"
                  :id="'traffic-setting-option-table-'+index"
                  style="width: 100%;">
          <el-table-column
            label-class-name="traffic-set-table-title"
            :resizable="false"
            show-overflow-tooltip
            v-for="(item, index) in tableLabels"
            :width="item.width"
            :key="`col-${index}-${item.prop}`"
            style="max-height: 200px"
            >
            <template slot="header">
              <span v-if="item.required == true"><span style="color: red;">*</span><span style="padding-left: 6px;">{{item.label}}</span></span>
              <span v-else>{{item.label}}</span>
            </template>
            <template slot-scope="scope" :column="item">
              <template v-if="item.prop == 'tags'">
                <div class="tab-tags" @click="showEditTagsBox(true,scope.$index,scope.row,$event)" id="traffic-setting-show-tags">
                  <el-tooltip placement="top" effect="light" popper-class="tags-pop transparent-pop">
                    <div slot="content">
                      <template v-if="scope.row[item.prop]">
                        <div v-for="(value, key, index) in scope.row[item.prop]" :key="index" class="tab-tags-item">
                          <div class="tag-item-key">{{key}}</div>
                          <div class="tag-item-value">{{value}}</div>
                        </div>
                      </template>
                    </div>
                    <div class="tab-tags-item" v-if="scope.row[item.prop]&&Object.keys(scope.row[item.prop]).length>0">
                      <div class="tag-item-key">{{Object.keys(scope.row[item.prop])[0]}}</div>
                      <div class="tag-item-value">{{scope.row[item.prop][Object.keys(scope.row[item.prop])[0]]}}</div>
                      <div class="tag-item-text" v-if="Object.keys(scope.row[item.prop]).length>1">+{{Object.keys(scope.row[item.prop]).length-1}}</div>
                    </div>
                  </el-tooltip>
                </div>
              </template>
              <template v-if="item.prop == 'ifindex'">
                <span v-if="scope.row.edit==false">{{scope.row[item.prop]}}</span>
                <template v-else>
                  <el-autocomplete
                    v-model="scope.row[item.prop]"
                    :class="{'input-error':isError(item.errRows,scope.$index)||ifIndexError,'transparent-pop':assetSetting.host == ''}"
                    :fetch-suggestions="loadIfIndex"
                    :debounce="300"
                    :trigger-on-focus="true"
                    popper-class="no-style-class"
                    size="mini"
                    :highlight-first-item="true"
                    @input="ifIndexInputChange(scope.row[item.prop],scope.row,scope.$index)"
                  ></el-autocomplete>
                </template>
              </template>
              <template v-if="item.prop == 'ifdescr'">
                <span>{{scope.row[item.prop]}}</span>
              </template>
              <template v-if="item.prop == 'direction'">
                <template v-if="scope.row.edit==false">
                  <span v-if="scope.row[item.prop][0]">{{scope.row[item.prop][0]}}</span>
                  <span v-if="scope.row[item.prop][1]">{{scope.row[item.prop][1]}}</span>
                </template>
                <template v-else>
                  <el-checkbox-group :disabled="assetSetting.host == null" v-model="scope.row[item.prop]" class="direction-checkbox" :class="{'input-error':isError(item.errRows,scope.$index),'transparent-pop':assetSetting.host == null}">
                    <div class="input__inner">
                      <el-checkbox label="rx">&nbsp;RX</el-checkbox>
                      <el-checkbox label="tx" >&nbsp;TX</el-checkbox>
                    </div>
                  </el-checkbox-group>
                </template>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="" :width="40" :show-overflow-tooltip="false">
            <template slot-scope="scope">
              <span :disabled="assetSetting.host == null" @click.stop="delTabRow(scope.$index,scope.row)" class="right-box-form-delete" size="mini" :title="$t('overall.delete')"><i class="nz-icon nz-icon-minus"></i></span>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-btn" style="margin-top: 10px;">
          <span @click="addTabRow" size="mini" class="right-box-form-add" :title="$t('tip.add')">
            <i class="nz-icon nz-icon-plus"></i>
          </span>
        </div>
      </div>
      <sub-box ref="subBox" @after="refreshTabFunc"></sub-box>
      <loading ref="loading"></loading>
    </div>
</template>

<script>
import subBox from './subBox'
import loading from '../../loading'
export default {
  name: 'trafficSettingTab',
  components: {
    'sub-box': subBox,
    loading: loading
  },
  props: {
    index: {},
    postAssetList: { type: Array, required: true },
    assetSetting: { type: Object },
    validateRepeatFunc: { type: Function }
  },
  data () {
    return {
      assetList: [],
      assetValidate: false,
      hostRepeat: false,
      hostInvalid: false,
      hostEmpty: false,
      refreshTab: true,
      tableLabels: [
        {
          label: 'ifIndex',
          prop: 'ifindex',
          width: 100,
          required: true,
          errRows: []
        },
        {
          label: 'ifDescr',
          prop: 'ifdescr',
          width: 150,
          required: false,
          errRows: []
        },
        {
          label: this.$t('config.dc.traffic.direction'),
          prop: 'direction',
          width: 200,
          required: true,
          errRows: []
        },
        {
          label: this.$t('overall.tag'),
          prop: 'tags',
          required: false,
          errRows: []
        }
      ],
      ifIndexList: [],
      ifDescMap: new Map(),
      editTagsBox: { show: false, top: 0, left: 0 }, // param编辑弹框
      tempTagsObj: [],
      showTags: [],
      showTagInput: false,
      newTag: { key: '', value: '' },
      hostTimer: null,
      ifIndexError: false
    }
  },
  created () {
    this.assetList = Object.assign([], this.postAssetList)
    this.showTags = Object.assign([], this.assetSetting.tags)
  },
  methods: {
    clearAssetInput () {
      this.resetComponet()
    },
    refreshTabFunc () {
      this.refreshTab = false
      this.$nextTick(() => {
        this.refreshTab = true
      })
    },
    resetComponet () {
      this.ifIndexList = []
      this.assetSetting.assetId = null
      this.assetSetting.configs = []
      this.assetSetting.configs.push({
        direction: [],
        ifindex: null,
        ifdescr: ' ',
        tags: {},
        edit: true
      })
      this.tableLabels = this.tableLabels.map(item => {
        item.errRows = []
        return item
      })
    },
    ifIndexChange (ifIndex, row) {
      this.$set(row, 'ifdescr', this.ifDescMap.get('ifDescr.' + ifIndex))
    },
    assetChanged () {
      if (!this.assetSetting || this.assetSetting.assetId == null) {
        return
      }
      this.assetValidate = false
      this.assetSetting.configs = [
        {
          direction: [],
          ifindex: null,
          ifdescr: ' ',
          tags: {},
          edit: true
        }
      ]
      this.queryInterfaceInfos(this.assetSetting.assetId, true)
    },
    queryInterfaceInfos (skipCommit = false) {
      // this.$refs.loading.startLoading();
      const queryParams = {
        operation: 'walk',
        host: this.assetSetting.host,
        port: this.assetSetting.port,
        version: this.assetSetting.version,
        community: this.assetSetting.community,
        oid: '1.3.6.1.2.1.2.2.1',
        auth: this.assetSetting.auth
      }
      this.$post('/mib/browser', queryParams).then(response => {
        this.ifIndexList = []
        this.ifDescMap.clear()
        if (response.code == 200) {
          const resultList = response.data.list
          const ifIndexList = resultList.filter(item => {
            return /if(?:Index)\.\d+/.test(item.name)
          })

          this.ifIndexList = ifIndexList.map(item => {
            return { label: item.value, value: item.value, isOccupy: false }
          })

          const ifDescrList = resultList.filter(item => {
            return /if(?:Descr)\.\d+/.test(item.name)
          })
          this.ifDescrList = ifDescrList.filter(item => {
            return this.ifDescMap.set(item.name, item.value)
          })
          this.commitAdd(skipCommit)
          // this.$refs.loading.endLoading();
        } else {
          // this.$refs.loading.endLoading();
          console.error(response)
          // this.$message.error(response.msg)
        }
      })
    },
    loadIfIndex (queryString, cb) {
      let result = Object.assign([], this.ifIndexList)
      result = result.filter(item => {
        const temp = this.assetSetting.configs.find(c => {
          return c.ifindex == item.value
        })
        return typeof temp === 'undefined'
      })
      cb(result)
    },
    queryAssetHosts (queryString, cb) {
      const param = {
        pageSize: -1,
        host: queryString
      }
      this.$get('/asset', param).then(response => {
        if (response.code == 200) {
          const data = response.data.list
          const result = data.map(item => {
            return { label: item.host, value: item.host }
          })
          cb(result)
        } else {
          cb()
          console.error(response)
        }
      })
    },
    popShow () {

    },
    popHide () {
      this.queryInterfaceInfos(true)
    },
    showInput () {
      this.showTagInput = true
    },
    handleInputConfirm () {

    },
    ifIndexInputChange (ifindex, row, index) {
      if (this.ifIndexList && this.ifIndexList.length > 0) {
        // let temp=this.ifIndexList.find(item=>{
        //   return item.value == ifindex;
        // })
        // if(!temp){
        //   this.ifIndexError=true;
        //   return ;
        // }else{
        //   this.ifIndexError=false;
        // }
        this.ifIndexChange(ifindex, row)
        const tmp = this.assetSetting.configs.find((item, i) => {
          return i != index && item.ifindex == ifindex
        })
        if (tmp) {
          this.ifIndexError = true
        } else {
          this.ifIndexError = false
        }
      } else {
        this.ifIndexError = false
      }
    },
    hostInputChange (value) {
      if (this.hostTimer) {
        clearTimeout(this.hostTimer)
      }
      this.hostTimer = setTimeout(() => {
        this.validateHostRepeat(value)
        this.validateHostValid(value)
        if (!this.hostEmpty && !this.hostRepeat && !this.hostInvalid) {
          this.queryInterfaceInfos(true)
        }
      }, 500)
    },
    validateHostEmpty () {
      this.hostEmpty = !this.assetSetting.host || this.assetSetting.host == ''
    },
    validateHostValid (host) {
      if (host == '') {
        return false
      }
      const hostReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\:\d{0,5})?$/
      if (hostReg.test(host)) {
        this.hostInvalid = false
      } else {
        this.hostInvalid = true
      }
    },
    validateHostRepeat (host) {
      if (!this.validateRepeatFunc(host, this.index)) {
        this.hostRepeat = true
      } else {
        this.hostRepeat = false
      }
    },
    changeRowEditState (row, column, event) {
      if (this.validateRows()) {
        this.commitAdd(false)
        if (row.edit == true) {
          this.$set(row, 'edit', false)
        } else {
          this.$set(row, 'edit', true)
        }
      }
    },
    validateRows () {
      let validateFlag = true
      validateFlag = this.assetSetting && this.assetSetting.host != ''
      if (!validateFlag) {
        this.assetValidate = true
        return validateFlag
      }
      this.assetValidate = false
      this.tableLabels.forEach(item => {
        item.errRows = []
      })
      this.assetSetting.configs.forEach((config, index) => {
        this.tableLabels.forEach(label => {
          const value = config[label.prop]
          const required = label.required
          if (required && (!value || (typeof value === 'string' && value == '') || (value instanceof Array && value.length < 1))) {
            validateFlag = false
            label.errRows.push(index) // 保存有错误的行的index，通过行列唯一定位有错误的输入框
          } else {
            if (label.prop == 'ifindex') {
              if (this.ifIndexList && this.ifIndexList.length > 0) {
                const temp = this.ifIndexList.find(item => {
                  return item.value == value
                })
                if (!temp) {
                  validateFlag = false
                  label.errRows.push(index) // 保存有错误的行的index，通过行列唯一定位有错误的输入框
                }
              }
            }
          }
        })
      })
      if (this.ifIndexError) {
        validateFlag = false
      }
      return validateFlag
    },
    isError (columnErrRows, rowIndex) {
      return columnErrRows.includes(rowIndex)
    },
    commitAdd (skipChangeEditState = false) {
      this.resetIfIndexOccupyState()
      this.assetSetting.configs = this.assetSetting.configs.map((config) => {
        if (!skipChangeEditState) {
          this.$set(config, 'edit', false)
        }
        this.changeIfIndexOccupyState(config.ifindex, true)
        return config
      })
    },
    addTabRow () {
      const validateFlag = this.validateRows()
      if (validateFlag) {
        this.commitAdd()
        this.assetSetting.configs.push({
          direction: [],
          ifindex: null,
          ifdescr: ' ',
          tags: {},
          edit: true
        })
      }
    },
    delTabRow (index, row) {
      if (this.assetSetting.configs.length > 1) {
        this.assetSetting.configs.splice(index, 1)
        if (row.edit == true && this.ifIndexError == true) {
          this.ifIndexError = false
        }
        this.changeIfIndexOccupyState(row.ifindex, false)
      }
    },
    resetIfIndexOccupyState () {
      this.ifIndexList = this.ifIndexList.map(item => {
        item.isOccupy = false
        return item
      })
    },
    changeIfIndexOccupyState (ifindex, state) {
      this.ifIndexList = this.ifIndexList.map(item => {
        if (item.value == ifindex) {
          item.isOccupy = state
        }
        return item
      })
    },
    delSelf () {
      this.$emit('delSelf', this.index)
    },
    showEditTagsBox (show, index, row, e) {
      if (this.assetSetting.host != '' && row.edit == true) {
        this.$refs.subBox.showEditTagsBox(show, this.assetSetting.configs, index, e)
      }
    }
  },
  mounted () {
    if (this.assetSetting && this.assetSetting.host && this.assetSetting.host != '') {
      this.queryInterfaceInfos(true)
    }
  }
}
</script>
