<template>
  <div class="right-box right-box-dc" v-clickoutside="clickOutside">
      <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
        <button id="dc-del" type="button" v-if="editDc.id" @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{editDc.id ? ($t("config.dc.editDc") + "  ID：" + editDc.id) : $t("config.dc.createDc")}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <el-scrollbar class="right-box-form-box">
        <el-form class="right-box-form right-box-form-left" label-width="120px" :model="editDc" label-position="right" :rules="rules" ref="dcForm">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editDc.name" size="small"></el-input>
          </el-form-item>
          <el-form-item :label='$t("asset.location")' prop="location">
            <el-input placeholder="" v-model="editDc.location" size="small"></el-input>
          </el-form-item>
          <el-form-item :label='$t("asset.tel")' prop="tel">
            <el-input placeholder="" v-model="editDc.tel" size="small"></el-input>
          </el-form-item>
          <el-form-item :label='$t("asset.principal")' prop="principal">
            <el-select value-key="id" popper-class="config-dropdown" v-model="editDc.principal" placeholder="" size="small">
              <el-option @click.native="" v-for="item in userData" :key="item.userId" :label="item.username" :value="item.userId" :id="'dc-principal-op-'+item.userId">
                <span>{{item.username}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label='$t("config.dc.area")' prop="area">
            <select-area ref="selectArea" :areaData="areaData" :placement="'bottom-start'" @selectArea="selectArea" :currentArea="editDc.area.id">
              <template v-slot:trigger>
                <el-input placeholder="" v-model="editDc.area.name" size="small" readonly="readonly" @click.native="toSelectArea"></el-input>
              </template>
            </select-area>
          </el-form-item>
        </el-form>
      </el-scrollbar>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button @click="esc" id="dc-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button @click="save" id="dc-box-save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>

    </div>
</template>

<script>
  import selectArea from "../popBox/selectArea"; //dc弹框
  export default {
    name: "dcBox",
    props: {
      dc: Object,
      userData: Array
    },
    components:{
      'select-area': selectArea
    },
    data() {
      return {
        editDc: {},
        rules: {
          name: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
        },
        areaData: [],
      }
    },
    methods: {
      /*关闭弹框*/
      esc(refresh) {
        this.$emit("close", refresh);
      },
      clickOutside() {
        this.esc(false);
      },
      /*弹出选择area弹框*/
      toSelectArea() {
        this.$refs.selectArea.openBox(this.editDc.area);
      },

      /*保存*/
      save() {
        this.$refs.dcForm.validate((valid) => {
          if (valid) {
            if (this.editDc.id) {
              if (this.editDc.area) {
                this.editDc.areaId = this.editDc.area.id;
              }
              this.$put('idc', this.editDc).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              if (this.editDc.area) {
                this.editDc.areaId = this.editDc.area.id;
              }
              this.$post('idc', this.editDc).then(response => {
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
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
      /*删除*/
      del() {
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("idc?ids=" + this.editDc.id).then(response => {
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
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
        this.editDc.area.id = area.id;
        this.editDc.area.name = area.name;
      }
    },
    mounted() {
      this.getAreaData();
    },
    watch: {
      dc: {
        immediate: true,
        deep:true,
        handler(n, o) {
          this.editDc = JSON.parse(JSON.stringify(n));
        }
      },
    }
  }
</script>
