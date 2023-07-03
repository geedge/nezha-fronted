<template>
  <el-table
    id="assetCommentTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    :show-header="false"
    tooltip-effect="light"
    class="resize-rich-text-editor-table"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
  >
    <el-table-column
      v-for="(item, index) in customTableTitle"
      :key="`col-${index}-${item.prop}`"
      :fixed="item.fixed"
      :label="item.label"
      :min-width="`${item.minWidth}`"
      :prop="item.prop"
      :resizable="true"
      :sort-orders="['ascending', 'descending']"
      :sortable="item.sortable"
      :width="`${item.width}`"
      :show-overflow-tooltip="item.prop === 'description'"
      class="data-column"
    >
      <template slot="header">
        <span class="data-column__span">{{item.label}}</span>
        <div class="col-resize-area"></div>
      </template>
      <template slot-scope="scope" :column="item">
        <div class="descriptions-info">
          <div>
            <i class="nz-icon nz-icon-user" style="margin-right: 4px;"></i>
            <span class="descriptions-name">{{scope.row.createUser.name}}</span>
            <span class="descriptions-name-small">@{{scope.row.createUser.name}}</span>
            <span class="descriptions-time">{{momentTz(scope.row.cts)}}</span>
            <i v-if="scope.row.createUser.id == userId" class="nz-icon nz-icon-edit descriptions-button" @click="edit(scope.row.id)" :title="$t('overall.edit')" style="margin-right: 18px;cursor: pointer;"></i>
            <i v-if="scope.row.createUser.id == userId" class="nz-icon nz-icon-delete descriptions-button" @click="$emit('del', scope.row)" :title="$t('overall.delete')" style="cursor: pointer;"></i>
          </div>
          <div v-if="editContentId == scope.row.id" class="textarea-box" style="height:184px;margin-top: 5px;min-height: 184px">
            <rich-text-editor class="comment-editor" ref="richTextEditor" :edit-data="editComment.html" @textChange="textChange(arguments)" style="height:100%;">
              <div class="textarea-button">
                <button class="nz-btn nz-btn-size-mini nz-btn-style-normal" style="margin-right: 10px" type="button"  @click="$emit('save', editComment,true)"><span>{{$t('overall.save')}}</span></button>
                <button class="nz-btn nz-btn-size-mini nz-btn-style-light" type="button" @click="cancelEdit()"><span>{{$t('overall.cancel')}}</span></button>
              </div>
            </rich-text-editor>
          </div>
          <div v-else class="descriptions-content" v-html="scope.row.html"></div>
        </div>
      </template>
    </el-table-column>
    <template slot="empty">
      <div  v-if="!loading"  class="table-no-data">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#nz-icon-a-NoComment"></use>
        </svg>
        <div class="table-no-data__title">No Comment</div>
      </div>
      <div v-else>&nbsp;</div>
    </template>
  </el-table>
</template>

<script>
import table from '@/components/common/mixin/table'
import richTextEditor from '@/components/chart/richTextEditor'
export default {
  name: 'assetCommentTable',
  mixins: [table],
  components: {
    richTextEditor
  },
  props: {
    loading: Boolean
  },
  data () {
    return {
      editContentId: '',
      // 修改数据
      editComment: {
        id: '',
        content: '',
        html: '',
        assetId: '',
        replyId: ''
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id'
        }
      ],
      // 当前用户id
      userId: localStorage.getItem('nz-user-id')
    }
  },
  methods: {
    textChange (val) {
      const html = `<div  class="editor-core ql-container ql-snow"><div class="ql-editor">${val[0]}</div></div>`
      this.editComment.html = html
      this.editComment.content = val[1].substr(0, val[1].length - 1)
    },
    // 修改
    async edit (id) {
      if (this.editContentId == id) return
      const response = await this.$get('asset/comment/' + id)
      if (response.code === 200) {
        this.editComment = {
          id: response.data.id,
          content: response.data.content,
          html: response.data.html,
          assetId: response.data.assetId,
          replyId: response.data.replyId
        }
      }
      this.editContentId = id
      this.$nextTick(() => {
        this.$refs.dataTable.doLayout()
      })
    },
    cancelEdit () {
      this.editContentId = ''
      this.editComment.content = ''
      this.editComment.html = ''
    }
  }
}
</script>
