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
          <el-form class="right-box-form" :model="alertRule" label-position="top" :rules="rules" ref="alertRuleForm">
            <!--alertName-->
            <el-form-item :label='$t("alert.config.name")' prop="alertName">
              <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model="alertRule.alertName" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.alertName}}</div>
            </el-form-item>
            <!--type-->
           <!-- <el-form-item :label="$t('alert.list.type')" prop="type">
              <el-select v-if="rightBox.isEdit" @change="(val) => {changeType(val);}" popper-class="config-dropdown" v-model="alertRule.type" placeholder="" size="small" >
                <el-option :id="'alert-type-'+item.value" v-for="item in typeData" :key="item.key" :label="item.value" :value="item.key"></el-option>
              </el-select>
              <div v-for="item in typeData" v-if="!rightBox.isEdit && item.key == alertRule.type" class="right-box-form-content-txt">{{item.value}}</div>
            </el-form-item>-->
            <!--linkedId-->
            <!--<el-form-item :label="$t('alert.config.link')" prop="linkId">
              <el-select v-if="rightBox.isEdit" v-model="alertRule.linkId" placeholder="" size="small" popper-class="config-dropdown">
                <el-option :id="'alert-linke-'+item.id" v-for="item in linkObjList" :key="item.id" :label="alertRule.type == 3 ? item.host : item.name" :value="item.id"></el-option>
              </el-select>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.linkObject ? alertRule.linkObject.name : ''}}</div>
            </el-form-item>-->
            <!--expr-->
            <el-form-item :label="$t('alert.config.expr')" prop="expr">
              <el-input maxlength="512" rows="4" show-word-limit v-if="rightBox.isEdit" type="textarea" placeholder="" v-model="alertRule.expr" size="small"></el-input>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.expr}}</div>
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
            <!--receiver-->
            <!--<el-form-item :label="$t('config.account.receiver')" prop="receiver">
              <el-select class="right-box-row-with-btn" value-key="id" popper-class="config-dropdown" v-model="alertRule.receiver" placeholder="" v-if="rightBox.isEdit" size="small">
                <el-option @click.native="blurEditReceiver()" v-for="item in receiverData" :key="item.id" :label="item.name" :value="item">
                  <span class="config-dropdown-label-txt" v-if="!item.isEdit">{{item.name}}</span>
                  <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop>
                    <el-input type="text" v-model="item.name" size="mini"></el-input>
                  </span>
                  <span class="config-dropdown-error-message">{{item.errorMessage}}</span>
                  <span class="config-dropdown-btn" @click.stop="toEditReceiver(item)">
                    <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                    <i class="el-icon-check" v-if="item.isEdit"></i>
                  </span>
                  <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="toDelReceiver(item)"><i class="el-icon-delete"></i></span>
                </el-option>
              </el-select>
              <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{alertRule.receiver}}</div>
            </el-form-item>-->
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
  export default {
    name: "alertConfigBox",
    props: {
      parentAlertRule: Object
    },
    data() {
      return {
        alertRule: {id: ''},
        rightBox: {show: false, isEdit: false, title: ''},
        rules:{
          alertName:[
            {required:true,message:this.$t('validate.required'),trigger:'blur'}
          ],
          type:[
            {required:true,message:this.$t('validate.required'),trigger:'change'}
          ],
          linkId:[
            {required:true,message:this.$t('validate.required'),trigger:"change"}
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
        receiverData: [{
          id: '1',
          name: 'group1',
          description: '小组1desc'
        }, {
          id: '2',
          name: 'group2',
          description: '小组2desc'
        }, {
          id: '3',
          name: '小组3',
          description: '小组3desc'
        }, {
          id: '4',
          name: '小组4',
          description: '小组4desc'
        }, {
          id: '5',
          name: '小组啊小组5',
          description: '小组5desc'
        }, {
          id: '6',
          name: '小组6',
          description: '小组6desc'
        }],
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
      changeType(type) {
        this.alertRule.linkId = '';
        if (type == 1) {
          this.getProjectList();
        } else if (type == 2) {
          this.getModuleList();
        } else if (type == 3) {
          this.getAssetList();
        }
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
      toEditReceiver: function(item) {
        if (!item.isEdit) {
          //如果不在编辑状态，那么其他项如果有改动，则还原改动，最后开始编辑
          this.blurEditReceiver();
          item.isEdit = true;
        } else {
          //如果已在编辑状态，判断name是否有变更，有变更则发请求
          if (item.name != item.oldName) {
            if (this.updateReceiverName(item) == 200) {
              item.isEdit = false;
            }
          } else {
            item.errorMessage = '';
            item.isEdit = false;
          }
        }
      },
      blurEditReceiver: function() {
        for (let i = 0; i < this.receiverData.length; i++) {
          if (this.receiverData[i].isEdit) {
            this.receiverData[i].name = this.receiverData[i].oldName;
            this.receiverData[i].isEdit = false;
            this.receiverData[i].errorMessage = '';
            break;
          }
        }
      },
      toDelReceiver: function(item) {
        this.blurEditReceiver();
        //TODO 请求后台，删除组
      },
      initReceiverData: function() {
        for (let i = 0; i < this.receiverData.length; i++) {
          this.$set(this.receiverData[i], 'oldName', this.receiverData[i].name);
          this.$set(this.receiverData[i], 'isEdit', false);
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
      this.initReceiverData();
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
