<template>
  <div class="right-box right-box-alert-config" v-clickoutside="{obj:editAlertRule,func:clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="alert-box-del" type="button" v-has="'rule_delete'" v-if="alertRule.id">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editAlertRule.id ? $t("alert.config.editAlertConfig") + "  ID：" + editAlertRule.id : $t("alert.config.createAlertConfig")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" :model="editAlertRule" label-position="right" label-width="120px" :rules="rules" ref="alertRuleForm">
        <!--alertName-->
        <el-form-item :label='$t("alert.config.name")' prop="alertName">
          <el-input placeholder="" maxlength="64" show-word-limit v-model="editAlertRule.alertName" size="small" id="alert-box-input-name"></el-input>
        </el-form-item>
        <div style="width: calc(100% - 70px);margin-left: 70px">
          <promql-input
            ref="promql"
            :expression-list.sync="expressions"
            :index="0"
            :styleType="2"
            :plugins="['metric-input']"
            id="alert-box-input-promql"
          ></promql-input>
        </div>
        <!--operator-->
        <el-form-item :label="$t('alert.config.operator')" prop="operator" style="width: 400px;display: inline-block;">
          <el-select popper-class="config-dropdown" v-model="editAlertRule.operator" placeholder=""  size="small" id="alert-box-input-operator">
            <el-option :id="'operator-'+item.key" v-for="item in operators" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <!--threshold-->
        <el-form-item :label="$t('alert.config.threshold')" prop="threshold" style="width: 415px;display: inline-block;">
          <el-input type="text" placeholder="" v-model="editAlertRule.threshold" size="small" id="alert-box-input-threshold">
          </el-input>
        </el-form-item>
        <!--unit-->
        <el-form-item :label="$t('alert.config.unit')" prop="unit">
          <el-cascader filterable placeholder="" popper-class="no-style-class unit-popper-class" size="small" style="width: 100%" id="alert-box-input-unit"
                       :options="unitOptions"
                       :props="{ expandTrigger: 'click',emitPath:false }"
                       :show-all-levels="false"
                       v-model="editAlertRule.unit"
          >
          </el-cascader>
        </el-form-item>
        <!--last-->
        <el-form-item :label="$t('alert.config.for')" prop="last">
          <el-input type="text" placeholder="" v-model.number="editAlertRule.last" size="small" id="alert-box-input-last">
            <template slot="append">{{$t('alert.config.second')}}</template>
          </el-input>
        </el-form-item>
        <!--severity-->
        <el-form-item :label="$t('alert.severity')" prop="severity">
          <el-select popper-class="config-dropdown" v-model="editAlertRule.severity" placeholder=""  size="small" id="alert-box-input-severity">
            <el-option :id="'alert-severity-'+item.value" v-for="item in $CONSTANTS.alertMessage.severityData" :key="item.value" :label="item.label" :value="item.value">
              <template v-if="!item.isEdit">{{item.label}}</template>
              <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop>
                <el-input type="text" v-model="item.value" size="mini"></el-input>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <div class="rule-severity-remark">
          <i class="nz-icon nz-icon-info-normal"></i>
          <div>
            <p>{{$t('alert.P1Rule')}}</p>
            <p>{{$t('alert.P2Rule')}}</p>
            <p>{{$t('alert.P3Rule')}}</p>
          </div>
        </div>
        <!--receiver-->
        <el-form-item :label="$t('config.account.receiver')" prop="receiver">
          <el-select
            id="alert-box-input-receiver"
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
          <el-input maxlength="512" rows="3" type="textarea" show-word-limit placeholder="" v-model="editAlertRule.summary" size="small" id="alert-box-input-summary"></el-input>
        </el-form-item>
        <!--description-->
        <el-form-item :label="$t('alert.description')" prop="description">
          <el-input maxlength="512" rows="4" show-word-limit type="textarea" placeholder="" v-model="editAlertRule.description" size="small" id="alert-box-input-description"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button v-cancel="{obj:editAlertRule,func:esc}" id="alert-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="alert-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
  import chartDataFormat from "../../charts/chartDataFormat";
  import promqlInput from "../../page/dashboard/explore/promqlInput";
  import { nzNumber} from "../js/validate";
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
            {validator:nzNumber,trigger: 'blur'}
          ],
        },
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

        userData: [],
      }
    },
    methods: {
      clickOutside() {
        this.esc(false);
      },
      esc(refresh) {
        this.prevent_opt.save=false;
        this.$emit("close", refresh);
      },
      save() {
        if(this.prevent_opt.save){ return } ;
        this.prevent_opt.save=true;
        this.editAlertRule.expr = this.expressions[0];
        this.$refs.alertRuleForm.validate((valid) => {
          if (valid) {
            this.editAlertRule.receiver = this.editAlertRule.receiverShow.join(",");
            if (this.editAlertRule.id) {
              this.$put('alert/rule', this.editAlertRule).then(response => {
                this.prevent_opt.save=false;
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('alert/rule', this.editAlertRule).then(response => {
                this.prevent_opt.save=false;
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            this.prevent_opt.save=false;
            return false;
          }
        })
      },
      del() {
        if(this.prevent_opt.save){ return } ;
        this.prevent_opt.save=true;
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("alert/rule?ids=" + this.editAlertRule.id).then(response => {
            this.prevent_opt.save=false;
            if (response.code === 200) {
              this.$message({type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          })
        }).catch(()=>{
          this.prevent_opt.save=false;
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
        immediate: true,
        handler(n, o) {
          this.editAlertRule = JSON.parse(JSON.stringify(n));
          if (this.editAlertRule.id) {
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
<style scoped>
  .rule-severity-remark{
    display: inline-flex;
    justify-content: left;
    justify-items: center;
    align-items: center;
    width: calc(100% - 220px);
    padding: 10px 15px;
    background: #F6F6F6;
    color: #999999;
    margin-top: -13px;
    margin-bottom: 18px;
    margin-left: 190px;
    font-size: 14px;
  }
  .rule-severity-remark .nz-icon-info-normal{
    margin-right: 10px;
  }
</style>
