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
                <el-input slot="reference" maxlength="64" show-word-limit v-model="scope.row[item.prop]" size="small" ></el-input>
              </el-popover>
            </template>
            <template v-if="item.prop == 'filePath'">
              <el-popover :content="rules.filePath.message" placement="top" trigger="manual" v-model="rules.filePath.switch" popper-class="small-pop warn-pop" @after-enter="popShow(rules.filePath)">
                <el-input slot="reference" maxlength="256" show-word-limit v-model="scope.row[item.prop]" size="small" ></el-input>
              </el-popover>
            </template>
            <template v-if="item.prop == 'account'">
              <el-popover :content="rules.account.message" placement="top" trigger="manual" v-model="rules.account.switch" popper-class="small-pop warn-pop" @after-enter="popShow(rules.account)">
                <el-select slot="reference" v-model="scope.row[item.prop]" :placeholder="$t('el.select.placeholder')" size="small" popper-class="right-box-select-top right-public-box-dropdown-top">
                  <template v-for="param in accountParams">
                    <el-option :label="param.label" :value="param.value"></el-option>
                  </template>
                </el-select>
              </el-popover>
            </template>
            <template v-if="item.prop == 'state'"><el-switch v-model="scope.row.state" active-color="#ee9d3f" :active-value="1" :inactive-value="0" /></template>
          </template>
          <template v-else>
            <template v-if="item.prop == 'state'">
              <el-switch :disabled="true" v-model="scope.row.state" :active-value="1" :inactive-value="0" />
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
            <button :disabled="prevent_opt.save" class="nz-btn nz-btn-size-mini nz-btn-style-normal" v-has="'system_notification_edit'" style="margin-right: 10px" type="button" @click="saveOrUpdate(scope.row)"><span>{{$t('overall.save')}}</span></button>
            <button :disabled="prevent_opt.save" class="nz-btn nz-btn-size-mini nz-btn-style-light" type="button" @click="cancel(scope.row)"><span>{{$t('overall.cancel')}}</span></button>
          </template>
          <template v-else>
            <button v-has="'system_notification_edit'" :class="{'table-operation-item--disable':isBuiltIn(scope.row)}" :disabled="isBuiltIn(scope.row)" class="table-operation-item" @click="toEdit(scope.row)" :title="$t('overall.edit')"><i class="nz-icon nz-icon-edit"></i></button>
            <el-dropdown size="medium" trigger="click" v-has="['system_notification_delete']" @command="tableOperation">
              <div class="table-operation-item table-operation-item--more" :title="$t('overall.moreOperations')">
                <i class="nz-icon nz-icon-more3"></i>
              </div>
              <el-dropdown-menu slot="dropdown" class="right-box-select-top right-public-box-dropdown-top">
                <!-- <el-dropdown-item v-has="'system_notification_delete'" :command="['delete', scope.row]"><i class="nz-icon nz-icon-delete"></i><span class="operation-dropdown-text">{{$t('overall.delete')}}</span></el-dropdown-item> -->
                <el-dropdown-item v-has="'system_notification_delete'" :command="['delete', scope.row]">
                  <delete-button
                  ref="deleteButton"
                  :from="'notifyMethod'"
                  :forceDeleteShow="false"
                  :type="'link'"
                  :title="$t('overall.delete')"
                  id="notify-method-delete"
                  :api="api"
                  :single="true"
                  :delete-objs="singleDelete"
                  @before="delFlag=true"
                  ></delete-button>
              </el-dropdown-item>
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
import table from '@/components/common/mixin/table'
import { tableCommon } from './systemCommon'
import deleteButton from '@/components/common/deleteButton'
export default {
  name: 'notifyMethodTable',
  props: {
    loading: Boolean
  },
  components: { deleteButton },
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
          label: this.$t('webshell.filePath'),
          prop: 'filePath',
          visibility: 'disabled',
          show: true
        }, {
          label: this.$t('config.system.notification.account'),
          prop: 'account',
          visibility: 'disabled',
          show: true
        }, {
          label: this.$t('overall.state'),
          prop: 'state',
          show: true
        }
      ],
      accountParams: [
        {
          label: 'id',
          value: 'id'
        }, {
          label: 'name',
          value: 'name'
        }, {
          label: 'username',
          value: 'username'
        }, {
          label: 'email',
          value: 'email'
        }, {
          label: 'mobile',
          value: 'mobile'
        }
      ],
      rules: {
        name: { required: true, message: this.$t('validate.required'), switch: false },
        account: { required: true, message: this.$t('validate.required'), switch: false },
        filePath: { required: true, message: this.$t('validate.required'), switch: false }
      },
      copy: null
    }
  },
  methods: {
    addNotify: function () {
      if (this.tableData.every(t => !t.edit)) {
        this.tableData.unshift({
          id: '',
          name: '',
          account: '',
          state: 1,
          filePath: '',
          edit: true
        })
      } else {
        this.setWarning()
      }
    }
  }
}
</script>
