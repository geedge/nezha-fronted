<template>
  <div v-clickoutside="{obj: editPlaylist, func: esc}" class="right-box right-box-playlist">
    <div class="right-box__header">
      <div class="header__title">{{editPlaylist.id ? $t('dashboard.editPlaylist') : $t('dashboard.createPlaylist')}}</div>
      <div class="header__operation">
        <span v-cancel="{obj: editPlaylist, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="form" :model="editPlaylist" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label="$t('overall.name')" prop="name">
            <el-input maxlength="64" show-word-limit v-model="editPlaylist.name" size="small" type="text"></el-input>
          </el-form-item>
          <!-- interval -->
          <el-form-item
            :label="$t('dashboard.interval')"
            prop="intvl"
          >
            <div class="el-input-group el-input-group--append">
              <el-input-number
                style="width:100%"
                size="small"
                :controls="false"
                :min="1"
                v-model="editPlaylist.intvl">
              </el-input-number>
              <div class="el-input-group__append" style="text-transform:capitalize;">{{$t('config.system.basic.minute')}}</div>
            </div>
          </el-form-item>
          <!-- dashboardIds -->
          <el-form-item
            :label="$t('dashboard.title')"
            prop="dashboardIds"
          >
            <el-select
              v-model="editPlaylist.dashboardIds"
              multiple
              :placeholder="$t('el.select.placeholder')"
              popper-class="right-box-select-top prevent-clickoutside"
              size="small"
              class="el-select-multiple-width640"
            >
              <el-option
                v-for="item in dashboardList"
                :key="item.id"
                :label="$t(item.name)"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="right-box__footer">
      <button id="asset-edit-cancel" v-cancel="{obj: editPlaylist, func: esc}" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button id="asset-edit-save" :class="{'footer__btn--disabled': prevent_opt.save}" :disabled="prevent_opt.save" class="footer__btn" @click="save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import editRigthBox from '../mixin/editRigthBox'
export default {
  name: 'playlistBox',
  props: {
    obj: {
      type: Object
    }
  },
  mixins: [editRigthBox],
  data () {
    return {
      url: '/visual/playlist',
      editPlaylist: {
        name: '',
        intvl: undefined,
        dashboardIds: []
      },
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        intvl: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        dashboardIds: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ]
      },
      dashboardList: []
    }
  },
  created () {
    this.getDashboard()
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
    async getDashboard () {
      const res = await this.$get('visual/dashboard?type=dashboard&pageSize=-1')
      this.dashboardList = this.flatten(res.data.list)
    },
    // 数组对象扁平化
    flatten (arr) {
      const tempArr = this.$loadsh.cloneDeep(arr)
      // 递归调用
      function handler (tempArr) {
        const newArr = []
        tempArr.forEach(element => {
          newArr.push(element)
          if (element.children) {
            newArr.push.apply(newArr, handler(element.children))
            delete element.children
          }
        })
        return newArr
      }
      return handler(tempArr)
    },
    save () {
      if (this.prevent_opt.save) {
        return
      }
      this.prevent_opt.save = true
      this.$refs.form.validate((valid) => {
        if (valid) {
          const params = {
            ...this.editPlaylist
          }
          if (this.editPlaylist.id) {
            this.$put(this.url, params).then(res => {
              this.prevent_opt.save = false
              if (res.code === 200) {
                this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(res.msg)
              }
            })
          } else {
            this.$post(this.url, params).then(res => {
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
        }
      })
    }
  },
  watch: {
    obj: {
      immediate: true,
      deep: true,
      handler (n) {
        this.isEdit = true
        this.editPlaylist = this.$loadsh.cloneDeep(n)
      }
    }
  }
}
</script>
