<template>
  <transition name="right-box">
    <div class="right-box right-box-model" v-if="rightBox.show" v-clickoutside="clickos">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button id="model-del" type="button" v-if="currentModel.id != '' && rightBox.isEdit" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button v-if="!rightBox.isEdit" id="model-save" type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.edit')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form" :model="currentModel" label-position="top" :rules="rules" ref="modelForm">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model="currentModel.name" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentModel.name}}</div>
          </el-form-item>
          <el-form-item :label="$t('config.model.vendor')" prop="vendor">
            <el-autocomplete
              :fetch-suggestions="vendorSuggestion"
              v-model="currentModel.vendor.name"
              placeholder=""
              size="small"
              popper-class="no-style-class"
              >
            </el-autocomplete>
          </el-form-item>
          <el-form-item :label="$t('config.model.remark')" prop="remark">
            <el-input maxlength="512" rows="4" show-word-limit v-if="rightBox.isEdit" type="textarea" placeholder="" v-model="currentModel.remark" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentModel.remark}}</div>
          </el-form-item>
        </el-form>
      </el-scrollbar>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="model-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button v-if="rightBox.isEdit" @click="saveOrToEdit" id="model-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>

    </div>
  </transition>
</template>

<script>
  import {noSpecialChar} from "../js/validate";

  export default {
    name: "modelBox",
    props: {
      model: Object
    },
    data() {
      return {
        currentModel: {
          id: '',
          name: '',
          vendor: {id: '', value: '', code: '', type: ''},
          type: {id: '', value: '', code: '', type: ''},
          assetStat: {total: '', inStock: '', outStock: ''},
          remark: '',
          vendorCode: '',
          typeCode: ''
        },
        rightBox: {
          show: false,
          firstShow: false,
          title: '',
          isEdit: false
        },
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
        },
        vendorData: [],
        typeData: []
      }
    },
    methods: {
      show(show, isEdit) {
        this.rightBox.show = show;
        this.rightBox.isEdit = isEdit;
      },
      clickos() {
        this.rightBox.show = false;
      },
      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
        this.rightBox.firstShow = false;
      },

      /*保存*/
      save() {
        this.$refs.modelForm.validate((valid) => {
          if (valid) {
            if (this.currentModel.id) {
              this.$put('model', this.currentModel).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.rightBox.show = false;
                  this.$emit('reload');
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('model', this.currentModel).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.rightBox.show = false;
                  this.$emit("reload");
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            return false;
          }
        });
      },
      saveOrToEdit: function() {
        if (!this.rightBox.isEdit) {
          this.rightBox.isEdit = true;
          this.rightBox.title = this.$t("config.model.editModel") + "  ID：" + this.currentModel.id;
        } else {
          this.save();
        }
      },
      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("model?ids=" + this.currentModel.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.rightBox.show = false;
              this.$emit("reload");
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getVendorData() {
        this.$get('sys/dict/all?type=vendor').then(response => {
          if (response.code === 200) {
            this.vendorData = response.data
          }
        })
      },
      getTypeData() {
        this.$get('sys/dict/all?type=assetType').then(response => {
          if (response.code === 200) {
            this.typeData = response.data
          }
        })
      },
      //vendor的输入建议
      vendorSuggestion(queryString, callback) {
        callback(this.suggestionFilter('vendor', queryString));
      },
      //type的输入建议
      typeSuggestion(queryString, callback) {
        callback(this.suggestionFilter('type', queryString));
      },
      suggestionFilter(type, queryString) {
        if (type == 'vendor') {

        } else if (type == 'type') {

        }
      }
    },
    mounted() {
      this.getVendorData();
      this.getTypeData();
    },
    computed: {
    },
    watch: {
      model: {
        immediate: true,
        deep:true,
        handler(n, o) {
          this.currentModel = JSON.parse(JSON.stringify(n));
          if (n && n.id) {
            this.rightBox.title =this.rightBox.isEdit? this.$t("config.model.editModel") + "  ID：" + n.id : this.$t("config.model.model") + "  ID：" + n.id ;
          } else {
            this.rightBox.title = this.$t("config.model.createModel");
          }
        }
      },
    }
  }
</script>

<style>
  .right-box-model .el-autocomplete {
    width: 100%;
  }
</style>
