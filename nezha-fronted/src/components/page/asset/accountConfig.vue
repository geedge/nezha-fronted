<template>
    <div>
      <el-form label-width="120px" class="" :model="account" :rules="rules" ref="accountForm">
        <div class="nz-tab">
          <div class="nz-tab-item-box" @click="changeProtocolType('SSH')" id="account-logintype-1">
            <div class="nz-tab-item" :class="{'nz-tab-item-active' : account.protocol == 'SSH', 'unclickable' : !isAllowedChangeProtocol && (account.protocol == 'TELNET' || account.protocol == 'SNMP')}">{{$t('asset.createAssetTab.sshProtocol')}}</div>
          </div>
          <div @click="changeProtocolType('TELNET')" class="nz-tab-item-box" id="account-logintype-2">
            <div class="nz-tab-item" :class="{'nz-tab-item-active' : account.protocol == 'TELNET', 'unclickable' : !isAllowedChangeProtocol && (account.protocol == 'SSH' || account.protocol == 'SNMP')}">{{$t('asset.createAssetTab.telnetProtocol')}}</div>
          </div>
          <div @click="changeProtocolType('SNMP')" class="nz-tab-item-box" id="account-logintype-3">
            <div class="nz-tab-item" :class="{'nz-tab-item-active' : account.protocol == 'SNMP', 'unclickable' : !isAllowedChangeProtocol && (account.protocol == 'TELNET' || account.protocol == 'SSH')}">SNMP</div>
          </div>
        </div>
        <template v-if="account.protocol == 'SSH'">

        </template>
        <template v-if="account.protocol == 'TELNET'">

        </template>
        <template v-if="account.protocol == 'SNMP'">

        </template>
        <el-form-item :label="$t('asset.createAssetTab.account')" prop="user">
          <el-input autocomplete="new-password" size="small" v-model="account.user"/>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.loginType')" prop="loginType" v-show="account.protocol == 'SSH'">
          <el-radio-group v-model="account.authType" size="small">
            <el-radio-button label="1">{{$t('asset.createAssetTab.password')}}</el-radio-button>
            <el-radio-button label="2">{{$t('asset.createAssetTab.ssh')}}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.password')" v-show="(account.authType==1 || account.protocol == 'TELNET')" >
          <el-input autocomplete="new-password" size="small" type="password" v-model="account.pwd"/>
        </el-form-item>
        <el-form-item :label="this.$t('asset.createAssetTab.ssh')" v-show="(account.authType==2 && account.protocol == 'SSH')" prop="file">
          <el-input rows="4" type="textarea" placeholder="" v-model="account.privateKey" size="small"></el-input>
        </el-form-item>
        <el-form-item :label="$t('asset.createAssetTab.port')" prop="port" style="display: inline-block">
          <el-input size="small" v-model.number="account.port"/>
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
          this.$emit('protocol-type-change',protocolType)
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
  .telnet-option_title .telnet-option_spilt{
    width: calc(100% - 125px);
    height: 1px;
    background-color: lightgrey;
    margin:auto 0;

    /*margin-bottom: 18px;*/
  }
  .telnet-option .telnet-option_title{
    display: flex;
    vertical-align: middle;
    margin-bottom: 18px;
    width: 100%;
  }
  .auto-login-tip{
    font-size: 12px;
    margin-bottom: 18px;
    color: #b4b4b4;
    min-height: 18px;

  }
</style>
