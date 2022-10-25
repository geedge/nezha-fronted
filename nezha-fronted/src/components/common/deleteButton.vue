<template>
  <div>
    <div :class="['delete-button',(deleteObjs.length<1?'':'delete-button-light')]">
      <button v-if="this.type === 'button'" :id="id" :class="{'nz-btn-disabled' : deleteObjs.length<1}" class="top-tool-btn top-tool-btn--delete" @click="batchDelete" :title="$t('overall.delete')">
        <span><i class="nz-icon nz-icon-delete" ></i></span>
      </button>
    </div>
    <button v-if="this.type === 'btn'" class="table-operation-item delete-button" :id="id" @click="batchDelete" :title="$t('overall.delete')"><i class="nz-icon nz-icon-delete"></i></button>
    <div v-if="this.type === 'link'" :id="id" @click="batchDelete" :title="$t('overall.delete')">
      <span><i class="nz-icon nz-icon-delete" ></i>{{title}}</span>
    </div>
    <el-dialog
      ref="batchDeleteDialog"
      id="batch-delete-dialog"
      class="batch-delete-dialog"
      :title="$t('deleteButton.confirm')"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      @close='handleClose'
      width="660px"
      :modal-append-to-body="true"
      :append-to-body="true"
    >
      <!--  -->
      <div class="dialog-header" style="vertical-align:top;"  v-if="prepare">
        <i class="nz-icon nz-icon-jinggao"></i>
        <span>{{$t('batch.prepare', { dataLength: idStr.length })}}</span>
      </div>
      <!--  -->
      <div class="dialog-header" style="vertical-align:top;" v-if="process">
        <i class="nz-icon nz-icon-import-failed1"></i>
        <span>{{$t('batch.process', {title: $t(deleteTitle)})}}</span>
      </div>
      <!--  -->
      <div class="dialog-header" style="vertical-align:top;" v-if="finish">
        <i class="nz-icon nz-icon-import-success1"></i>
        <span>{{$t('batch.finish', {title: $t(deleteTitle)})}}</span>
      </div>
      <div class="batch-delete-tree">
        <div class="tree-header tree-body-item">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange" v-if="!finish"></el-checkbox>
          <div class="batch-delete-item-id" v-if="idShow">ID</div>
          <div class="batch-delete-item-name">{{$t('overall.name')}}</div>
        </div>
        <el-checkbox-group v-model="idStr" @change="checkedChange">
          <div class="tree-body">
            <div v-for="(item,index) in deleteData" :key = 'index' class="tree-body-item">
              <el-checkbox :key="item.id" :label="item.id"  v-if="!finish"></el-checkbox>
              <div class="batch-delete-item-id" v-if="idShow">{{item.id}}</div>
              <div class="batch-delete-item-name" @click="showChild(item)">
                <i class="nz-icon nz-icon-caret-right" :class="item.showChildren ? 'rotate90': '' " :style="item.relates && item.relates.length ? '': 'opacity: 0'"/>
                <i :class="selectIcon(item.type)"/>
                <span class="text-ellipsis batch-delete-item-text" :title="item.name">{{item.name}}</span>
                <el-collapse-transition>
                  <div v-show="item.showChildren && item.relates && item.relates.length">
                    <div v-for="(relate,i) in item.relates" :key = 'i' class="tree-body-item tree-body-children" @click="showChild(relate)" :style="i === item.relates.length-1?'margin-bottom: 0':''">
                      <i class="nz-icon nz-icon-caret-right" :class="relate.showChildren ? 'rotate90': '' " :style="relate.relates && relate.relates.length ? '' : 'opacity: 0'"/>
                      <i :class="selectIcon(relate.type)"/>
                      <span class="text-ellipsis batch-delete-item-text" :title="relate.name"> {{relate.name}}</span>
                      <div class="text-ellipsis batch-delete-item-text" :title="relate.name" v-if="relate.showChildren && relate.relates && relate.relates.length">
                        <div v-for="(cildren,j) in relate.relates" :key = 'j' class="tree-body-item tree-body-children" :style="j === relate.relates.length-1?'margin-bottom: 0':''">
                          <i :class="selectIcon(cildren.type)"/>
                          <span class="text-ellipsis batch-delete-item-text" :title="cildren.name">{{cildren.name}}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-collapse-transition>
              </div>
            </div>
          </div>
        </el-checkbox-group>
      </div>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer right-box__footer batch-delete-footer" v-if="!finish">
        <div>
          <button id="batch-delete-cancel" class="footer__btn footer__btn--light" style="margin-top: 8px;"  type="button" @click="dialogVisible = false">{{$t('tip.no')}}</button>
          <button id="batch-delete-next" class="footer__btn"  type="button" @click="batchDeleteYes">{{$t('tip.yes')}}</button>
        </div>
        <div v-if="forceDeleteShow">
          <el-checkbox v-model="forceDelete" text-color="black" name="type" :true-label="1" :false-label="0"></el-checkbox>
          <span class="check-title">{{$t('batch.forceDelete')}}</span>
        </div>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import bus from '@/libs/bus'
