<template>
  <el-form label-width="120px" :model="account" :rules="rules" ref="accountForm" style="margin-top: 20px;margin-left: 66px">
    <template v-if="account.protocol == 'SSH'">
      <el-form-item :label="$t('asset.account')" prop="params.username">
        <el-input autocomplete="new-password" size="small" v-model="account.params.username" id="ssh-account-username"/>
      </el-form-item>
      <el-form-item :label="$t('asset.loginType')" prop="params.method">
        <el-radio-group v-model="account.params.method" size="small" id="ssh-account-method">
          <el-radio-button label="password">{{$t('asset.password')}}</el-radio-button>
          <el-radio-button label="key">{{$t('asset.ssh')}}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('asset.password')" v-if="account.params.method == 'password'">
        <el-input autocomplete="new-password" size="small" type="password" v-model="account.params.password" id="ssh-account-password"/>
      </el-form-item>
      <el-form-item :label="$t('asset.ssh')" v-if="account.params.method == 'key'" prop="file">
        <el-input rows="4" type="textarea" placeholder="" v-model="account.params.key" size="small" id="ssh-account-key"></el-input>
      </el-form-item>
      <el-form-item :label="$t('asset.password')" v-if="account.params.method == 'key'">
        <el-input autocomplete="new-password" size="small" type="password" v-model="account.params.keyPassword" id="ssh-account-keyPassword"/>
      </el-form-item>
      <el-form-item :label="$t('asset.port')" prop="port" style="display: inline-block">
        <el-input size="small" v-model.number="account.port" id="ssh-account-port"/>
      </el-form-item>
    </template>
    <template v-if="account.protocol == 'TELNET'">
      <el-form-item :label="$t('asset.account')" prop="params.username">
        <el-input autocomplete="new-password" size="small" v-model="account.params.username" id="telnet-account-username"/>
      </el-form-item>
      <el-form-item :label="$t('asset.userTip')" prop="userTip">
        <el-input autocomplete="new-password" size="small" v-model="account.params.userTip" id="telnet-account-userTip"/>
      </el-form-item>
      <el-form-item :label="$t('asset.password')">
        <el-input autocomplete="new-password" size="small" type="password" v-model="account.params.password" id="telnet-account-password"/>
      </el-form-item>
      <el-form-item :label="this.$t('asset.passwordTip')">
        <el-input size="small" v-model="account.params.passwordTip" id="telnet-account-passwordTip"/>
      </el-form-item>
      <el-form-item :label="$t('asset.reloginPasswordTip')" prop="reloginTip">
        <el-input size="small" v-model="account.params.reloginTip" id="telnet-account-reloginTip"/>
      </el-form-item>
      <el-form-item :label="$t('asset.port')" prop="port" style="display: inline-block">
        <el-input size="small" v-model.number="account.port" id="telnet-account-port"/>
      </el-form-item>
    </template>
    <template v-if="account.protocol == 'SNMP'">
      <el-form-item :label="$t('asset.port')" prop="port">
        <el-input size="small" v-model.number="account.port" id="snmp-account-port"/>
      </el-form-item>
      <el-form-item :label="$t('project.module.community')" prop="params.community">
        <el-input size="small" v-model="account.params.community" id="snmp-account-community"/>
      </el-form-item>
      <el-form-item :label="$t('project.module.contextName')" prop="params.contextName">
        <el-input size="small" v-model="account.params.contextName" id="snmp-account-contextName"/>
      </el-form-item>
      <el-form-item :label="$t('project.module.version')" prop="params.version">
        <el-radio-group v-model.number="account.params.version" size="small" id="snmp-account-version">
          <el-radio-button :label="2"></el-radio-button>
          <el-radio-button :label="3"></el-radio-button>
        </el-radio-group>
      </el-form-item>
      <!--SNMP V3 setting-->
      <template v-if="account.params.version == 3">
        <el-form-item :label="$t('asset.account')" prop="params.username">
          <el-input size="small" v-model="account.params.username" id="snmp-account-username"/>
        </el-form-item>
        <el-form-item :label="$t('project.module.securityLevel')" prop="params.securityLevel">
          <el-radio-group v-model="account.params.securityLevel" size="small" id="snmp-account-securityLevel">
            <el-radio-button label="noAuthNoPriv"></el-radio-button>
            <el-radio-button label="authNoPriv"></el-radio-button>
            <el-radio-button label="authPriv"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('login.password')" prop="params.password" v-if="account.params.securityLevel == 'authNoPriv' || account.params.securityLevel == 'authPriv'">
          <el-input autocomplete="new-password" size="small" type="password" v-model="account.params.password" id="snmp-account-password"/>
        </el-form-item>
        <el-form-item :label="$t('project.module.authProtocol')" prop="params.authProtocol" v-if="account.params.securityLevel == 'authNoPriv' || account.params.securityLevel == 'authPriv'">
          <el-radio-group v-model="account.params.authProtocol" size="small" id="snmp-account-authProtocol">
            <el-radio-button label="MD5"></el-radio-button>
            <el-radio-button label="SHA"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('project.module.privProtocol')" prop="params.privProtocol" v-if="account.params.securityLevel == 'authPriv'">
          <el-radio-group v-model="account.params.privProtocol" size="small" id="snmp-account-privProtocol">
            <el-radio-button label="DES"></el-radio-button>
            <el-radio-button label="AES"></el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('project.module.privPassword')" prop="params.privPassword" v-if="account.params.securityLevel == 'authPriv'">
          <el-input autocomplete="new-password" size="small" type="password" v-model="account.params.privPassword" id="snmp-account-privPassword"/>
        </el-form-item>
      </template>
    </template>
  </el-form>
</template>

<script>
  import {port} from '../../common/js/validate'
export default {
    name: "accountConfig",
    props:{
      account:{type:Object},
      isAllowedChangeProtocol:{type:Boolean,default:true}
    },
    data(){
      return {
        rules:{
          "params.username": [
            { required: true, message: this.$t('validate.required'), trigger: 'blur'}
          ],
          port: [
            {required: true, message: this.$t('validate.required'), trigger: 'blur'},
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
          this.$emit("setValidateResult", valid, this.account.protocol);
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
