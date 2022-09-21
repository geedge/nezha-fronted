<template>
  <el-table
    id="assetCommentTable"
    ref="dataTable"
    :data="tableData"
    :height="height"
    :show-header="false"
    tooltip-effect="light"
    border
    @header-dragend="dragend"
    @sort-change="tableDataSort"
    @selection-change="selectionChange"
    @row-dblclick="(row)=>{queryMessage(row)}"
  >
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
                <span class="descriptions-time">{{utcTimeToTimezoneStr(scope.row.cts)}}</span>
                <i class="nz-icon nz-icon-edit descriptions-button" @click="edit(scope.row.id)" :title="$t('overall.edit')" style="margin-right: 18px;cursor: pointer;"></i>
                <i :title="$t('overall.delete')" @click="$emit('del', scope.row)" class="nz-icon nz-icon-delete descriptions-button" style="cursor: pointer;"></i>
            </div>
            <div v-if="editContentId == scope.row.id" class="textarea-box" style="height:122px;margin-top: 5px;margin-bottom: 0px;">
               <el-input
               type="textarea"
               style="height:calc(100% - 40px)"
               v-model="editComment.content">
               </el-input>
               <div class="textarea-button">
                <button class="nz-btn nz-btn-size-mini nz-btn-style-normal" style="margin-right: 10px" type="button"  @click="$emit('save', editComment,true)"><span>{{$t('overall.save')}}</span></button>
                <button class="nz-btn nz-btn-size-mini nz-btn-style-light" type="button" @click="cancelEdit()"><span>{{$t('overall.cancel')}}</span></button>
               </div>
            </div>
            <div v-else class="descriptions-content" >{{scope.row.content}}</div>
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
export default {
  name: 'assetCommentTable',
  mixins: [table],
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
        assetId: '',
        replyId: ''
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true
        }]
    }
  },
  methods: {
    // 修改
    async edit (id) {
      const response = await this.$get('asset/comment/' + id)
      if (response.code === 200) {
        this.editComment = {
          id: response.data.id,
          content: response.data.content,
          assetId: response.data.assetId,
          replyId: response.data.replyId
        }
      }
      this.editContentId = id
    },
    cancelEdit () {
      this.editContentId = ''
      this.editComment.content = ''
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
