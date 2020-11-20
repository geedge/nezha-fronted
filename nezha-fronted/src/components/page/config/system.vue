<template>
  <div class="system" v-scroll-bar>
    <el-tabs type="border-card" @tab-click="selectTab" v-model="activeTab" class="system-tabs" >
      <el-tab-pane :label="$t('config.system.basic.basic')" name="basic">
        <div class="system-config-form basicForm">
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
            <!--<el-form-item :label="$t('config.system.basic.assetPingInterval')" prop="asset_ping_interval">
              <el-input v-model.number="basic.asset_ping_interval" :disabled="basic.asset_ping_switch == 'off'"></el-input><span class="nz-input-append">s</span>
            </el-form-item>-->
            <el-form-item :label="$t('config.system.basic.defaultCabinetUsize')" prop="default_cabinet_usize">
              <el-input v-model.number="basic.default_cabinet_usize" ></el-input>
            </el-form-item>
            <!--<el-form-item :label="$t('config.system.basic.exporterTarget')" prop="node_exporter_target_path">
              <el-input v-model="basic.node_exporter_target_path"></el-input>
            </el-form-item>-->
            <el-form-item :label="$t('config.system.basic.scrapeInterval')" prop="scrape_interval">
              <el-input v-model.number="basic.scrape_interval" ></el-input><span class="nz-input-append">{{$t('config.system.basic.second')}}</span>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.storageRetention')" prop="storage_local_retention">
              <el-input v-model.number="basic.storage_local_retention" ></el-input><span class="nz-input-append">{{$t('config.system.basic.day')}}</span>
            </el-form-item>
            <!--<el-form-item :label="$t('config.system.basic.maxSeries')" prop="storage_local_retention">-->
              <!--<el-input-number v-model="basic.query_max_series" controls-position="right" :min="-1" :max="1000" :precision="0"></el-input-number>-->
            <!--</el-form-item>-->
            <el-form-item :label="$t('config.system.basic.timezone')" prop="timezone">
              <!--                <el-input v-model.number="basic.timezone" ></el-input>-->
              <el-select v-model="basic.timezone">
                <el-option v-for="(item,index) in timezoneOption" :key="index" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <button type="button" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" @click="resetForm('basicForm','basic')" style="top:2px">{{$t('overall.reset')}}</button>
              <button type="button" @click="saveSetInfo('basic','basicForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.email.email')" name="email" >
        <div class="system-config-form">
          <el-form :model="email"  label-width="180px" size="small" ref="emailForm" :rules="email.email_enable=='on'?emailRules:{}" :validate-on-rule-change="false">
            <el-form-item :label="$t('config.system.email.enable')" prop="email_enable">
              <el-checkbox v-model="email.email_enable" true-label="on" false-label="off"  @change="switchChange('emailForm')"></el-checkbox>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpHost')" prop="email_smtp_host">
              <el-input v-model="email.email_smtp_host" :disabled="email.email_enable == 'off'"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpPort')" prop="email_smtp_port">
              <el-input v-model.number="email.email_smtp_port" :disabled="email.email_enable == 'off'"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpAccount')" prop="email_smtp_account">
              <el-input  v-model="email.email_smtp_account" :disabled="email.email_enable == 'off'"> autocomplete="off"</el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpPwd')" prop="email_smtp_password">
              <el-input v-model="email.email_smtp_password" type="password" :show-password="false" :disabled="email.email_enable == 'off'"  autocomplete="off"></el-input>
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
              <button type="button" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" @click="resetForm('emailForm','email')" style="top:2px">{{$t('overall.reset')}}</button>
              <button type="button" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" :class="{'nz-btn-disabled':email.email_enable == 'off'}" :disabled="email.email_enable == 'off'" @click="testSetInfo('email','emailForm')" style="top:2px">{{$t('config.system.email.testConnection')}}</button>
              <button type="button" @click="saveSetInfo('email','emailForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.terminal.terminal')" name="terminal">
        <div class="system-config-form terminal">
          <el-form :model="terminal"  label-width="180px" size="small" ref="terminalForm" :rules="terminalRules">
            <el-form-item :label="$t('config.system.terminal.terminalNum')" prop="max_terminal_num">
              <el-input-number v-model="terminal.max_terminal_num" controls-position="right" :min="1" :max="50"></el-input-number>
            </el-form-item>
            <el-form-item>
              <button type="button" @click="saveSetInfo('terminal','terminalForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.ldap.ldap')" name="ldap">
        <div class="system-config-form">
          <el-form :model="ldap"  label-width="180px" size="small" ref="ldapForm" :rules="ldap.ldap_enable == 'on'?ldapRules:{}" :validate-on-rule-change="false">
            <el-form-item :label="$t('config.system.ldap.active')" prop="ldap_enable">
              <el-checkbox v-model="ldap.ldap_enable" true-label='on' false-label='off' @change="switchChange('ldapForm')"></el-checkbox>
            </el-form-item>
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
            <el-form-item>
              <button type="button" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" @click="resetForm('ldapForm','ldap')" style="top:2px">{{$t('overall.reset')}}</button>
              <button type="button" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" @click="testSetInfo('ldap','ldapForm')" style="top:2px">{{$t('config.system.email.testConnection')}}</button>
              <button type="button" @click="saveSetInfo('ldap','ldapForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
     <!-- <el-tab-pane :label="$t('config.system.notification.notification')" name="notification">&lt;!&ndash;$t('config.system.reset.reset')&ndash;&gt;
        <div class="linkBox" >
          <div class="linkTitle">
            <span class="linkTitleHandle"></span>
            <div class="linkTitleName">{{$t('config.system.notification.name')}}</div>
            <div class="linkTitleUrl">{{$t('config.system.notification.filePath')}}</div>
            <div class="linkTitleBtn">{{$t('config.system.notification.operation')}}</div>
          </div>
          &lt;!&ndash;linkAdd&ndash;&gt;
          <div class="linkContent linkAddBox">
            <span class="linkTitleHandle"></span>
            <el-form :inline="true"  :model="notificationTemp"  label-width="180px" size="small" ref="notificationTempForm" :rules="notificationRules" :validate-on-rule-change="false" class="reset-form">
              <el-form-item  prop="name">
                <el-input v-model="notificationTemp.name"  class="linkName"/>
              </el-form-item>
              <el-form-item  prop="filePath">
                <el-input  v-model="notificationTemp.filePath" class="linkUrl"/>
              </el-form-item>
              <el-form-item  prop="btn">
                <i class="nz-icon-create-square nz-icon" @click="notificationAdd"></i>
              </el-form-item>
            </el-form>
          </div>
          &lt;!&ndash;notificationEdit&ndash;&gt;
          <div  class="scrollBox"
                v-scrollBar>
            <draggable v-model="notification"
                       :options="{group:'people',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}"
                       @change="change"
                       @start="start"
                       @end="notificationEnd"
                       :move="move"
                       handle=".handle"
            >
              <div v-for="(item,index) in notification" class="linkContent" :id="'notificationDiv'+item.id">
                <i class="nz-icon nz-icon-sort4 handle" style="display:none"></i>
                <span style="display: inline-block;width: 26px"></span>
                <el-form :inline="true"  :model="notification[index]" :ref="'notificationForm'+item.id" label-width="180px" size="small" ref="resetForm" :rules="notificationRules" :validate-on-rule-change="false" class="reset-form" :key="index" v-if="item.isEdit" >
                  <el-form-item  prop="name" class="linkName">
                    <el-input v-model="item.name" width="140px" />
                  </el-form-item>
                  <el-form-item  prop="filePath" class="linkUrl">
                    <el-input  v-model="item.filePath" width="460px" />
                  </el-form-item>
                  <el-form-item  prop="btn">
                    <button type="button" class="linkBtn nz-btn nz-btn-size-small-new nz-btn-style-normal-new" @click="notificationUpdate(item)">Update</button>
                    <button type="button" class="linkBtn nz-btn nz-btn-size-small-new nz-btn-style-light-new" @click="notificationCancel(item)">Cancel</button>
                  </el-form-item>
                </el-form>
                <div class="linkFormContent" v-else>
                  <div class="linkTitleName" :title="item.name">{{item.name}}</div>
                  <div class="linkTitleUrl">
                    &lt;!&ndash;<span class="linkTitleUrlContent" @click="openUrl(item)" @dblclick.stop="linkEdit(item)">&ndash;&gt;
                      &lt;!&ndash;<el-tooltip class="item" effect="dark" :content="item.url" placement="top" popper-class="linkUrlTip">&ndash;&gt;
                      <span>{{item.filePath}}</span>
                      &lt;!&ndash;</el-tooltip>&ndash;&gt;
                    &lt;!&ndash;</span>&ndash;&gt;
                  </div>
                  <div class="linkFormBtn">
                    <i class="nz-icon nz-icon-edit" @click.stop="notificationEdit(item)"></i>
                    <i class="nz-icon nz-icon-delete" @click="notificationDel(item)"></i>
                  </div>
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </el-tab-pane>-->
      <el-tab-pane :label="$t('config.system.link.link')" name="link"><!--$t('config.system.reset.reset')-->
        <div class="linkBox" >
          <div class="linkTitle">
            <span class="linkTitleHandle"></span>
            <div class="linkTitleName">{{$t('config.system.link.name')}}</div>
            <div class="linkTitleUrl">{{$t('config.system.link.url')}}</div>
            <div class="linkTitleBtn">{{$t('config.system.link.operation')}}</div>
          </div>
          <!--linkAdd-->
          <div class="linkContent linkAddBox">
            <span class="linkTitleHandle"></span>
            <el-form :inline="true"  :model="linkTemp"  label-width="180px" size="small" ref="linkTempForm" :rules="linkRules" :validate-on-rule-change="false" class="reset-form">
              <el-form-item  prop="name">
                <el-input v-model="linkTemp.name"  class="linkName"/>
              </el-form-item>
              <el-form-item  prop="url">
                <el-input  v-model="linkTemp.url" class="linkUrl"/>
              </el-form-item>
              <el-form-item  prop="btn">
                <i class="nz-icon-create-square nz-icon" @click="linkAdd"></i>
              </el-form-item>
            </el-form>
          </div>
          <!--linkEdit-->
          <div  class="scrollBox"
                v-scrollBar>
            <draggable v-model="link"
                       :options="{group:'people',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}"
                       @change="change"
                       @start="start"
                       @end="end"
                       :move="move"
                       handle=".handle"
            >
              <div v-for="(item,index) in link" class="linkContent" :id="'linkDiv'+item.id">
                <i class="nz-icon nz-icon-sort4 handle"></i>
                <el-form :inline="true"  :model="link[index]" :ref="'linkForm'+item.id" label-width="180px" size="small" ref="resetForm" :rules="linkRules" :validate-on-rule-change="false" class="reset-form" :key="index" v-if="item.isEdit" >
                <el-form-item  prop="name" class="linkName">
                  <el-input v-model="item.name" width="140px" />
                </el-form-item>
                <el-form-item  prop="url" class="linkUrl">
                  <el-input  v-model="item.url" width="460px" />
                </el-form-item>
                <el-form-item  prop="btn">
                  <button type="button" class="linkBtn nz-btn nz-btn-size-small-new nz-btn-style-normal-new" @click="linkUpdate(item)">Update</button>
                  <button type="button" class="linkBtn nz-btn nz-btn-size-small-new nz-btn-style-light-new" @click="linkCancel(item)">Cancel</button>
                </el-form-item>
              </el-form>
                <div class="linkFormContent" v-else>
                  <div class="linkTitleName" :title="item.name">{{item.name}}</div>
                  <div class="linkTitleUrl">
                    <span class="linkTitleUrlContent" @click="openUrl(item)" @dblclick.stop="linkEdit(item)">
                      <!--<el-tooltip class="item" effect="dark" :content="item.url" placement="top" popper-class="linkUrlTip">-->
                      <span>{{item.url}}</span>
                      <!--</el-tooltip>-->
                    </span>
                  </div>
                  <div class="linkFormBtn">
                    <i class="nz-icon nz-icon-edit" @click.stop="linkEdit(item)" v-if="item.buildIn=='0'"></i>
                    <i class="nz-icon nz-icon-delete" @click="linkDel(item)" v-if="item.buildIn=='0'"></i>
                  </div>
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.reset.reset')" name="reset">
        <div class="system-config-form">
          <el-form :model="reset"  label-width="82px" size="small" ref="resetForm" :rules="resetRules" :validate-on-rule-change="false" class="reset-form">
            <el-form-item  prop="type">
