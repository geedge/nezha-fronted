<template>
  <div class="right-box right-box-dc" v-clickoutside="{obj:editDc,func:clickOutside}">
      <!-- begin--顶部按钮-->
    <div class="right-box-top-btns right-box-form-delete">
        <button @click="del" class="nz-btn nz-btn-size-normal nz-btn-size-alien" id="dc-del" type="button" v-has="'dc_delete'" v-if="editDc.id">
          <span class="right-box-top-btn-icon"><i class="nz-icon nz-icon-delete"></i></span>
          <span class="right-box-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{editDc.id ? ($t("config.dc.editDc") + "  ID：" + editDc.id) : $t("config.dc.createDc")}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box-form-box">
        <el-form class="right-box-form right-box-form-left" label-width="120px" :model="editDc" label-position="right" :rules="rules" ref="dcForm">
          <el-form-item :label='$t("overall.name")' prop="name">
            <el-input placeholder="" maxlength="64" show-word-limit v-model="editDc.name" size="small" id="dc-box-input-name"></el-input>
          </el-form-item>
          <el-form-item :label='$t("asset.location")' prop="location">
            <el-input placeholder="" v-model="editDc.location" size="small" id="dc-box-input-location"></el-input>
          </el-form-item>
          <el-form-item :label='$t("asset.tel")' prop="tel">
            <el-input placeholder="" v-model="editDc.tel" size="small" id="dc-box-input-tel"></el-input>
          </el-form-item>
          <el-form-item :label='$t("asset.principal")' prop="principal">
            <el-select value-key="id" popper-class="config-dropdown" v-model="editDc.principal" placeholder="" size="small" id="dc-box-input-principal">
              <el-option @click.native="" v-for="item in userData" :key="item.userId" :label="item.username" :value="item.userId" :id="'dc-principal-op-'+item.userId">
                <span>{{item.username}}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <!--<el-form-item :label='$t("config.dc.area")' prop="area">-->
            <!--<select-area ref="selectArea" :areaData="areaData" :placement="'bottom-start'" @selectArea="selectArea" :currentArea="editDc.area.id">-->
              <!--<template v-slot:trigger>-->
                <!--<el-input placeholder="" v-model="editDc.area.name" size="small" readonly="readonly" @click.native="toSelectArea"></el-input>-->
              <!--</template>-->
            <!--</select-area>-->
          <!--</el-form-item>-->
          <el-form-item :label='$t("config.dc.state")' prop="state">
            <el-switch
              id="dc-box-input-name"
              v-model="editDc.state"
              active-value="ON"
              inactive-value="OFF"
              active-color="#ee9d3f"
            >
            </el-switch>
          </el-form-item>
          <el-form-item :label='$t("config.dc.longitude")' prop="longitude" :rules="[{required:coordinateFlag,trigger:'blur'}]">
            <el-input-number
              id="dc-box-input-longitude"
              placeholder=""
              v-model="editDc.longitude"
              size="small"
              controls-position="right"
              :min="-180"
              :max="180"
              :step="0.00001"
              :precision="5"
              @change="(val)=>{coordinateChange(val,'longitude')}"
            />
          </el-form-item>
          <el-form-item :label='$t("config.dc.latitude")' prop="latitude"  :rules="[{required:coordinateFlag,trigger:'blur'}]">
            <el-input-number
              id="dc-box-input-latitude"
              placeholder=""
              v-model="editDc.latitude"
              size="small"
              controls-position="right"
              :min="-90"
              :max="90"
              :step="0.00001"
              :precision="5"
              @change="(val)=>{coordinateChange(val,'latitude')}"
            />
          </el-form-item>
        </el-form>
      </div>

      <!--底部按钮-->
      <div class="right-box-bottom-btns">
        <button v-cancel="{obj:editDc,func:esc}" id="dc-box-esc" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new">
          <span>{{$t('overall.cancel')}}</span>
        </button>
        <button :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" @click="save" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" id="dc-box-save">
          <span>{{$t('overall.save')}}</span>
        </button>
      </div>

    </div>
</template>

<script>
  import selectArea from "../popBox/selectArea"; //dc弹框
  var  regNum = /^[0-9]+.?[0-9]*/;
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
          state:[
            {required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ]
        },
        areaData: [],
        coordinateFlag:false,
      }
    },
    methods: {
      /*关闭弹框*/
      esc(refresh) {
        this.prevent_opt.save=false;
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
        if(this.prevent_opt.save){ return } ;
        this.prevent_opt.save=true;
        this.$refs.dcForm.validate((valid) => {
          if (valid) {
            if (this.editDc.id) {
              let param={...this.editDc};
              if (param.area) {
                param.areaId = param.area.id;
              }
              if(!regNum.test(param.longitude)){
                param.longitude=null
              }
              if(!regNum.test(param.latitude)){
                param.latitude=null
              }

              this.$put('idc', param).then(response => {
                this.prevent_opt.save=false;
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            } else {
              let param={...this.editDc}
              if (param.area) {
                param.areaId = param.area.id;
              }
              if(!regNum.test(param.longitude)){
                param.longitude=null;
              }
              if(!regNum.test(param.latitude)){
                param.latitude=null;
              }
              this.$post('idc', param).then(response => {
                this.prevent_opt.save=false;
                if (response.code === 200) {
                  this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                  this.esc(true);
                } else {
                  this.$message.error(response.msg);
                }
              });
            }
          } else {
            this.prevent_opt.save=false;
            return false;
          }
        });
      },
      /*删除*/
      del() {
        if(this.prevent_opt.save){ return } ;
        this.prevent_opt.save=true;
        this.$confirm(this.$t("tip.confirmDelete"), {
          confirmButtonText: this.$t("tip.yes"),
          cancelButtonText: this.$t("tip.no"),
          type: 'warning'
        }).then(() => {
          this.$delete("idc?ids=" + this.editDc.id).then(response => {
            this.prevent_opt.save=false;
            if (response.code === 200) {
              this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
              this.esc(true);
            } else {
              this.$message.error(response.msg);
            }
          });
        }).catch(()=>{
          this.prevent_opt.save=false;
        });
      },
      // getAreaData() {
      //   this.$get('area', {pid: 0}).then(response => {
      //     if (response.code === 200) {
      //       this.areaData = response.data.list;
      //     }
      //   });
      // },

      selectArea(area) {
        this.editDc.area.id = area.id;
        this.editDc.area.name = area.name;
      },
      coordinateChange(val,str){//经纬度改变
        if(regNum.test(this.editDc.longitude) || regNum.test(this.editDc.latitude)){
          this.coordinateFlag=true
        }else{
          this.coordinateFlag=false;
          this.$refs['dcForm'].clearValidate(['longitude','latitude'])
        }
      },
    },
    mounted() {
      // this.getAreaData();
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
