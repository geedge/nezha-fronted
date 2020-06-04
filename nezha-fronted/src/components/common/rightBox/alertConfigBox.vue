<template>
  <transition name="right-box">
    <div class="right-box right-box-alert-config" v-if="rightBox.show" v-clickoutside="clickos">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button type="button" v-if="alertRule.id != '' && rightBox.isEdit" id="alert-box-del" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button v-if="!rightBox.isEdit && alertRule.buildIn != 1" type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82" id="alert-box-edit">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.edit')}}</span>
        </button>
      </div>

      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form right-box-form-left" :model="alertRule" label-position="right" label-width="120px" :rules="rules" ref="alertRuleForm">
          <!--alertName-->
          <el-form-item :label='$t("alert.config.name")' prop="alertName">
            <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model="alertRule.alertName" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.alertName}}</div>
          </el-form-item>
          <!--expr-->
          <el-form-item :label="$t('alert.config.expr')" prop="expr">
            <el-input maxlength="512" rows="4" show-word-limit v-if="rightBox.isEdit" type="textarea" placeholder="" v-model="alertRule.expr" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.expr}}</div>
          </el-form-item>
          <!--operator-->
          <el-form-item :label="$t('alert.config.operator')" prop="operator">
            <el-select v-if="rightBox.isEdit" popper-class="config-dropdown" v-model="alertRule.operator" placeholder=""  size="small">
              <el-option :id="'operator-'+item.key" v-for="item in operators" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.operator}}</div>
          </el-form-item>
          <!--threshold-->
          <el-form-item :label="$t('alert.config.threshold')" prop="threshold">
            <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model.number="alertRule.threshold" size="small">
            </el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.operator}}s</div>
          </el-form-item>
          <!--unit-->
          <el-form-item :label="$t('alert.config.unit')" prop="unit">
            <el-cascader filterable placeholder="" popper-class="no-style-class unit-popper-class" size="small" style="width: 100%"
                         :options="unitOptions"
                         :props="{ expandTrigger: 'click',emitPath:false }"
                         :show-all-levels="false"
                         v-model="alertRule.unit"
            >
            </el-cascader>
          </el-form-item>
          <!--last-->
          <el-form-item :label="$t('alert.config.for')" prop="last">
            <el-input v-if="rightBox.isEdit" type="text" placeholder="" v-model.number="alertRule.last" size="small">
              <template slot="append">second</template>
            </el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.last}}s</div>
          </el-form-item>
          <!--severity-->
          <el-form-item :label="$t('alert.severity')" prop="severity">
            <el-select v-if="rightBox.isEdit" popper-class="config-dropdown" v-model="alertRule.severity" placeholder=""  size="small">
              <el-option :id="'alert-severity-'+item.key" v-for="item in severityData" :key="item.key" :label="item.value" :value="item.key">
                <template v-if="!item.isEdit">{{item.value}}</template>
                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop>
                  <el-input type="text" v-model="item.name" size="mini"></el-input>
                </span>
              </el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.severity}}</div>
          </el-form-item>
          <!--receiver-->
          <el-form-item :label="$t('config.account.receiver')" prop="receiver">
            <el-select
              v-model.trim="alertRule.receiverShow"
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
            <el-input maxlength="512" rows="3" type="textarea" show-word-limit v-if="rightBox.isEdit" placeholder="" v-model="alertRule.summary" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.summary}}</div>
          </el-form-item>
          <!--description-->
          <el-form-item :label="$t('alert.description')" prop="description">
            <el-input maxlength="512" rows="4" show-word-limit v-if="rightBox.isEdit" type="textarea" placeholder="" v-model="alertRule.description" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.description}}</div>
          </el-form-item>
        </el-form>
      </el-scrollbar>
      <!-- end--表单-->

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="alert-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button v-if="rightBox.isEdit" @click="saveOrToEdit" id="alert-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
  import chartDataFormat from "../../charts/chartDataFormat";

  export default {
    name: "alertConfigBox",
    props: {
      parentAlertRule: Object
    },
    data() {
      return {
        alertRule: {id: '', receiverShow: [], receiver: ''},
        rightBox: {show: false, isEdit: false, title: ''},
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

          // description:[
          //   {required:true,message:this.$t('validate.required'),trigger:'blur'},
          // ],
          // receiver:[
          //   {required:true,message:this.$t('validate.required'),trigger:'change'},
          // ]
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
        unitOptions:chartDataFormat.unitOptions(),
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
        linkObjList: []
      }
    },
    methods: {
      clickos() {
        this.rightBox.show = false;
      },
      show(show, isEdit) {
        this.rightBox.show = show;
        this.rightBox.isEdit = isEdit;
      },
      save: function() {
        this.$refs.alertRuleForm.validate((valid) => {
          if (valid) {
            this.alertRule.receiver = this.alertRule.receiverShow.join(",");
            if (this.alertRule.id) {
              this.$put('alert/rule', this.alertRule).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$emit('reload');
                  this.rightBox.show = false;
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('alert/rule', this.alertRule).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.$emit('reload');
                  this.rightBox.show = false;
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
      del: function() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("alert/rule?ids=" + this.alertRule.id).then(response => {
            if (response.code === 200) {
              this.$message({type: 'success', message: this.$t("tip.deleteSuccess")});
              this.$emit('reload');
              this.rightBox.show = false;
            } else {
              this.$message.error(response.msg);
            }
          })
        });
      },
      saveOrToEdit: function() {
        if (!this.rightBox.isEdit) {
          this.rightBox.isEdit = true;
          this.rightBox.title = this.$t("alert.config.editAlertConfig") + "  ID：" + this.alertRule.id;
        } else {
          this.save();
        }
      },
      esc: function() {
        this.rightBox.show = false;
      },

      getProjectList() {
        this.$get('project', {pageNo: 1, pageSize: -1}).then(response => {
          if (response.code == 200) {
            this.linkObjList = response.data.list;
          }
        })
      },
      getUserList() {
        this.$get('sys/user/list', {pageNo: 1, pageSize: -1}).then(response => {
          if (response.code == 200) {
            this.userData = response.data.list;
          }
        })
      },
      getModuleList() {
        this.$get('module', {pageNo: 1, pageSize: -1}).then(response => {
          if (response.code == 200) {
            this.linkObjList = response.data.list;
          }
        })
      },

      getAssetList() {
        this.$get('asset', {pageNo: 1, pageSize: -1}).then(response => {
          if (response.code == 200) {
            this.linkObjList = response.data.list;
          }
        })
      },
    },
    created() {
      this.getUserList();
      this.rightBox.title = this.$t("alert.config.createAlertConfig");
    },
    watch: {
      parentAlertRule: {
        deep: true,
        handler(n, o) {
          this.alertRule = n;
          if (this.alertRule.id) {
            if (this.alertRule.type == 1) {
              this.getProjectList();
            } else if (this.alertRule.type == 2) {
              this.getModuleList();
            } else if (this.alertRule.type == 3) {
              this.getAssetList();
            }
          }
          if (this.rightBox.show) {
            if (this.rightBox.isEdit && this.alertRule.id) {
              this.rightBox.title = this.$t("alert.config.editAlertConfig") + "  ID：" + this.alertRule.id;
            } else if (this.rightBox.isEdit && !this.alertRule.id) {
              this.rightBox.title = this.$t("alert.config.createAlertConfig");
            } else if (!this.rightBox.isEdit && this.alertRule.id) {
              this.rightBox.title = this.$t("alert.config.alertConfig") + "  ID：" + this.alertRule.id;
            }
          }
        }
      }
    }
  }
</script>

<style scoped>

</style>
<style>
  .unit-popper-class{
    z-index: 2052 !important;
  }
</style>
