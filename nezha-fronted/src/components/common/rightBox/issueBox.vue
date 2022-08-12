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
              v-model="editIssue.name" :placeholder="''"
              maxlength="64"
              show-word-limit
              size="small">
            </el-input>
          </el-form-item>
            <!--type-->
          <el-form-item prop="type" :label='$t("overall.type")' :rules="{ required: true, message: $t('validate.required'), change: 'blur'}">
                      <el-select
                        v-model="editIssue.type"
                        :placeholder="issueTypeSelect[0]"
                        style="margin-right: 10px"
                        filterable
                        allow-create
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
          <el-form-item :label='$t("alert.severity")' prop="priority">
             <el-input v-model="editIssue.priority" :placeholder="'High'" size="small"></el-input>
         </el-form-item>
          <!--state-->
          <el-form-item :label="$t('overall.state')" prop="state">
          <el-select v-model="editIssue.state" clearable :placeholder="$t('issue.open')" size="small" value-key="state">
            <el-option v-for="item in stateData" :key="item.id" :label="item.value" :value="item.value">
              {{item.value}}
            </el-option>
          </el-select>
          </el-form-item>
           <!-- Relate Assets -->
          <el-form-item :label="$t('issue.relateAssets')" prop="assetIds">
           <v-selectpage
                ref="selectPage"
                style="flex: 1"
                data="asset/asset"
                :params="selectPageParams"
                :tb-columns="columns"
                key-field="id"
                show-field="manageIp"
                search-field="manageIp"
                v-model="editIssue.assetIds"
                size="small"
                :language="language"
                :placeholder="$t('dashboard.panel.chartForm.selectAsset')"
                id="box-input-asset-id"
                :result-format="resultFormat"></v-selectpage>
          </el-form-item>
          <!-- Reporter -->
           <el-form-item :label='$t("issue.reporter")' prop="rid">
             <el-select
              id="issue-box-input-receiver"
              v-model.trim="editIssue.rid"
              class="right-box__select"
              filterable
              multiple
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
              v-model.trim="editIssue.aid"
              class="right-box__select"
              filterable
              multiple
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
            <rich-text-editor ref="richTextEditor" :edit-data="editIssue.content" @after-init="afterInitRich"></rich-text-editor>
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
export default {
  name: 'issueBox',
  components: {
    richTextEditor
  },
  mixins: [editRigthBox],
  props: {
    issue: Object
  },
  data () {
    return {
      issueTypeSelect: [],
      selectPageParams: { pageNumber: 1 },
      userData: [],
      editIssue: {
        id: '',
        name: '',
        type: '',
        content: '',
        state: '',
        priority: '',
        rid: '',
        aid: '',
        assetIds: ''
      },
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
        // type: [
        //   { required: true, message: this.$t('validate.required'), trigger: 'change' }
        // ],
        // expr: [
        //   { required: true, message: this.$t('validate.required'), trigger: 'change' }
        // ],
        // labels: [
        //   { required: true, message: this.$t('validate.required'), trigger: 'change' },
        //   { validator: arrLength, trigger: 'change' }
        // ],
        // state: [
        //   { required: true, message: this.$t('validate.required'), trigger: 'change' }
        // ]
      },
      columns: [
        { title: 'ID', data: 'id' },
        {
          title: 'Name',
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          }
        },
        { title: 'Manage Ip', data: 'manageIp' },
        {
          title: 'Type',
          data: (row) => {
            return row.type ? row.type.name : ''
          }
        },
        {
          title: 'Model',
          data: (row) => {
            return row.model ? row.model.name : ''
          }
        },
        {
          title: 'Datacenter',
          data: (row) => {
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
      ]
    }
  },
  mounted () {
    this.getTypeData()
    this.getUserList()
  },
  methods: {
    getTypeData () {
      this.$get('issue/type').then(response => {
        if (response.code === 200) {
          this.issueTypeSelect = response.data
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
    afterInitRich () {
      this.$refs.alertName.focus()
    },
    save () {
      this.editIssue.expr = this.expressions[0]
      this.$refs.issueForm.validate((valid) => {
        // 处理labels数据
        const obj = {}
        this.editIssue.labels.forEach(item => {
          obj[item.label] = item.value
        })

        const params = {
          ...this.editIssue,
          state: Number(this.editIssue.state),
          type: Number(this.editIssue.type),
          inr: Number(this.editIssue.inr),
          labels: this.editIssue.labels[0].label != '' ? JSON.stringify(obj) : {}
        }
        if (valid) {
          this.prevent_opt.save = true
          if (this.editIssue.id) {
            this.$put('/record/rule', params).then(response => {
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
            this.$post('record/rule', params).then(response => {
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
    language () { return this.$store.getters.getLanguage }
  },
  watch: {
    // issue: {
    //   deep: true,
    //   immediate: true,
    //   handler (n, o) {
    //     this.isEdit = true
    //     const editObj = lodash.cloneDeep(n)
    //     this.editIssue = {
    //       ...editObj,
    //       type: editObj.type + '',
    //       inr: editObj.inr + '',
    //       labels: typeof editObj.labels != 'object' ? this.labelsSort(editObj.labels) : editObj.labels,
    //       state: editObj.state + ''
    //     }
    //   }
    // }
  }
}
</script>
