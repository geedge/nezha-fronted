<template>
  <div class="right-box right-box-prom" v-clickoutside="clickOutside">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns">
      <button type="button" v-if="editPromServer.id" @click="del"
              class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light"
              id="promServer-edit-del">
        <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editPromServer.id ? ($t("config.promServer.editProm") + "  ID：" + editPromServer.id) : $t("config.promServer.createProm")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form" :model="editPromServer" label-position="top" :rules="rules" ref="promServerForm">
        <!--DC-->
        <el-form-item :label="$t('config.dc.dc')" prop="idc.name">
          <div class="right-box-form-content">
            <el-select value-key="id" popper-class="config-dropdown" v-model="editPromServer.idc" placeholder="" size="small">
              <el-option v-for="item in dcData" :key="item.id" :label="item.name" :value="item" :id="'prom-edit-idc-op-'+item.id">
                <span class="config-dropdown-label-txt">{{item.name}}</span>
              </el-option>
            </el-select>
          </div>
        </el-form-item>

        <!--host-->
        <el-form-item label="Host" prop="host">
          <el-input type="text" placeholder="" v-model="editPromServer.host" size="small"></el-input>
        </el-form-item>
        <!--Port-->
        <el-form-item label="Port" prop="port">
          <el-input type="text" placeholder="" v-model.number="editPromServer.port" size="small"></el-input>
        </el-form-item>
        <!--type-->
        <el-form-item :label="$t('config.promServer.type')" prop="type">
          <el-select popper-class="config-dropdown" v-model="editPromServer.type" placeholder="" size="small">
            <el-option v-for="item in $CONSTANTS.promServer.typeData" :key="item.value" :label="item.label" :value="item.value" :id="'prom-edit-type-op-'+item.value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc" id="prom-esc"
              class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="prom-save"
              class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
  import {host} from '../../common/js/validate';
  import {port} from '../../common/js/validate';

  export default {
    name: "promServerBox",
    props: {
      promServer: Object
    },
    data() {
      return {
        rules: {
          'idc.name': [
            {required: true, message: this.$t('validate.required'), trigger: 'change'}
          ],
          host: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'},
            {validator: host, trigger: 'blur'}
          ],
          port: [
            {validator: port, trigger: 'blur'},
            {required: true, message: this.$t('validate.required')}
          ],
          type: [
            {required: true, message: this.$t('validate.required'), trigger: 'change'},
          ]
        },
        editPromServer: {},
        dcData: [], //data center数据
      }
    },
    methods: {
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },
      clickOutside() {
        this.esc(false);
      },
      /*保存*/
      save() {
        this.$refs.promServerForm.validate(valid => {
          if (valid) {
            if (this.editPromServer.id) {
              this.$put('promServer', this.editPromServer).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('promServer', this.editPromServer).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            return false;
          }
        })
      },
      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("promServer?ids=" + this.editPromServer.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      //获取dc下拉列表数据
      getDcData() {
        this.$get('idc').then(response => {
          if (response.code === 200) {
            this.dcData = response.data.list;
          }
        })
      },
    },
    watch: {
      //将prop里的user转为组件内部对象
      promServer: {
        immediate: true,
        deep: true,
        handler(n) {
          this.editPromServer = JSON.parse(JSON.stringify(n));
        }
      },
      'editPromServer.idc': function (n, o) {
        this.editPromServer.idcId = n.id;
      },
    },
    mounted() {
      this.getDcData();
    }
  }
</script>
