<template>
  <div class="right-box right-box-model" v-clickoutside="{obj:editModel,func:clickOutside}" @click="inputHandler">
    <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
      <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="model-del" type="button" v-has="'model_delete'" v-if="editModel.id">
        <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
        <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
      </button>
    </div>
    <!-- end--顶部按钮-->

    <!-- begin--标题-->
    <div class="right-box-title">{{editModel.id ? ($t("config.model.editModel") + "  ID：" + editModel.id) : $t("config.model.createModel")}}</div>
    <!-- end--标题-->

    <!-- begin--表单-->
    <div class="right-box-form-box">
      <el-form class="right-box-form right-box-form-left" :model="editModel" label-position="right" label-width="120px"  :rules="rules" ref="modelForm">
        <!--model名称-->
        <el-form-item :label='$t("overall.name")' prop="name">
          <el-input placeholder="" maxlength="64" show-word-limit v-model.trim="editModel.name" size="small"></el-input>
        </el-form-item>
        <!--设备类型-->
        <el-form-item :label="$t('config.model.type')" prop="type">
          <el-autocomplete
            :fetch-suggestions="typeSuggestion"
            v-model.trim="editModel.type.value"
            placeholder=""
            size="small"
            popper-class="no-style-class"
            >
            <template slot-scope="{ item }">
              <div class="autocomplete-dropdown" @mouseenter="dropdownHoverItem = 'type' + item.id" @mouseleave="dropdownHoverItem = ''">
                <span v-if="!item.isEdit">{{item.value}}</span>
                <span v-else @click.stop="inputHandler(item)"><el-input size="mini" v-model="editingType" @click.stop></el-input></span>
                <div class="dropdown-btns" v-show="dropdownHoverItem == 'type' + item.id">
                  <span :id="'model-type-op-del-' + item.id" @click.stop="delType(item.id)" class="dropdown-btn dropdown-btn-delete" v-has="'model_type_delete'"><i class="nz-icon nz-icon-delete"></i></span>
                  <span :id="'model-type-op-edit-' + item.id" @click.stop="editType(item)" class="dropdown-btn dropdown-btn-edit" v-has="'model_type_toEdit'" v-if="!item.isEdit"><i class="nz-icon nz-icon-edit"></i></span>
                  <span :id="'model-type-op-edit-' + item.id" @click.stop="saveType(item)" class="dropdown-btn dropdown-btn-edit" v-else><i class="nz-icon nz-icon-check"></i></span>
                </div>
              </div>
            </template>
          </el-autocomplete>

        </el-form-item>
        <!--厂商-->
        <el-form-item :label="$t('config.model.vendor')" prop="vendor">
          <el-autocomplete
            :fetch-suggestions="vendorSuggestion"
            v-model.trim="editModel.vendor.value"
            placeholder=""
            size="small"
            popper-class="no-style-class"
          >
            <template slot-scope="{ item }">
              <div class="autocomplete-dropdown" @mouseenter="dropdownHoverItem = 'vendor' + item.id" @mouseleave="dropdownHoverItem = ''">
                <span v-if="!item.isEdit">{{item.value}}</span>
                <span v-else @click.stop="inputHandler(item)"><el-input size="mini" v-model="editingVendor"></el-input></span>
                <div class="dropdown-btns" v-show="dropdownHoverItem == 'vendor' + item.id">
                  <span :id="'model-vendor-op-del-' + item.id" @click.stop="delVendor(item.id)" class="dropdown-btn dropdown-btn-delete" v-has="'model_vendor_delete'"><i class="nz-icon nz-icon-delete"></i></span>
                  <span :id="'model-vendor-op-edit-' + item.id" @click.stop="editVendor(item)" class="dropdown-btn dropdown-btn-edit" v-has="'model_vendor_toEdit'" v-if="!item.isEdit"><i class="nz-icon nz-icon-edit"></i></span>
                  <span :id="'model-type-op-edit-' + item.id" @click.stop="saveVendor(item)" class="dropdown-btn dropdown-btn-edit" v-else><i class="nz-icon nz-icon-check"></i></span>
                </div>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('asset.uSize')" prop="usize">
          <el-input v-model.number="editModel.usize" :max="47" size="small"></el-input>
        </el-form-item>
      </el-form>
    </div>

    <!--底部按钮-->
    <div class="right-box-bottom-btns">
      <button v-cancel="{obj:editModel,func:esc}" id="model-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="model-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
  import bus from "../../../libs/bus";
  export default {
    name: "modelBox",
    props: {
      model: Object,
    },
    data() {
      return {
        vendorData: [], //vendor下拉列表的数据
        typeData: [],  //type下拉列表的数据
        editModel: {},
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          type: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          vendor: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          usize: [
            {type: 'number', min: 1, max: 47,message: this.$t('validate.usize'),trigger: 'blur'}
          ],
        },
        editingVendor: '', //修改状态的vendor值
        editingType: '', //修改状态的assetType值
        dropdownHoverItem: '', //控制vendor和type下拉列表中操作按钮的展示
      }
    },
    methods: {
      clickOutside() {
        this.esc(false);
      },

      //控制下拉框里input的状态
      inputHandler(obj) {
        if (obj) {
          this.typeData.forEach((item, index) => {
            if (obj.id != item.id) {
              item.isEdit = false;
            }
          });
          this.vendorData.forEach((item, index) => {
            if (obj.id != item.id) {
              item.isEdit = false;
            }
          });
        } else {
          this.typeData.forEach((item, index) => {
            item.isEdit = false;
          });
          this.vendorData.forEach((item, index) => {
            item.isEdit = false;
          });
        }
      },
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },

      /*保存*/
      save() {
        this.$refs.modelForm.validate((valid) => {
          if (valid) {
            this.prevent_opt.save = true;
            let errMsg = [];
            //vendor和type如果是新记录，需要先请求后台新增，再获取code
            let vendorReady;
            let vendorCode = this.autocompleteExist('vendor', this.editModel.vendor.value);
            if (vendorCode) {
              this.editModel.vendorCode = vendorCode;
              vendorReady = this.$TOOLS.blankPromise();
            } else {
              let vendor = {type: 'vendor', value: this.editModel.vendor.value};
              vendorReady = this.saveVendor(vendor);
            }

            let typeReady;
            let typeCode = this.autocompleteExist('type', this.editModel.type.value);
            if (typeCode) {
              this.editModel.typeCode = typeCode;
              typeReady = this.$TOOLS.blankPromise();
            } else {
              let type = {type: 'assetType', value: this.editModel.type.value};
              typeReady = this.saveType(type);
            }

            Promise.all([vendorReady, typeReady]).then(response => {
              if (this.editModel.id) {
                this.$put('model', this.editModel).then(response => {
                  if (response.code === 200) {
                    this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                    bus.$emit('asset-property-change')
                    this.esc(true);
                  } else {
                    this.$message.error(response.msg);
                  }
                  this.prevent_opt.save=false;
                });
              } else {
                this.$post('model', this.editModel).then(response => {
                  if (response.code === 200) {
                    this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                    bus.$emit('asset-property-change')
                    this.esc(true);
                  } else {
                    this.$message.error(response.msg);
                  }
                  this.prevent_opt.save=false;
                });
              }
            });
          } else {
            return false;
          }
        });
      },
      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("model?ids=" + this.editModel.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      delType(id) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("sys/dict/delete?ids=" + id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getTypeData();
              this.$emit("reload");
              bus.$emit('asset-property-change')
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      editType(item) {
        this.editingType = item.value;
        this.inputHandler(item);
        item.isEdit = true;
      },
      saveType(item) {
        return new Promise(resolve => {
          if (this.editingType) { //下拉选中的编辑
            let temp = Object.assign({}, item);
            temp.value = this.editingType;
            this.$post('sys/dict/update', temp).then(response => {
              if (response.code === 200) {
                item.value = this.editingType;
                item.isEdit = false;
                if (this.editModel.type.id == item.id) {
                  this.editModel.type.value = item.value;
                }
                this.$emit("reload");
                bus.$emit('asset-property-change')
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              } else {
                this.$message.error(response.msg);
              }
            });
          }else{
            this.$post('sys/dict/save', item).then(response => {
              if (response.code === 200) {
                this.editModel.typeCode=response.data.dictEntity.code;
                this.$emit("reload");
                bus.$emit('asset-property-change')
                // this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                resolve();
              } else {
                this.$message.error(response.msg);
              }
            });
          }
        });
      },
      editVendor(item) {
        this.editingVendor = item.value;
        this.inputHandler(item);
        item.isEdit = true;
      },
      saveVendor(item) {
        return new Promise(resolve => {
          if (this.editingVendor) {
            let temp = Object.assign({}, item);
            temp.value = this.editingVendor;
            this.$post('sys/dict/update', temp).then(response => {
              if (response.code === 200) {
                item.value = this.editingVendor;
                item.isEdit = false;
                if (this.editModel.vendor.id == item.id) {
                  this.editModel.vendor.value = item.value;
                }
                this.$emit("reload");
                bus.$emit('asset-property-change')
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
              } else {
                this.$message.error(response.msg);
              }
            });
          } else {
            this.$post('sys/dict/save', item).then(response => {
              if (response.code === 200) {
                this.editModel.vendorCode=response.data.dictEntity.code;
                this.$emit("reload");
                bus.$emit('asset-property-change')
                // this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                resolve();
              } else {
                this.$message.error(response.msg);
              }
            });
          }
        });
      },
      delVendor(id) {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("sys/dict/delete?ids=" + id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.getVendorData();
              this.$emit("reload");
              bus.$emit('asset-property-change')
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getVendorData() {
        this.$get('sys/dict/all?type=vendor&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.vendorData = response.data.map((item) => {
              item.isEdit = false;
              return item;
            });
          }
        });
      },
      getTypeData() {
        this.$get('sys/dict/all?type=assetType&pageSize=-1').then(response => {
          if (response.code === 200) {
            this.typeData = response.data.map((item) => {
              item.isEdit = false;
              return item;
            });
          }
        });
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
        let data = [];
        if (type == 'vendor') {
          if (!queryString) {
            data = this.vendorData;
          } else {
            for (let i = 0; i < this.vendorData.length; i++) {
              if (this.vendorData[i].value.toLowerCase().indexOf(queryString.toLowerCase()) != -1) {
                data.push(this.vendorData[i]);
              }
            }
          }
        } else if (type == 'type') {
          if (!queryString) {
            data = this.typeData;
          } else {
            for (let i = 0; i < this.typeData.length; i++) {
              if (this.typeData[i].value.toLowerCase().indexOf(queryString.toLowerCase()) != -1) {
                data.push(this.typeData[i]);
              }
            }
          }
        }
        return data;
      },
      autocompleteExist(type, string) {
        let result = false;
        let data = [];
        if (type == 'vendor') {
          data = this.vendorData;
        } else if (type == 'type') {
          data = this.typeData;
        }
        for (let i = 0; i < data.length; i++) {
          if (data[i].value.toLowerCase() == string.toLowerCase()) {
            result = data[i].code;
            break;
          }
        }
        return result;
      }
    },
    mounted() {
      this.getVendorData();
      this.getTypeData();
    },
    watch: {
      model: {
        immediate: true,
        deep:true,
        handler(n, o) {
          this.editModel = JSON.parse(JSON.stringify(n));
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
