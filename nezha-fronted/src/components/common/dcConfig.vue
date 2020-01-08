<template>
  <el-popover :placement="placement"    width="400" @hide="hidePop"  ref="popBox" v-model="popBox.show">
    <div class="pop-window-assetType-content">
      <!-- begin--顶部按钮-->
      <div class="pop-top-btns">
        <button type="button" v-if="popBox.isEdit && idc.id != ''" @click="del" class="nz-btn nz-btn-size-normal nz-btn-style-light">
          <span class="top-tool-btn-txt">{{$t('overall.delete')}}</span>
        </button>
        <button type="button" @click="save" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
          <span class="top-tool-btn-txt">{{$t('overall.save')}}</span>
        </button>

        <button type="button" @click="esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
          <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
        </button>
      </div>
      <!-- end--顶部按钮-->
      <div class="pop-title">{{title}}</div>

      <div class="pop-item-wider">
        <el-form class="right-box-form" :model="idc" label-position="left" label-width="150px"  :rules="rules" ref="idcForm">
          <el-form-item :label="$t('asset.createAssetTab.dcName')" prop="name">
            <el-input type="text"  placeholder="" v-model="idc.name" size="mini" maxlength="64"></el-input>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.location')" prop="location">
            <el-input type="text"  placeholder="" v-model="idc.location" size="mini"></el-input>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.principal')" prop="principal">
            <el-select v-model="idc.principal" clearable size="mini" placeholder="">
              <el-option v-for="item in principals" :key="item.id" :label="item.username" :value="item.userId"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('asset.createAssetTab.tel')" prop="tel">
            <el-input type="text"  placeholder="" v-model="idc.tel" size="mini"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <span :class="buttonClass" @click.prevent.stop="" slot="reference">
      <slot name="optionZone"  >
        <i class="el-icon-plus"></i>
      </slot>
    </span>
  </el-popover>
</template>

<script>
    export default {
      name: "dcConfig",
      props:{
        postIdc:{type:Object},
        placement:{type:String},
        buttonClass:{type:String}
      },
      created() {
        this.init();
      },
      data(){
        let checkPhone=(rule, value, callback) => {
          if(!value || value == ''){
            callback()
          }
          const phoneReg = /^1[3|4|5|7|8][0-9]{9}$/
          setTimeout(() => {
            if (!Number.isInteger(+value)) {
              callback(new Error(this.$t('validate.tel')))
            } else {
              if (phoneReg.test(value)) {
                callback()
              } else {
                callback(new Error(this.$t('validate.tel')))
              }
            }
          }, 100)
        }

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
              { validator: checkPhone, trigger: 'blur'}
            ]
          },
          idc:{},
          principals:[],
          popBox:{isEdit:false,show:false}
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
        getUserData() {
          let temp=this;
          temp.$get('sys/user/list').then(response => {
            if (response.code === 200) {
              temp.principals = response.data.list
            }
          })
        },
        save:function(){
          let temp=this;
          temp.$refs.idcForm.validate((valide)=>{
            if(valide){
              const h = temp.$createElement;
              if(!temp.idc.id){
                temp.$post('idc', temp.idc).then(response => {
                  if (response.code === 200) {
                    temp.$message({duration: 1000, type: 'success', message: temp.$t("tip.deleteSuccess")});
                    temp.$emit("after");
                    temp.esc();
                  } else {
                    this.$message.error(response.msg);
                  }
                })
              }else{
                this.$put('idc', temp.idc).then(response => {
                  if (response.code === 200) {
                    temp.$message({duration: 1000, type: 'success', message: temp.$t("tip.deleteSuccess")});
                    temp.$emit("after");
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
              this.title = this.$t('asset.createAssetTab.editIdcTab.title') + "  ID：" + n.id;
              this.popBox.isEdit=true;
              this.idc=n;

            } else {
              this.title = this.$t('asset.createAssetTab.AddIdcTab.title');
              this.popBox.isEdit=false;
              this.resetData();
            }
          }
        },
      }
    }
</script>

<style scoped>

</style>
