<template>
  <div class="right-box right-box-menu" v-clickoutside="{obj:editMenu,func:clickOutside}">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="menus-edit-del"
              type="button"
              v-if="editMenu.id">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editMenu.id ? ($t("config.menus.editMenu")) : $t("config.menus.createMenu")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form :model="editMenu" :rules="rules" class="right-box-form right-box-form-left" label-position = "top" label-width="130px" ref="menuForm" size="small">
        <el-form-item :label="$t('config.menus.parent')" prop="parentId">
          <tree-select :multiple="false" :options="menus" label="id" noChildrenText="" noOptionsText="" placeholder="" v-model="editMenu.parentId" id="menu-box-input-parent"></tree-select>
        </el-form-item>
        <el-form-item :label="$t('overall.type')" prop="type">
          <el-radio-group v-model="editMenu.type" id="menu-box-input-type">
            <el-radio :label="1">{{$t('config.menus.menu')}}</el-radio>
            <el-radio :label="2">{{$t('config.menus.button')}}</el-radio>
            <el-radio :label="3">{{$t('config.menus.tab')}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!--name-->
        <el-form-item :label="$t('overall.name')" prop="name">
          <el-input  placeholder="" type="text" v-model="editMenu.name" id="menu-box-input-name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.menus.code')" prop="code">
          <el-input  placeholder="" type="text" v-model="editMenu.code" id="menu-box-input-code"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.menus.i18n')" prop="i18n">
          <el-input  placeholder="" type="text" v-model="editMenu.i18n" id="menu-box-input-i18n"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.menus.route')" prop="route">
          <el-input  placeholder="" type="text" v-model="editMenu.route" id="menu-box-input-route"></el-input>
        </el-form-item>
        <el-form-item :label="$t('config.menus.icon')" prop="icon">
          <el-input  placeholder="" type="text" v-model="editMenu.icon" id="menu-box-input-icon"></el-input>
        </el-form-item>
        <!--<el-form-item :label="$t('config.menus.perms')" prop="perms">
          <el-input  type="text" placeholder="" v-model="editMenu.perms" ></el-input>
        </el-form-item>-->
        <el-form-item :label="$t('config.menus.orderNum')" prop="orderNum">
          <el-input-number :max="1000" :min="1" :precision="0" controls-position="right" style="width: 100%;" v-model="editMenu.orderNum" id="menu-box-input-orderNum"></el-input-number>
        </el-form-item>

        <div class="right-box-sub-title">{{$t('config.menus.perms')}}
          <button @click="addPermission" class="float-right" id="add-permission" type="button" >
            <span :title="$t('tip.add')"><i class="nz-icon nz-icon-create-square"></i></span>
          </button>
        </div>

        <div class="right-box-line"></div>
        <div id="menu-box-permissions">
          <el-form-item :key="index" :label="index+1+''" v-for="(permission,index) in editMenu.permissions" >
            <el-input oninput="this.value = this.value.replace(/[,]/g,'')" placeholder="" style="width: calc(100% - 37px);" type="text" v-model="editMenu.permissions[index].value" ></el-input>
            <span @click="removePermission(index)" style="padding-left: 5px;" :title="$t('overall.delete')"><i class="nz-icon nz-icon-shanchu1"></i></span>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <!-- end--表单-->
    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editMenu,func:esc}" class="footer__btn footer__btn--light"
              id="menus-esc">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button @click="save" class="footer__btn"
              id="menus-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>
<script>
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import editRigthBox from '../mixin/editRigthBox'

export default {
  name: 'menuBox',
  components: {
    'tree-select': Treeselect
  },
  props: {
    menu: {
      type: Object
    }
  },
  computed: {
    isCurrentUser () {
      return function (username) {
        return localStorage.getItem('nz-username') == username
      }
    },
    addDisabled () {
      const enabled = this.selectableScripts.filter(item => {
        return !item.disabled
      })
      return enabled.length === 0
    }
  },
  mixins: [editRigthBox],
  data () {
    return {
      rules: { // 表单校验规则
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        code: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        i18n: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        orderNum: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ]
      },
      editMenu: {},
      menus: [],
      option: {
        save: false

      }
    }
  },
  methods: {
    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },
    clickOutside () {
      this.esc(false)
    },
    /* 保存 */
    save () {
      this.$refs.menuForm.validate(valid => {
        if (valid) {
          this.editMenu.perms = this.editMenu.permissions && this.editMenu.permissions.length > 0 ? this.editMenu.permissions.map(t => t.value).join(',') : ''
          delete this.editMenu.permissions
          if (this.editMenu.id) {
            this.$put('sys/menu', this.editMenu).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('sys/menu', this.editMenu).then(response => {
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          return false
        }
      })
    },
    /* 删除 */
    del () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('sys/menu/?ids=' + this.editMenu.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },
    addPermission: function () {
      if (this.editMenu.permissions) {
        this.editMenu.permissions.push({ value: '' })
      } else {
        this.$set(this.editMenu, 'permissions', [{ value: '' }])
      }
    },
    removePermission: function (index) {
      this.editMenu.permissions.splice(index, 1)
    },
    getMenus: function () {
      this.menus = []
      this.$get('sys/menu').then(response => {
        if (response.code == 200) {
          this.menus = response.data.list
          function replaceFunc (data) {
            data.forEach(t => {
              t.label = t.name
              if (t.children && t.children instanceof Array && t.children.length > 0) {
                replaceFunc(t.children)
              } else {
                delete t.children
              }
            })
          }
          replaceFunc(this.menus)
          this.menus = [{
            id: 0,
            label: this.$t('config.menus.mainMenu'),
            children: JSON.parse(JSON.stringify(this.menus))
          }]
        } else {
          this.$message.error('load menu faild')
        }
      })
    },
    inputValid: function (val) {
      return val.replace(/[,]/g, '')
    }
  },
  mounted () {
    this.getMenus()
  },
  watch: {
    // 将prop里的user转为组件内部对象
    menu: {
      immediate: true,
      deep: true,
      handler (n) {
        this.isEdit = true
        this.editMenu = JSON.parse(JSON.stringify(n))
        if (this.editMenu.perms && this.editMenu.perms != '') {
          this.$set(this.editMenu, 'permissions', this.editMenu.perms.split(',').map(t => { return { value: t } }))
        }
      }
    }
  }
}
</script>
<style scoped>
  .form-item-title{
    position: absolute;
    left: -120px;
  }

</style>
