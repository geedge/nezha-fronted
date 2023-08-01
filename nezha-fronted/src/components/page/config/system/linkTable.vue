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
          <template v-if="scope.row.edit">
            <template v-if="item.prop == 'name'">
              <el-popover :content="rules.name.message" placement="top" trigger="manual" v-model="rules.name.switch" popper-class="small-pop warn-pop" @after-enter="popShow(rules.name)">
                <el-input maxlength="64" show-word-limit slot="reference" v-model="scope.row[item.prop]" size="small" ></el-input>
              </el-popover>
            </template>
            <template v-if="item.prop == 'url'">
              <el-popover :content="rules.url.message" placement="top" trigger="manual" v-model="rules.url.switch" popper-class="small-pop warn-pop" @after-enter="popShow(rules.url)">
                <el-input maxlength="1024" show-word-limit slot="reference" v-model="scope.row[item.prop]" size="small" ></el-input>
              </el-popover>
            </template>
          </template>
          <template v-else>
            <template v-if="item.prop == 'creator'">
              {{scope.row[item.prop]?scope.row[item.prop].name:'-'}}
            </template>
            <template v-else-if="scope.row[item.prop]">{{scope.row[item.prop]}}</template>
            <template v-else>-</template>
          </template>
        </template>
      </el-table-column>
      <el-table-column
        :resizable="false"
        :width="operationWidth"
        fixed="right">
        <div slot="header" class="table-operation-title">{{$t('overall.option')}}</div>
        <div slot-scope="scope" class="table-operation-items">
          <template v-if="scope.row.edit">
            <button :disabled="prevent_opt.save" class="nz-btn nz-btn-size-mini nz-btn-style-normal" v-has="'system_link_edit'" style="margin-right: 10px" type="button"  @click="saveOrUpdate(scope.row)"><span>{{$t('overall.save')}}</span></button>
            <button :disabled="prevent_opt.save" class="nz-btn nz-btn-size-mini nz-btn-style-light" type="button" @click="cancel(scope.row)"><span>{{$t('overall.cancel')}}</span></button>
          </template>
          <template v-else>
            <button class="table-operation-item" v-has="'system_link_edit'" @click="toEdit(scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
            <el-dropdown size="medium" v-has="['system_link_delete']" trigger="click" @command="tableOperation">
              <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
                <i class="nz-icon nz-icon-more3"></i>
              </div>
              <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
                <el-dropdown-item v-has="'system_link_delete'" :command="['delete-rel', scope.row, {forceDeleteShow:false, single:true,from:'link'}]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
import bus from '../../../../libs/bus'
import table from '@/components/common/mixin/table'
export default {
  name: 'linkTable',
  props: {
    loading: Boolean
  },
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
          show: true
        }, {
          label: 'URL',
          prop: 'url',
          visibility: 'disabled',
          show: true
        }
      ],
      rules: {
        name: { required: true, message: this.$t('validate.required'), switch: false },
        url: { required: true, message: this.$t('validate.required'), switch: false }
      }
    }
  },
  beforeUpdate () {
    bus.$emit('link-data-change')
  },
  methods: {
    addLink: function () {
      if (this.tableData.every(t => !t.edit)) {
        this.tableData.unshift({
          id: '',
          name: '',
          url: '',
          edit: true
        })
      } else {
        this.setWarning()
      }
    }
  }
}
</script>
