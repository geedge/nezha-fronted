<template>
  <transition name="right-box-580">
    <div class="right-box right-box-asset" v-clickoutside="{obj:editAssetMeta,func:clickOutside}">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns right-box-form-delete">
        <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="alert-box-del" type="button"
                v-has="'alert_silence_delete'" v-if="editAssetMeta.id">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box__header">
      <div class="header__title">{{editAssetMeta.id ? $t("config.assetLabel.editMeta") + " ID：" + editAssetMeta.id :
        $t("config.assetLabel.addMeta")}}</div>
    </div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box__container">
        <el-form class="right-box-form right-box-form-left" label-width="120px"  :model="editAssetMeta" label-position = "top" ref="editAssetMetaForm" :rules="rules">

          <el-form-item :label='$t("config.assetLabel.name")' prop="name">
            <el-input placeholder="" show-word-limit v-model="editAssetMeta.name" size="small" id="editAssetMeta-box-input-name"></el-input>
          </el-form-item>

          <el-form-item :label='$t("config.assetLabel.key")' prop="metaKey">
            <el-input placeholder="" show-word-limit v-model="editAssetMeta.metaKey" size="small" id="editAssetMeta-box-input-key"></el-input>
          </el-form-item>

          <el-form-item :label='$t("config.assetLabel.group")' prop="groupId">
<!--            <el-input placeholder="" show-word-limit v-model="editAssetMeta.group" size="small" id="editAssetMeta-box-input-group"></el-input>-->
            <el-select v-model="editAssetMeta.groupId" size="small" :popper-class="'nz-meta-group-box'" :popper-append-to-body="false">
              <el-option v-for="(item, index) in groupData" :key="index" :value="item.id" :label="item.name"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item :label='$t("config.assetLabel.search")' prop="search">
<!--            <el-input placeholder="" show-word-limit v-model="editAssetMeta.search" size="small" id="editAssetMeta-box-input-search"></el-input>-->
            <el-switch
              @change="switchSearch"
              v-model="editAssetMeta.search"
              active-color="#ee9d3f"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item>

          <el-form-item :label='$t("config.assetLabel.display")' prop="display">
<!--            <el-input placeholder="" show-word-limit v-model="editAssetMeta.display" size="small" id="editAssetMeta-box-input-display"></el-input>-->
            <el-switch
              v-model="editAssetMeta.display"
              active-color="#ee9d3f"
              :active-value="1"
              :inactive-value="0">
            </el-switch>
          </el-form-item>

          <el-form-item :label='$t("config.assetLabel.type")' prop="type">
            <el-select  v-model="editAssetMeta.type" size="small" class="right-box__select" placeholder='请选择' popper-class="right-box-select-dropdown prevent-clickoutside" :popper-append-to-body="false" @change="selectType">
              <el-option v-for="(item, index) in typeData" :key="index" :value="item.value" :disabled="item.disabled">
                <div><i :class="item.icon"></i>&nbsp;&nbsp;<span >{{item.name}}</span></div>
              </el-option>
            </el-select>
          </el-form-item>

          <div class="right-box-sub-title" style="margin-bottom: 20px" v-if="showParam">
            <span>{{$t('config.assetLabel.params')}}</span>
            <span @click="addParam" class="float-right" style="height: 19px;display: inline-block;line-height: 1;" v-if="editAssetMeta.type!=='datetime'">
            <span class="create-square-box">
              <i style="font-size: 17px; cursor: pointer;" class="nz-icon nz-icon-create-square"></i>
            </span>
          </span>
          </div>
          <el-form-item prop="param" v-if="showParam" class="asset-meta-param">
