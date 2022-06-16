<template>
  <div>
    <nz-data-list
      ref="dataList"
      :api="url"
      :layout="['searchInput', 'elementSet', 'pagination']"
      :custom-table-title.sync="tools.customTableTitle"
      :from="fromRoute.dc"
      :search-msg="searchMsg"
      @search="search"
      @getTableData="getTableData"
    >
      <template v-slot:top-tool-right>
        <button id="dc-add" v-has="'dc_add'" :title="$t('overall.createDatacenter')" class="top-tool-btn margin-r-10"
                type="button" @click="add">
          <i class="nz-icon-create-square nz-icon"></i>
        </button>
      </template>
      <template v-slot:default="slotProps">
        <globalization-table
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
          @orderBy="tableDataSort"
          @reload="getTableData"
          @selectionChange="selectionChange"
          @showBottomBox="(targetTab, object) => { $refs.dataList.showBottomBox(targetTab, object) }"></globalization-table>
      </template>
      <!-- 分页组件 -->
      <template v-slot:pagination>
        <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
      </template>
    </nz-data-list>
    <transition name="right-box">
      <i18n-box v-if="rightBox.show" :obj="object" :globalization-data="globalizationData" @close="closeRightBox" @reload="getTableData"></i18n-box>
    </transition>
  </div>
</template>
<script>
import nzDataList from '@/components/common/table/nzDataList'
import dataListMixin from '@/components/common/mixin/dataList'
import i18nBox from '@/components/common/rightBox/setting/globalizationBox'
import globalizationTable from '@/components/common/table/settings/globalizationTable'

export default {
  name: 'i18n',
  components: {
    nzDataList,
    i18nBox,
    globalizationTable
  },
  mixins: [dataListMixin],
  data () {
    return {
      url: 'sys/i18n',
      tableId: 'i18nTable', // 需要分页的table的id，用于记录每页数量
      blankObject: {
        id: '',
        name: '',
        code: '',
        lang: 'en',
        value: ''
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
            name: this.$t('config.menus.code'),
            type: 'input',
            label: 'code',
            disabled: false
          },
          {
            name: this.$t('config.menus.lang'),
            type: 'input',
            label: 'lang',
            disabled: false
          },
          {
            name: this.$t('config.menus.value'),
            type: 'input',
            label: 'value',
            disabled: false
          }
        ]
      },
      globalizationData: [],
      cabinetBoxShow: false
    }
  },
  methods: {
    getUserData () {
      return new Promise(resolve => {
        this.$get('/sys/i18n', { pageSize: -1, pageNo: 1 }).then(response => {
          if (response.code === 200) {
            this.globalizationData = response.data.list
            const allValue = []
            let valueObj = {}
            const allValue2 = []
            let valueObj2 = {}
            response.data.list.forEach(item => {
              if (allValue.indexOf(item.code) == -1) {
                allValue.push(item.code)
                valueObj[item.code] = {
                  values: [item.value],
                  key: item.code
                }
              } else {
                valueObj[item.code].values.push(item.value)
              }
            })
            Object.keys(valueObj).forEach(key => {
              const item = valueObj[key]
              const strKey = item.values.join('&')
              if (allValue2.indexOf(strKey) === -1) {
                allValue2.push(strKey)
                valueObj2[strKey] = {
                  allKey: [item.key],
                  key: strKey
                }
              } else {
                valueObj2[strKey].allKey.push(item.key)
              }
            })
            valueObj2 = this.$loadsh.filter(valueObj2, function (o) {
              if (o.allKey.length > 1) {
                return o
              } else {
                return false
              }
            })
            console.log(valueObj2)
            console.log(JSON.stringify(valueObj2))
          } else {
            this.$message.error(response.msg)
          }
          resolve()
        })
      })
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
  }
}
</script>
<style scoped>
/deep/ td .nz-icon-gear:before{
  color: #606266;
}
</style>
