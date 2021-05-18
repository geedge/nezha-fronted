<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.dc"
      :search-msg="searchMsg"
      @search="search"
    >
      <template v-slot:top-tool-right>
        <button id="dc-add" v-has="'dc_add'" :title="$t('overall.createDatacenter')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
        <delete-button id="account-list-batch-delete" v-has="'dc_delete'" :delete-objs="batchDeleteObjs" api="dc" @after="getTableData" @before="delFlag=true"></delete-button>
      </template>
      <template v-slot:default="slotProps">
        <dc-table
          ref="dataTable"
          v-loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></dc-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <dc-box v-if="rightBox.show" :obj="object" :user-data="userData" @close="closeRightBox" @reload="getTableData"></dc-box>
    </transition>
    <transition name="right-box">
      <cabinetBox v-if="cabinetBoxShow" :obj="cabinet" :current-dc="{}" @close="closeRightBox" :dcDisabled="false" @reload="getTableData"></cabinetBox>
    </transition>
  </div>
</template>
<script>
import dcBox from '@/components/common/rightBox/dcBox' // dc弹框
import cabinetBox from '@/components/common/rightBox/cabinetBox' // dc弹框
import trafficSettingBox from '@/components/common/rightBox/trafficSetting/trafficSettingBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import dcTable from '@/components/common/table/settings/dcTable'
export default {
  name: 'dc',
  components: {
    trafficSettingBox,
    dcBox,
    deleteButton,
    nzDataList,
    dcTable,
    cabinetBox
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'dc',
      tableId: 'dcTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        name: '',
        location: '',
        tel: '',
        principal: '',
        state: 'ON',
        longitude: undefined,
        latitude: undefined
      },
      cabinet: {
        id: '',
        idcId: '',
        name: '',
        remark: '',
        seq: '',
        uSize: 1
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [
          {
            name: 'ID',
            type: 'input',
            label: 'ids',
            disabled: false
          },
          {
            name: this.$t('overall.name'),
            type: 'input',
            label: 'name',
            disabled: false
          },
          {
            name: this.$t('asset.location'),
            type: 'input',
            label: 'location',
            disabled: false
          },
          {
            name: this.$t('asset.state'),
            type: 'selectString',
            label: 'dcState',
            disabled: false
          }
        ]
      },
      regNum: /^[0-9]+.?[0-9]*/,
      userData: [],
      cabinetBoxShow: false
    }
  },
  methods: {
    statusChange (dc) {
      this.$put(this.url, dc).then(response => {
        if (response.code === 200) {
          this.rightBox.show = false
          this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
        } else {
          this.$message.error(response.msg)
        }
        this.getTableData()
      })
    },
    getUserData () {
      return new Promise(resolve => {
        this.$get('sys/user', { pageSize: -1, pageNo: 1 }).then(response => {
          if (response.code === 200) {
            this.userData = response.data.list
          }
          resolve()
        })
      })
    },
    regNumTest (val) { // 校验是否是数字
      return this.regNum.test(val)
    },
    addCabinet () {
      this.cabinetBoxShow = true
    },
    closeRightBox (refresh) {
      this.rightBox.show = false
      this.cabinetBoxShow = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    }
  },
  mounted () {
    this.getUserData()
  },
  watch: {
    $route: {
      immediate: true,
      handler () {
        // 是否弹出侧滑
        const add = this.$route.query.add
        if (add) {
          if (add === 'dc') {
            this.add()
          }
          if (add === 'cabinet') {
            this.addCabinet()
          }
        }
      }
    }
  }
}
</script>
<style scoped>
  /deep/ td .nz-icon-gear:before{
    color: #606266;
  }
</style>
