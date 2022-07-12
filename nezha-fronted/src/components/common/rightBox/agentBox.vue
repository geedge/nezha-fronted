<template>
  <div v-clickoutside="{obj:editPromServer,func:clickOutside}" class="right-box right-box-prom">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editPromServer.id ? ($t("config.agent.editProm")) : $t("overall.createPrometheusServer")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editPromServer, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- end--标题-->
    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="agentForm" :model="editPromServer" :rules="rules" label-position = "top" label-width="120px">
          <!--          name-->
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editPromServer.name" size="small" id="agent-box-input-name"></el-input>
          </el-form-item>
          <!--DC-->
          <el-form-item :label="$t('overall.dc')" prop="dc.name">
            <div class="right-box-form-content">
              <el-select id="prom-box-input-dc" v-model="editPromServer.dc" placeholder="" class="right-box__select" popper-class="right-box-select-top right-public-box-dropdown-top prevent-clickoutside" size="small" value-key="id">
                <el-option v-for="item in dcData" :id="'prom-edit-dc-op-'+item.id" :key="item.id" :label="item.name" :value="item">
                  <span class="config-dropdown-label-txt">{{item.name}}</span>
                </el-option>
              </el-select>
            </div>
          </el-form-item>
          <!--host-->
          <el-form-item :label="$t('asset.host')" prop="host">
            <el-input id="prom-box-input-host" maxlength="64" show-word-limit v-model="editPromServer.host" placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--Port-->
          <el-form-item :label="$t('asset.port')" prop="port">
            <el-input id="prom-box-input-port" maxlength="10" show-word-limit v-model.number="editPromServer.port" placeholder="" size="small" type="text"></el-input>
          </el-form-item>
          <!--type-->
          <el-form-item :label="$t('overall.type')" prop="type">
  <!--          <el-cascader-->
  <!--            id="prom-box-input-type"-->
  <!--            style="width: 100%"-->
  <!--            v-model="editPromServer.type"-->
  <!--            placeholder=""-->
  <!--            size="small"-->
  <!--            :options="$CONSTANTS.agent.theData"-->
  <!--            :props="{ multiple: false, checkStrictly: false ,emitPath:false}"-->
  <!--            clearable></el-cascader>-->
            <el-select  v-model="editPromServer.type" :disabled="editPromServer.id != null&& editPromServer.id != ''" placeholder="" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="value">
<!--              <el-option-group-->
<!--                v-for="group in agent2.theData"-->
<!--                :key="group.label"-->
<!--                :label="group.label">-->
<!--                -->
<!--              </el-option-group>-->
              <el-option v-for="item in agent2.theData" :key="item.value" :label="item.label" :value="item.value" :disabled="federationEnabled && item.value == 2">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('asset.talon.token')" prop="token">
            <el-input maxlength="64" show-word-limit id="prom-box-input-token" v-model="editPromServer.token" class="right-box-row-with-btn" placeholder="" size="small" type="text">
<!--              <i slot="suffix" class="nz-icon nz-icon-refresh" @click="refreshToken"></i>-->
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('webshell.protocol')" prop="protocol">
            <el-select  v-model="editPromServer.protocol" placeholder="" class="right-box__select" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="value">
              <el-option v-for="item in agent2.protocol" :key="item.value" :label="item.label" :value="item.value">
                <span class="panel-dropdown-label-txt" >{{item.label}}</span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>

    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box__footer">
      <button id="prom-esc" v-cancel="{obj:editPromServer,func:esc}"
              class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="prom-save" :class="{'nz-btn-disabled':prevent_opt.save}"
              :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
import { host, noSpecialChar, port } from '../../common/js/validate'
import { agent2 } from '@/components/common/js/constants'
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'agentBox',
  props: {
    agent: Object
  },
  mixins: [editRigthBox],
  data () {
    return {
      agent2: agent2,
      agentPrometheusEnabled: localStorage.getItem('nz-prometheus-federation-enabled'),
      rules: {
        'dc.name': [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'blur' }
        ],
        host: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: host, trigger: 'blur' }
        ],
        port: [
          { validator: port, trigger: 'blur' },
          { required: true, message: this.$t('validate.required') }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      editPromServer: {},
      dcData: [], // data center数据
      federationEnabled: !Number(localStorage.getItem('nz-prometheus-federation-enabled'))
    }
  },
  methods: {
    refreshToken: function () {
      if (!this.editPromServer.token || this.editPromServer.token == '') {
        this.$message.error('The token is empty')
        return
      }
      this.$post('agent/token/refresh', this.editPromServer).then(response => {
        if (response.code == 200) {
          this.editPromServer.token = response.data.token
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },
    /* 保存 */
    save () {
      this.$refs.agentForm.validate(valid => {
        if (valid) {
          this.prevent_opt.save = true
          if (this.editPromServer.id) {
            this.$put('agent', this.editPromServer).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('agent', this.editPromServer).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          }
        } else {
          return false
        }
      })
    },
    /* 删除 */
    del () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('agent?ids=' + this.editPromServer.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    // 获取dc下拉列表数据
    getDcData () {
      this.$get('dc', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.dcData = response.data.list
        }
      })
    }
  },
  watch: {
    // 将prop里的user转为组件内部对象
    agent: {
      immediate: true,
      deep: true,
      handler (n) {
        this.isEdit = true
        const editPromServer = JSON.parse(JSON.stringify(n))
        if (!editPromServer.name) {
          editPromServer.name = ''
        }
        this.editPromServer = editPromServer
      }
    },
    'editPromServer.dc': function (n, o) {
      this.editPromServer.dcId = n.id
    }
  },
  mounted () {
    this.getDcData()
  }
}
</script>
