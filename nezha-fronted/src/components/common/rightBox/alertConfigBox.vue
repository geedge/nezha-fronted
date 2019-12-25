<template>
  <transition name="right-box">
    <div class="right-box right-box-alert-config" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <div class="right-box-top-btn right-box-top-btn-full" @click="esc">
          <div class="right-box-btn-icon">
            <i class="el-icon-close"></i>
          </div>
          <span>{{$t('overall.esc')}}</span>
        </div>
        <div class="right-box-top-btn right-box-top-btn-full" @click="saveOrToEdit">
          <div class="right-box-btn-icon">
            <i class="el-icon-edit-outline"></i>
          </div>
          <span v-if="rightBox.isEdit">{{$t('overall.save')}}</span>
          <span v-else>{{$t('overall.edit')}}</span>
        </div>
        <div @click="del" class="right-box-top-btn" v-if="rightBox.isEdit && alertRule.id != ''">
          <div class="right-box-btn-icon">
            <i class="el-icon-delete"></i>
          </div>
          <span>{{$t('overall.delete')}}</span>
        </div>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box-form">
        <!--name-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('alert.config.name')}}</div>
          <div class="right-box-form-content">
            <el-input
              v-if="rightBox.isEdit"
              type="text"
              placeholder=""
              v-model="alertRule.alertName"
              maxlength="64"
              show-word-limit
              size="small"
            ></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.alertName}}</div>
          </div>
        </div>
        <!--type-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('alert.list.type')}}</div>
          <div class="right-box-form-content">
            <el-select @change="(val) => {changeType(val);}" popper-class="config-dropdown" v-model="alertRule.type" placeholder="" v-if="rightBox.isEdit" size="small" >
              <el-option
                v-for="item in typeData"
                :key="item.key"
                :label="item.value"
                :value="item.key">
              </el-option>
            </el-select>
            <div v-for="item in typeData" v-if="!rightBox.isEdit && item.key == alertRule.type" class="right-box-form-content-txt">{{item.value}}</div>
          </div>
        </div>
        <!--linkedId-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('alert.config.link')}}</div>
          <div class="right-box-form-content">
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.linkObject ? alertRule.linkObject.name : ''}}</div>
            <el-select v-model="alertRule.linkId" placeholder="" v-if="rightBox.isEdit" size="small">
                <el-option
                  v-for="item in linkObjList"
                  :key="item.id"
                  :label="alertRule.type == 3 ? item.host : item.name"
                  :value="item.id">
                </el-option>
              </el-select>
          </div>
        </div>
        <!--expr-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('alert.config.expr')}}</div>
          <div class="right-box-form-content">
            <el-input
              type="textarea"
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="alertRule.expr"
              size="small"
            ></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.expr}}</div>
          </div>
        </div>
        <!--for-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('alert.config.for')}}</div>
          <div class="right-box-form-content">
            <el-input
              type="text"
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="alertRule.last"
              size="small"
            >
              <template slot="append">second</template>
            </el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.last}}s</div>
          </div>
        </div>
        <!--severity-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('alert.severity')}}</div>
          <div class="right-box-form-content">
            <el-select popper-class="config-dropdown" v-model="alertRule.severity" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option
                v-for="item in severityData"
                :key="item.key"
                :label="item.value"
                :value="item.key">
                <span class="config-dropdown-label-txt" v-if="!item.isEdit">{{item.value}}</span>
                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop>
                                        <el-input
                                          type="text"
                                          v-model="item.name"
                                          size="mini"
                                        ></el-input>
                                     </span>
              </el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.severity}}</div>
          </div>
        </div>
        <!--summary-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('alert.summary')}}</div>
          <div class="right-box-form-content">
            <el-input
              type="text"
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="alertRule.summary"
              size="small"
            ></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.summary}}</div>
          </div>
        </div>
        <!--description-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('alert.description')}}</div>
          <div class="right-box-form-content">
            <el-input
              type="textarea"
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="alertRule.description"
              size="small"
            ></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{alertRule.description}}</div>
          </div>
        </div>
        <!--receiver-->
        <!--<div class="right-box-form-row">
          <div class="right-box-form-label">{{$t('config.account.receiver')}}</div>
          <div class="right-box-form-content">
            <el-select class="right-box-row-with-btn" value-key="id" popper-class="config-dropdown" v-model="alertRule.receiver" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option
                @click.native="blurEditReceiver()"
                v-for="item in receiverData"
                :key="item.id"
                :label="item.name"
                :value="item">
                <span class="config-dropdown-label-txt" v-if="!item.isEdit">{{item.name}}</span>
                <span class="config-dropdown-label-input" v-if="item.isEdit" @click.stop>
                                        <el-input
                                          type="text"
                                          v-model="item.name"
                                          size="mini"
                                        ></el-input>
                                    </span>
                <span class="config-dropdown-error-message">{{item.errorMessage}}</span>
                <span class="config-dropdown-btn" @click.stop="toEditReceiver(item)">
                                        <i class="el-icon-edit-outline" v-if="!item.isEdit"></i>
                                        <i class="el-icon-check" v-if="item.isEdit"></i>
                                    </span>
                <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="toDelReceiver(item)"><i class="el-icon-delete"></i></span>
              </el-option>
            </el-select>
            <div class="right-box-row-btn" v-if="rightBox.isEdit">
              <span class="el-icon-plus"></span>
            </div>
            <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{alertRule.receiver}}</div>
          </div>
        </div>-->
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box-bottom-btns">
        <div @click="esc()" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save" v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{alertRule.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
      </div>
      <!-- end--底部按钮-->

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
      show(show, isEdit) {
        this.rightBox.show = show;
        this.rightBox.isEdit = isEdit;
      },
      save: function() {
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
      del: function(u) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("alert/rule?ids=" + u.id).then(response => {
            if (response.code === 200) {
              this.$message({type: 'success', message: this.$t("tip.deleteSuccess")});
              this.$emit('reload');
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
        this.$get('project', {pageNo: 1, pageSize: 9999}).then(response => {
          if (response.code == 200) {
            this.linkObjList = response.data.list;
          }
        })
      },

      getModuleList() {
        this.$get('module', {pageNo: 1, pageSize: 9999}).then(response => {
          if (response.code == 200) {
            this.linkObjList = response.data.list;
          }
        })
      },

      getAssetList() {
        this.$get('asset', {pageNo: 1, pageSize: 9999}).then(response => {
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
