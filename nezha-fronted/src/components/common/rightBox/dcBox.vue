<template>
  <transition name="right-box">
    <div class="right-box right-box-dc" v-if="rightBox.show">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button id="dc-del" type="button" v-if="dc.id != '' && rightBox.isEdit" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
          <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button v-if="!rightBox.isEdit" id="dc-save" type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light nz-btn-min-width-82">
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
        <el-form class="right-box-form" :model="dc" label-position="top" :rules="rules" ref="dcForm">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model="dc.name" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{dc.name}}</div>
          </el-form-item>
          <el-form-item :label='$t("asset.createAssetTab.location")' prop="location">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="dc.location" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{dc.location}}</div>
          </el-form-item>
          <el-form-item :label='$t("asset.createAssetTab.tel")' prop="tel">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="dc.tel" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{dc.tel}}</div>
          </el-form-item>
          <el-form-item :label='$t("asset.createAssetTab.principal")' prop="principal">
            <el-select value-key="id" popper-class="config-dropdown"
                       v-model="dc.principal" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option @click.native="" v-for="item in userData" :key="item.userId" :label="item.username"
                         :value="item.userId" :id="'dc-principal-op-'+item.userId">
                <span>{{item.username}}</span>
              </el-option>

            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{dc.tel}}</div>
          </el-form-item>
          <el-form-item :label='$t("config.dc.area")' prop="area">


          </el-form-item>
        </el-form>
      </el-scrollbar>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="dc-box-esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button v-if="rightBox.isEdit" @click="saveOrToEdit" id="dc-box-save" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
  import {noSpecialChar} from "../js/validate";

  export default {
    name: "dcBox",
    props: {
      dc: Object,
      userData: Array
    },
    data() {
      return {
        rightBox: {
          show: false,
          title: '',
          isEdit: false
        },
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'},
            {validator: noSpecialChar,trigger: "change"}
          ],
        },
        areaData: [],
        data: {
          code: 200,
          msg: "success",
          data: {
            list: [{
              id: 1,
              pid: 0,
              name: "astana",
              longitude: 100.3,
              latitude: 24.3,
              i18n:{en:'astana',cn:'阿斯塔纳'},
              children: [{
                id: 2,
                pid: 1,
                name: "qu",
                longitude: 100.3,
                latitude: 24.3,
                i18n:{en:'qu',cn:'阿斯塔纳一个区'},
                children: [{
                  id: 3,
                  pid: 2,
                  name: "qu2",
                  longitude: 100.3,
                  latitude: 24.3,
                  i18n:{en:'qu2',cn:'阿斯塔纳二个区'}}
                ]
              }, {
                id: 4,
                pid: 0,
                name: "alamutu",
                longitude: 100.3,
                latitude: 24.3,
                i18n:{en:'alamutu',cn:'阿拉木图'},
                children: [{
                  id: 5,
                  pid: 4,
                  name: "qu3",
                  longitude: 100.3,
                  latitude: 24.3,
                  i18n: {en: 'qu3', cn: '阿拉木图一个区'}
                }]
              }]
            }]
          }
        },
        data2: [{
          id: 1,
          label: '一级 1',
          children: [{
            id: 4,
            label: '二级 1-1',
            children: [{
              id: 9,
              label: '三级 1-1-1'
            }, {
              id: 10,
              label: '三级 1-1-2'
            }]
          }]
        }, {
          id: 2,
          label: '一级 2',
          children: [{
            id: 5,
            label: '二级 2-1'
          }, {
            id: 6,
            label: '二级 2-2'
          }]
        }, {
          id: 3,
          label: '一级 3',
          children: [{
            id: 7,
            label: '二级 3-1'
          }, {
            id: 8,
            label: '二级 3-2',
            children: [{
              id: 11,
              label: '三级 3-2-1'
            }, {
              id: 12,
              label: '三级 3-2-2'
            }, {
              id: 13,
              label: '三级 3-2-3'
            }]
          }]
        }],
      }
    },
    methods: {
      show(show, isEdit) {
        this.rightBox.show = show;
        this.rightBox.isEdit = isEdit;
      },

      /*关闭弹框*/
      esc() {
        this.rightBox.show = false;
      },

      /*保存*/
      save() {
        this.$refs.dcForm.validate((valid) => {
          if (valid) {
            if (this.dc.id) {
              this.$put('idc', this.dc).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.rightBox.show = false;
                  this.$emit('reload');
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              this.$post('idc', this.dc).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.rightBox.show = false;
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
          this.rightBox.title = this.$t("asset.createAssetTab.editIdcTab.title") + "  ID：" + this.dc.id;
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
          this.$delete("idc?ids=" + this.dc.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.rightBox.show = false;
              this.$store.commit('dcListChange');
            } else {
              this.$message.error(response.msg);
            }
          });
        });
      },
      getAreaData() {
        this.areaData = this.toTreeData(this.data);

        /*this.$get('area', {}).then(response => {
          if (response.code === 200) {
            let rawData = response.data.list;
            //将原始数据处理为el-tree格式

          }
        });*/
      },
      toTreeData(rawData) {

        return rawData;
      }
    },
    mounted() {
      this.getAreaData();
    },
    computed: {
    },
    watch: {
      dc: {
        immediate: true,
        deep:true,
        handler(n, o) {
          if (n && n.id) {
            this.rightBox.title =this.rightBox.isEdit? this.$t("asset.createAssetTab.editIdcTab.title") + "  ID：" + n.id : this.$t("config.dc.dc") + "  ID：" + n.id ;
          } else {
            this.rightBox.title = this.$t("asset.createAssetTab.AddIdcTab.title");
          }
        }
      },
    }
  }
</script>

<style scoped>
</style>
