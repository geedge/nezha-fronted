<template>
  <div class="right-box right-box-traffic-setting " v-clickoutside="{obj:traffic,func:clickOutside}" >

    <!-- begin--标题-->
    <div class="right-box-title">{{$t('config.dc.traffic.title')}}</div>
    <!-- end--标题-->
    <div class="right-box-form-box">
      <el-form :model="traffic" class="right-box-form" label-position="top" label-width="100px" ref="trafficForm">
        <el-form-item :label="$t('config.dc.dc')" size="small">
          <el-input :disabled="true" v-model.trim="dc.name" id="traffic-setting-name"></el-input>
        </el-form-item>
        <traffic-setting-tab ref="trafficSetting" :post-asset-list="assetList" v-for="(item,index) in traffic.setting" :index="index" :asset-setting="item" :key="uuids[index]" :id="uuids[index]" @delSelf="delAssetSetting" :validate-repeat-func="valiateRepeatFunc"></traffic-setting-tab>
        <button @click="addAssetSetting" class="nz-btn nz-btn-size-normal nz-btn-style-light" id="traffic-setting-add" style="margin:15px 1px 15px 15px" type="button">{{$t('buttons.add')}}</button>
      </el-form>
    </div>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button id="traffic-setting-esc" v-cancel="{obj:traffic,func:esc}" class="nz-btn nz-btn-size-normal nz-btn-style-light" type="button">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="traffic-setting-save" v-has="'dc_trafficSetting_save'" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import trafficSettingTab from './trafficSettingTab'
import editRigthBox from '../../mixin/editRigthBox'
import { getUUID } from '../../js/common'

