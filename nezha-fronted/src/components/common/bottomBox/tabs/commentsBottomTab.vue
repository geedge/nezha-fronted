<template>
  <nz-bottom-data-list
      :showTitle='showTitle'
      :obj='obj'
      id="commentBottomTab"
    :api="url"
    :custom-table-title.sync="tools.customTableTitle"
    :tabs="tabs"
    :targetTab="targetTab"
    :showPagination="false"
    @search="search"
    @changeTab="changeTab"
  >
    <template v-slot:title><span :title="obj.name">{{obj.name}}</span></template>
    <template v-slot>
      <div class="textarea-box" :style="{height: rowBox ?'122px':'33px'}">
          <el-input
          type="textarea"
          :class="rowBox ? 'textarea-big' : 'textarea-small'"
          :placeholder="$t('overall.addComment') + '...'"
          v-model="editComment.content"
          @focus="stageZoomIn">
         </el-input>
         <div class="textarea-button" v-if="rowBox">
          <button class="nz-btn nz-btn-size-mini nz-btn-style-normal" style="margin-right: 10px" type="button"  @click="save(editComment,false)"><span>{{$t('overall.save')}}</span></button>
          <button class="nz-btn nz-btn-size-mini nz-btn-style-light" type="button" @click="cancel()"><span>{{$t('overall.cancel')}}</span></button>
         </div>
      </div>
      <div :style="{height: rowBox ?'calc(100% - 89px)':'100%'}">
      <assetCommentTable
        ref="dataTable"
        :orderByFa="'id'"
        v-my-loading="tools.loading"
        :loading="tools.loading"
        :api="url"
        :custom-table-title="tools.customTableTitle"
        :height="subTableHeight"
        :table-data="tableData"
        :terminaLogTab="true"
        @del="del"
        @save="save"
        @orderBy="tableDataSort"
        @reload="getTableData"
        @selectionChange="selectionChange"></assetCommentTable>
      </div>
    </template>
    <template v-slot:pagination>
      <Pagination ref="Pagination" :pageObj="pageObj" :tableId="tableId" @pageNo='pageNo' @pageSize='pageSize'></Pagination>
    </template>
  </nz-bottom-data-list>
</template>

<script>
import dataListMixin from '@/components/common/mixin/dataList'
import subDataListMixin from '@/components/common/mixin/subDataList'
import nzBottomDataList from '@/components/common/bottomBox/nzBottomDataList'
import assetCommentTable from '@/components/common/table/asset/assetCommentTable'
import detailViewRightMixin from '@/components/common/mixin/detailViewRightMixin'

export default {
  name: 'networkBottomTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    assetCommentTable
  },
  props: {
    obj: Object,
    showTitle: {
      type: Boolean,
      default: true
    }
  },
  watch: {
  },
  data () {
    return {
      url: 'asset/comment',
      tableId: 'assetCommentTable', // 需要分页的table的id，用于记录每页数量
      searchLabel: {},
      tableData: [],
      // 输入框参数
      rowBox: false,
      // 修改数据
      editComment: {
        id: '',
        content: '',
        assetId: '',
        replyId: ''
      }
    }
  },
  methods: {
    getTableData () {
      this.$set(this.searchLabel, 'pageSize', '-1')
      this.$set(this.searchLabel, 'assetId', this.obj.id)
      this.tools.loading = true
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    // 输入框聚焦事件
    stageZoomIn () {
      this.rowBox = true
    },
    // 取消事件
    cancel () {
      this.editComment.content = ''
      this.editComment.id = ''
      this.rowBox = false
    },
    save (data, flag) {
      const params = {
        ...data,
        assetId: this.obj.id
      }
      if (flag) {
        this.$put(this.url, params).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.$refs.dataTable.cancelEdit()
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      } else {
        this.$post(this.url, params).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.cancel()
            this.getTableData()
          } else {
            this.$message.error(response.msg)
          }
        })
      }
    },
    // 删除
    del (info) {
      this.$delete(this.url + '?ids=' + info.id).then(response => {
        if (response.code === 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
          this.getTableData()
        } else {
          this.$message.error(response.msg)
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
>>>.el-textarea__inner {
    resize: none;
}
.textarea-box{
  position: relative;
}
.textarea-button{
  position: absolute;
  bottom: 10px;
  right: 10px;
  .nz-btn.nz-btn-size-mini{
    width: 74px;
    height: 30px;
  }
}
</style>
