<template>
  <div v-my-loading="preferenceLoading">
    <nzDetailView
      v-my-loading="detailViewLoading || tools.loading"
      v-if="detailType !== 'list' "
      :api="url"
      ref="detailList"
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :from="fromRoute.dc"
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
        <button id="asset-create-asset" v-has="'asset_add'" :title="$t('asset.createAsset')" class="top-tool-btn" @click.stop="add">
          <i class="nz-icon nz-icon-create-square"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :params2="searchCheckBox"
          :permissions="{
            import: 'dc_add',
            export: 'dc_edit'
          }"
          class="top-tool-export margin-r-10 margin-l-10"
          export-file-name="datacenter"
          export-url="/dc/export"
          import-url="/dc/import"
          @afterImport="getTableData"
          v-has="['dc_add','dc_edit']"
        >
        </top-tool-more-options>
      </template>
      <template v-slot:nz-detail-view-list>
        <dc-detail
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
        </dc-detail>
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
            <el-input-number v-if="showInput" ref="jumpInput" v-model="pageObj.pageNo" :controls="false" :min="1" :max="pageObj.pages" class="jump-input" @change="getTableData" @keyup.enter.native="getTableData" size="mini"/>
            <span class="jump-pages">/&nbsp;{{pageObj.pages}}</span>
          </template>
        </el-pagination>
      </template>
    </nzDetailView>
    <nz-data-list
      ref="dataList"
      :api="url"
      v-if="detailType === 'list' "
      :layout="['searchInput', 'elementSet', 'pagination','detailViewSet']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.dc"
      :search-msg="searchMsg"
      @search="search"
      :detailType="detailType"
      @changeDetailType="changeDetailType"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="dc-add" v-has="'dc_add'" :title="$t('overall.createDatacenter')" class="top-tool-btn margin-r-10" type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
       <top-tool-more-options
          :delete-objs="batchDeleteObjs"
          ref="export"
          id="model"
          :params="searchLabel"
          :permissions="{
            import: 'dc_add',
            export: 'dc_edit'
          }"
          class="top-tool-export margin-r-10"
          export-file-name="datacenter"
          export-url="/dc/export"
          import-url="/dc/import"
          @afterImport="getTableData"
          v-has="['dc_add','dc_edit','dc_delete']"
        >
          <template v-slot:before>
            <div>
              <el-dropdown-item :disabled="batchDeleteObjs.length==0" :class="'nz-el-dropdown-menu-item'">
                <delete-button
                  ref="deleteButton"
                  :single="false"
                  :from="'datacenter'"
                  :forceDeleteShow="true"
                  :deleteTitle="'overall.dc'"
                  :type="'link'"
                  :title="$t('overall.batchDel')"
                  id="account-list-batch-delete"
                  v-has="'dc_delete'"
                  :delete-objs="batchDeleteObjs"
                  api="dc"
                  @after="getTableData"
                  @before="delFlag=true"
                ></delete-button>
              </el-dropdown-item>
            </div>
          </template>
        </top-tool-more-options>
      </template>
      <template v-slot:default="slotProps">
        <dc-table
          ref="dataTable"
          :orderByFa="orderBy"
          v-my-loading="tools.loading"
          :loading="tools.loading"
          :api="url"
          :custom-table-title="tools.customTableTitle"
          :height="mainTableHeight"
          :table-data="tableData"
          @del="del"
          @edit="edit"
          @copy="copy"
          @orderBy="tableDataSort"
          @reload="getTableData"
          @topology="topology"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></dc-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <dc-box v-if="rightBox.show" :obj="object" :user-data="userData" @close="closeRightBox" @reload="getTableData" @addcabinet="addCabinet"></dc-box>
    </transition>
    <transition name="right-box">
      <cabinetBox v-if="cabinetBoxShow" :obj="cabinet" :current-dc="{}" @close="closeRightBox" :dcDisabled="false" @reload="getTableData"></cabinetBox>
    </transition>
  </div>
</template>
<script>
import dcBox from '@/components/common/rightBox/dcBox' // dc弹框
import cabinetBox from '@/components/common/rightBox/cabinetBox' // dc弹框
// import trafficSettingBox from '@/components/common/rightBox/trafficSetting/trafficSettingBox'
import deleteButton from '@/components/common/deleteButton'
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import dcTable from '@/components/common/table/settings/dcTable'
import topToolMoreOptions from '@/components/common/popBox/topToolMoreOptions'
import nzDetailView from '@/components/common/detailView/nzDetailView'
import detailViewMixin from '@/components/common/mixin/detailViewMixin'
import dcDetail from '@/components/common/detailView/list/dc/dcDetail'
// import detailViewTopSearch from '@/components/common/detailView/detailViewTopSearch'
import bus from '@/libs/bus'

export default {
  name: 'dc',
  components: {
    dcBox,
    deleteButton,
    nzDataList,
    dcTable,
    cabinetBox,
    topToolMoreOptions,
    nzDetailView,
    dcDetail
  },
  mixins: [dataListMixin, detailViewMixin],
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
        longitude: '',
        latitude: '',
        lnglat: ''
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
            name: this.$t('overall.state'),
            type: 'selectString',
            label: 'dcState',
            readonly: true,
            disabled: false
          },
          {
            name: this.$t('overall.remark'),
            type: 'input',
            label: 'remark',
            disabled: false
          }
        ]
      },
      regNum: /^[0-9]+.?[0-9]*/,
      userData: [],
      cabinetBoxShow: false,
      needAlertDaysData: true,
      trendKey: 'dcId'
    }
  },
  computed: {
    addCabinetBoxShow () {
      return this.$store.getters.getAddCabinetBoxParams
    }
  },
  methods: {
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
    addCabinet (params) {
      if (params) {
        this.cabinet.idcId = params.dcid
      }
      this.cabinetBoxShow = true
    },
    add () {
      this.$get('/sys/config/key/map_center_config').then(response => {
        if (response.code === 200) {
          const mapParam = JSON.parse(response.data.paramValue)
          this.object = this.newObject()
          this.object.longitude = mapParam.longitude
          this.object.latitude = mapParam.latitude
          this.rightBox.show = true
        }
      })
    },
    closeRightBox (refresh) {
      this.rightBox.show = false
      this.cabinetBoxShow = false
      this.$store.dispatch('addCabinet', { dcid: '', cabinetBoxShow: false })
      if (refresh) {
        this.delFlag = true
        this.getTableData()
      }
    }
  },
  mounted () {
    bus.$on('cabinet-tab', () => {
      this.getTableData()
    })
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
          const newQuery = JSON.parse(JSON.stringify(this.$route.query)) // 深拷贝
          delete newQuery.add
          this.$router.replace({ query: newQuery })
        }
      }
    },
    addCabinetBoxShow: {
      handler (n) {
        this.cabinetBoxShow = n.cabinetBoxShow
        this.cabinet.idcId = n.dcId
      }
    }
  }
}
</script>
