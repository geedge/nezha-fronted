<template>
  <div class="right-box right-box-issue" v-clickoutside="{obj:editIssue,func:clickOutside}">
    <!-- begin--标题-->
    <div class="right-box__header">
      <div class="header__title">{{editIssue.id ? $t("overall.issue.edit") : $t("overall.createIssue")}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editIssue, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="issueForm" :model="editIssue"
                 :rules="rules" label-position="top" label-width="120px">
           <!-- title -->
          <el-form-item :label='$t("project.topology.title")' prop="name">
            <el-input
              v-model="editIssue.name"
              :placeholder="''"
              maxlength="64"
              show-word-limit
              ref="issueName"
              size="small">
            </el-input>
          </el-form-item>
            <!--type-->
          <el-form-item prop="type" :label='$t("overall.type")' :rules="{ required: true, message: $t('validate.required'), change: 'blur'}">
                      <el-select
                        v-model="editIssue.type"
                        class="type-select"
                        :placeholder="editIssue.type"
                        style="margin-right: 10px"
                        filterable
                        allow-create :maxlength="64"
                        default-first-option
                      >
                      <el-option
                        v-for="item in issueTypeSelect"
                        :value="item"
                        :label="item"
                        :key="item"/>
                      </el-select>
          </el-form-item>
          <!--priority-->
         <el-form-item :label="$t('alert.severity')" prop="priority">
          <el-select v-model="editIssue.priority" clearable :placeholder="$t('issue.middle')" size="small" value-key="state" class="type-select">
            <el-option v-for="item in priorityData" :key="item.id" :label="item.value" :value="item.id">
              {{item.value}}
            </el-option>
          </el-select>
          </el-form-item>
          <!--state-->
          <el-form-item :label="$t('overall.state')" prop="state">
          <el-select v-model="editIssue.state" placeholder='' size="small" value-key="state" class="type-select">
            <el-option v-for="item in stateData" :key="item.id" :label="item.value" :value="item.id">
              {{item.value}}
            </el-option>
          </el-select>
          </el-form-item>
           <!-- Relate Assets -->
          <el-form-item :label="$t('issue.relateAssets')" prop="assetIds">
                <v-selectpage
                ref="selectPage"
                :data="assetList"
                :tb-columns="columns"
                :params="{
                  varType: 1, dashboardId: 0,
                   returnChildren:0,groupId:0,
                }"
                :multiple="true"
                :language="languages"
                key-field="id"
                :width="640"
                v-model="editIssue.assetIds"
                show-field="manageIp"
                class="form-control"
                @values="(data) => {editIssue.assetIds = data.map(d => d.id).join(',')}"
                :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>
          <!-- Reporter -->
           <el-form-item :label='$t("issue.reporter")' prop="rid">
             <el-select
              id="issue-box-input-receiver"
              v-model="editIssue.rid"
              class="right-box__select"
              filterable
              placeholder=""
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
              value-key="userId"
            >
              <el-option
                style="width: 620px"
                v-for="item in userData"
                :key="item.id"
                :label="item.name"
                :value="item.id">
                <span class="user-name" :title="item.name">{{item.name}}</span><span class="user-username" :title="item.username">@{{item.username}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!-- Assignee -->
          <el-form-item :label='$t("issue.assignee")' prop="aid">
             <el-select
              id="issue-box-input-receiver"
              v-model="editIssue.aid"
              class="right-box__select"
              filterable
              placeholder=""
              popper-class="prevent-clickoutside right-box-select-top"
              size="small"
              value-key="userId"
            >
              <el-option
                style="width: 620px"
                v-for="item in userData"
                :key="item.id"
                :label="item.name"
                :value="item.id">
                <span class="user-name" :title="item.name">{{item.name}}</span><span class="user-username" :title="item.username">@{{item.username}}</span>
              </el-option>
            </el-select>
          </el-form-item>
           <!-- remark -->
          <el-form-item :label='$t("overall.remark")' prop="content">
            <rich-text-editor ref="richTextEditor" :edit-data="editIssue.content" @textChange="textChange"></rich-text-editor>
          </el-form-item>
        </el-form>
      </div>

    </div>
    <!-- end--表单-->

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editIssue,func:esc}" id="alert-box-esc"
              class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save"
              class="footer__btn" id="alert-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import editRigthBox from '../mixin/editRigthBox'