<!--            <el-input placeholder="" show-word-limit v-model="editAssetMeta.param" size="small" id="editAssetMeta-box-input-param"></el-input>-->
            <div v-if="editAssetMeta.type==='radio' || editAssetMeta.type==='checkbox' || editAssetMeta.type==='select'" class="meta-option-box">
              <el-row class="asset-meta-param-row asset-meta-param-header">
                <el-col :span="12">
                  {{$t('config.assetLabel.option')}}
                </el-col>
                <el-col :span="6">
                  {{$t('config.assetLabel.isCheck')}}
                </el-col>
                <el-col :span="6">
                  {{$t('config.assetLabel.operate')}}
                </el-col>
              </el-row>
              <el-row v-for="(item,index) in editAssetMeta.param.items" :key="index" class="asset-meta-param-row">
                <el-col :span="12">
                  <el-input v-model = "item.name" size="small" :rules="{ required: true, message: $t('validate.required'), trigger: 'blur'}" @input="(val)=>{inputChange(index, val)}" :ref="'metaNameOption'+index"></el-input>
                </el-col>
                <el-col :span="6">
                  <el-radio v-if="editAssetMeta.type==='radio' || editAssetMeta.type==='select'" v-model = "item.check" :label="true" @change="radioChange(index)">{{$t('config.assetLabel.default')}}</el-radio>

                  <el-checkbox v-else v-model="item.check" @change="checkBoxChange"> {{$t('config.assetLabel.default')}}</el-checkbox>

                </el-col>
                <el-col :span="6">
                  <div class="">
                <span class="nz-icon-minus-medium">
                  <i @click="deleteParam(index)" class="nz-icon nz-icon-minus"></i>
                </span>
                    <span class="nz-icon-copy">
                  <i @click="copyParam(index)" class="nz-icon nz-icon-override"></i>
                </span>
                  </div>
                </el-col>
              </el-row>
            </div>

            <div v-if="editAssetMeta.type==='datetime'">
              <el-row style="margin-bottom: 10px">
                <span class="datetime-header">{{$t('config.assetLabel.dateType')}}: </span>
                <el-radio-group v-model="editAssetMeta.param.subType">
                  <el-radio :label="'date'">{{$t('config.assetLabel.date')}}</el-radio>
                  <el-radio :label="'time'">{{$t('config.assetLabel.time')}}</el-radio>
                  <el-radio :label="'datetime'">{{$t('config.assetLabel.datetimes')}}</el-radio>
                </el-radio-group>
              </el-row>
              <el-row>
                <span class="datetime-header">{{$t('config.assetLabel.interval')}}: </span>
                <el-switch
                  v-model="editAssetMeta.param.interval"
                  @change="$forceUpdate"
                  active-color="#ee9d3f">
                </el-switch>
              </el-row>
            </div>

            <div v-if="editAssetMeta.type==='double'">
              <el-row>
                <span class="datetime-header">{{$t('config.assetLabel.decimals')}}: </span>
                <el-input-number v-model="editAssetMeta.param.decimals" @change="$forceUpdate" :min="0" :max="10" :controls="false" size="small"></el-input-number>
              </el-row>
            </div>
          </el-form-item>

          <el-form-item :label='$t("overall.remark")' prop="remark">
            <el-input placeholder="" maxlength="512" type="textarea" show-word-limit v-model="editAssetMeta.remark" size="small" id="editAssetMeta-box-input-remark"></el-input>
          </el-form-item>

          <el-form-item :label='$t("config.assetLabel.example")'>
            <assetTagEx :type="editAssetMeta.type" :param="editAssetMeta.param"/>
          </el-form-item>

        </el-form>
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box-bottom-btns">
        <button v-cancel="{obj:editAssetMeta,func:esc}" id="editAssetMeta-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="editAssetMeta-box-save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
      <!-- end--底部按钮-->

    </div>
  </transition>
</template>

