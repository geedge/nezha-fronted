<template>
  <div class="right-box right-box-alert-config" v-clickoutside="clickOutside" v-if="rightBox.show">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns">
      <button type="button" v-if="editAlertRule&&editAlertRule.id" id="alert-box-del" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light">
        <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editAlertRule.id ? $t("alert.config.editAlertConfig") + "  ID：" + editAlertRule.id : $t("alert.config.createAlertConfig")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <el-scrollbar class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" :model="editAlertRule" label-position="right" label-width="120px" :rules="rules" ref="alertRuleForm">
        <!--alertName-->
        <el-form-item :label='$t("alert.config.name")' prop="alertName">
          <el-input placeholder="" maxlength="64" show-word-limit v-model="editAlertRule.alertName" size="small"></el-input>
        </el-form-item>
        <promql-input
          ref="promql"
          :expression-list.sync="expressions"
          :index="0"
          :styleType="2"
          :plugins="['metric-input']"
        ></promql-input>
        <!--operator-->
        <el-form-item :label="$t('alert.config.operator')" prop="operator" style="width: 400px;display: inline-block;">
          <el-select popper-class="config-dropdown" v-model="editAlertRule.operator" placeholder=""  size="small">
            <el-option :id="'operator-'+item.key" v-for="item in operators" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <!--threshold-->
        <el-form-item :label="$t('alert.config.threshold')" prop="threshold" style="width: 415px;display: inline-block;">
          <el-input type="text" placeholder="" v-model.number="editAlertRule.threshold" size="small">
          </el-input>
        </el-form-item>
        <!--unit-->
        <el-form-item :label="$t('alert.config.unit')" prop="unit">
          <el-cascader filterable placeholder="" popper-class="no-style-class unit-popper-class" size="small" style="width: 100%"
                       :options="unitOptions"
                       :props="{ expandTrigger: 'click',emitPath:false }"
                       :show-all-levels="false"
                       v-model="editAlertRule.unit"
          >
          </el-cascader>
        </el-form-item>
        <!--last-->
        <el-form-item :label="$t('alert.config.for')" prop="last">
          <el-input type="text" placeholder="" v-model.number="editAlertRule.last" size="small">
            <template slot="append">{{$t('alert.config.second')}}</template>
          </el-input>
        </el-form-item>
        <!--severity-->
        <el-form-item :label="$t('alert.severity')" prop="severity">
          <el-select popper-class="config-dropdown" v-model="editAlertRule.severity" placeholder=""  size="small">
            <el-option :id="'alert-severity-'+item.key" v-for="item in severityData" :key="item.key" :label="item.value" :value="item.key">
              <template v-if="!item.isEdit">{{item.value}}</template>
              <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop>
                <el-input type="text" v-model="item.name" size="mini"></el-input>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <!--receiver-->
        <el-form-item :label="$t('config.account.receiver')" prop="receiver">
          <el-select
            v-model.trim="editAlertRule.receiverShow"
            placeholder=""
            multiple
            filterable
            size="small"
            value-key="userId"
            popper-class="no-style-class"
          >
            <el-option
              v-for="item in userData"
              :key="item.userId"
              :label="item.username"
              :value="item.userId">
            </el-option>
          </el-select>
        </el-form-item>
        <!--summary-->
        <el-form-item :label="$t('alert.summary')" prop="summary">
          <el-input maxlength="512" rows="3" type="textarea" show-word-limit placeholder="" v-model="editAlertRule.summary" size="small"></el-input>
        </el-form-item>
        <!--description-->
        <el-form-item :label="$t('alert.description')" prop="description">
          <el-input maxlength="512" rows="4" show-word-limit type="textarea" placeholder="" v-model="editAlertRule.description" size="small"></el-input>
        </el-form-item>
      </el-form>
    </el-scrollbar>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button @click="esc(false)" id="alert-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" id="alert-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
  import chartDataFormat from "../../charts/chartDataFormat";
  import promqlInput from "../../page/dashboard/explore/promqlInput";
  export default {
    name: "alertConfigBox",
    props: {
      alertRule: Object
    },
    components: {
      'promql-input': promqlInput,
    },
    data() {
      return {
        rightBox:{
          show:false
        },
        promqlCount: 1,
        promqlKeys: [0],
        expressions: [''],
        legends: [''],

        editAlertRule: {},
        rules:{
          alertName:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
          ],
          expr:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
          ],
          last:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'},
            {type:'number',message:this.$t('validate.number')}
          ],
          severity:[
            {required:true,message:this.$t('validate.required'),trigger:'change'},
          ],
          summary:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'},
          ],
          operator:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'},
          ],
          unit:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'},
          ],
          threshold:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'},
            {type:'number',message:this.$t('validate.number')}
          ],
        },
        severityData: [
          {
            key: 'medium',
            value: this.$t("alert.config.medium")
          },
          {
            key: 'high',
            value: this.$t("alert.config.high")
          },
          {
            key: 'low',
            value: this.$t("alert.config.low")
          }
        ],
        operators:[
          {
            label:'==',
            value:'=='
          },
          {
            label:'!=',
            value:'!='
          },
          {
            label:'>',
            value:'>'
          },
          {
            label:'<',
            value:'<'
          },
          {
            label:'>=',
            value:'>='
          },
          {
            label:'<=',
            value:'<='
          },
        ],
        unitOptions: chartDataFormat.unitOptions(),
        typeData: [
          {
            key: 1, //project
            value: this.$t('alert.config.typeOption.project')
          },
          {
            key: 2, //module
            value: this.$t('alert.config.typeOption.module')
          },
          {
            key: 3, //asset
            value: this.$t('alert.config.typeOption.asset')
          }
        ],
        userData: [],
      }
    },
    methods: {
      show:function(){
        this.rightBox.show=true;
      },
      clickOutside() {
        this.esc(false);
        this.rightBox.show=false;
      },
      esc(refresh) {
        this.$emit("close", refresh);
        this.rightBox.show=false;
      },
      save() {
        this.editAlertRule.expr = this.expressions[0];
        this.$refs.alertRuleForm.validate((valid) => {
          if (valid) {
            this.editAlertRule.receiver = this.editAlertRule.receiverShow.join(",");
            if (this.editAlertRule.id) {
              this.$put('alert/rule', this.editAlertRule).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('alert/rule', this.editAlertRule).then(response => {
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
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("alert/rule?ids=" + this.editAlertRule.id).then(response => {
            if (response.code === 200) {
              this.$message({type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      getUserList() {
        this.$get('sys/user/list', {pageNo: 1, pageSize: -1}).then(response => {
          if (response.code == 200) {
            this.userData = response.data.list;
          }
        })
      },
    },
    mounted() {
      this.getUserList();
    },
    watch: {
      alertRule: {
        deep: true,
        handler(n, o) {
          console.info(n)
          this.editAlertRule = JSON.parse(JSON.stringify(n));
          if (this.editAlertRule&&this.editAlertRule.id) {
            this.expressions = [this.editAlertRule.expr];
            this.$nextTick(() => {
              this.expressions.forEach((ex, index) => {
                if (ex) {
                  this.$refs.promql.metricChange(ex);
                }
              });
            });
          }
        }
      }
    }
  }
</script>
<style>
  .unit-popper-class{
    z-index: 2052 !important;
  }
</style>
