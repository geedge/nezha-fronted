<template>
    <div>
      <el-form label-width="120px" class="" :model="account" :rules="rules" ref="accountForm">
          <!--<div class="nz-btn-group float-left" style="padding-top: 4px;" v-if="isEdit">
            <button type="button" @click="changeLoginType(1)" id="account-logintype-1"
                    class="nz-btn nz-btn-size-small float-left"
                    :class="{'nz-btn-disabled nz-btn-style-normal' : account.authType == 1, 'nz-btn-style-light' : account.authType == 2}">
              <span>{{$t('asset.createAssetTab.password')}}</span>
            </button>
            <button type="button" @click="changeLoginType(2)" id="account-logintype-2"
                    class="nz-btn nz-btn-size-small float-left"
                    :class="{'nz-btn-disabled nz-btn-style-normal' : account.authType == 2, 'nz-btn-style-light' : account.authType == 1}">
              <span>{{$t('asset.createAssetTab.ssh')}}</span>
            </button>
          </div>-->
        <div class="nz-tab" v-if="isEdit">
          <div class="nz-tab-item-box" @click="changeLoginType(1)" id="account-logintype-1">
            <div class="nz-tab-item" :class="{'nz-tab-item-active' : account.authType == 1}">{{$t('asset.createAssetTab.password')}}</div>
          </div>
          <div @click="changeLoginType(2)" class="nz-tab-item-box">
            <div class="nz-tab-item" :class="{'nz-tab-item-active' : account.authType == 2}">{{$t('asset.createAssetTab.ssh')}}</div>
          </div>
        </div>
        <el-form-item :label="$t('asset.createAssetTab.loginType')" size="mini" v-if="!isEdit">
          <div class="right-box-form-content-txt" >{{account.authType==1?$t('asset.createAssetTab.password'):$t('asset.createAssetTab.ssh')}}</div>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.account')" prop="user">
          <el-input autocomplete="new-password" size="small" v-model="account.user" v-if="isEdit"/>
          <div class="right-box-form-content-txt" v-if="!isEdit">{{account.user}}</div>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.password')" v-show="account.authType==1" v-if="isEdit">
          <el-input autocomplete="new-password" size="small" type="password" v-model="account.pwd"/>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.port')" prop="port" style="display: inline-block">
          <el-input size="small" v-model.number="account.port" v-if="isEdit"/>
          <div class="right-box-form-content-txt" v-if="!isEdit">{{account.port}}</div>
        </el-form-item>
        <el-form-item :label="this.$t('asset.createAssetTab.ssh')" v-show="account.authType==2" prop="file" v-if="isEdit">
          <el-input  rows="4" type="textarea" placeholder="" v-model="account.privateKey" size="small"></el-input>
        </el-form-item>
      </el-form>
    </div>
</template>

<script>
  import {port} from '../../common/js/validate'
export default {
    name: "accountConfig",
    props:{
      account:{type:Object},
      isEdit:{type:Boolean,default:true}
    },
    created() {
    },
  data(){
      return {
        rules:{
          user:[
            { required: true, message:this.$t('validate.required'),trigger: 'blur'}
          ],
          port:[
            {required:true,message:this.$t('validate.required'),trigger: 'blur'},
            { validator: port, trigger: 'blur'}
          ],
        },
        uploadTip:''
      }
    },
    methods:{
      resetData:function(){
        this.account={
          id:null,
          user:"",
          authType:1,
          pwd:"",
          port:null,
          privateKey:null,
          uploadFile:null
        }
      },
      changeLoginType:function(loginType){
        this.account.authType=loginType;
        if(loginType == 1){//密码登录
          this.clearPrivateKey();
        }
        if(loginType == 2){//公钥登录
          this.account.pwd='';
        }
      },
      clearPrivateKey:function(){
        this.account.privateKey=null;
      },
      handleChange(file,fileList) {
        if (fileList.length > 0) {
          this.uploadFileList = [fileList[fileList.length - 1]]
        }
        this.account.uploadFile = this.uploadFileList[0];
        this.validateFile();
      },
      validateAccount:function(){
        this.validateResult=false;
        this.$refs.accountForm.validate((valid) => {
          this.$emit("setValidateResult",valid);
        });
      },

    },
    watch:{
      account:{
        immediate:true,
        deep:true,
        handler(n,o){
          // if (n && n.id) {
          //   this.account=n;
          // } else {
          //   this.resetData();
          // }
        }
      }
    }
}
</script>

<style scoped>
  /*去除上传文件动画start*/
  /*.upload-demo {*/
  /*  display: flex;*/
  /*}*/
  /deep/ .el-list-enter-active,
  /deep/ .el-list-leave-active {
    transition: none;
  }
.nz-tab {
  margin-bottom: 22px;
  margin-left: 13px;
}
  /deep/ .el-list-enter,
  /deep/ .el-list-leave-active {
    opacity: 0;
  }
  /deep/ .el-upload-list {
    height: 40px;
  }
  /*去除上传文件动画end*/
</style>
