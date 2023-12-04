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
          <template v-else-if="item.prop === 'category'">
            <div>
              {{scope.row.type ? scope.row.type.category : '-'}}
            </div>
          </template>
          <template v-else-if="item.prop === 'type'">
            {{scope.row.type ? scope.row.type.name : '-'}}
          </template>
          <template v-else-if="item.prop === 'asset'">
            <div>
              <div class="document-copy-block" v-if="scope.row.asset">
              <span
                class="document-copy-text"
                :title="scope.row.asset&&scope.row.asset.name"
                @mouseenter="labelHover(scope.row, item.prop, true,true, $event)"
                @mouseleave="labelHover(scope.row, item.prop, false,true)">
                <i class="nz-icon nz-icon-overview-project monitorColor color23BF9A"></i>
                {{scope.row.asset&&scope.row.asset.name}}
              </span>
                <i v-if="scope.row.asset&&scope.row.asset.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(scope.row.asset.name)" :title="$t('overall.copyText')"></i>
              </div>
              <span v-else>--</span>
            </div>
          </template>
          <span v-else-if="item.prop === 'dateIssued' || item.prop === 'dateExpires'">{{ scope.row[item.prop] ? momentTz(scope.row[item.prop] ) : '-'}}</span>
          <!-- status -->
          <template v-else-if="item.prop === 'status'">
            <div v-if="scope.row.status === 1">
              <i class="nz-icon nz-icon-import-success1" style="color:#8dcb4b;"></i>
              <span>{{$t('licenseMange.licensed')}}</span>
            </div>
            <div v-else-if="scope.row.status == 2">
              <i class="nz-icon nz-icon-stop" style="color:#bebebe;"></i>
              <span>{{ $t('licenseMange.notLicensed') }}</span>
            </div>
            <div v-else>-</div>
          </template>
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
          <!-- <button class="table-operation-item" @click="showBottomBox('endpoint', scope.row)" :title="$t('overall.view')"><i class="nz-icon nz-icon-view1"></i></button> -->
          <button class="table-operation-item" v-has="'softwareAsset_edit'" @click="tableOperation(['edit', scope.row])" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
          <el-dropdown size="medium" v-has="['softwareAsset_edit','softwareAsset_add','softwareAsset_delete']" trigger="click" @command="tableOperation">
            <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
              <i class="nz-icon nz-icon-more3"></i>
            </div>
            <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
              <el-dropdown-item v-has="'softwareAsset_add'" :command="['copy', scope.row]"><i class="nz-icon nz-icon-override"></i><span class="operation-dropdown-text">{{$t('overall.duplicate')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'softwareAsset_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:true, single:true,from:'softwareAsset'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              <el-dropdown-item v-has="'softwareAsset_edit'" :command="['upload', scope.row]" @click.native="upload(scope.row)">
                <i class="nz-icon nz-icon-upload"></i><span class="operation-dropdown-text">{{$t('softwareAsset.upload')}}</span>
              </el-dropdown-item>
              <el-dropdown-item v-has="'softwareAsset_edit'" :command="['download', scope.row]" @click.native="download(scope.row)">
                <i class="nz-icon nz-icon-download1"></i><span class="operation-dropdown-text">{{$t('softwareAsset.download')}}</span>
              </el-dropdown-item>
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
    <alertLabel
      v-if="alertLabelShow"
      :id="alertLabelId"
      :that="alertLabelObj"
      :type="alertLabelType"
    ></alertLabel>
    <el-upload
      action=""
      :auto-upload="false"
      accept=".v2c,.V2CP,.H2R,.R2H,.H2H,.ID "
      :on-change="uploadChange"
      style="display: none"
      ref="upload"
    >
    </el-upload>
  </div>
</template>

<script>
import table from '@/components/common/mixin/table'
import copy from '@/components/common/copy'
import alertLabelMixin from '@/components/common/mixin/alertLabelMixin'
import axios from 'axios'
export default {
  name: 'softwareTable',
  mixins: [table, alertLabelMixin],
  components: { copy },
  props: {
    loading: Boolean
  },
  data () {
    return {
      viewPermission: 'softwareAsset_view',
      tableTitle: [ // 原始table列
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
          width: 200,
          sortable: 'custom'
        }, {
          label: this.$t('softwareType.category'),
          prop: 'category',
          show: true,
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('overall.type'),
          prop: 'type',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('asset.asset'),
          prop: 'asset',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('licenseMange.dateIssue'),
          prop: 'dateIssued',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('licenseMange.dateExpire'),
          prop: 'dateExpires',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('licenseMange.licenseStatus'),
          prop: 'status',
          minWidth: 200,
          show: true
        }, {
          label: this.$t('licenseMange.concurrency'),
          prop: 'concurrency',
          minWidth: 150,
          show: true
        }, {
          label: this.$t('licenseMange.logins'),
          prop: 'logins',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          minWidth: 200,
          show: true
        }
      ],
      uploadId: undefined
    }
  },
  methods: {
    // 上传V2C
    upload (row) {
      this.uploadId = row.id
      this.$refs.upload.$children[0].$refs.input.click()
    },
    async uploadChange (file) {
      const form = new FormData()
      form.append('file', file.raw)
      form.append('saId', this.uploadId)
      const res = await this.$post('/license/uploadV2C', form, { 'Content-Type': 'multipart/form-data' })
      if (res.code === 200) {
        this.$emit('reload')
        this.$message.success(this.$t('tip.uploadSuccess'))
      } else {
        this.$message.error(res.msg)
      }
    },
    // 下载C2V
    download (row) {
      const params = {
        saId: row.id
      }
      axios.get('/license/downloadC2V', { responseType: 'blob', params: params }).then(res => {
        const filename = row.name + '.c2v'
        if (window.navigator.msSaveOrOpenBlob) {
          // 兼容ie11
          const blobObject = new Blob([res.data])
          window.navigator.msSaveOrOpenBlob(blobObject, filename)
        } else {
          const url = URL.createObjectURL(new Blob([res.data]))
          const a = document.createElement('a')
          document.body.appendChild(a) // 此处增加了将创建的添加到body当中
          a.href = url
          a.download = filename
          a.target = '_blank'
          a.click()
          a.remove() // 将a标签移除
        }
      }, error => {
        const $self = this
        const reader = new FileReader()
        reader.onload = function (event) {
          const responseText = reader.result
          const exception = JSON.parse(responseText)
          if (exception.message) {
            $self.$message.error(exception.message)
          } else if (exception.msg) {
            $self.$message.error(exception.msg)
          } else {
            console.error(error)
          }
        }
        reader.readAsText(error.response.data)
      })
    },
    copyValue (item) {
      const str = item
      this.$copyText(JSON.stringify(str)).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    }
  }
}
</script>
