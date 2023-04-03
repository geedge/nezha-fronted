<template>
  <nz-bottom-data-list
    :showTitle='showTitle'
    :obj='obj'
    :tableId="tableId"
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
      <div class="textarea-box" :style="{height: rowBox ?'184px':'33px','margin-bottom': '10px'}">
        <el-input
          v-if="!rowBox"
          type="textarea"
          class="textarea-small"
          :placeholder="$t('overall.addComment') + '...'"
          @focus="stageZoomIn">
        </el-input>
        <rich-text-editor v-else class="comment-editor" ref="richTextEditor" :placeholder="$t('overall.addComment') + '...'" :edit-data="editComment.html" @textChange="textChange(arguments)" style="height:100%;">
          <div class="textarea-button">
            <button class="nz-btn nz-btn-size-mini nz-btn-style-normal" style="margin-right: 10px" type="button"  @click="save(editComment,false)"><span>{{$t('overall.save')}}</span></button>
            <button class="nz-btn nz-btn-size-mini nz-btn-style-light" type="button" @click="cancel()"><span>{{$t('overall.cancel')}}</span></button>
          </div>
        </rich-text-editor>
      </div>
      <div :style="{height: rowBox ?'calc(100% - 184px)':'calc(100% - 35px)'}">
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
          @selectionChange="selectionChange">
        </assetCommentTable>
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
import richTextEditor from '@/components/chart/richTextEditor'

export default {
  name: 'commentsBottomTab',
  mixins: [dataListMixin, subDataListMixin, detailViewRightMixin],
  components: {
    nzBottomDataList,
    assetCommentTable,
    richTextEditor
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
        html: '',
        assetId: '',
        replyId: ''
      }
    }
  },
  methods: {
    textChange (val) {
      const html = `<div  class="editor-core ql-container ql-snow"><div class="ql-editor">${val[0]}</div></div>`
      this.editComment.html = html
      this.editComment.content = val[1].substr(0, val[1].length - 1)
    },
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
      this.$nextTick(() => {
        // 聚焦
        this.$refs.richTextEditor.quill.focus()
      })
    },
    // 取消事件
    cancel () {
      this.editComment.content = ''
      this.editComment.html = ''
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