<!--                <el-checkbox-group v-model="reset.type">-->
<!--                  <div v-for="(item,index) in resetOptions" :key="item.value+index">-->
<!--                    <el-checkbox :value="item.value"   :label="item.label" :disabled="true" :checked="true"></el-checkbox>-->
<!--                  </div>-->
<!--                </el-checkbox-group>-->
              <div class="el-checkbox-group">
                <div v-for="(item,index) in resetOptions" :key="item.value+index" >
                  <label class="el-checkbox sys-reset-label" :for="item.value" >
                    <span class="el-checkbox__label" style="width: 100px;text-align: right;margin-right: 10px">{{item.label}}</span>
                    <span class="el-checkbox__input">
                      <input type="checkbox" name="resetType" :value="item.value" class="el-checkbox__original" aria-hidden="true" :id="item.value" @change="resetCheckBoxChange"/>
                      <span class="el-checkbox__inner"></span>
                    </span>
                  </label>
                </div>
              </div>
            </el-form-item>
            <el-form-item>
              <button type="button" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" @click="resetSys()" style="top:2px">{{$t('overall.reset')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
    import {positiveInteger} from '../../common/js/validate'
    import {port} from '../../common/js/validate'
    import {hostPlus} from '../../common/js/validate'
    import {host} from '../../common/js/validate'
    import {uSize} from '../../common/js/validate'
    import bus from '../../../libs/bus';
    import draggable from 'vuedraggable'

    export default {
        name: "system",
        components:{draggable},
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
              timezone:'',
              default_cabinet_usize:'',
              // query_max_series:''
            },
            basicCopy:null,
            basicRules:{
              system_name:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              // node_exporter_target_path:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              alert_api:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:host,trigger: 'blur'}],
              asset_ping_interval:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
              scrape_interval:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
              storage_local_retention:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
              timezone:[{required:true,message:this.$t('validate.required'),trigger:'blur'}],
              default_cabinet_usize:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'},{validator:uSize,trigger:'blur'}],
              query_max_series:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
            },
            basicRules2:{
              system_name:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              node_exporter_target_path:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              alert_api:[{required:true,message:this.$t('validate.required'),trigger:'blur'},,{validator:host,trigger: 'blur'}],
              scrape_interval:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
              storage_local_retention:[{required:true,message:this.$t('validate.required'),trigger:'blur'},{validator:positiveInteger,trigger:'blur'}],
              timezone:[{required:true,message:this.$t('validate.required'),trigger:'blur'}],
              default_cabinet_usize:[{validator:positiveInteger,trigger:'blur'},{validator:uSize,trigger:'blur'}],
               query_max_series:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
            },
            timezoneOption:[
              {label:'UTC-12:00',value:'-12'},
              {label:'UTC-11:00',value:'-11'},
              {label:'UTC-10:00',value:'-10'},
              {label:'UTC-09:00',value:'-9'},
              {label:'UTC-08:00',value:'-8'},
              {label:'UTC-07:00',value:'-7'},
              {label:'UTC-06:00',value:'-6'},
              {label:'UTC-05:00',value:'-5'},
              {label:'UTC-04:00',value:'-4'},
              {label:'UTC-03:00',value:'-3'},
              {label:'UTC-02:00',value:'-2'},
              {label:'UTC-01:00',value:'-1'},
              {label:'UTC 00:00',value:'0'},
              {label:'UTC+01:00',value:'1'},
              {label:'UTC+02:00',value:'2'},
              {label:'UTC+03:00',value:'3'},
              {label:'UTC+04:00',value:'4'},
              {label:'UTC+05:00',value:'5'},
              {label:'UTC+06:00',value:'6'},
              {label:'UTC+07:00',value:'7'},
              {label:'UTC+08:00',value:'8'},
              {label:'UTC+09:00',value:'9'},
              {label:'UTC+10:00',value:'10'},
              {label:'UTC+11:00',value:'11'},
              {label:'UTC+12:00',value:'12'},
            ],
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
            emailCopy:null,
            emailRules:{
              email_smtp_host: [
                {required:true,message:this.$t('validate.required'),trigger:'blur'},
                {validator:hostPlus,trigger: 'blur'}
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
            terminalCopy:null,
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
            ldapCopy:null,
            ldapRules:{
              ldap_address:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              ldap_user_filter:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
              ldap_mapping:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
            },
            reset:{
              type:[],
              password:'',
            },
            linkTemp:{
              name:'',url:''
            },
            link:[],
            linkReserved:[],
            linkRules:{
              name:[
                { required: true, message: this.$t('validate.required'), trigger: 'blur' },
                { max: 64, message: this.$t('config.system.link.nameMaxLength'), trigger: 'blur' }
                ],
              url:[
                { required: true, message: this.$t('validate.required'), trigger: 'blur' },
                // { type: 'url', message: this.$t('config.system.link.uriRequired'), trigger: 'blur' } /*检验网址是否正确*/
              ]
            },
            notificationTemp:{
              name:'',filePath:''
            },
            notification:[],
            notificationReserved:[],
            notificationRules:{
              name:[
                { required: true, message: this.$t('validate.required'), trigger: 'blur' },
                { max: 64, message: this.$t('config.system.link.nameMaxLength'), trigger: 'blur' }
              ],
              filePath:[
                { required: true, message: this.$t('validate.required'), trigger: 'blur' },
                { pattern: /^\/(\w+\/?)+$/, message: this.$t('config.system.notification.filePathReg') }
                // { type: 'url', message: this.$t('config.system.link.uriRequired'), trigger: 'blur' } /*检验网址是否正确*/
              ]
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
                value:'sysconfig',
              },
            ],
            activeTab:'basic'
          }
        },
        methods:{
          selectTab:function(tab){
            this.querySetInfo(tab.name)
          },
          querySetInfo:function(type){ // 切换tab
            if(!type){
              console.error('type is required')
              return
            }
            if(type == 'reset'){
              return ;
            }
            if(type == 'link'){
              this.getLinkData();
              return
            }
            if(type == 'notification'){
              this.getNotificationData();
              return
            }
            this.$get('sysConfig?type='+type).then(response=>{
              if(response.code == 200){
                let sets=response.data[type];
                for(let key in sets){
                  this[type][key]=sets[key];
                }
                if(type ==  'basic'){
                  localStorage.setItem('nz-sys-name',this.basic.system_name);
                  localStorage.setItem('nz-sys-timezone',this.basic.timezone);
                  localStorage.setItem('nz-sys-asset-ping-switch',this.basic.asset_ping_switch);
                  localStorage.setItem('nz-sys-default-cabinet-usize',this.basic.default_cabinet_usize);
                }else if(type == 'terminal'){
                  localStorage.setItem('nz-sys-max-terminal-num',this.terminal.max_terminal_num);
                }
                if(type == 'email'){
                  this.$refs.emailForm.clearValidate();
                }
                this[type+"Copy"]=Object.assign({},this[type])
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
                    // this.resetForm(formName);
                    setTimeout(()=> {
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
            let $temp=this;
            this.$prompt(this.$t('config.system.reset.pwdTip'), this.$t('config.system.reset.promptTitle'), {
              confirmButtonText: this.$t('config.system.reset.yes'),
              cancelButtonText: this.$t('config.system.reset.no'),
              inputType:'password',
            }).then(({ value }) => {
              $temp.reset.password=value
              $temp.$refs['resetForm'].validate(valid=>{
                if(valid){
                  $temp.$put('/sysConfig/reset',$temp.reset).then(response=>{
                    if(response.code == 200){
                      $temp.$message({duration: 2000, type: 'success', message: this.$t("tip.resetSuccess")});
                    }else{
                      $temp.$message.error(response.msg);
                    }
                  })
                }
              })
            }).catch(() => {

            });
          },
          resetForm(formName,type){
            this.$refs[formName].resetFields();
            this[type]=Object.assign({},this[type+"Copy"]);
          },
          switchChange:function(formName){
            let $temp=this;
            $temp.$refs[formName].clearValidate();
            setTimeout(()=>{
              $temp.$refs[formName].validate();
            },100)
          },
          resetCheckBoxChange:function(e){
            if(e.target.checked == true ){
              this.reset.type.push(e.target.value)
            }else{
              let index = this.reset.type.indexOf(e.target.value);
              this.reset.type.splice(index,1);
            }
          },
          jumpTo(data, id) {
            bus.$emit("menu-change", data);
            this.$router.push({
              path: "/" + data,
              query: {
                t: +new Date()
              }
            });
          },
          // link 移动
          change: function (evt) {
            // console.log(evt)
          },
          //start ,end ,add,update, sort, remove 得到的都差不多
          start: function (evt) {
            // console.log(evt)
          },
          notificationEnd: function (evt) {
            let length=this.notification.length;
            if(evt.newIndex==evt.oldIndex){ // 如果没有移动返回
              return
            }
            let parmas={
              id:this.notification[evt.newIndex].id,
              prev:0,
              next:-1
            }
            if(evt.newIndex==length-1){
              parmas.prev=this.notification[evt.newIndex-1].id;
            }else if(evt.newIndex==0){
              parmas.next=this.notification[evt.newIndex+1].id;
            }else{
              parmas.prev=this.notification[evt.newIndex-1].id;
              parmas.next=this.notification[evt.newIndex+1].id;
            }
            this.$put('/alert/script/modify',parmas).then((response)=>{
              // this.$store.commit('setLinkData',this.link);
            })
          },
          end: function (evt) {
            let length=this.link.length;
            if(evt.newIndex==evt.oldIndex){ // 如果没有移动返回
              return
            }
            let parmas={
              id:this.link[evt.newIndex].id,
              prev:0,
              next:-1
            }
            if(evt.newIndex==length-1){
              parmas.prev=this.link[evt.newIndex-1].id;
            }else if(evt.newIndex==0){
              parmas.next=this.link[evt.newIndex+1].id;
            }else{
              parmas.prev=this.link[evt.newIndex-1].id;
              parmas.next=this.link[evt.newIndex+1].id;
            }
            this.$put('/link/modify',parmas).then((response)=>{
              this.$store.commit('setLinkData',this.link);
            })
          },
          move: function (evt, originalEvent) {
            // console.log(evt)
            // console.log(originalEvent) //鼠标位置
          },
          getLinkData(){
            this.linkTemp={name:'',url:''};
            this.$refs['linkTempForm'].clearValidate();
            this.$get('/link').then(response=>{
              this.link=response.data;
              this.linkReserved=[...this.link];
            });
          },
          // link add
          linkAdd(){
            this.$refs['linkTempForm'].validate((valid) => {
              if (valid) {
                this.$post('/link',this.linkTemp).then(response=>{//新增link
                  if(response.code == 200){
                    this.linkTemp={name:'',url:''};
                    this.linkAddCallBack();
                    this.$message({duration: 2000, type: 'success', message: this.$t("tip.addSuccess")});
                  }else{
                    this.$message.error(response.msg);
                  }
                })
              } else {
                return false;
              }
            });
          },
          linkAddCallBack(){
            this.$get('/link').then(response=>{
              this.link.push(response.data[response.data.length-1]);
              this.linkReserved.push(response.data[response.data.length-1]);
              this.$store.commit('setLinkData',this.link);
            });
          },
          // link edit
          linkEdit(item){
            let index=this.link.findIndex((item1)=>item.id==item1.id);
            this.$set(this.link,index,{...this.link[index],isEdit:true});
          },
          // link update
          linkUpdate(item){
            this.$refs['linkForm'+item.id][0].validate((valid) => {
              if (valid) {
                let params={
                  id:item.id,
                  name:item.name,
                  url:item.url,
                };
                this.$put('/link',params).then(response=>{
                  if(response.code == 200){
                    let index=this.link.findIndex((item1)=>item.id==item1.id);
                    this.$set(this.link,index,{...this.link[index],isEdit:false});
                    this.linkReserved=[...this.link];
                    this.$store.commit('setLinkData',this.link);
                    this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                  }else{
                    this.$message.error(response.msg);
                  }
                })
              } else {
                return false;
              }
            });
          },
          // link cancel
          linkCancel(item){
            let index=this.link.findIndex((item1)=>item.id==item1.id);
            let indexReserved=this.linkReserved.findIndex((item1)=>item.id==item1.id);
            this.$set(this.link,index,{...this.linkReserved[indexReserved],isEdit:false});
          },
          // link del
          linkDel(item){
            this.$delete('/link?ids='+item.id).then((response)=>{
              if(response.code == 200){
                this.link=this.link.filter((item1)=>item.id!==item1.id);
                this.linkReserved=this.linkReserved.filter((item1)=>item.id!==item1.id);
                this.$store.commit('setLinkData',this.link);
                this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              }else{
                this.$message.error(response.msg);
              }
            });
          },

          getNotificationData(){
            this.notificationTemp={name:'',filePath:''};
            this.$refs['notificationTempForm'].clearValidate();
            this.$get('/alert/script').then(response=>{
              this.notification=response.data.list;
              console.log(this.notification);
              this.notificationReserved=[...this.notification];
            });
          },
          // link add
          notificationAdd(){
            this.$refs['notificationTempForm'].validate((valid) => {
              if (valid) {
                this.$post('/alert/script',this.notificationTemp).then(response=>{//新增link
                  if(response.code == 200){
                    this.notificationTemp={name:'',filePath:''};
                    this.notificationAddCallBack();
                    this.$message({duration: 2000, type: 'success', message: this.$t("tip.addSuccess")});
                  }else{
                    this.$message.error(response.msg);
                  }
                })
              } else {
                return false;
              }
            });
          },
          notificationAddCallBack(){
            this.$get('/link').then(response=>{
              this.notification.push(response.data[response.data.length-1]);
              this.notificationReserved.push(response.data[response.data.length-1]);
              // this.$store.commit('setLinkData',this.link);
            });
          },
          // link edit
          notificationEdit(item){
            let index=this.notification.findIndex((item1)=>item.id==item1.id);
            this.$set(this.notification,index,{...this.notification[index],isEdit:true});
          },
          // link update
          notificationUpdate(item){
            this.$refs['notificationForm'+item.id][0].validate((valid) => {
              if (valid) {
                let params={
                  id:item.id,
                  name:item.name,
                  filePath:item.filePath,
                };
                this.$put('/alert/script',params).then(response=>{
                  if(response.code == 200){
                    let index=this.notification.findIndex((item1)=>item.id==item1.id);
                    this.$set(this.notification,index,{...this.notification[index],isEdit:false});
                    this.notificationReserved=[...this.notification];
                    // this.$store.commit('setLinkData',this.notification);
                    this.$message({duration: 2000, type: 'success', message: this.$t("tip.saveSuccess")});
                  }else{
                    this.$message.error(response.msg);
                  }
                })
              } else {
                return false;
              }
            });
          },
          // link cancel
          notificationCancel(item){
            let index=this.notification.findIndex((item1)=>item.id==item1.id);
            let indexReserved=this.notificationReserved.findIndex((item1)=>item.id==item1.id);
            this.$set(this.notification,index,{...this.notificationReserved[indexReserved],isEdit:false});
          },
          // link del
          notificationDel(item){
            this.$delete('/alert/script?ids='+item.id).then((response)=>{
              if(response.code == 200){
                this.notification=this.notification.filter((item1)=>item.id!==item1.id);
                this.notificationReserved=this.notificationReserved.filter((item1)=>item.id!==item1.id);
                // this.$store.commit('setLinkData',this.link);
                this.$message({duration: 2000, type: 'success', message: this.$t("tip.deleteSuccess")});
              }else{
                this.$message.error(response.msg);
              }
            });
          },
          //openUrl 跳转页面
          openUrl(item){
            // window.open(item.url)
          }
        },
        mounted() {
          this.querySetInfo('basic');
        }
    }
</script>

<style scoped>
  .system{
    height: 100%;
    position: relative;
  }
  .system-config-form{
    width: 61.8% !important;
    position: relative;
  }
  .linkBox{
    max-height: 800px;
    width: 800px;
  }
  .scrollBox{
    position: relative;
    height: 600px;
    margin-bottom: 20px;
  }
  .linkTitle{
    display: flex;
    align-items:center;
    border-bottom: 2px solid #dfe1e6;
    color: #6b778c;
    font-size: 12px;
    height: 24px;
    line-height: 24px;
    font-weight: 600;
  }
  .handle{
    cursor: move !important;
    padding:0 5px;
    line-height: 34px;
  }
  .linkBtn{
    height: 28px;
    line-height: 0px;
    font-size: 12px;
  }
  .linkTitleHandle{
    padding: 0 13px;
  }
  .linkAddBox{
    display: flex;
    padding: 10px 0px;
    border-bottom: 1px solid #dfe1e6;
    font-size: 13px;
    line-height: 34px;
  }
  .linkContent{
    display: flex;
    padding: 10px 0px;
    font-size: 13px;
    line-height: 34px;
  }
  .linkContent:not(:last-child){
    border-bottom: 1px solid #dfe1e6;
  }
  .linkFormContent{
    display: flex;
    line-height: 34px;
  }
  .linkTitleName{
    width: 100px;
    margin-right: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 31px;
  }
  .linkTitleUrl{
    width: 462px;
    margin-right: 12px;
    height: 31px;
  }
  .linkTitleUrlContent{
    display: inline-block;
    width: 460px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    height: 31px;
    cursor: pointer;
    outline: none;
  }
  .linkFormBtn .nz-icon-delete{
    cursor: pointer;
    color: #ee6723;
    margin-left: 10px;
  }
  /*.linkTitleUrlContent:hover{*/
    /*text-decoration:underline;*/
  /*}*/
  .linkFormBtn .nz-icon-edit{
    font-size: 14px;
    cursor: pointer;
  }
  .nz-icon-create-square{
    cursor: pointer;
    color: #333333;
  }
  /deep/ .el-form-item--small .el-form-item__error{
    padding-top: 0px;
  }
  .linkUrlTip{
    width: 430px;
  }
  .system-config-form.terminal  /deep/ .el-input-number--small{
    width: 512px;
  }
  .system-config-form.basicForm  /deep/ .el-input-number--small{
    width: 512px;
  }
  .system-config-form  /deep/ .el-input input{
    text-align: left;
  }
</style>
<style>
  .system-config-form .el-form-item__content{
    width: 512px;
  }
  .system-config-form .el-input{
    width:512px;
    text-align: left;
  }
  .system-config-form .el-input__inner{
    height: 28px;
    line-height: 28px;
    width: 512px;
  }
  .system-tabs .el-tabs--border-card{
    webkit-box-shadow: unset !important;
    box-shadow: unset !important;
    height: 100%;
    width: 100%;
    border-bottom: unset;
    border-left: unset;
  }
  .sys-reset-label .el-checkbox__original:checked + span{
    background-color: orange;
  }
  .sys-reset-label .el-checkbox__original:checked + span:after{
    -webkit-transform: rotate(45deg) scaleY(1);
    transform: rotate(45deg) scaleY(1);
  }
  .reset-form .el-checkbox-group{
    margin-left: -28px !important;
  }
  .linkBox .el-input--small .el-input__inner{
    height: 28px;
    line-height: 28px;
  }
  .linkName .el-input__inner{
    width: 100px;
  }
  .linkUrl .el-input__inner{
    width: 460px;
  }
  .linkBox .el-form-item--mini.el-form-item, .linkBox .el-form-item--small.el-form-item{
    margin-bottom: 0px;
  }
  .linkBox .el-form--inline{
    padding: 0;
  }
</style>
