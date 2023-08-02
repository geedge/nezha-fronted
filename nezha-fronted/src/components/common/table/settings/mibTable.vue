<template>
  <el-table
    id="mibTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    border
    :default-sort="orderBy"
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
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
      class="data-column"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <template v-if="item.prop == 'updateUser'" >{{scope.row[item.prop].name}}</template>
        <template v-else-if="item.prop == 'fileName' && scope.row[item.prop]" >
          <div class="document-copy-block">
              <span class="link document-copy-text" @click="downloadMib(scope.row)">{{scope.row[item.prop]}}</span>
              <i v-if="scope.row[item.prop]" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row[item.prop])" :title="$t('overall.copyText')"></i>
            </div>
        </template>
        <template v-else-if="item.prop === 'name'">
           <copy :copyData='scope.row[item.prop]' :showInfo='scope.row[item.prop]'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
                  </template>
            </copy>
          </template>
        <template v-else-if="item.prop === 'modelsDetail' && scope.row['modelsDetail'] && scope.row['modelsDetail'].length >0" >
          <div style="height: 100%">
            <div style="height: 100%; overflow: auto;" v-if="scope.row['modelsDetail']">
              <div v-for="(n,i) in scope.row['modelsDetail']" :key="n.name+'-'+n.id+'-'+i" class="detail-item-content" v-if="n">
                <el-popover placement="top" trigger="hover" >
                  <div>
                    <div>
                      <span>{{$t('overall.name')}}:</span>
                      <span>{{n.name}}</span>
                    </div>
                    <div>
                      <span>{{$t('asset.vendor')}}:</span>
                      <span>{{n.vendor}}</span>
                    </div>
                    <div>
                      <span>{{$t('overall.type')}}:</span>
                      <span>{{n.type}}</span>
                    </div>
                  </div>
                  <template slot="reference">
                    <div v-if="i < scope.row['modelsDetail'].length-1" class="detail-item-content">{{n.name}},</div>
                    <div v-else class="detail-item-content">{{n.name}}</div>
                  </template>
                </el-popover>
              </div>
            </div>
          </div>
        </template>
        <span v-else-if="item.prop === 'updateAt'">{{utcTimeToTimezoneStr(scope.row[item.prop])}}</span>
        <span v-else-if="scope.row[item.prop]" :class="item.prop === 'remark'? 'el-table-remark':''">{{scope.row[item.prop]}}</span>
        <template v-else>-</template>
      </template>
    </el-table-column>
    <el-table-column
      :resizable="false"
      :width="operationWidth"
      fixed="right">
      <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
      <div slot-scope="scope" class="table-operation-items">
        <button class="table-operation-item" :title="$t('overall.download')" v-has="'snmp_mibFile_edit'" @click="downloadMib(scope.row)"><i class="nz-icon nz-icon-download"></i></button>
        <el-dropdown size="medium" v-has="['snmp_mibFile_edit','snmp_mibFile_delete']" trigger="click" @command="tableOperation">
          <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
            <i class="nz-icon nz-icon-more3"></i>
          </div>
          <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
            <el-dropdown-item v-has="'snmp_mibFile_edit'" :command="['edit', scope.row]"><i class="nz-icon nz-icon-edit"></i><span class="operation-dropdown-text">{{$t('overall.edit')}}</span></el-dropdown-item>
            <el-dropdown-item v-has="'snmp_mibFile_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true,from:'mib'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
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
</template>

<script>
import table from '@/components/common/mixin/table'
import copy from '@/components/common/copy'
import axios from 'axios'
export default {
  name: 'mibTable',
  mixins: [table],
  components: { copy },
  props: {
    loading: Boolean
  },
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80,
          sortable: 'custom'
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          show: true,
          sortable: 'custom',
          minWidth: 200
        }, {
          label: this.$t('config.mib.fileName'),
          prop: 'fileName',
          show: true,
          minWidth: 100
        }, {
          label: this.$t('overall.models'),
          prop: 'modelsDetail',
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          show: true,
          minWidth: 100
        }, {
          label: this.$t('config.mib.updateUser'),
          prop: 'updateUser',
          show: false,
          minWidth: 120
        }, {
          label: this.$t('alert.silence.upTime'),
          prop: 'updateAt',
          show: false,
          minWidth: 150
        }
      ]
    }
  },
  methods: {
    downloadMib (mib) {
      axios.get('/mib/download?id=' + mib.id, { responseType: 'blob' }).then(data => {
        let fileName = new Date().getTime() + '.txt'
        const disposition = data.headers['content-disposition']
        if (disposition) {
          fileName = disposition.split(';')[1].split('filename=')[1]
        }
        // 由于ie不支持download属性，故需要做兼容判断
        if (navigator.appVersion.toString().indexOf('.NET') > 0) {
          // ie独有的msSaveBlob属性，data.data为Blob文件流
          window.navigator.msSaveBlob(data.data, fileName)
        } else {
          // 以下流程即为文章开始的下载流程
          const url = window.URL.createObjectURL(data.data)
          const link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          window.URL.revokeObjectURL(link.href)
        }
      })
    }
  }
}
</script>
