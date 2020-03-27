<template>
  <transition name="right-box">
    <div class="right-box right-box-model" v-if="rightBox.show" v-clickoutside="clickos" @click="inputHandler">
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
          <!--model名称-->
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model.trim="currentModel.name" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentModel.name}}</div>
          </el-form-item>
          <!--设备类型-->
          <el-form-item :label="$t('config.model.type')" prop="type">
            <el-autocomplete
              :fetch-suggestions="typeSuggestion"
              v-model.trim="currentModel.type.value"
              placeholder=""
              size="small"
              popper-class="no-style-class"
              >
              <template slot-scope="{ item }">
                <div class="autocomplete-dropdown" @mouseenter="dropdownHoverItem = 'type' + item.id" @mouseleave="dropdownHoverItem = ''">
                  <span v-if="!item.isEdit">{{item.value}}</span>
                  <span v-else @click.stop="inputHandler(item)"><el-input size="mini" v-model="editingType" @click.stop></el-input></span>
                  <div class="dropdown-btns" v-show="dropdownHoverItem == 'type' + item.id">
                    <span class="dropdown-btn dropdown-btn-delete" :id="'model-type-op-del-' + item.id" @click.stop="delType(item.id)"><i class="el-icon-delete"></i></span>
                    <span v-if="!item.isEdit" class="dropdown-btn dropdown-btn-edit" :id="'model-type-op-edit-' + item.id" @click.stop="editType(item)"><i class="nz-icon nz-icon-edit"></i></span>
                    <span v-else class="dropdown-btn dropdown-btn-edit" :id="'model-type-op-edit-' + item.id" @click.stop="saveType(item)"><i class="el-icon-check"></i></span>
                  </div>
                </div>
              </template>
            </el-autocomplete>
          </el-form-item>
          <!--厂商-->
          <el-form-item :label="$t('config.model.vendor')" prop="vendor">
            <el-autocomplete
              :fetch-suggestions="vendorSuggestion"
              v-model.trim="currentModel.vendor.value"
              placeholder=""
              size="small"
              popper-class="no-style-class"
            >
              <template slot-scope="{ item }">
                <div class="autocomplete-dropdown" @mouseenter="dropdownHoverItem = 'vendor' + item.id" @mouseleave="dropdownHoverItem = ''">
                  <span v-if="!item.isEdit">{{item.value}}</span>
                  <span v-else @click.stop="inputHandler(item)"><el-input size="mini" v-model="editingVendor"></el-input></span>
                  <div class="dropdown-btns" v-show="dropdownHoverItem == 'vendor' + item.id">
                    <span class="dropdown-btn dropdown-btn-delete" :id="'model-vendor-op-del-' + item.id" @click.stop="delVendor(item.id)"><i class="el-icon-delete"></i></span>
                    <span v-if="!item.isEdit" class="dropdown-btn dropdown-btn-edit" :id="'model-vendor-op-edit-' + item.id" @click.stop="editVendor(item)"><i class="nz-icon nz-icon-edit"></i></span>
                    <span v-else class="dropdown-btn dropdown-btn-edit" :id="'model-type-op-edit-' + item.id" @click.stop="saveVendor(item)"><i class="el-icon-check"></i></span>
                  </div>
                </div>
              </template>
            </el-autocomplete>
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
          type: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          vendor: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        },
        vendorData: [], //vendor下拉列表的数据
        typeData: [],  //type下拉列表的数据
        editingVendor: '', //修改状态的vendor值
        editingType: '', //修改状态的assetType值
        dropdownHoverItem: '', //控制vendor和type下拉列表中操作按钮的展示
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
      esc() {
        this.rightBox.show = false;
        this.rightBox.firstShow = false;
      },

      /*保存*/
      save() {
        this.$refs.modelForm.validate((valid) => {
          if (valid) {
            let errMsg = [];
            //vendor和type如果是新记录，需要先请求后台新增，再获取code
            let vendorReady = false;
            let vendorCode = this.autocompleteExist('vendor', this.currentModel.vendor.value);
            if (vendorCode) {
              this.currentModel.vendorCode = vendorCode;
              vendorReady = true;
            } else {
              let vendor = {type: 'vendor', value: this.currentModel.vendor.value};
              this.$post("sys/dict/save", vendor).then(response => {
                if (response.code === 200) {
                  //保存成功后，重新获取
                  this.$get('sys/dict/all?type=vendor').then(response => {
                    if (response.code === 200) {
                      this.vendorData = response.data.map((item) => {
                        item.isEdit = false;
                        return item;
                      });
                      this.currentModel.vendorCode = this.autocompleteExist('vendor', this.currentModel.vendor.value);
                      vendorReady = true;
                    }
                  });
                } else {
                  errMsg.push("vendor");
                }
              });
            }

            let typeReady = false;
            let typeCode = this.autocompleteExist('type', this.currentModel.type.value);
            if (typeCode) {
              this.currentModel.typeCode = typeCode;
              typeReady = true;
            } else {
              let type = {type: 'assetType', value: this.currentModel.type.value};
              this.$post("sys/dict/save", type).then(response => {
                if (response.code === 200) {
                  this.$get('sys/dict/all?type=assetType').then(response => {
                    if (response.code === 200) {
                      this.typeData = response.data.map((item) => {
                        item.isEdit = false;
                        return item;
                      });
                      this.currentModel.typeCode = this.autocompleteExist('type', this.currentModel.type.value);
                      typeReady = true;
                    }
                  });
                } else {
                  errMsg.push("type");
                }
              });
            }

            let intervalTime = 1; //设置3秒超时
            let interval = setInterval(() => {
              if (vendorReady && typeReady) {
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
                clearInterval(interval);
              } else if (intervalTime > 15) {
                if (errMsg.length > 0) {
                  this.$message.error(errMsg.join() + " error");
                } else {
                  this.$message.error("Time out");
                }
                clearInterval(interval);
              } else {
                intervalTime++;
              }
            }, 200);
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
        if (this.editingType) {
          let temp = Object.assign({}, item);
          temp.value = this.editingType;
          this.$post('sys/dict/update', temp).then(response => {
            if (response.code === 200) {
              item.value = this.editingType;
              item.isEdit = false;
              if (this.currentModel.type.id == item.id) {
                this.currentModel.type.value = item.value;
              }
              this.$emit("reload");
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            } else {
              this.$message.error(response.msg);
            }
          });
        }
      },
      editVendor(item) {
        this.editingVendor = item.value;
        this.inputHandler(item);
        item.isEdit = true;
      },
      saveVendor(item) {
        if (this.editingVendor) {
          let temp = Object.assign({}, item);
          temp.value = this.editingVendor;
          this.$post('sys/dict/update', temp).then(response => {
            if (response.code === 200) {
              item.value = this.editingVendor;
              item.isEdit = false;
              if (this.currentModel.vendor.id == item.id) {
                this.currentModel.vendor.value = item.value;
              }
              this.$emit("reload");
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
            } else {
              this.$message.error(response.msg);
            }
          });
        }
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
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getVendorData() {
        this.$get('sys/dict/all?type=vendor').then(response => {
          if (response.code === 200) {
            this.vendorData = response.data.map((item) => {
              item.isEdit = false;
              return item;
            });
          }
        });
      },
      getTypeData() {
        this.$get('sys/dict/all?type=assetType').then(response => {
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
