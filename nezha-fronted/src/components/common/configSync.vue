<template>
  <div class="configSync">
    <div @click="showDialog" v-if="type==='batch'">
      <i class="nz-icon nz-icon-a-BatchSynchronize" style="font-size:14px;margin-right:7px;"></i>{{$t('overall.batchSync')}}
    </div>
    <el-dialog
      class="configSync-dialog"
      :title="$t('deleteButton.confirm')"
      v-if="dialogVisible"
      :visible.sync="dialogVisible"
      @close='handleClose'
      width="580px"
      :append-to-body="true"
    >
     <div class="dialog-header" style="vertical-align:top;" >
        <i class="nz-icon nz-icon-jinggao"></i>
        <span>{{$t('batch.syncTip', { dataLength: idArr.length })}}</span>
      </div>
      <div class="batch-sync-tree">
        <div class="tree-header tree-body-item">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="checkAllChange"></el-checkbox>
          <div class="batch-sync-item-id">ID</div>
          <div class="batch-sync-item-name">{{$t('overall.name')}}</div>
        </div>
        <el-checkbox-group v-model="idArr" @change="checkedChange">
          <div class="tree-body">
            <div v-for="(item,index) in batchData" :key='index' class="tree-body-item">
              <el-checkbox :key="item.id" :label="item.id"></el-checkbox>
              <div class="batch-sync-item-id">{{item.id}}</div>
              <div class="batch-sync-item-name" @click="showChild(item)">
              <i :class="selectIcon(item.type)"/>
              <span class="text-ellipsis batch-sync-item-text" :title="item.name">{{item.name}}</span>
              </div>
            </div>
          </div>
        </el-checkbox-group>
      </div>
      <ul class="sync-select-list">
        <li class="sync-select-item">
          <el-checkbox v-model="syncBox.endpoint">{{$t('batch.syncEndpoint')}}</el-checkbox>
        </li>
        <li class="sync-select-item">
          <el-checkbox v-model="syncBox.dashboard">{{$t('batch.syncDashboard')}}</el-checkbox>
        </li>
      </ul>
      <div slot="footer">
        <button @click="dialogVisible = false" class="footer__btn footer__btn--light">{{$t("overall.cancel")}}</button>
        <button @click="configSync" class="footer__btn" :class="{'nz-btn-disabled': prevent_opt.save||!idArr.length}" :disabled="prevent_opt.save||!idArr.length">{{$t('overall.synchronize')}}</button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'configSync',
  data () {
    return {
      api: '',
      dialogVisible: false,
      batchData: [],
      idArr: [],
      syncBox: {
        endpoint: undefined,
        dashboard: undefined
      },
      checkAll: false,
      isIndeterminate: false
    }
  },
  props: {
    type: String,
    from: String, // 通过 from 确认删除的 icon
    batchObjs: Array
  },
  created () {
    switch (this.from) {
      case 'asset': this.api = '/asset/asset/sync'; break
      case 'module': this.api = '/monitor/module/sync'; break
      case 'endpoint': this.api = '/monitor/endpoint/sync'; break
    }
  },
  methods: {
    showDialog () {
      this.dialogVisible = true
      this.batchData = this.$lodash.cloneDeep(this.batchObjs).map(item => {
        item.type = this.from
        return item
      })
      this.checkAll = true
      this.idArr = this.batchData.map(item => item.id)
    },
    async configSync () {
      this.prevent_opt.save = true
      const params = {
        ids: this.idArr,
        endpoint: this.syncBox.endpoint ? 1 : 0,
        dashboard: this.syncBox.dashboard ? 1 : 0
      }
      const res = await this.$put(this.api, params)
      if (res.code === 200) {
        this.dialogVisible = false
        this.$message.success(this.$t('tip.syncSuccess'))
      } else {
        this.$message.error(res.msg)
      }
      this.prevent_opt.save = false
    },
    handleClose () {
      this.dialogVisible = false
      this.syncBox.endpoint = undefined
      this.syncBox.dashboard = undefined
    },
    checkAllChange (value) {
      const allId = this.batchData.map(item => {
        return item.id
      })
      this.idArr = value ? allId : []
      this.isIndeterminate = false
    },
    checkedChange (value) {
      const checkedCount = value.length
      this.checkAll = checkedCount > 0
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.batchData.length
    },
    selectIcon (type) {
      switch (type) {
        case 'asset' : return 'nz-icon monitorColor nz-icon-overview-project'
        case 'module' : return 'nz-icon monitorColor nz-icon-overview-module'
        case 'endpoint' : return 'nz-icon monitorColor nz-icon-overview-endpoint'
      }
      return ' '
    }
  }
}
</script>
