<template>
  <div class="system">
    <div class="content-left">
      <div class="sidebar-title">{{$t('overall.config')}}</div>
      <div class="sidebar-info">
        <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')" id="prom-jump-account">
          {{$t('config.account.account')}}
        </div>
        <div class="sidebar-info-item " @click="jumpTo('promServer')">{{$t('config.promServer.promServerList')}}</div>
        <div class="sidebar-info-item" @click="jumpTo('dc')" id="system-jump-dc">
          {{$t('config.dc.dc')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('model')" id="system-jump-model">
          {{$t('config.model.model')}}
        </div>
        <div class="sidebar-info-item" @click="jumpTo('mib')" id="system-jump-mib">
          {{$t('config.mib.mib')}}
        </div>
        <div class="sidebar-info-item sidebar-info-item-active"  id="system-jump-system">
          {{$t('config.system.system')}}
        </div>
      </div>
    </div>
    <div class="content-right">
      <el-tabs type="border-card" @tab-click="selectTab" v-model="activeTab">
        <el-tab-pane :label="$t('config.system.basic.basic')" name="basic">
          <div class="system-config-form">
            <el-form :model="basic"  label-width="180px" size="small" ref="basicForm" :rules="basic.asset_ping_switch == 'on'?basicRules:basicRules2" :validate-on-rule-change="false">
              <el-form-item :label="$t('config.system.basic.systemName')" prop="system_name">
                <el-input v-model="basic.system_name"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.basic.curUrl')" prop="alert_api">
                <el-input v-model="basic.alert_api"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.basic.assetPingSwith')" prop="asset_ping_switch">
                <el-switch v-model.number="basic.asset_ping_switch" active-color="rgb(238, 157, 63)"  active-value='on' inactive-value='off'>
                </el-switch>
              </el-form-item>
              <el-form-item :label="$t('config.system.basic.assetPingInterval')" prop="asset_ping_interval">
                <el-input v-model.number="basic.asset_ping_interval" :disabled="basic.asset_ping_switch == 'off'"></el-input><span class="nz-input-append">s</span>
              </el-form-item>
              <el-form-item :label="$t('config.system.basic.exporterTarget')" prop="node_exporter_target_path">
                <el-input v-model="basic.node_exporter_target_path"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.basic.scrapeInterval')" prop="scrape_interval">
                <el-input v-model.number="basic.scrape_interval" ></el-input><span class="nz-input-append">s</span>
              </el-form-item>
              <el-form-item :label="$t('config.system.basic.storageRetention')" prop="storage_local_retention">
                <el-input v-model.number="basic.storage_local_retention" ></el-input><span class="nz-input-append">h</span>
              </el-form-item>
              <el-form-item>
                <el-button class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100" @click="resetForm('basicForm')" style="top:2px">{{$t('overall.reset')}}</el-button>
                <el-button type="primary" @click="saveSetInfo('basic','basicForm')" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">{{$t('overall.submit')}}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('config.system.email.email')" name="email">
          <div class="system-config-form">
            <el-form :model="email"  label-width="180px" size="small" ref="emailForm" :rules="email.email_enable=='on'?emailRules:{}" :validate-on-rule-change="false">
              <el-form-item :label="$t('config.system.email.enable')" prop="email_enable">
                <el-checkbox v-model="email.email_enable" true-label="on" false-label="off"></el-checkbox>
              </el-form-item>
              <el-form-item :label="$t('config.system.email.smtpHost')" prop="email_smtp_host">
                <el-input v-model="email.email_smtp_host" :disabled="email.email_enable == 'off'"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.email.smtpPort')" prop="email_smtp_port">
                <el-input v-model.number="email.email_smtp_port" :disabled="email.email_enable == 'off'"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.email.smtpAccount')" prop="email_smtp_account">
                <el-input v-model="email.email_smtp_account" :disabled="email.email_enable == 'off'"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.email.smtpPwd')" prop="email_smtp_password">
                <el-input v-model="email.email_smtp_password" type="password" :show-password="false" :disabled="email.email_enable == 'off'"></el-input>
                <div><span>{{$t('config.system.email.pwdTip')}}</span></div>
              </el-form-item>
              <el-form-item :label="$t('config.system.email.sendAccount')" prop="email_send_account">
                <el-input v-model="email.email_send_account" :disabled="email.email_enable == 'off'"></el-input>
                <div><span>{{$t('config.system.email.sendAccountTip')}}</span></div>
              </el-form-item>
              <el-form-item :label="$t('config.system.email.testAccount')" prop="email_test_reciver">
                <el-input v-model="email.email_test_reciver" :disabled="email.email_enable == 'off'"></el-input>
                <div><span>{{$t('config.system.email.testAccountTip')}}</span></div>
              </el-form-item>
              <el-form-item :label="$t('config.system.email.useSSL')" prop="email_ssl_flag">
                <el-row :gutter="10">
                  <el-col :span="5"><el-checkbox v-model="email.email_ssl_flag" true-label="on" false-label="off" :disabled="email.email_enable == 'off'"></el-checkbox></el-col>
                  <el-col :span="15"><div><span>{{$t('config.system.email.sslTip')}}</span></div></el-col>
                </el-row>
              </el-form-item>
              <el-form-item :label="$t('config.system.email.useTLS')" prop="email_tls_flag">
                <el-row :gutter="10">
                  <el-col :span="5"><el-checkbox v-model="email.email_tls_flag" true-label='on' false-label='off' :disabled="email.email_enable == 'off'"></el-checkbox></el-col>
                  <el-col :span="16"><span>{{$t('config.system.email.tlsTip')}}</span></el-col>
                </el-row>
              </el-form-item>
              <el-form-item>
                <el-button class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100" @click="resetForm('emailForm')" style="top:2px">{{$t('overall.reset')}}</el-button>
                <el-button class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100" @click="testSetInfo('email','emailForm')" style="top:2px">{{$t('config.system.email.testConnection')}}</el-button>
                <el-button type="primary" @click="saveSetInfo('email','emailForm')" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">{{$t('overall.submit')}}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('config.system.terminal.terminal')" name="terminal">
          <div class="system-config-form">
            <el-form :model="terminal"  label-width="180px" size="small" ref="terminalForm" :rules="terminalRules">
              <el-form-item :label="$t('config.system.terminal.terminalNum')" prop="max_terminal_num">
                <el-input v-model.number="terminal.max_terminal_num"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSetInfo('terminal','terminalForm')" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">{{$t('overall.submit')}}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('config.system.ldap.ldap')" name="ldap">
          <div class="system-config-form">
            <el-form :model="ldap"  label-width="180px" size="small" ref="ldapForm" :rules="ldap.ldap_enable == 'on'?ldapRules:{}" :validate-on-rule-change="false">
              <el-form-item :label="$t('config.system.ldap.address')" prop="ldap_address">
                <el-input v-model="ldap.ldap_address"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.ldap.dn')" prop="ldap_dn">
                <el-input v-model="ldap.ldap_dn"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.ldap.pwd')" prop="ldap_password">
                <el-input v-model="ldap.ldap_password" type="password"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.ldap.ou')" prop="ldap_ou">
                <el-input v-model="ldap.ldap_ou"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.ldap.filter')" prop="ldap_user_filter">
                <el-input v-model="ldap.ldap_user_filter"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.ldap.map')" prop="ldap_mapping">
                <el-input v-model="ldap.ldap_mapping"></el-input>
              </el-form-item>
              <el-form-item :label="$t('config.system.ldap.active')" prop="ldap_enable">
                <el-checkbox v-model="ldap.ldap_enable" true-label='on' false-label='off'></el-checkbox>
              </el-form-item>
              <el-form-item>
                <el-button class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100" @click="resetForm('ldapForm')" style="top:2px">{{$t('overall.reset')}}</el-button>
                <el-button class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-min-width-100" @click="testSetInfo('ldap','ldapForm')" style="top:2px">{{$t('config.system.email.testConnection')}}</el-button>
                <el-button type="primary" @click="saveSetInfo('ldap','ldapForm')" class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100">{{$t('overall.submit')}}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane :label="$t('config.system.reset.reset')" name="reset">
          <div class="system-config-form">
            <el-form :model="reset"  label-width="180px" size="small" ref="resetForm" :rules="resetRules" :validate-on-rule-change="false">
              <el-form-item :label="$t('config.system.reset.type')" prop="type">
<!--                <el-select v-model="reset.type" size="small">-->
<!--                  <el-option v-for="(item,index) in resetOptions" :label="item.label" :value="item.value" :key="item.value+index"></el-option>-->
<!--                </el-select>-->
                <el-checkbox-group v-model="reset.type">
                  <el-checkbox v-for="(item,index) in resetOptions" :label="item.label" :value="item.value" :key="item.value+index"></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button class="nz-btn nz-btn-size-normal nz-btn-style-normal nz-btn-min-width-100" @click="resetSys()" style="top:2px">{{$t('overall.reset')}}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
    import {positiveInteger} from '../../common/js/validate'
    import {port} from '../../common/js/validate'
    import {domain} from '../../common/js/validate'
    import {host} from '../../common/js/validate'

    export default {
        name: "system",
        data(){
          return {
            basic:{
              alert_api:'',
              asset_ping_switch:'on',//主机连通性检查开关，'on'：开启，off：关闭
              asset_ping_interval:null,//检查周期，单位：s
              node_exporter_target_path:'',
              scrape_interval:15,
              storage_local_retention:15*24,
              system_name:'',
              current_site_url:'',
            },
            basicRules:{
              system_name:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              node_exporter_target_path:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              alert_api:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:host,trigger: 'blur'}],
              asset_ping_interval:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
              scrape_interval:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
              storage_local_retention:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
            },
            basicRules2:{
              system_name:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              node_exporter_target_path:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              alert_api:[{required:true,message:this.$t('validate.required'),trigger:'blur'},,{validator:host,trigger: 'blur'}],
              scrape_interval:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
              storage_local_retention:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
            },
            email:{
              email_enable: 'on',
              email_smtp_host: '',
              email_smtp_port: 25,
              email_smtp_account: "",
              email_smtp_password: "",
              email_send_account: "",
              email_test_reciver: "",
              email_ssl_flag: 'off',
              email_tls_flag: 'off',
            },
            emailRules:{
              email_smtp_host: [
                {required:true,message:this.$t('validate.required'),trigger:'blur'},
                {validator:domain,trigger: 'blur'}
              ],
              email_smtp_port: [
                {required:true,message:this.$t('validate.required'),trigger:'blur'},
                {validator:port,trigger:'blur'}
              ],
              email_smtp_account: [
                {required:true,message:this.$t('validate.required'),trigger:'blur'},
                { type: 'email', message: this.$t('validate.email'), trigger: 'blur' }
              ],
              email_send_account:[{ type: 'email', message: this.$t('validate.email'), trigger: 'blur' }],
              email_test_reciver: [{ type: 'email', message: this.$t('validate.email'), trigger: 'blur' }],
            },
            terminal:{
              max_terminal_num:10
            },
            terminalRules:{
              max_terminal_num:[
                {required:true,message:this.$t('validate.required'),trigger:'blur'},
                {validator:positiveInteger,trigger:'blur'}
              ]
            },
            ldap:{
              ldap_address:'',
              ldap_dn:'',
              ldap_password:'',
              ldap_ou:'',
              ldap_user_filter:'',
              ldap_mapping:'',
              ldap_enable:'off',
            },
            ldapRules:{
              ldap_address:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              ldap_user_filter:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              ldap_mapping:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
            },
            reset:{
              type:[],
              password:'',
            },
            resetRules:{
              type:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              password:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
            },
            resetOptions:[
              {
                label:this.$t('config.system.reset.metric'),
                value:'metric',
              },
              {
                label:this.$t('config.system.reset.alert'),
                value:'alert',
              },
              {
                label:this.$t('config.system.reset.sysConfig'),
                value:'sysConfig',
              },
            ],
            activeTab:'basic'
          }
        },
        methods:{
          selectTab:function(tab){
            this.querySetInfo(tab.name)
          },
          querySetInfo:function(type){
            if(!type){
              console.error('type is required')
              return
            }
            if(type == 'reset'){
              return ;
            }
            this.$get('sysConfig?type='+type).then(response=>{
              if(response.code == 200){
                let sets=response.data[type];
                for(let key in sets){
                  this[type][key]=sets[key];
                }
              }
            })
          },
          saveSetInfo:function(type,formName){
            this.$refs[formName].validate((valid) => {
              if (valid) {
                let param={};
                param[type]=Object.assign({},this[type]);
                this.$set(param[type],'test','false')
                let postParam=Object.assign({},param);
                for (let key in postParam[type]){
                  postParam[type][key]=postParam[type][key]+'';
                }
                this.$put('/sysConfig',postParam).then(response=>{
                  if(response.code == 200){
                    this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                    this.resetForm(formName);
                    setTimeout(()=>{
                      this.querySetInfo(type);
                    },200)
                  }else{
                    this.$message.error(response.msg);
                  }
                })
              }
            });
          },
          testSetInfo:function(type,formName){
            this.$refs[formName].validate((valid) => {
              if (valid) {
                let param={};
                param[type]=Object.assign({},this[type]);
                this.$set(param[type],'test','true')
                let postParam=Object.assign({},param);
                for (let key in postParam[type]){
                  postParam[type][key]=postParam[type][key]+'';
                }
                this.$put('/sysConfig',postParam).then(response=>{
                  if(response.code == 200){
                    this.$message({duration: 2000, type: 'success', message: this.$t("tip.testSuccess")});
                  }else{
                    this.$message.error(response.msg);
                  }
                })
              }
            });
          },
          resetSys:function(){
            this.$prompt(this.$t('config.system.reset.pwdTip'), this.$t('config.system.reset.promptTitle'), {
              confirmButtonText: this.$t('config.system.reset.yes'),
              cancelButtonText: this.$t('config.system.reset.no'),
              inputType:'password',
            }).then(({ value }) => {
              this.reset.password=value
              this.$refs['resetForm'].validate(valid=>{
                if(valid){
                  this.$delete('/sysConfig/reset',this.reset).then(response=>{
                    if(response.code == 200){
                      this.$message({duration: 2000, type: 'success', message: this.$t("tip.success")});
                    }else{
                      this.$message.error(response.msg);
                    }
                  })
                }
              })
            }).catch(() => {

            });
          },
          resetForm(formName){
            this.$refs[formName].resetFields();
            switch (formName) {
              case 'basicForm':
                this.basic.scrape_interval=15;
                this.basic.storage_local_retention=15*24;
                break;
              case 'emailForm':
                this.email.email_smtp_port=25;
                break;
              case 'terminalForm':
                this.terminal.max_terminal_num=10;
                break;
            }
          },
          jumpTo(data, id) {
            this.$router.push({
              path: "/" + data,
              query: {
                t: +new Date()
              }
            });
          },
        },
        mounted() {
          this.querySetInfo('basic')
        }
    }
</script>

<style scoped>
  .system{
    height: 100%;
  }
  .system-config-form{
    width: 61.8% !important;
    position: relative;
  }
</style>
<style>
  .system-config-form .el-form-item__content{
    width: 512px;
  }
  .system-config-form .el-input{
    width:512px
  }
  .system-config-form .el-input__inner{
    height: 28px;
    line-height: 28px;
    width: 512px;
  }
</style>
