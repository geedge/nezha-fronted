<template>
  <div class="detail-left-box">
    <div class="order-box">
      <el-select v-model="orderBy" size="small" :placeholder="$t('asset.detail.orderBy')" popper-class="right-box-select-top" class="detail-select">
        <el-option
          v-for="item in tableTitle"
          v-if="item.sortable==='custom'"
          :key="item.prop"
          :label="$t('asset.detail.orderByLabel',{label:item.label})"
          :value="item.prop">
          {{item.label}}
        </el-option>
      </el-select>
      <button @click="orderTypeChange" size="small" class="detail-button top-tool-btn table-column-setting margin-l-10">
        <i class="nz-icon nz-icon-arrow-up1" v-if="orderType=='ascending'"  :title="$t('dashboard.explore.ascending')"/>
        <i class="nz-icon nz-icon-arrow-down2" v-if="orderType=='descending'"  :title="$t('dashboard.explore.descending')"/>
      </button>
    </div>
    <ul class="detail-row-box" ref="dataTable">
      <li
        v-for="(item,index) in tableData"
        :key="index"
        class="detail-row"
        :id="'globalSearch' + item.id"
        :class="item.id === detailViewRightObj.id ? 'selected' : ''"
        @click="detailViewRightShow(item)"
        @mouseenter="labelHover(item, 'notebook', true, $event)"
        @mouseleave="labelHover(item, 'notebook', false)">
        <div class="detail-row-info" :title="item.name">
          <div class="asset-manageIp">
            <span class="author-avatar">{{item.createUser ? item.createUser.name.substr(0, 1) : '-'}}</span>
            <span>{{item.name}}</span>
          </div>
          <div class="asset-name" style="padding-left:25px;">
            <span>{{item.createUser ? item.createUser.name : '-'}}</span>
          </div>
        </div>
        <alertLabel
          v-if="item && item.loading"
          :id="item.id"
          :that="item"
          :detail-list="true"
          :type="'notebook'"
        ></alertLabel>
      </li>
    </ul>
  </div>
</template>

<script>

import detailViewLeftMixin from '@/components/common/mixin/detailViewLeftMixin'
import alertLabel from '@/components/common/alert/alertLabel'
export default {
  name: 'notebookDetail',
  mixins: [detailViewLeftMixin],
  components: {
    alertLabel
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
          minWidth: 200,
          sortable: 'custom'
        }, {
          label: this.$t('notebook.author'),
          prop: 'createUser',
          show: true,
          minWidth: 300
        }, {
          label: this.$t('notebook.modifiedTime'),
          prop: 'uts',
          show: true,
          minWidth: 200
        }
      ]
    }
  },
  methods: {
    detailViewRightShow (item) {
      this.$store.commit('setNotebookEdit', false)
      this.$emit('detailViewRightShow', item)
    },
    // label 鼠标划入
    labelHover (item, type, loading, e) {
      if (e) {
        const dom = e.currentTarget
        const position = dom.getBoundingClientRect()
        this.$set(item, 'position', position)
      }
      this.$set(item, 'loading', loading)
    }
  }
}
</script>
