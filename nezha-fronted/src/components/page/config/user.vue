<template>
  <div>
    <nzDetailView
      v-my-loading="detailViewLoading || tools.loading"
      v-if="detailType !== 'list'"
      :api="url"
      ref="detailList"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :from="fromRoute.user"
      :search-msg="searchMsg"
      :detailType="detailType"
      :detailViewRightObj="detailViewRightObj"
      :dataLength="tableData.length"
      @search="search"
      @changeDetailType="changeDetailType"
    >
      <template v-slot:top-tool-left>
        <!--        <detailViewTopSearch :selectValue.sync="selectValue" :detailSearchList="detailSearchList" @reload="reloadTable" />-->
      </template>
      <template v-slot:top-tool-right>
      </template>
      <template v-slot:nz-detail-view-list>
        <userDetail
          class="data-detail"
          ref="dataDetail"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :detailViewRightObj="detailViewRightObj"
          :api="url"
          :table-data="tableData"
          @detailViewRightShow = 'detailViewRightShow'
          @orderDetail="orderDetail"
        >
        </userDetail>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <el-pagination
          @current-change="pageNo"
          :current-page.sync="pageObj.pageNo"
          :page-size="20"
          :total="pageObj.total"
          layout="prev, slot, next"
          small
        >
          <template>
            <el-input-number ref="jumpInput" v-model="pageObj.pageNo" :controls="false" :min="1" :max="pageObj.pages" class="jump-input" @change="getTableData" @keyup.enter.native="getTableData" size="mini"/>
            <span class="jump-pages">/&nbsp;{{pageObj.pages}}</span>
          </template>
        </el-pagination>
      </template>
    </nzDetailView>
    <nz-data-list
      ref="dataList"
      :api="url"
      v-if="detailType === 'list'"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.user"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :search-msg="searchMsg"
      @search="search"
      :detailType="detailType"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="account-add" v-has="'user_add'" :title="$t('overall.createUser')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button
          ref="deleteButton"
          :from="'user'"
          :forceDeleteShow="false"
          :deleteTitle="'config.user.user'"
          id="account-list-batch-delete"
          v-has="'user_delete'"
          :api="url" :delete-objs="batchDeleteObjs"
          @after="getTableData"
          @before="delFlag=true"
        ></delete-button>
      </template>
      <template v-slot="slotProps">
        <user-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @copy="copy"
          @reset_mfa="resetMfa"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></user-table>
      </template>
      <template v-slot:pagination>
        <Pagination ref="Pagination" :page-obj="pageObj" :table-id="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <user-box v-if="rightBox.show" :obj="object" @close="closeRightBox"></user-box>
    </transition>
  </div>
</template>
<script>
import deleteButton from '@/components/common/deleteButton'
import userBox from '@/components/common/rightBox/administration/userBox'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import userTable from '@/components/common/table/settings/userTable'
import MessageBox from 'element-ui/packages/message-box/src/main'
import i18n from '@/components/common/i18n'
import nzDetailView from '@/components/common/detailView/nzDetailView'
import detailViewMixin from '@/components/common/mixin/detailViewMixin'
import userDetail from '@/components/common/detailView/list/userDetail/userDetail'
import detailViewTopSearch from '@/components/common/detailView/detailViewTopSearch'
import routerPathParams from '@/components/common/mixin/routerPathParams'
export default {
  name: 'user',
  components: {
    nzDataList,
    userBox,
    deleteButton,
    userTable,
    nzDetailView,
    userDetail,
    detailViewTopSearch
  },
  mixins: [dataListMixin, detailViewMixin, routerPathParams],
  data () {
    return {
      url: 'sys/user',
      blankObject: { // 空白对象
        id: '',
        name: '',
        username: '',
        email: '',
        pin: '',
        pinChange: '',
        status: '1',
        createTime: '',
        receiver: [],
        roleIds: '',
        roles: [],
        notifications: [],
        mfaLevel: 0,
        lang: 'en'
      },
      tableId: 'userTable',
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('config.user.user'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
      }
    }
  },
  methods: {
    edit (u, copyFlag) {
      this.$get(`${this.url}/${u.id}`).then(response => {
        const user = response.user
        if (response.code === 200) {
          this.object = {
            ...user,
            status: user.status + '',
            roleIds: Number(user.roles.map(item => item.id).join(',')),
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
              this.object.name = u.name.substring(0, u.name.length - length) + '-copy'
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
        this.$delete('/sys/user/resetMfa?ids=' + row.id).then(res => {
          if (res.code == 200) {
            this.$message.success(this.$t('tip.resetSuccess'))
            this.getTableData()
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    }
  },
  created () {
    const searchKeys = {
      // key: path 键
      // value: vue set 参数
      pageNo: { target: this.pageObj, propertyName: 'pageNo', type: 'number' },
      pageSize: { target: this.pageObj, propertyName: 'pageSize', type: 'number' },
      orderBy: { target: this.$data, propertyName: 'orderBy', type: 'string' },
      name: {
        target: this.searchLabel,
        isSearchInput: true,
        propertyName: 'name',
        type: 'string',
        defaultJson: {
          disabled: false,
          id: 'name',
          label: 'name',
          name: 'Name',
          type: 'input',
          val: ''
        },
        jsonKey: 'val'
      }
    }
    this.initQueryFromPath(searchKeys)
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
                ...this.$loadsh.cloneDeep(item),
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
    }
  }
}
</script>