<script>
import assetTagEx from '../../page/asset/components/assetTagEx'
export default {
  name: 'assetLabelBox',
  props: {
    assetLabel: {}
  },
  components: { assetTagEx },
  data () {
    return {
      editAssetMeta: {
        id: '',
        name: '',
        metaKey: '',
        groupId: {
          id: '',
          name: ''
        },
        search: 1,
        display: 1,
        type: '',
        param: {},
        remark: ''
      },
      rightBox: { // 面板弹出框相关
        show: false
      },
      groupData: [],
      rules: {
        name: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        metaKey: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }, { pattern: /\w/, message: this.$t('validate.onlyWord'), trigger: 'change' }],
        groupId: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }],
        type: [{ required: true, message: this.$t('validate.required'), trigger: 'change' }]
      },
      value:'',
      typeData: [
        {
          icon: 'nz-icon nz-icon-text',
          disabled:true,
          value: 'text',
          name: this.$t('config.assetLabel.text')
        },
        {
          icon: 'nz-icon nz-icon-multitext',
          disabled:true,
          value: 'multitext',
          name: this.$t('config.assetLabel.multitext')
        },
        {
          icon: 'nz-icon nz-icon-textarea',
          disabled:true,
          value: 'textarea',
          name: this.$t('config.assetLabel.textarea')
        },
        {
          icon: 'nz-icon nz-icon-radio',
          disabled:true,
          value: 'radio',
          name: this.$t('config.assetLabel.radio')
        },
        {
          icon: 'nz-icon nz-icon-checkbox',
          disabled:true,
          value: 'checkbox',
          name: this.$t('config.assetLabel.checkbox')
        },
        {
          icon: 'nz-icon nz-icon-xialaxuanze',
          disabled:true,
          value: 'select',
          name: this.$t('config.assetLabel.select')
        },
        {
          icon: 'nz-icon nz-icon-integer',
          disabled:true,
          value: 'integer',
          name: this.$t('config.assetLabel.integer')
        },
        {
          icon: 'nz-icon nz-icon-double',
          disabled:true,
          value: 'double',
          name: this.$t('config.assetLabel.double')
        },
        {
          icon: 'nz-icon nz-icon-double',
          disabled:true,
          value: 'datetime',
          name: this.$t('config.assetLabel.datetime')
        },
        {
          icon: 'nz-icon nz-icon-double',
          disabled:true,
          value: 'email',
          name: this.$t('config.assetLabel.email')
        }
      ],
      showParam: false
    }
  },
  watch: {
    assetLabel: {
      immediate: true,
      handler (n) {
        this.editAssetMeta = { ...n }
        this.selectType(n.type, true)
      }
    }
  },
  mounted () {
    this.getGroupData()
    this.switchSearch()
  },
  methods: {
    switchSearch(value){
      this.typeData.forEach(element => {
          if( value === 0 ) {
            element.disabled = false
          }else {
            if(element.value == 'radio'){
              element.disabled = false
            }else if(element.value == 'checkbox'){
              element.disabled = false
            }else if(element.value == 'select'){
              element.disabled = false
            }
          }
      })    
    },
    clickOutside () {
      this.esc(false)
    },
    esc (refresh) {
      this.prevent_opt.save = false
      this.$emit('close', refresh)
    },
    save () {
      if (this.prevent_opt.save) {
        return
      };
      this.prevent_opt.save = true
      this.$refs.editAssetMetaForm.validate((valid) => {
        if (valid) {
          const param = { ...this.editAssetMeta }
          if (param.type === 'radio' || param.type === 'checkbox' || param.type === 'select') {
            for (let i = 0; i < param.param.items.length; i++) {
              if (!param.param.items[i].name) {
                this.$refs['metaNameOption' + i][0].focus()
                this.$message.error(this.$t('config.assetLabel.metaOptionNull'))
                this.prevent_opt.save = false
                return
              }
            }
          }
          if (param.type !== 'radio' && param.type !== 'checkbox' && param.type !== 'select' && param.type !== 'datetime') {
            delete param.param
          } else {
            param.param = JSON.stringify(param.param)
          }
          if (this.editAssetMeta.id) {
            this.$put('asset/field/meta', param).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          } else {
            this.$post('asset/field/meta', param).then(response => {
              this.prevent_opt.save = false
              if (response.code === 200) {
                this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                this.esc(true)
              } else {
                this.$message.error(response.msg)
              }
            })
          }
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    del () {
      if (this.prevent_opt.save) {
        return
      }
      ;
      this.prevent_opt.save = true
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('/alert/silence?ids=' + this.editAssetMeta.id).then(response => {
          this.prevent_opt.save = false
          if (response.code === 200) {
            this.$message({ type: 'success', message: this.$t('tip.deleteSuccess') })
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      }).catch(() => {
        this.prevent_opt.save = false
      })
    },
    getGroupData () {
      this.$get('asset/field/group', { pageSize: -1 }).then(response => {
        if (response.code == 200) {
          this.groupData = response.data.list
        }
      })
    },
    selectType (val, init) {
      switch (val) {
        case 'radio' :
        case 'checkbox' :
        case 'select' :
          this.showParam = true
          if (init) return
          this.editAssetMeta.param = {}
          this.editAssetMeta.param.items = [{
            name: 'Option 1',
            check: false
          }, {
            name: 'Option 2',
            check: false
          }]
          break
        case 'datetime' :
          this.showParam = true
          if (init) return
          this.editAssetMeta.param = {
            subType: 'date',
            interval: false
          }
          break
        case 'double' :
          this.showParam = true
          if (init) return
          this.editAssetMeta.param = {
            decimals: 2
          }
          break
        default:
          this.showParam = false
          break
      }
    },
    inputChange (index, val) {
      // console.log(val)
      // this.editAssetMeta.param.items[index] = val
      this.$forceUpdate()
    },
    radioChange (i) {
      this.editAssetMeta.param.items.forEach((item, index) => {
        if (index === i) {
          item.check = !!item.check
        } else if (this.editAssetMeta.type !== 'checkbox') {
          item.check = false
        }
      })
      this.$forceUpdate()
    },
    checkBoxChange () {
      this.$forceUpdate()
    },
    addParam () {
      if (this.editAssetMeta.param.items.length >= 20) {
        this.$message.error(this.$t('config.assetLabel.moreOptionsError'))
        return
      }
      this.editAssetMeta.param.items.push({
        name: '',
        check: false
      })
      this.$forceUpdate()
    },
    deleteParam (index) {
      if (this.editAssetMeta.param.items.length === 1) {
        this.$message.error(this.$t('config.assetLabel.onlyOptionError'))
        return
      }
      this.editAssetMeta.param.items.splice(index, 1)
      this.$forceUpdate()
    },
    copyParam (index) {
      if (this.editAssetMeta.type !== 'checkbox') {
        this.editAssetMeta.param.items.push({
          name: this.editAssetMeta.param.items[index].name,
          check: false
        })
      } else {
        this.editAssetMeta.param.items.push({
          ...this.editAssetMeta.param.items[index]
        })
      }
      this.$forceUpdate()
    }
  }
}
</script>

<style scoped>
  /deep/ .nz-meta-group-box{
    min-width: 220px;
  }
  /*.asset-meta-param /deep/ .el-radio__label{*/
  /*  display: none;*/
  /*}*/
  .asset-meta-param-row{
    text-align: center;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
  }
  .asset-meta-param-row:last-child{
    margin-bottom: 0;
  }
  .meta-option-box{

  }
  .datetime-header{
    display: inline-block;
    width: 80px;
    margin-right: 10px;
    text-align: right;
  }
</style>