import richTextEditor from '@/components/chart/richTextEditor'
import { noSpecialChar } from '@/components/common/js/validate'
import publicConfig from '@/components/common/rightBox/chart/publicConfig'
export default {
  name: 'issueBox',
  components: {
    richTextEditor
  },
  mixins: [editRigthBox, publicConfig],
  props: {
    issue: Object
  },
  data () {
    return {
      // selectPageParams: {},
      assetList: [], // asset 列表数据
      issueTypeSelect: [],
      userData: [],
      editIssue: {
        id: '',
        name: '',
        type: 'default',
        content: '',
        state: '',
        priority: 2,
        rid: '',
        aid: '',
        assetIds: ''
      },
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        content: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        rid: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        aid: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        state: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      // 下拉选择框（表格）
      columns: [
        { title: 'ID', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          },
          tip: function (row) {
            return row.name
          }
        },
        { title: this.$t('asset.manageIp'), data: 'manageIp', tip: 'manageIp' },
        {
          title: this.$t('overall.type'),
          data: (row) => {
            return row.type ? row.type.name : ''
          },
          tip: (row) => {
            return row.type ? row.type.name : ''
          }
        },
        {
          title: this.$t('asset.model'),
          data: (row) => {
            return row.model ? row.model.name : ''
          },
          tip: (row) => {
            return row.model ? row.model.name : ''
          }
        },
        {
          title: this.$t('overall.dc'),
          data: (row) => {
            return row.dc ? row.dc.name : ''
          },
          tip: (row) => {
            return row.dc ? row.dc.name : ''
          }
        }
      ],
      stateData: [
        {
          id: 1,
          value: this.$t('issue.open')
        }, {
          id: 2,
          value: this.$t('issue.hasBeenAssigned')
        }, {
          id: 3,
          value: this.$t('issue.beingProcessed')
        }, {
          id: 4,
          value: this.$t('issue.hangUp')
        }, {
          id: 5,
          value: this.$t('issue.resolved')
        }, {
          id: 6,
          value: this.$t('overall.close')
        }, {
          id: 7,
          value: this.$t('overall.cancel')
        }
      ],
      priorityData: [
        {
          id: 1,
          value: this.$t('dashboard.dashboard.chartForm.high')
        }, {
          id: 2,
          value: this.$t('issue.middle')
        }, {
          id: 3,
          value: this.$t('issue.low')
        }
      ]
    }
  },
  mounted () {
    this.getTypeData()
    this.getUserList()
    this.assetTemplateList()
  },
  methods: {
    /* 获取asset列表数据 */
    assetTemplateList () {
      this.$get('asset/asset', { pageSize: -1, varType: 1, dashboardId: 0, groupId: 0 }).then(res => {
        this.assetList = res.data.list
      })
    },
    textChange (val) {
      const html = `<div  class="editor-core ql-container ql-snow"><div class="ql-editor">${val}</div></div>`
      this.editIssue.content = html
      this.change()
    },
    getTypeData () {
      this.$get('issue/type').then(response => {
        if (response.code === 200) {
          this.issueTypeSelect = response.data.list
        }
      })
    },
    getUserList () {
      this.$get('sys/user', { pageNo: 1, pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.userData = response.data.list
        }
      })
    },
    resultFormat (resp) {
      if (resp && resp.data) {
        const assetData = {}
        assetData.list = resp.data.list
        assetData.totalRow = resp.data.total
        return assetData
      }
    },
    clickOutside () {
      this.esc(false)
    },
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      this.$refs.issueForm.validate((valid) => {
        const assetIdsArr = this.editIssue.assetIds.split(',').map((item) => {
          return Number(item)
        })
        const params = {
          ...this.editIssue,
          assetIds: assetIdsArr,
          content: this.$refs.richTextEditor.getContent()
        }
        if (valid) {
          this.prevent_opt.save = true
          if (this.editIssue.id) {
            this.$put('/issue', params).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
              this.prevent_opt.save = false
            })
          } else {
            this.$post('issue', params).then(response => {
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
          this.prevent_opt.save = false
        }
      })
    }
  },
  computed: {
    languages () { return this.$store.getters.getLanguage }
  },
  watch: {
    issue: {
      deep: true,
      immediate: true,
      handler (n, o) {
        this.isEdit = true
        if (n.assets && n.assets[0] != null) {
          const assetIdData = n.assets.map(item => {
            return item.id
          })
          this.editIssue = {
            ...n,
            assetIds: assetIdData.join(',')
          }
        } else {
          this.editIssue = {
            ...n
          }
        }
      }
    }
  }
}
</script>
