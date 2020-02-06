<template>
  <el-popover :placement="placement"  @show="afterShow"  width="400" @hide="hidePop"  ref="popBox" v-model="popBox.show" popper-class="nz-pop">
    <div class="">
      <!-- begin--顶部按钮-->
      <div class="pop-top-btns">
        <button type="button" v-if="idc.id && idc.id != ''&& popBox.isEdit" @click="del" class="nz-btn nz-btn-size-small nz-btn-size-alien nz-btn-style-light nz-btn-min-width-60" id="dc-del">
          <span class="pop-top-btn-icon"><i class="el-icon-delete"></i></span>
          <span class="pop-top-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-60" id="dc-save">
          <span class="pop-top-btn-icon"><i class="nz-icon nz-icon-edit"></i></span>
          <span class="pop-top-btn-txt" v-if="popBox.isEdit">{{$t('overall.save')}}</span>
          <span class="pop-top-btn-txt" v-else>{{$t('overall.edit')}}</span>
        </button>

        <button type="button" @click="esc" class="nz-btn nz-btn-size-alien nz-btn-size-small nz-btn-style-light nz-btn-min-width-35" id="dc-esc">
          <span class="pop-top-btn-icon"><i class="el-icon-close"></i></span>
          <span class="pop-top-btn-txt">{{$t('overall.esc')}}</span>
        </button>
      </div>
      <!-- end--顶部按钮-->
      <div class="pop-title">{{title}}</div>

      <div class="pop-item-wider">
        <el-form class="right-box-form" :model="idc" label-position="left" label-width="150px"  :rules="rules" ref="idcForm">
          <el-form-item :label="$t('asset.createAssetTab.dcName')" prop="name">
            <el-input type="text"  placeholder="" v-model="idc.name" size="mini" maxlength="64" v-if="popBox.isEdit"></el-input>
            <div class="right-box-form-content-txt" v-if="!popBox.isEdit">{{idc.name}}</div>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.location')" prop="location">
            <el-input type="text"  placeholder="" v-model="idc.location" size="mini" v-if="popBox.isEdit"></el-input>
            <div class="right-box-form-content-txt" v-if="!popBox.isEdit">{{idc.location}}</div>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.principal')" prop="principal">
            <el-select v-model="idc.principal" clearable size="mini" placeholder="" v-if="popBox.isEdit">
              <el-option v-for="item in principals" :key="item.id" :label="item.username" :value="item.userId"></el-option>
            </el-select>
            <div class="right-box-form-content-txt" v-if="!popBox.isEdit">{{idc.principal}}</div>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.tel')" prop="tel" >
            <el-input type="text"  placeholder="" v-model="idc.tel" size="mini" v-if="popBox.isEdit"></el-input>
            <div class="right-box-form-content-txt" v-if="!popBox.isEdit">{{idc.tel}}</div>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <span :class="buttonClass" @click.prevent.stop="" slot="reference" :id="'edit-idc-'+Math.random().toString(36).slice(-8)">
      <slot name="optionZone">
        <i class="el-icon-plus" id="dc-plus"></i>
      </slot>
    </span>
  </el-popover>
</template>

<script>
    import {phone} from '../../common/js/validate'
    export default {
      name: "dcConfig",
      props:{
        postIdc:{type:Object},
        placement:{type:String},
        buttonClass:{type:String},
        isEdit:{type:Boolean,default:true},
        userData:{type:Array}
      },
      created() {
        this.init();
      },
      data(){
        return {
          title:"",
          rules:{
            name:[
              {required:true,message:this.$t('validate.required'),trigger:'blur'}
            ],
            location:[
            ],
            principal:[
            ],
            tel:[
              { validator: phone, trigger: 'blur'}
            ]
          },
          idc:{},
          principals:[],
          popBox:{isEdit:true,show:false}
        }
      },
      methods:{
        init:function(){
          let temp=this;
          temp.getUserData();
        },
        resetData:function(){
          let temp=this;
          temp.idc={
            name:"",
            location: "",
            principal: null,
            tel:""
          }
        },
        openBox:function(){
          this.popBox.show=true;
        },
        afterShow:function(){
          if(!this.popBox.isEdit){
            this.popBox.isEdit=this.isEdit;
          }
        },
        getUserData() {
          let temp=this;
          if(temp.userData&&temp.userData.length>0){
            temp.principals=temp.userData;
            return;
          }
          temp.$get('sys/user/list').then(response => {
            if (response.code === 200) {
              temp.principals = response.data.list
            }
          })
        },
        saveOrToEdit:function(){
          if (!this.popBox.isEdit) {
            this.toEdit(this.idc);
          } else {
            this.save();
          }
        },
        save:function(){
          let temp=this;
          temp.$refs.idcForm.validate((valide)=>{
            if(valide){
              const h = temp.$createElement;
              if(!temp.idc.id){
                temp.$post('idc', temp.idc).then(response => {
                  if (response.code === 200) {
                    temp.$message({duration: 1000, type: 'success', message: temp.$t("tip.saveSuccess")});
                    temp.$emit("after");
                    temp.$store.commit('assetDcListChange');
                    temp.esc();
                  } else {
                    this.$message.error(response.msg);
                  }
                })
              }else{
                this.$put('idc', temp.idc).then(response => {
                  if (response.code === 200) {
                    temp.$message({duration: 1000, type: 'success', message: temp.$t("tip.saveSuccess")});
                    temp.$emit("after");
                    temp.$store.commit('assetDcListChange');
                    temp.esc();
                  } else {
                    this.$message.error(response.msg);
                  }
                })
              }

            }else{
              return false;
            }
          });
        },
        toEdit:function(u){
          this.idc = Object.assign({}, u);
          this.popBox.isEdit = true;
          this.title = this.$t('asset.createAssetTab.editIdcTab.title') + "  ID：" + this.idc.id
          this.popBox.show = true;
        },
        show:function(isShow,isEdit){
          this.popBox.show=isShow;
          this.popBox.isEdit=isEdit;
        },
        esc:function(){
          this.popBox.show=false;
        },
        del:function(){
          let temp=this;
          temp.$confirm(temp.$t("tip.confirmDelete"), {
            confirmButtonText: temp.$t("tip.yes"),
            cancelButtonText: temp.$t("tip.no"),
            type: 'warning'
          }).then(() => {
            temp.$delete("idc?ids=" + temp.idc.id).then(response => {
              if (response.code === 200) {
                temp.$message({duration: 1000, type: 'success', message: temp.$t("tip.deleteSuccess")});
                temp.$emit("after");
                temp.$store.commit('assetDcListChange');
                temp.esc();
              } else {
                this.$message.error(response.msg);
              }
            });
          });

        },
        hidePop:function(){//隐藏事件触发方法
          if(this.postIdc&&this.postIdc.id){
            this.idc=this.postIdc
          }else{
            this.resetData();
          }
          this.clearValidate();
        },
        clearValidate:function(){
          this.$refs.idcForm.clearValidate();
        }
      },
      watch:{
        postIdc: {
          immediate: true,
          deep: true,
          handler(n, o) {
            if (n && n.id) {
              this.title = this.popBox.isEdit?this.$t('asset.createAssetTab.editIdcTab.title') + "  ID：" + n.id:this.$t('asset.createAssetTab.dc') + "  ID：" + n.id;
              this.idc=n;

            } else {
              this.title = this.$t('asset.createAssetTab.AddIdcTab.title');
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
