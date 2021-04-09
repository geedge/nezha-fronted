<template>
  <div class="right-box right-box-prom" v-clickoutside="{obj:editPromServer,func:clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" type="button" v-has="'prom_delete'" v-if="editPromServer.id"
              class="nz-btn nz-btn-size-normal nz-btn-size-alien"
              id="promServer-edit-del">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editPromServer.id ? ($t("config.promServer.editProm") + "  ID：" + editPromServer.id) : $t("config.promServer.createProm")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" :model="editPromServer" label-position = "top" label-width="120px" :rules="rules" ref="promServerForm">
        <!--DC-->
        <el-form-item :label="$t('config.dc.dc')" prop="idc.name">
          <div class="right-box-form-content">
            <el-select value-key="id" popper-class="config-dropdown" v-model="editPromServer.idc" placeholder="" size="small" id="prom-box-input-idc">
              <el-option v-for="item in dcData" :key="item.id" :label="item.name" :value="item" :id="'prom-edit-idc-op-'+item.id">
                <span class="config-dropdown-label-txt">{{item.name}}</span>
              </el-option>
            </el-select>
          </div>
        </el-form-item>

        <!--host-->
        <el-form-item label="Host" prop="host">
          <el-input type="text" placeholder="" v-model="editPromServer.host" size="small" id="prom-box-input-host"></el-input>
        </el-form-item>
        <!--Port-->
        <el-form-item label="Port" prop="port">
          <el-input type="text" placeholder="" v-model.number="editPromServer.port" size="small" id="prom-box-input-port"></el-input>
        </el-form-item>
        <!--type-->
        <el-form-item :label="$t('config.promServer.type')" prop="type">
<!--          <el-cascader-->
<!--            id="prom-box-input-type"-->
<!--            style="width: 100%"-->
<!--            v-model="editPromServer.type"-->
<!--            placeholder=""-->
<!--            size="small"-->
<!--            :options="$CONSTANTS.promServer.theData"-->
<!--            :props="{ multiple: false, checkStrictly: false ,emitPath:false}"-->
<!--            clearable></el-cascader>-->
          <el-select  placeholder="" v-model="editPromServer.type" :disabled="editPromServer.id != null&& editPromServer.id != ''" popper-class="config-dropdown" value-key="value" size="small">
            <el-option :key="item.value" :label="item.label" :value="item.value" v-for="item in $CONSTANTS.promServer2.theData">
              <span class="panel-dropdown-label-txt" >{{item.label}}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Token" prop="token">
          <el-input class="right-box-row-with-btn" type="text" placeholder="" v-model="editPromServer.token" size="small" id="prom-box-input-token">
            <i slot="suffix" class="nz-icon nz-icon-refresh" @click="refreshToken"></i>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button v-cancel="{obj:editPromServer,func:esc}" id="prom-esc"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="prom-save"
              class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
import { host, port } from '../../common/js/validate'

export default {
  name: 'promServerBox',
  props: {
    promServer: Object
  },
  data () {
    return {
      rules: {
        'idc.name': [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
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
      dcData: [] // data center数据
    }
  },
  methods: {
    refreshToken: function () {
      if(!this.editPromServer.token||this.editPromServer.token == ''){
        this.$message.error("The token is empty")
        return;
      }
      this.$post('agent/token/refresh' , this.editPromServer).then(response=>{
        if(response.code == 200){
          this.editPromServer.token = response.data.token;
        }else{
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
      this.$refs.promServerForm.validate(valid => {
        if (valid) {
          this.prevent_opt.save = true
          if (this.editPromServer.id) {
            this.$put('promServer', this.editPromServer).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('promServer', this.editPromServer).then(response => {
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
        this.$delete('promServer?ids=' + this.editPromServer.id).then(response => {
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
      this.$get('idc', { pageSize: -1 }).then(response => {
        if (response.code === 200) {
          this.dcData = response.data.list
        }
      })
    }
  },
  watch: {
    // 将prop里的user转为组件内部对象
    promServer: {
      immediate: true,
      deep: true,
      handler (n) {
        this.editPromServer = JSON.parse(JSON.stringify(n))
      }
    },
    'editPromServer.idc': function (n, o) {
      this.editPromServer.idcId = n.id
    }
  },
  mounted () {
    this.getDcData()
  }
}
</script>
