<template>
    <div>
      <el-form label-width="120px" class="" :model="account" :rules="rules" ref="accountForm">
          <!--<div class="nz-btn-group float-left" style="padding-top: 4px;" v-show="isEdit">
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
        <div class="nz-tab" v-show="isEdit">
          <div class="nz-tab-item-box" @click="changeProtocolType('SSH')" id="account-logintype-1">
            <div class="nz-tab-item" :class="{'nz-tab-item-active' : account.protocol == 'SSH','unclickable':!isAllowedChangeProtocol&&account.protocol == 'TELNET'}">{{$t('asset.createAssetTab.sshProtocol')}}</div>
          </div>
          <div @click="changeProtocolType('TELNET')" class="nz-tab-item-box">
            <div class="nz-tab-item" :class="{'nz-tab-item-active' : account.protocol == 'TELNET','unclickable':!isAllowedChangeProtocol&&account.protocol == 'SSH'}">{{$t('asset.createAssetTab.telnetProtocol')}}</div>
          </div>
        </div>
        <el-form-item :label="$t('asset.createAssetTab.protocol')" size="mini" v-show="!isEdit">
          <div class="right-box-form-content-txt" >{{account.protocol=='SSH'?$t('asset.createAssetTab.sshProtocol'):$t('asset.createAssetTab.telnetProtocol')}}</div>
        </el-form-item>
<!--        <el-form-item :label="$t('asset.createAssetTab.loginType')" size="mini" v-show="!isEdit">-->
<!--          <div class="right-box-form-content-txt" >{{account.authType==1?$t('asset.createAssetTab.password'):$t('asset.createAssetTab.ssh')}}</div>-->
<!--        </el-form-item>-->
        <el-form-item :label="$t('asset.createAssetTab.account')" prop="user">
          <el-input autocomplete="new-password" size="small" v-model="account.user" v-show="isEdit"/>
          <div class="right-box-form-content-txt" v-show="!isEdit">{{account.user}}</div>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.loginType')" prop="loginType" v-show="account.protocol == 'SSH'">
          <el-radio-group v-model="account.authType" size="small">
            <el-radio-button label="1">{{$t('asset.createAssetTab.password')}}</el-radio-button>
            <el-radio-button label="2">{{$t('asset.createAssetTab.ssh')}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.password')" v-show="isEdit&&(account.authType==1 || account.protocol == 'TELNET')" >
          <el-input autocomplete="new-password" size="small" type="password" v-model="account.pwd"/>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.port')" prop="port" style="display: inline-block">
          <el-input size="small" v-model.number="account.port" v-show="isEdit"/>
          <div class="right-box-form-content-txt" v-show="!isEdit">{{account.port}}</div>
        </el-form-item>
        <el-form-item :label="this.$t('asset.createAssetTab.ssh')" v-show="isEdit&&(account.authType==2 && account.protocol == 'SSH')" prop="file">
          <el-input  rows="4" type="textarea" placeholder="" v-model="account.privateKey" size="small"></el-input>
        </el-form-item>
      </el-form>

      <div class="telnet-option" v-show="isEdit && account.protocol=='TELNET'">
        <div class="telnet-option_title clickable" @click="isShowTelnetOption">login option<i style="font-size: 12px;"  :class="{'el-icon-arrow-left':!showTelnetOption,'el-icon-arrow-down':showTelnetOption}"></i></div>
        <el-form-item :label="$t('asset.createAssetTab.userTip')" v-show="isEdit && account.protocol=='TELNET' && showTelnetOption">
          <el-input type="text" size="small" v-model="account.userTip" />
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.passwordTip')" v-show="isEdit && account.protocol=='TELNET' && showTelnetOption">
          <el-input type="text" size="small" v-model="account.passwordTip" />
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.reloginPasswordTip')" v-show="isEdit && account.protocol=='TELNET' && showTelnetOption">
          <el-input type="text" size="small" v-model="account.reloginPasswordTip" />
        </el-form-item>
      </div>

    </div>
</template>

<script>
  import {port} from '../../common/js/validate'
export default {
    name: "accountConfig",
    props:{
      account:{type:Object},
      isEdit:{type:Boolean,default:true},
      isAllowedChangeProtocol:{type:Boolean,default:true}
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
        showTelnetOption:false
      }
    },
    methods:{
      resetData:function(){
        this.account={
          id:null,
          user:"",
          authType:1,
          protocol:'SSH',
          pwd:"",
          port:null,
          privateKey:null,
          userTip:"",
          passwordTip:'',
          reloginPasswordTip:''
        }
      },
      isShowTelnetOption:function(){
        this.showTelnetOption=!this.showTelnetOption;
        if(!this.showTelnetOption){
          this.account.userTip="";
          this.account.passwordTip="";
          this.account.reloginPasswordTip="";
        }
      },
      telnetOptionState:function(){
        if(this.account.userTip != ''|| this.account.passwordTip != '' || this.account.reloginPasswordTip != ''){
          this.showTelnetOption=true;
        }
      },
      changeProtocolType:function(protocolType){
        if(this.isAllowedChangeProtocol){
          this.account.protocol=protocolType;
        }else{
          return ;
        }
      },
      clearPrivateKey:function(){
        this.account.privateKey=null;
      },
      clearTelnetOptions:function(){
        this.account.userTip='';
        this.account.passwordTip='';
        this.account.reloginPasswordTip='';
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
          if(n.authType == 1){//密码登录
            this.clearPrivateKey();
          }
          if(n.authType == 2){//公钥登录
            this.account.pwd='';
          }
          if(n.protocol == 'SSH'){
            this.showTelnetOption=false;
            this.clearTelnetOptions();
          }else{
            this.clearPrivateKey();
          }
          this.telnetOptionState();
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
  .telnet-option{
    position: relative;
  }
  .telnet-option:before{
    content: "";
    display: inline-block;
    width: 79.9%;
    height: 1px;
    background-color: lightgrey;
    vertical-align: middle;
    margin-bottom: 18px;
  }
  .telnet-option .telnet-option_title{
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 18px;
  }
</style>
