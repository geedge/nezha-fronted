<template>
  <div>
    <span :id="'asset-detail-'+row.id" :title="translation('overall.view')" class="content-right-option" @click.stop="detail"><i
      class="nz-icon nz-icon-view"></i>
              </span>
      &nbsp;
      <span :id="'asset-edit-'+row.id" v-has="'asset_toEdit'" :title="translation('overall.edit')" class="content-right-option" @click.stop="edit"><i
        class="nz-icon nz-icon-edit"></i>
              </span>
      &nbsp;
      <span :id="'asset-del-'+row.id" v-has="'asset_delete'" :title="translation('overall.delete')" class="content-right-option" @click.stop="del"><i
        class="nz-icon nz-icon-delete"></i>
              </span>
      &nbsp;
      <el-dropdown v-has="'asset_connect'" trigger="hover" @command="cli">
        <span :id="'asset-ssh-'+row.id" class="content-right-option" title="CLI"><i
          :class="{'gray-filter': !row.accounts || row.accounts.length === 0 || (row.accounts.length === 1 && row.accounts.find(t => t.protocol === 'SNMP'))}" class="nz-icon nz-icon-cli"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(account, index) in row.accounts" v-if="account && account.protocol !== 'SNMP'" :key="index" :command="[row.id ,row.host, account]">{{account.protocol}}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
  </div>
</template>

<script>
import bus from '../../../../libs/bus'

export default {
  name: 'operation',
  props: ['rowIndex', 'model', 'prop', 'data', 'column'],
  data () {
    return {
      row: {}
    }
  },
  methods: {
    edit () {
      bus.$emit('asset-edit', this.row)
    },
    del () {
      bus.$emit('asset-delete', this.row)
    },
    detail () {
      bus.$emit('asset-detail', this.row)
    },
    cli () {
      bus.$emit('asset-cli', this.row)
    }
  },
  watch: {
    model: {
      immediate: true,
      deep: true,
      handler (n) {
        this.row = JSON.parse(JSON.stringify(n))
      }
    }
  }
}
</script>

<style scoped>

</style>
