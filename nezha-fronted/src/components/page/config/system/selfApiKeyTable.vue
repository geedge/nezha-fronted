<template>
    <el-table
      :id="tableId"
      ref="dataTable"
      :data="tableData"
      :height="height"
      border
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
        :key="`col-${index}`"
        :fixed="item.fixed"
        :label="item.label"
        :min-width="`${item.minWidth}`"
        :prop="item.prop"
        :resizable="true"
        :sort-orders="['ascending', 'descending']"
        :width="`${item.width}`"
        class="data-column"
      >
        <template slot="header">
          <span>{{item.label}}</span>
          <div class="col-resize-area"></div>
        </template>
        <template slot-scope="scope" :column="item">
           <template v-if="item.prop == 'id'">
               {{scope.row[item.prop]}}
            </template>
            <template v-if="item.prop == 'name'">
               {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
            </template>
             <template v-if="item.prop == 'token'">
              <copy :copyData='scope.row[item.prop]' :showInfo='scope.row.name'>
                  <template slot="copy-text">
                     {{scope.row[item.prop]?scope.row[item.prop].replace(reg, '*'):'-'}}
                  </template>
              </copy>
            </template>
             <template v-if="item.prop == 'expireAt'">
              {{scope.row[item.prop]?utcTimeToTimezoneStr(scope.row[item.prop]):'-'}}
            </template>
            <template v-if="item.prop == 'createAt'">
              {{scope.row[item.prop]?utcTimeToTimezoneStr(scope.row[item.prop]):'-'}}
            </template>
             <template v-if="item.prop == 'remark'">
              {{scope.row[item.prop]?scope.row[item.prop]:'-'}}
            </template>
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        :width="operationWidth"
        fixed="right">
        <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
        <div slot-scope="scope" v-has="['system_apiKey_edit','system_apiKey_delete']" class="table-operation-items">
          <template v-if="scope.row.edit">
            <button v-has="'system_apiKey_edit'" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-mini nz-btn-style-normal" style="margin-right: 10px" type="button"  @click="save(scope.row)"><span>{{$t('overall.save')}}</span></button>
            <button :disabled="prevent_opt.save" class="nz-btn nz-btn-size-mini nz-btn-style-light" type="button" @click="cancel(scope.row)"><span>{{$t('overall.cancel')}}</span></button>
          </template>
          <template v-else>
            <!-- <button class="table-operation-item" @click="$emit('del',scope.row)" v-has="'system_apiKey_delete'"><i class="nz-icon nz-icon-delete"></i></button> -->
           <div @click="tableOperation(scope.row)" v-has="'system_apiKey_delete'">
              <delete-button
              ref="deleteButton"
              :forceDeleteShow="false"
              id="self-apiKey-delete"
              :from="'selfApiKey'"
              :type="'btn'"
              :api="api"
              :single="true"
              :delete-objs="singleDelete"
               @before="delFlag=true"
              ></delete-button>
            </div>
          </template>
        </div>
      </el-table-column>
      <template  slot="empty">
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
import { tableCommon } from './systemCommon'
import table from '@/components/common/mixin/table'
import deleteButton from '@/components/common/deleteButton'
import copy from '@/components/common/copy'
export default {
  name: 'selfApiKeyTable',
  props: {
    loading: Boolean
  },
  components: { deleteButton, copy },
  mixins: [table, tableCommon],
  data () {
    return {
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: this.$t('overall.name'),
          prop: 'name',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('apiKey.key'),
          prop: 'token',
          minWidth: 180,
          show: false
        }, {
          label: this.$t('config.system.apiKey.expireAt'),
          prop: 'expireAt',
          minWidth: 100,
          show: true
        }, {
          label: this.$t('config.system.apiKey.creatAt'),
          prop: 'createAt',
          minWidth: 100,
          show: false
        }, {
          label: this.$t('overall.remark'),
          prop: 'remark',
          minWidth: 100,
          show: true
        }
      ],
      reg: new RegExp('(?<=.{8}).', 'g')
    }
  },
  methods: {
    // timeFormates (data) {
    //   if (localStorage.getItem('nz-default-dateFormat')) {
    //     return bus.timeFormate(new Date(data), localStorage.getItem('nz-default-dateFormat'))
    //   } else {
    //     return bus.timeFormate(new Date(data), 'YYYY-MM-DD HH:mm:ss')
    //   }
    // }
    tableOperation (row) {
      if (this.singleDelete.length === 0) {
        this.singleDelete.push(row)
      } else {
        this.singleDelete = []
        this.singleDelete.push(row)
      }
    }
  },
  created () {
  },
  mounted () {
  }
}
</script>
