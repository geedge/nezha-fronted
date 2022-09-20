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
      <div class="textarea-box">
          <el-input
          type="textarea"
          :class="row"
          :placeholder="$t('overall.addComment') + '...'"
          v-model="editComment.content"
          @focus="stageZoomIn"
          style="margin-bottom:10px;">
         </el-input>
         <div class="textarea-button" v-if="textareaShow">
          <button class="nz-btn nz-btn-size-mini nz-btn-style-normal" style="margin-right: 10px" type="button"  @click="save(obj)"><span>{{$t('overall.save')}}</span></button>
          <button class="nz-btn nz-btn-size-mini nz-btn-style-light" type="button" @click="cancel()"><span>{{$t('overall.cancel')}}</span></button>
         </div>
      </div>
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
        @edit="edit"
        @orderBy="tableDataSort"
        @reload="getTableData"
        @selectionChange="selectionChange"></assetCommentTable>
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
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        this.searchLabel = { id: n.id }
        this.getTableData()
      }

    }
  },
  data () {
    return {
      url: 'asset/comment',
      tableId: 'assetCommentTable', // 需要分页的table的id，用于记录每页数量
      searchLabel: { id: this.obj.id },
      tableData: [],
      // 输入框参数
      row: 'add-small',
      textareaShow: false,
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
      this.$set(this.searchLabel, 'pageNo', this.pageObj.pageNo)
      this.$set(this.searchLabel, 'pageSize', this.pageObj.pageSize)
      this.searchLabel.id = this.obj.id
      this.tools.loading = true
      this.$get(this.url, this.searchLabel).then(response => {
        this.tools.loading = false
        if (response.code === 200) {
          this.tableData = response.data.list
          this.pageObj.total = response.data.total
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    // 输入框聚焦事件
    stageZoomIn () {
      this.row = 'add-big'
      setTimeout(() => {
        this.textareaShow = true
      })
    },
    // 取消事件
    cancel () {
      this.editComment.content = ''
      this.textareaShow = false
      this.row = 'add-small'
      this.editComment.id = ''
    },
    save (obj) {
      const params = {
        ...this.editComment,
        assetId: obj.id
      }
      if (this.editComment.id) {
        this.$put(this.url, params).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
            this.cancel()
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
    },
    // 修改
    async edit (id) {
      const response = await this.$get(this.url + '/' + id)
      if (response.code === 200) {
        this.editComment = {
          id: response.data.id,
          content: response.data.content,
          assetId: response.data.assetId,
          replyId: response.data.replyId
        }
      }
      this.stageZoomIn()
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
  bottom: 20px;
  right: 10px;
  .nz-btn.nz-btn-size-mini{
    width: 74px;
    height: 30px;
  }
}
</style>
