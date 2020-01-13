<template>
  <el-popover :placement="placement"  width="400" @hide="hidePop"  ref="popBox" v-model="popBox.show">
    <div class="">
      <div class="pop-window-assetType-content">
        <div class="pop-top-btns">
          <button type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-small nz-btn-style-normal" id="cabinet-save">
            <span class="top-tool-btn-txt" v-if="popBox.isEdit">{{$t('overall.save')}}</span>
            <span class="top-tool-btn-txt" v-else>{{$t('overall.edit')}}</span>
          </button>
          <button type="button" @click="esc" class="nz-btn nz-btn-size-small nz-btn-style-light nz-btn-style-square" id="cabinet-esc" >
            <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
          </button>
        </div>
        <!--标题-->
        <div class="pop-title">{{title}}</div>
        <!--表单内容-->
        <el-form class="pop-item-wider" :model="cabinet" ref="cabinetForm" :rules="rules">
          <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.name')" prop="name">
            <el-input size='mini' v-model="cabinet.name" v-if="popBox.isEdit"/>
            <div class="right-box-form-content-txt" v-if="!popBox.isEdit">{{cabinet.name}}</div>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.uSize')" prop="uSize">
            <div :class="{'right-box-form-content-txt':!popBox.isEdit}" >{{cabinet.uSize}}</div>
            <el-slider v-model.number="cabinet.uSize" :max="47" v-if="popBox.isEdit"></el-slider>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.remark')">
            <el-input size='mini' v-model="cabinet.remark" type="textarea" :rows="2" v-if="popBox.isEdit"/>
            <div class="right-box-form-content-txt" v-if="!popBox.isEdit">{{cabinet.remark}}</div>
          </el-form-item>
          <el-form-item :label="this.$t('asset.createAssetTab.AddCabinetTab.DC')" prop="idcId">
            <el-select size='mini' v-model="cabinet.idcId" clearable style="width: 100%;" placeholder="" v-if="popBox.isEdit">
              <el-option v-for="item in idcDatas" :key="item.key" :label="item.name" :value="item.id">
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
            <div class="right-box-form-content-txt" v-if="!popBox.isEdit">{{idc?idc.name:''}}</div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <span :class="buttonClass" @click.prevent.stop="" slot="reference" :id="'cabinet-edit-'+Math.random().toString(36).slice(-8)">
      <slot name="optionZone">
        <i class="el-icon-plus" id="cabinet-plus"></i>
      </slot>
    </span>
  </el-popover>
</template>

<script>
export default {
  name: "cabinetConfig",
  props:{
    postCabinet:{type:Object},
    placement:{type:String},
    buttonClass:{type:String},
    isEdit:{type:Boolean,default:true}
  },
  created() {
    this.init();
  },
  data(){
    return {
      title:"",
      rules:{
        name: [
          {required: true, message: this.$t('validate.required'), trigger: 'blur'}
        ],
        uSize: [
          {required: true, type: 'number', min: 1, max: 47, message: this.$t('validate.required'), trigger: 'blur'}
        ],
        idcId: [
          {required: true, message: this.$t('validate.required'), trigger: 'blur'}
        ]
      },
      cabinet:{},
      popBox:{isEdit:false,show:false},
      idcDatas:[],
      idc:null
    }
  },
  methods:{
    init:function(){
      this.getIdcDatas();
    },
    resetData:function(){
      let temp=this;
      temp.cabinet={
        name:'',
        uSize:0,
        idcId:null,
        remark:''
      }
    },
    saveOrToEdit(){
      if (!this.popBox.isEdit) {
        this.toEdit(this.cabinet);
      } else {
        this.save();
      }
    },
    save:function(){
      let temp=this;
      temp.$refs.cabinetForm.validate((valid => {
        if(valid){
          if (temp.cabinet.id) {
            this.$put('cabinet', temp.cabinet).then(res => {
              const h = temp.$createElement;
              if (res.code === 200) {
                temp.$message({duration: 2000, type: 'success', message: temp.$t("tip.saveSuccess")});
                temp.$emit("after",temp.cabinet.idcId);
                temp.esc();
              } else {
                temp.$message.error(res.msg);
              }
            })
          } else {
            temp.$post('cabinet', temp.cabinet).then(res => {
              const h = temp.$createElement;
              if (res.code === 200) {
                temp.$message({duration: 2000, type: 'success', message: temp.$t("tip.saveSuccess")});
                temp.$emit("after",temp.cabinet.idcId);
                temp.esc();
              } else {
                temp.$message.error(res.msg);
              }
            })
          }
        }else{
          return false;
        }
      }))
    },
    show:function(isShow,isEdit){
      this.popBox.show=isShow;
      this.popBox.isEdit=isEdit;
    },
    toEdit:function(u){
      this.cabinet = Object.assign({}, u);
      this.popBox.isEdit = true;
      this.title = this.$t('asset.createAssetTab.editCabinetTab.title') + "  ID：" + this.cabinet.id;
      this.popBox.show = true;
    },
    getIdcDatas:function(){
      let temp=this;
      temp.$get('idc').then(response => {
        if (response.code === 200) {
          temp.idcDatas = response.data.list;
          for (let i in temp.idcDatas){
            let item=temp.idcDatas[i];
            if(item.id==temp.cabinet.idcId){
             temp.idc=item;
              break;
            }
          }
        }
      })
    },
    openBox:function(){
      this.popBox.show=true;
    },
    esc:function(){
      this.popBox.show=false;
    },
    hidePop:function(){//隐藏事件触发方法
      if(this.postCabinet&&this.postCabinet.id){
        this.cabinet=this.postCabinet;
      }else{
        this.resetData();
      }
      this.clearValidate();
    },
    clearValidate:function(){
      this.$refs.cabinetForm.clearValidate();
    }
  },
  watch:{
    postCabinet: {
      immediate: true,
      deep: true,
      handler(n, o) {
        if (n && n.id) {
          this.title =this.popBox.isEdit? this.$t('asset.createAssetTab.editCabinetTab.title') + "  ID：" + n.id : this.$t('asset.createAssetTab.cabinet') + "  ID：" + n.id;
          this.cabinet=n;
        } else {
          this.title = this.$t('asset.createAssetTab.AddCabinetTab.title');
          this.resetData();
        }
      }
    },
    isEdit:{
      immediate: true,
      handler(n, o) {
        this.popBox.isEdit=n;
      }
    }
  }
}
</script>

<style scoped>

</style>
