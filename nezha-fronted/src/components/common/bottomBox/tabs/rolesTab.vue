<template>
 <div>
  <nz-bottom-data-list
    :showTitle="showTitle"
    :obj="obj"
    :api="url"
    :tableId="tableId"
    style="height: 100%"
    :custom-table-title.sync="tools.customTableTitle"
    :layout="['searchInput', 'elementSet']"
    :search-msg="searchMsg"
    :tabs="tabs"
    :targetTab.sync="targetTab"
    @changeTab="changeTab"
    @search="search"
  >
    <template v-slot:title
      ><span :title="obj.name">{{ obj.name }}</span></template
    >
    <template v-slot>
      <user-tab-table
        ref="dataTable"
        :api="url"
        :orderByFa="orderBy"
        v-my-loading="tools.loading"
        :loading="tools.loading"
        :custom-table-title="tools.customTableTitle"
        :height="subTableHeight"
        :table-data="tableData"
        @del="del"
        @copy="copy"
        @reset_mfa="resetMfa"
        @edit="edit"
        @orderBy="tableDataSort"
        @reload="getTableData"
        @selectionChange="selectionChange"
      ></user-tab-table>
    </template>
    <template v-slot:pagination>
      <Pagination
        ref="Pagination"
        :pageObj="pageObj"
        :tableId="tableId"
        @pageNo="pageNo"
        @pageSize="pageSize"
      >
      </Pagination>
    </template>
  </nz-bottom-data-list>
  <transition name="right-box">
    <user-box v-if="rightBox.show" :obj="object" @close="closeRightBox"></user-box>
  </transition>
</div>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import userTabTable from '@/components/common/table/settings/userTabTable'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'
import userBox from '@/components/common/rightBox/administration/userBox'
import MessageBox from 'element-ui/packages/message-box/src/main'
import i18n from '@/components/common/i18n'
import routerPathParams from '@/components/common/mixin/routerPathParams'
export default {
  name: 'rolesTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin, routerPathParams],
  components: {
    nzBottomDataList,
    userTabTable,
    userBox
  },
  props: {
    obj: Object
  },
  data () {
    return {
      url: 'sys/user',
      tableId: 'userTabTable',
      detailType: 'list',
      searchMsg: {
        // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            id: 11,
            name: this.$t('config.user.user'),
            type: 'input',
            label: 'name',
            disabled: false
          }
        ]
      },
      searchLabel: { roleId: this.obj.id },
      fromBottom: true
    }
  },
  watch: {
    tableData: {
      immediate: true,
      handler (n) {
        if (n) {
          const arr = []
          n.map(item => {
            if (!item.position) {
              const obj = {
                ...this.$lodash.cloneDeep(item),
                type: 'user',
                position: {
                  top: 0,
                  left: 0
                },
                loading: false
              }
              arr.push(obj)
            }
          })
          return arr
        }
      }
    },
    obj: {
      immediate: true,
      async handler (n) {
        if (n) {
          this.searchLabel = { roleId: this.obj.id }
          await this.getPreference()
          this.getTableData()
        }
      }
    }
  },
  methods: {
    edit (u, copyFlag) {
      this.$get(`${this.url}/${u.id}`).then((response) => {
        const user = response.user
        if (response.code === 200) {
          this.object = {
            ...user,
            status: user.status + '',
            roleIds: Number(user.roles.map((item) => item.id).join(',')),
            pin: '',
            pinChange: ''
          }
          if (!this.object.mfaLevel) {
            this.object.mfaLevel = 0
          }
          if (copyFlag) {
            this.object.id = ''
            this.object.name = this.object.name + '-copy'
            if (this.object.name.length > 64) {
              const length = this.object.name.length - 64
              this.object.name =
                u.name.substring(0, u.name.length - length) + '-copy'
            }
          }
          this.rightBox.show = true
        }
      })
    },
    copy (u) {
      this.edit(u, true)
    },
    resetMfa (row) {
      MessageBox.confirm(i18n.t('tip.resetMfa'), {
        confirmButtonText: i18n.t('tip.yes'),
        cancelButtonText: i18n.t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/sys/user/resetMfa?ids=' + row.id).then((res) => {
          if (res.code == 200) {
            this.$message.success(this.$t('tip.resetSuccess'))
            this.getTableData()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    getTableData (params) {
      if (params && Object.keys(params).length > 0) {
        for (const key in params) {
          this.$set(this.searchLabel, key, params[key])
        }
      }
      if (this.orderBy) {
        this.$set(this.searchLabel, 'orderBy', this.orderBy)
      } else {
        delete this.searchLabel.orderBy
      }
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.tools.loading = true
      if (this.obj) {
        this.$set(this.searchLabel, 'roleId', this.obj.id)
      }
      this.$get(this.url, { ...this.searchLabel, ...this.searchCheckBox }).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          for (let i = 0; i < response.data.list.length; i++) {
            response.data.list[i].status = response.data.list[i].status + ''
          }
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
          if (!this.scrollbarWrap && this.$refs.dataTable && this.$refs.dataTable.$refs.dataTable) {
            this.$nextTick(() => {
              this.scrollbarWrap = this.$refs.dataTable.$refs.dataTable.bodyWrapper
              this.toTopBtnHandler(this.scrollbarWrap)
            })
          }
        }
      })
    }
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: {
        target: this.pageObj,
        propertyName: 'pageSize',
        type: 'number'
      },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      name: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'name',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 11,
          label: 'name',
          name: 'Name',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      }
    }
    this.initQueryFromPath(searchKeys)
  }
}
</script>