export default {
  name: 'deleteButton',
  data () {
    return {
      prepare: true,
      process: false,
      finish: false,
      dialogVisible: false,
      idShow: true,
      idStr: [],
      backupName: [],
      deleteData: [],
      forceDelete: 0,
      batchDeleteObjs: [],
      checkAll: false,
      isIndeterminate: false
    }
  },
  props: {
    forceDeleteShow: { // 是否显示强制删除
      type: Boolean,
      default: false
    },
    filterFunction: Function,
    deleteObjs: Array, // 删除的数组
    api: String, // 删除的接口
    from: String, // 通过 from 确认删除的 icon
    clickFunction: Function,
    id: String,
    type: { // 删除按钮的样式 是按钮 还是文字
      type: String,
      default: 'button'
    },
    title: {
      type: String
    },
    deleteTitle: { // 删除的名称
      type: String,
      default: 'project.topology.data'
    },
    single: { // 是否需要强制删除
      type: Boolean
    }
  },
  inject: ['getTableData'],
  methods: {
    batchDelete: function () {
      if (!this.single) {
        this.$emit('before')
        if (this.deleteObjs.length < 1) return
        if (this.clickFunction) {
          this.clickFunction()
          return
        }
        this.idShow = true
        this.prepare = true
        this.process = false
        this.finish = false
        this.forceDelete = 0
        this.deleteData = this.$loadsh.cloneDeep(this.deleteObjs).map(item => {
          item.type = this.from
          return item
        })
        this.checkAll = true
        this.idStr = this.deleteData.map(item => item.id)
        this.dialogVisible = true
      } else {
        setTimeout(() => {
          this.$emit('before')
          if (this.deleteObjs.length < 1) return
          if (this.clickFunction) {
            this.clickFunction()
            return
          }
          this.idShow = true
          this.prepare = true
          this.process = false
          this.finish = false
          this.forceDelete = 0
          this.deleteData = this.$loadsh.cloneDeep(this.deleteObjs).map(item => {
            item.type = this.from
            return item
          })
          this.checkAll = true
          this.idStr = this.deleteData.map(item => item.id)
          if (this.from == 'backup') {
            this.backupName = this.deleteData.map(item => item.fileName)
          }
          this.dialogVisible = true
        }, 50)
      }
    },
    handleClose () {
      this.dialogVisible = false
      if (this.finish) {
        this.$emit('after')
        if (this.single) {
          this.getTableData()
        }
      }
    },
    batchDeleteYes () {
      if (!this.forceDeleteShow) {
        this.forceDelete = 1
      }
      this.$delete(this.api + `?ids=${this.idStr.join(',')}&force=${this.forceDelete}` + `${this.from == 'backup' ? '&filename=' + this.backupName : ''}`).then(res => {
        this.idShow = false
        this.prepare = false
        this.process = true
        this.finish = false
        if (res.data && res.data.list && res.code !== 200) {
          this.deleteData = res.data.list.map(item => {
            item.showChildren = true
            item.relates && item.relates.forEach(relate => {
              relate.showChildren = true
            })
            return item
          })
          this.idStr = this.deleteData.map(item => item.id)
        } else if (res.code === 200) {
          this.idShow = false
          this.prepare = false
          this.process = false
          this.finish = true
          this.deleteData = this.deleteData.filter(item => {
            return this.idStr.indexOf(item.id) !== -1
          })
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
          // this.$emit('after')
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    showProcess (arr) {
      this.idShow = false
      this.prepare = false
      this.process = true
      this.finish = false
      this.deleteData = arr.map(item => {
        item.showChildren = true
        item.relates && item.relates.forEach(relate => {
          relate.showChildren = true
        })
        return item
      })
      this.idStr = this.deleteData.map(item => item.id)
      this.checkAll = true
      this.dialogVisible = true
    },
    checkAllChange (value) {
      const allId = this.deleteData.map(item => {
        return item.id
      })
      this.idStr = value ? allId : []
      this.isIndeterminate = false
    },
    checkedChange (value) {
      const checkedCount = value.length
      this.checkAll = checkedCount > 0
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.deleteData.length
    },
    showChild (item, e) {
      e && e.stopPropagation ? e.stopPropagation() : window.event.cancelBubble = true
      if (item.relates && !item.relates.length) {
        return
      }
      item.showChildren = !item.showChildren
    },
    selectIcon (type) {
      switch (type) {
        case 'asset' : return 'nz-icon monitorColor nz-icon-overview-project'
        case 'datacenter' : return 'nz-icon monitorColor nz-icon-Datacenter2'
        case 'dc' : return 'nz-icon monitorColor nz-icon-Datacenter2'
        case 'project' : return 'nz-icon monitorColor nz-icon-project'
        case 'module' : return 'nz-icon monitorColor nz-icon-overview-module'
        case 'endpoint' : return 'nz-icon monitorColor nz-icon-overview-endpoint'
        case 'alertrule' : return 'nz-icon monitorColor nz-icon-Alertrule'
        case 'cabinetTab' : return 'nz-icon monitorColor nz-icon-Cabinet1'
        case 'roles' : return 'nz-icon monitorColor nz-icon-role1'
        case 'role' : return 'nz-icon monitorColor nz-icon-role1'
        case 'alertSilence' : return 'nz-icon monitorColor nz-icon-a-Silencealert'
        case 'user' : return 'nz-icon monitorColor nz-icon-user1'
        case 'cabinet' : return 'nz-icon monitorColor nz-icon-Cabinet1'
        case 'alertRule' : return 'nz-icon monitorColor nz-icon-Alertrule'
        case 'alertMessage' : return 'nz-icon monitorColor nz-icon-overview-alert'
        case 'agent' : return 'nz-icon monitorColor nz-icon-agent'
        case 'assetMeta' : return 'nz-icon monitorColor nz-icon-label'
        case 'model' : return 'nz-icon monitorColor nz-icon-model'
      }
      return ' '
    }
  }
}
</script>

<style scoped>
  .delete-button{
    margin-right: 10px;
    opacity: 0.7;
    border-radius: 2px;
  }
  .delete-button-light.delete-button{
    border-radius: 2px;
    opacity: 1;
  }
</style>
