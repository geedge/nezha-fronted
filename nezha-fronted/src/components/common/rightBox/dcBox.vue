<template>
  <div class="right-box right-box-dc" v-clickoutside="clickos">
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <button id="dc-del" type="button" v-if="currentDc.id" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien nz-btn-style-light">
          <span class="right-box-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form right-box-form-left" label-width="120px" :model="currentDc" label-position="right" :rules="rules" ref="dcForm">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input v-if="rightBox.isEdit" placeholder="" maxlength="64" show-word-limit v-model="currentDc.name" size="small"></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{currentDc.name}}</div>
          </el-form-item>
          <el-form-item :label='$t("asset.createAssetTab.location")' prop="location">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="currentDc.location" size="small"></el-input>
            <div v-if="!rightBox.isEdit && currentDc.location" class="right-box-form-content-txt">{{currentDc.location}}</div>
            <div v-else-if="!rightBox.isEdit" class="right-box-form-content-txt">-</div>
          </el-form-item>
          <el-form-item :label='$t("asset.createAssetTab.tel")' prop="tel">
            <el-input v-if="rightBox.isEdit" placeholder="" v-model="currentDc.tel" size="small"></el-input>
            <div v-if="!rightBox.isEdit && currentDc.tel" class="right-box-form-content-txt">{{currentDc.tel}}</div>
            <div v-else-if="!rightBox.isEdit" class="right-box-form-content-txt">-</div>
          </el-form-item>
          <el-form-item :label='$t("asset.createAssetTab.principal")' prop="principal">
            <el-select value-key="id" popper-class="config-dropdown"
                       v-model="currentDc.principal" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option @click.native="" v-for="item in userData" :key="item.userId" :label="item.username"
                         :value="item.userId" :id="'dc-principal-op-'+item.userId">
                <span>{{item.username}}</span>
              </el-option>
            </el-select>
            <div v-if="!rightBox.isEdit && currentDc.principal" class="right-box-form-content-txt">
              <template v-for="item in userData">
                <template v-if="item.userId == currentDc.principal">{{item.username}}</template>
              </template>
            </div>
            <div v-else-if="!rightBox.isEdit" class="right-box-form-content-txt">-</div>
          </el-form-item>
          <el-form-item :label='$t("config.dc.area")' prop="area">
            <select-area ref="selectArea" :areaData="areaData" :placement="'bottom-start'" @selectArea="selectArea" :currentArea="currentDc.area.id">
              <template v-slot:trigger>
                <el-input v-if="rightBox.isEdit" placeholder="" v-model="currentDc.area.name" size="small" readonly="readonly" @click.native="toSelectArea"></el-input>
              </template>
            </select-area>
            <div v-if="!rightBox.isEdit && currentDc.area.name" class="right-box-form-content-txt">{{currentDc.area.name}}</div>
            <div v-else-if="!rightBox.isEdit" class="right-box-form-content-txt">-</div>
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
</template>

<script>
  export default {
    name: "dcBox",
    props: {
      dc: Object,
      userData: Array
    },
    data() {
      return {
        currentDc: {
          id: '',
          name: '',
          location: '',
          tel: '',
          principal: '',
          area: {
            id: '',
            name: ''
          },
          areaId: ''
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
        areaData: [],
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

      /*弹出选择area弹框*/
      toSelectArea() {
        this.$refs.selectArea.openBox(this.currentDc.area);
      },

      /*保存*/
      save() {
        this.$refs.dcForm.validate((valid) => {
          if (valid) {
            if (this.currentDc.id) {
              if (this.currentDc.area) {
                this.currentDc.areaId = this.currentDc.area.id;
              }
              this.$put('idc', this.currentDc).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.rightBox.show = false;
                  this.$emit('reload');
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              if (this.currentDc.area) {
                this.currentDc.areaId = this.currentDc.area.id;
              }
              this.$post('idc', this.currentDc).then(response => {
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
          this.rightBox.title = this.$t("asset.createAssetTab.editIdcTab.title") + "  ID：" + this.currentDc.id;
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
          this.$delete("idc?ids=" + this.currentDc.id).then(response => {
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
      getAreaData() {
        this.$get('area', {pid: 0}).then(response => {
          if (response.code === 200) {
            this.areaData = response.data.list;
          }
        });
      },

      selectArea(area) {
        this.currentDc.area.id = area.id;
        this.currentDc.area.name = area.name;
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
          this.currentDc = JSON.parse(JSON.stringify(n));
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