export default {
  name: 'trafficSettingBox',
  components: {
    'traffic-setting-tab': trafficSettingTab
  },
  props: {
    dc: {
      type: Object,
      required: true
    }
  },
  mixins: [editRigthBox],
  mounted () {
    this.queryTrafficSettings()
  },
  data () {
    return {
      assetList: [],
      uuids: [],
      traffic: {
        idcId: '',
        setting: [
          {
            host: '',
            port: 161,
            community: 'public',
            version: 2,
            auth: {
              username: '',
              securityLevel: '',
              authProtocol: '',
              privProtocol: '',
              privPin: ''
            },
            configs: [
              {
                direction: [],
                ifindex: null,
                ifdescr: ' ',
                tags: {},
                edit: true
              }
            ]
          }
        ]
      }
    }
  },
  methods: {
    addAssetSetting: function () {
      const valid = this.validateTabs()
      if (valid) {
        this.uuids.push(getUUID())
        this.traffic.setting.push({
          host: '',
          port: 161,
          community: 'public',
          version: 2,
          auth: {
            username: '',
            securityLevel: '',
            authProtocol: '',
            privProtocol: '',
            privPin: ''
          },
          configs: [
            {
              direction: [],
              ifindex: null,
              ifdescr: ' ',
              tags: {},
              edit: true
            }
          ]
        })
      }
    },
    getEmptyTraffic: function () {
      const obj = {
        host: '',
        port: 161,
        community: 'public',
        version: 2,
        auth: {
          username: '',
          securityLevel: '',
          authProtocol: '',
          privProtocol: '',
          privPin: ''
        },
        configs: [
          {
            direction: [],
            ifindex: null,
            ifdescr: ' ',
            tags: {},
            edit: true
          }
        ]
      }
      return Object.assign({}, obj)
    },
    validateTabs: function () {
      let valid = true
      for (let i = 0; i < this.$refs.trafficSetting.length; i++) {
        const component = this.$refs.trafficSetting[i]
        valid = component.validateRows()
        if (!valid) {
          break
        }
      }
      return valid
    },
    valiateRepeatFunc: function (host, index) {
      if (host != '') {
        const temp = this.traffic.setting.find((item, i) => {
          return i != index && item.host == host
        })
        return typeof temp === 'undefined'
      } else {
        return true
      }
    },
    delAssetSetting: function (index) {
      this.uuids.splice(index, 1)
      this.traffic.setting.splice(index, 1)
    },

    clickOutside () {
      this.esc(false)
    },

    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },
    /* 保存 */
    save () {
      const valid = this.validateTabs()
      if (valid) {
        // 拆解数据
        const result = {
          idcId: this.dc.id,
          setting: []
        }
        this.traffic.setting.forEach(assetSetting => {
          assetSetting.configs.forEach(config => {
            const settingItem = {
              host: assetSetting.host,
              port: assetSetting.port,
              community: assetSetting.community,
              version: assetSetting.version,
              auth: assetSetting.auth,
              direction: config.direction.toString(),
              ifindex: config.ifindex,
              ifdescr: config.ifdescr,
              tags: config.tags
            }
            result.setting.push(settingItem)
          })
        })

        this.$put('/idc/trafficSetting', result).then(response => {
          if (response.code == 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.esc(false)
          } else {
            this.$message.error(response.msg)
          }
        })
      } else {
        console.log('error submit!!')
        return false
      }
    },
    queryTrafficSettings: function () {
      this.$get('/idc/trafficSetting?id=' + this.dc.id).then(response => {
        if (response.code == 200) {
          const list = response.data.list
          if (list.length > 0) {
            const map = new Map()
            list.forEach(item => {
              const arr = map.get(item.host)
              if (arr) {
                arr.push(item)
                map.set(item.host, arr)
              } else {
                map.set(item.host, [item])
              }
            })
            this.traffic = {
              idcId: this.dc.id,
              setting: []
            }
            const keys = map.keys()
            for (const key of keys) { // settings 为同一asset下的设置集合
              const configs = map.get(key)
              const settingItem = {
                host: configs[0].host,
                port: configs[0].port,
                community: configs[0].community,
                version: configs[0].version,
                auth: configs[0].auth,
                configs: []
              }
              if (settingItem.version == 2) {
                settingItem.auth = {
                  username: '',
                  securityLevel: '',
                  authProtocol: '',
                  privProtocol: '',
                  privPin: ''
                }
              }
              configs.forEach(item => {
                const config = {
                  direction: item.direction && item.direction != '' ? item.direction.split(',') : [],
                  ifindex: item.ifindex + '',
                  ifdescr: item.ifdescr,
                  tags: item.tags && item.tags != '' ? item.tags : {},
                  edit: false
                }
                settingItem.configs.push(config)
              })
              this.traffic.setting.push(settingItem)
            }
          } else {
            this.traffic = {
              idcId: '',
              setting: [
                {
                  host: '',
                  port: 161,
                  community: 'public',
                  version: 2,
                  auth: {
                    username: '',
                    securityLevel: '',
                    authProtocol: '',
                    privProtocol: '',
                    privPin: ''
                  },
                  configs: [
                    {
                      direction: [],
                      ifindex: '',
                      ifdescr: ' ',
                      tags: {},
                      edit: true
                    }
                  ]
                }
              ]
            }
          }
          for (let i = 0; i < this.traffic.setting.length; i++) {
            this.uuids.push(getUUID())
          }
        } else {
          console.error(response.msg)
          this.$message.error(response.msg)
        }
      })
    },
    queryAssetList () {
      const queryParams = {
        pageSize: -1,
        idcId: this.dc.id
      }
      this.assetList = []
      this.$get('/asset', queryParams).then(response => {
        if (response.code == 200) {
          const temp = response.data.list
          this.assetList = temp.map((item, index) => {
            item.isOccupy = false
            return item
          })
        } else {
          this.$message.error(response.msg)
        }
      })
    }
  },
  watch: {
    dc: {
      immediate: true,
      deep: true,
      handler (n) {
        this.isEdit = true
        this.queryAssetList()
      }
    }
  }
}
</script>
