<template>
  <div style="height: 100%">
    <el-table
      id="softwareTypeTable"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
      :default-sort="orderBy"
      @header-dragend="dragend"
      @sort-change="tableDataSort"
      @selection-change="selectionChange"
      @row-dblclick="(row)=>{}"
    >
      <el-table-column
        :resizable="false"
        align="center"
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        v-for="(item, index) in customTableTitle"
        v-if="item.show"
        :key="`col-${index}-${item.prop}`"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
        :sort-orders="['ascending', 'descending']"
        :sortable="item.sortable"
        :width="`${item.width}`"
      >
        <template slot="header">
          <span class="data-column__span">{{item.label}}</span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
          <template v-if="item.prop === 'name'">
            <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
              <template slot="copy-text">
                {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
              </template>
            </copy>
          </template>
          <span v-else-if="item.prop === 'params'"
                @mouseenter="labelHover(scope.row, 'params', true, false, $event)"
                @mouseleave="labelHover(scope.row, 'params', false, false)"
          >
            <div class="text-ellipsis" style="width: 100%" >
              {{JSON.stringify(scope.row[item.prop])}}
            </div>
          </span>
          <template v-else-if="item.prop === 'cts'">
            <template>{{scope.row[item.prop] ? utcTimeToTimezoneStr(scope.row[item.prop]) : '-'}}</template>
          </template>
          <template v-else-if="item.prop === 'uts'">
            <template>{{scope.row[item.prop] ? utcTimeToTimezoneStr(scope.row[item.prop]) : '-'}}</template>
          </template>
          <div v-else-if="item.prop === 'icon'"
                    @mouseenter="labelHover(scope.row, 'icon', true, false, $event)"
                    @mouseleave="labelHover(scope.row, 'icon', false, false)"
          >
            <div>
              <img v-if="scope.row[item.prop]" :url="scope.row[item.prop]" class="table-image"/>
            </div>
          </div>
          <span v-else-if="scope.row[item.prop]" :class="item.prop === 'remark'? 'el-table-remark':''">{{scope.row[item.prop]}}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        :width="operationWidth"
        fixed="right">
        <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
        <div slot-scope="scope" class="table-operation-items">
          <!-- <button class="table-operation-item" v-has="'model_edit'" @click="$emit('edit', scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button> -->
          <button class="table-operation-item" @click="showBottomBox('asset', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button>
          <el-dropdown size="medium" v-has="['model_delete','main_edit','model_edit']" trigger="click" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <el-dropdown-item v-has="'model_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'model_edit'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'model_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true,from:'model'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'main_edit'" :command="['sync', scope.row]"><i class="nz-icon nz-icon-sync"></i><span class="operation-dropdown-text">{{$t('overall.syncChart')}}</span></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-table-column>
      <template slot="empty">
        <div v-if="!loading" class="table-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div class="table-no-data__title">No results found</div>
        </div>
        <div v-else>&nbsp;</div>
      </template>
    </el-table>
    <nzTooltip
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :width="200"
      :type="alertLabelType"
      @tipHover='tipHover'
      ref="nzTooltip"
      class="data-column__"
    >
      <div style="word-break: break-all">
        <div name="default">
          <span class="copy-value-content" :title="$t('overall.duplicate')" v-if="alertLabelType !== 'icon'"> <i class="nz-icon nz-icon-override" @click="copyValue(alertLabelObj[alertLabelType])"></i></span>
          <pre v-if="alertLabelType !== 'icon'" class="copy-value-content__pre">{{JSON.stringify(alertLabelObj[alertLabelType],null,2)}}</pre>
          <img :src="alertLabelObj" style="width: 200px;height: 200px" v-if="alertLabelType === 'icon'"/>
        </div>
      </div>
    </nzTooltip>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import copy from '@/components/common/copy'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
export default {
  name: 'softwareTypeTable',
  mixins: [table, alertLabelMixin],
  components: { copy },
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [ // 原始table列
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 120,
          sortable: 'custom'
        }, {
          label: this.$t('config.model.name'),
          prop: 'name',
          show: true,
          width: 350,
          sortable: 'custom'
        }, {
          label: this.$t('softwareType.category'),
          prop: 'category',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        },
        // {
        //   label: this.$t('config.menus.icon'),
        //   prop: 'icon',
        //   show: true,
        //   width: 120,
        //   sortable: 'custom'
        // },
        // {
        //   label: this.$t('config.assetLabel.params'),
        //   prop: 'params',
        //   minWidth: 200,
        //   show: true
        // },
        {
          label: this.$t('issue.createTime'),
          prop: 'cts',
          minWidth: 200,
          show: false
        }, {
          label: this.$t('alert.silence.upTime'),
          prop: 'uts',
          minWidth: 200,
          show: false
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          minWidth: 200,
          show: true
        }
      ]
    }
  },
  methods: {
    copyValue (item) {
      const str = item
      // const domUrl = document.createElement('input')
      // domUrl.value = JSON.stringify(str)
      // domUrl.id = 'creatDom'
      // document.body.appendChild(domUrl)
      // domUrl.select() // 选择对象
      // document.execCommand('Copy') // 执行浏览器复制命令
      // const creatDom = document.getElementById('creatDom')
      // creatDom.parentNode.removeChild(creatDom)
      // this.$message.success(this.$t('overall.copySuccess'))
      this.$copyText(JSON.stringify(str)).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    }
  },
  created () {
  },
  computed: {

  }
}
</script>
