<template>
  <div v-clickoutside="{obj: editRole, func: esc}" class="right-box right-box-role">
    <div class="right-box__header">
      <div class="header__title">{{editRole.id ? $t('config.roles.editRole') : $t('overall.createRole')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editRole, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container right-box-container__left">
      <div class="container__form">
        <el-form :disabled="detail" :model="editRole" :rules="rules" label-position="top" label-width="120px" ref="roleForm">
          <!--name-->
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input  maxlength="64" placeholder="" id="role-box-input-name"
                       show-word-limit size="small" type="text" v-model.trim="editRole.name"></el-input>
          </el-form-item>
          <el-form-item :label="$t('overall.remark')">
            <el-input maxlength="256" show-word-limit :rows="2" size='small' type="textarea" v-model="editRole.remark" id="role-box-input-remark"/>
          </el-form-item>

          <el-form-item :label="$t('config.menus.perms')">
            <!--<div class="tree-option">
              <button type="button" class="nz-btn nz-btn-size-small-new nz-btn-style-light option-btn" style="margin-left: 0px;" @click="expandAllOrNone" :class="{'btn-active':expandAllFlag}">展开/收缩</button>
              <button type="button" class="nz-btn nz-btn-size-small-new nz-btn-style-light option-btn" @click="selectAllOrNone" :class="{'btn-active':selectAllFlag}"><span ><i class="nz-icon nz-icon-delete"></i></span></button>
            </div>-->
            <el-tree :data="menus" :default-expand-all="expandAllFlag" :props="{label:labelFormatter}" :default-checked-keys="[312]" class="tree-border" node-key="id" ref="menuTree" show-checkbox id="role-box-input-menus">
              <div slot-scope="{ node, data }">
              <span>
                <i v-if="data.type == '1'" class="el-icon-menu"></i>
                <i v-if="data.type == '2'" class="el-icon-edit"></i>
              </span>
                {{$t(data.i18n)}}
              </div>
            </el-tree>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editRole, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import editRigthBox from '../../mixin/editRigthBox'
export default {
  name: 'roleBox',
  components: {
  },
  props: {
    obj: {
      type: Object
    },
    detail: Boolean,
    copyFlag: Boolean
  },
  mixins: [editRigthBox],
  data () {
    return {
      editRole: {},
      url: 'sys/role',
      rightBox: { model: { show: false } },
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      menus: [],
      selectedIds: [],
      selectAllFlag: false,
      expandAllFlag: true
    }
  },
  watch: {
    obj: {
      deep: true,
      immediate: true,
      handler (n) {
        this.isEdit = true
        this.editRole = JSON.parse(JSON.stringify(n))
        if (this.editRole.roles && this.editRole.roles.length > 0) {
          this.editRole.roleIds = this.editRole.roles.map(t => t.id)
        }
      }
    }
  },
  created () {

  },
  mounted () {
    this.getMenus().then(() => {
      if (this.copyFlag) {
        this.editRole.id = ''
      }
      if (this.$refs.menuTree && this.selectedIds && this.selectedIds.length > 0) {
        this.$refs.menuTree.setCheckedKeys(this.selectedIds, true)
      }
    })
  },
  methods: {
    clickOutside () {
      this.esc(false)
    },
    /* 关闭弹框 */
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    getMenus: function () {
      const self = this
      return new Promise(resolve => {
        self.menus = []
        if (self.editRole.id) {
          self.$get('/sys/role/menu/' + self.editRole.id).then(response => {
            if (response.code == 200) {
              self.menus = response.data.menus
              self.selectedIds = response.data.selectedIds
              self.menus[0].children[0].disabled = true
            } else {
              self.$message.error('load menu faild')
            }
            resolve()
          })
        } else {
          self.$get('/sys/menu').then(response => {
            if (response.code == 200) {
              self.menus = response.data.list
              self.menus[0].children[0].disabled = true
            } else {
              self.$message.error('load menu faild')
            }
            resolve()
          })
        }
      })
    },
    labelFormatter: function (data, node) {
      return data && data.i18n ? this.$t(data.i18n) : data.name
    },
    selectAllOrNone: function () {
      if (this.$refs.menuTree) {
        if (!this.selectAllFlag) {
          this.$refs.menuTree.setCheckedNodes(this.menus)
        } else {
          this.$refs.menuTree.setCheckedNodes([])
        }
        this.selectAllFlag = !this.selectAllFlag
      }
    },
    expandAllOrNone: function () {
      this.expandAllFlag = !this.expandAllFlag
      const $self = this
      if (this.$refs.menuTree) {
        this.menus.forEach(t => {
          $self.$refs.menuTree.store.nodesMap[t.id].expanded = $self.expandAllFlag
        })
      }
    },
    save () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.editRole.menuIds = this.$refs.menuTree.getCheckedKeys(true)
      this.$refs.roleForm.validate((valid) => {
        if (valid) {
          if (this.editRole.id) {
            this.$put(this.url, this.editRole).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, this.editRole).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    }
  }
}
</script>
