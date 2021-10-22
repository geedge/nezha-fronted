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
            <template v-if="item.prop == 'role'">
              <el-popover :content="rules.roleId.message" placement="top" trigger="manual" v-model="rules.roleId.switch" popper-class="small-pop warn-pop" @after-enter="popShow(rules.roleId)">
                <el-select v-model="scope.row[item.prop]" size="small" :placeholder="$t('el.select.placeholder')" value-key="id" slot="reference" popper-class="api-select right-public-box-select-top right-public-box-dropdown-top role-system-table">
                  <template v-for="role in roles" >
                    <el-option :label="role.name" :value="role"></el-option>
                  </template>
                </el-select>
              </el-popover>
            </template>
            <template v-if="item.prop == 'expireAt'">
<!--              <el-popover :content="rules.expireAt.message" placement="top" trigger="manual" v-model="rules.expireAt.switch" popper-class="small-pop warn-pop" @after-enter="popShow(rules.expireAt)">-->
                <my-date-picker
                  slot="reference"
                  style="width: 100%;"
                  v-model="scope.row[item.prop]"
                  prefix-icon=" " size="small" ref="calendar"
                  format="yyyy-MM-dd HH:mm:ss"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  type="datetime"
                  popper-class="item-system-table right-public-box-dropdown-top right-public-box-select-top"
                  :picker-options="pickerOptions"
                  :placeholder="$t('el.datepicker.selectTime')">
                </my-date-picker>
<!--              </el-popover>-->
            </template>
          </template>
          <template v-else>
            <template v-if="item.prop == 'createUser'">
              {{scope.row[item.prop]?scope.row[item.prop].name:'-'}}
            </template>
            <template v-else-if="item.prop == 'role'">
              {{scope.row[item.prop]?scope.row[item.prop].name:'-'}}
            </template>
            <template v-else-if="item.prop == 'expireAt'">
              {{scope.row[item.prop]?utcTimeToTimezoneStr(scope.row[item.prop]):$t('config.system.apiKey.noExpire')}}
            </template>
            <template v-else-if="item.prop == 'createAt'">
              {{scope.row[item.prop]?utcTimeToTimezoneStr(scope.row[item.prop]):$t('config.system.apiKey.noExpire')}}
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
            <button type="button" class="nz-btn nz-btn-size-mini-new nz-btn-style-normal-new" v-has="'system_apiKey_edit'" :disabled="prevent_opt.save" @click="save(scope.row)"  style="margin-right: 10px"><span>{{$t('overall.save')}}</span></button>
            <button type="button" class="nz-btn nz-btn-size-mini-new nz-btn-style-light-new" @click="cancel(scope.row)" :disabled="prevent_opt.save"><span>{{$t('overall.cancel')}}</span></button>
          </template>
          <template v-else>
            <button class="table-operation-item" @click="$emit('del',scope.row)" v-has="'system_apiKey_delete'"><i class="nz-icon nz-icon-delete"></i></button>
          </template>
        </div>
      </el-table-column>
      <template v-if="!loading" slot="empty">
        <div class="right-no-data">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#nz-icon-no-data-list"></use>
          </svg>
          <div style="font-size: 16px;color: #333333;font-weight: 400;">No results found</div>
        </div>
      </template>
    </el-table>
</template>

<script>
import { tableCommon } from './systemCommon'
import table from '@/components/common/mixin/table'
export default {
  name: 'apiKeyTable',
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
          label: 'Token',
          prop: 'token',
          show: true
        }, {
          label: this.$t('config.system.apiKey.role'),
          prop: 'role',
          show: true
        }, {
          label: this.$t('config.system.apiKey.expireAt'),
          prop: 'expireAt',
          show: true
        }, {
          label: this.$t('config.system.apiKey.create'),
          prop: 'createUser',
          show: true
        }, {
          label: this.$t('config.system.apiKey.creatAt'),
          prop: 'createAt',
          minWidth: 100,
          show: true
        }
      ],
      roles: [],
      rules: {
        name: { required: true, message: this.$t('validate.required'), switch: false },
        roleId: { required: true, message: this.$t('validate.required'), switch: false }
        // expireAt: { required: true, message: this.$t('validate.required'), switch: false }
      },
      pickerOptions: {
        // 限制预约时间
        disabledDate (time) {
          return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
        }
      }
    }
  },
  methods: {
    addApiKey: function () {
      if (this.tableData.every(t => !t.edit)) {
        this.tableData.unshift({
          id: '',
          name: '',
          role: {
            id: '',
            name: ''
          },
          expireAt: '',
          edit: true
        })
      } else {
        this.setWarning()
      }
    },
    getRoles: function () {
      this.$get('sys/role?pageSize=-1').then(response => {
        if (response.code === 200) {
          this.roles = response.data.list
        }
      })
    },
    save: function (obj) {
      const copy = JSON.parse(JSON.stringify(obj))
      copy.expireAt = this.timezoneToUtcTimeStr(copy.expireAt)
      if (copy.role) {
        copy.roleId = copy.role.id
      }
      delete copy.role
      this.saveOrUpdate(copy)
    }
  },
  mounted () {

  }
}
</script>
<style>

</style>
