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
          v-loading="slotProps.loading"
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
      <dc-box v-if="rightBox.dc.show" :dc="object" :user-data="userData" @close="closeDcBox" @reload="getTableData"></dc-box>
    </transition>
    <transition name="right-box">
      <traffic-setting-box v-if="rightBox.trafficSetting.show" ref="trafficBox" :dc="object" @close="closeTrafficBox"></traffic-setting-box>
    </transition>
    <span v-if="dcDataRefresh" style="display: none"></span>
  </div>
</template>
<script>
import bus from '@/libs/bus'
import dcBox from '@/components/common/rightBox/dcBox' // dc弹框
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
    dcTable
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
      rightBox: {
        dc: { show: false },
        trafficSetting: { show: false }
      },
      searchMsg: { // 给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 10,
          name: this.$t('overall.name'),
          type: 'input',
          label: 'name',
          disabled: false
        }]
      },
      regNum: /^[0-9]+.?[0-9]*/,
      tabShow: 1, // 控制显示一级页面和二级页面 1 dc 2cabinet
      userData: []
    }
  },
  computed: {
    dcDataRefresh () { // 通过vuex更新dc   需要该属性到页面 否则不被监听
      if (this.$store.getters.getDcDataRefresh) {
        this.getTableData()
      }
      return this.$store.getters.getDcDataRefresh
    }
  },
  methods: {
    assetStatClassName (param) {
      if (param.column.label == this.$t('config.dc.assets')) {
        return 'asset-state'
      }
      return ''
    },
    edit (u) {
      this.dc = JSON.parse(JSON.stringify(u))
      if (!this.regNum.test(this.dc.longitude)) {
        this.dc.longitude = undefined
      }
      if (!this.regNum.test(this.dc.latitude)) {
        this.dc.latitude = undefined
      }
      if (!this.dc.area) {
        this.$set(this.dc, 'area', { id: '', name: '' })
      }
      this.rightBox.dc.show = true
    },
    detail (u) {
      this.bottomBox.object = JSON.parse(JSON.stringify(u))
      if (!this.bottomBox.object.area) {
        this.$set(this.bottomBox.object, 'area', { id: '', name: '' })
      }
      this.bottomBox.targetTab = 'detail'
      this.bottomBox.showSubList = true
    },
    add () {
      this.object = this.newObject()
      this.rightBox.dc.show = true
    },
    closeDcBox (refresh) {
      this.rightBox.dc.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    closeTrafficBox (refresh) {
      this.rightBox.trafficSetting.show = false
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    },
    statusChange (idc) {
      this.$put('dc', idc).then(response => {
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
    initEvent () {
      bus.$on('dc-list-change', () => {
        this.getTableData()
      })
    }
  },
  beforeDestroy () {
    bus.$off('dc-list-change')
  },
  mounted () {
    this.getUserData()
  }
}
</script>
<style scoped>
  /deep/ td .nz-icon-gear:before{
    color: #606266;
  }
</style>
