<template>
  <div class="system">
    <el-tabs v-model="activeTab" :class="{'full-table':activeTab == 'notification'||activeTab == 'link'||activeTab === 'apiKey'}" class="system-tabs" style="overflow: auto" type="border-card" @tab-click="selectTab">
      <el-tab-pane :label="$t('config.system.basic.basic')" name="basic">
        <div class="system-config-form basicForm" v-if="activeTab === 'basic'">
          <el-form :model="basic"  label-width="180px" size="small" ref="basicForm" :rules="basicRules" :validate-on-rule-change="false">
            <div class="system-title">{{$t('config.system.basic.title')}}</div>
            <el-form-item :label="$t('config.system.basic.systemName')" prop="system_name">
              <el-input v-model="basic.system_name" id="system-baisc-system_name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.sessionTimeout')" prop="session_timeout">
              <el-input v-model.number="basic.session_timeout" >
                <template slot="append"><span >{{$t('config.system.basic.minute')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.defaultCabinetUsize')" prop="default_cabinet_usize">
              <el-input v-model.number="basic.default_cabinet_usize" id="system-baisc-default_cabinet_usize"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.timezone')" prop="timezone">
              <el-select v-model="basic.timezone" id="system-baisc-timezone" filterable popper-class="right-box-select-top">
                <el-option v-for="(item,index) in timezoneOption" :key="index" :label="item.name" :value="item.name" >
                  <div style="display: flex;justify-content: space-between;padding: 5px;">
                    <div >{{item.name}}</div>
                    <div class="utc-item">{{timezoneOptionHandler(item.offset)}}</div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.mapConfig')" class="basic-lnglat" prop="lnglat">
              <div style="display: flex">
                <el-input v-model="basic.lnglat" maxlength="256" placeholder="" style="width: calc(100% - 50px); padding-right: 50px;">
                  <template slot="prepend">{{$t('config.system.basic.lnglat')}}</template>
                </el-input>
                <latlng-picker ref="latlngPicker" :init-data="basic.lnglat" :show-zoom="true" @lnglatChange="lnglatChange"></latlng-picker>
              </div>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.snmpTrapPort')" prop="snmp_trap_listen_port">
              <el-input v-model="basic.snmp_trap_listen_port"   id="system-baisc-snmp_trap_listen_port"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.unsaved')" prop="unsaved_change">
              <el-switch v-model="basic.unsaved_change" active-color="rgb(238, 157, 63)"  active-value='on' inactive-value='off' id="system-baisc-unsaved_change">
              </el-switch>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.mfa')" prop="mfa_auth_enable">
              <el-switch v-model="basic.mfa_auth_enable" active-color="rgb(238, 157, 63)"  :active-value='"1"' :inactive-value='"0"' id="system-baisc-mfs_change">
              </el-switch>
              <div class="el-form-item__tip">{{$t('config.system.basic.TwoFactorAuthentication')}}</div>
            </el-form-item>
            <el-form-item>
              <button id="system-basic-save" v-has="'system_basic_save'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" style="margin-top: 8px;"  type="button" @click="saveSetInfo('basic','basicForm')">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div >
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.monitor.monitor')" name="monitor">
        <div class="system-config-form basicForm" v-if="activeTab === 'monitor'">
          <div class="system-title">{{$t('config.system.basic.title')}}</div>
          <el-form :model="monitor"  label-width="180px" size="small" ref="monitorForm" :rules="monitorRules" :validate-on-rule-change="false">
            <el-form-item :label="$t('config.system.monitor.prometheusFederation')" prop="prometheus_federation_enabled">
              <el-checkbox v-model="monitor.prometheus_federation_enabled" true-label="1" false-label="0"  id="system-monitor-prometheus_federation_enabled"></el-checkbox>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.scrapeInterval')" prop="default_scrape_interval">
              <el-input v-model.number="monitor.default_scrape_interval" >
                <template slot="append"><span >{{$t('config.system.basic.second')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.scrapeTimeout')" prop="default_scrape_timeout">
              <el-input v-model.number="monitor.default_scrape_timeout" >
                <template slot="append"><span >{{$t('config.system.basic.second')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.assetPingInterval')" prop="asset_ping_interval">
              <el-input v-model.number="monitor.asset_ping_interval" >
                <template slot="append"><span >{{$t('config.system.basic.second')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.asset_ping_from')" prop="asset_ping_from">
              <el-select v-model="monitor.asset_ping_from" popper-class="right-box-select-top">
                <el-option label="Global" value="1"></el-option>
                <el-option label="Per-datacenter" value="2"></el-option>
              </el-select>
            </el-form-item>
            <!--metrics-->
            <div class="system-title system-title-border">{{$t('config.system.monitor.metricsTitle')}}</div>
            <el-form-item :label="$t('config.system.monitor.metrics_storage_retention')" prop="metrics_storage_retention">
              <el-input v-model.number="monitor.metrics_storage_retention" id="monitor-metrics_storage_retention">
                <template slot="append"><span >{{$t('config.system.basic.day')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.metrics_storage_type')" prop="metrics_storage_type">
              <el-select v-model="monitor.metrics_storage_type" popper-class="right-box-select-top">
                <el-option :label="$t('config.system.monitor.local')" value="1"></el-option>
                <el-option :label="$t('config.system.monitor.s3')" value="2"></el-option>
              </el-select>
            </el-form-item>
            <transition name="el-zoom-in-top">
              <div v-show="monitor.metrics_storage_type == 2">
                <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_endpoint')" prop="metrics_storage_s3_endpoint" :rules=" [ { required: monitor.metrics_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
                  <el-input v-model="monitor.metrics_storage_s3_endpoint" id="monitor-metrics_storage_s3_endpoint">
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_bucket')" prop="metrics_storage_s3_bucket" :rules=" [ { required: monitor.metrics_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
                  <el-input v-model="monitor.metrics_storage_s3_bucket" id="monitor-metrics_storage_s3_bucket">
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_access_key')" prop="metrics_storage_s3_access_key" :rules=" [ { required: monitor.metrics_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
                  <el-input v-model="monitor.metrics_storage_s3_access_key" id="monitor-metrics_storage_s3_access_key">
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('config.system.monitor.metrics_storage_s3_secret_access_key')" prop="metrics_storage_s3_secret_access_key" :rules=" [ { required: monitor.metrics_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]" class="monitorLastEle">
                  <el-input v-model="monitor.metrics_storage_s3_secret_access_key" id="monitor-metrics_storage_s3_secret_access_key">
                  </el-input>
                </el-form-item>
              </div>
            </transition>
            <el-form-item :label="$t('config.system.basic.maxSeries')" prop="metrics_query_max_series">
              <el-input-number v-model="monitor.metrics_query_max_series" controls-position="right" :min="-1" :max="1000" :precision="0" id="system-monitor-metrics_query_max_series"></el-input-number>
            </el-form-item>

            <!--logs-->
            <div class="system-title system-title-border">{{$t('config.system.monitor.logsTitle')}}</div>
            <el-form-item :label="$t('config.system.monitor.logs_storage_retention')" prop="logs_storage_retention">
              <el-input v-model.number="monitor.logs_storage_retention" id="monitor-logs_storage_retention">
                <template slot="append"><span >{{$t('config.system.basic.day')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.monitor.logs_storage_type')" prop="logs_storage_type">
              <el-select v-model="monitor.logs_storage_type" popper-class="right-box-select-top">
                <el-option :label="$t('config.system.monitor.local')" value="1"></el-option>
                <el-option :label="$t('config.system.monitor.s3')" value="2"></el-option>
              </el-select>
            </el-form-item>
            <transition name="el-zoom-in-top">
              <div v-show="monitor.logs_storage_type == 2">
                <el-form-item :label="$t('config.system.monitor.logs_storage_s3_endpoint')" prop="logs_storage_s3_endpoint" :rules=" [ { required: monitor.logs_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
                  <el-input v-model="monitor.logs_storage_s3_endpoint" id="monitor-logs_storage_s3_endpoint">
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('config.system.monitor.logs_storage_s3_bucket')" prop="logs_storage_s3_bucket" :rules=" [ { required: monitor.logs_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
                  <el-input v-model="monitor.logs_storage_s3_bucket" id="monitor-logs_storage_s3_bucket">
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('config.system.monitor.logs_storage_s3_access_key')" prop="logs_storage_s3_access_key" :rules=" [ { required: monitor.logs_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]">
                  <el-input v-model="monitor.logs_storage_s3_access_key" id="monitor-logs_storage_s3_access_key">
                  </el-input>
                </el-form-item>
                <el-form-item :label="$t('config.system.monitor.logs_storage_s3_secret_access_key')" prop="logs_storage_s3_secret_access_key" :rules=" [ { required: monitor.logs_storage_type == 2, message: this.$t('validate.required'), trigger: 'blur' }]" class="monitorLastEle">
                  <el-input v-model="monitor.logs_storage_s3_secret_access_key" id="monitor-logs_storage_s3_secret_access_key">
                  </el-input>
                </el-form-item>
              </div>
            </transition>
            <el-form-item :label="$t('config.system.monitor.logs_query_range_default_limit')" prop="logs_query_range_default_limit">
              <el-input-number v-model="monitor.logs_query_range_default_limit" controls-position="right" :min="-1" :max="1000" :precision="0" id="system-monitor-logs_query_range_default_limit"></el-input-number>
            </el-form-item>

            <el-form-item>
              <!--              <button-->
              <!--                @click="resetForm('basicForm','basic')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button" id="system-basic-reset"-->
              <!--                :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}"-->
              <!--              >{{$t('overall.reset')}}</button>-->
              <button id="system-monitor-save" v-has="'system_basic_save'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal"  type="button" @click="saveSetInfo('monitor','monitorForm')">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.email.email')" name="email" >
        <div class="system-config-form" v-if="activeTab === 'email'">
          <div class="system-title">{{$t('config.system.basic.title')}}</div>
          <el-form :model="email"  label-width="180px" size="small" ref="emailForm" :rules="email.email_enable=='on'?emailRules:{}" :validate-on-rule-change="false">
            <el-form-item :label="$t('config.system.email.enable')" prop="email_enable">
              <el-checkbox v-model="email.email_enable" true-label="on" false-label="off"  @change="switchChange('emailForm')" id="system-email-email_enable"></el-checkbox>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpHost')" prop="email_host">
              <el-input v-model="email.email_host" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_host"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpPort')" prop="email_port">
              <el-input v-model.number="email.email_port" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_port"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.timeout')" prop="email_timeout">
              <el-input v-model.number="email.email_timeout" >
                <template slot="append"><span >{{$t('config.system.basic.second')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpAccount')" prop="email_auth_account">
              <el-input  v-model="email.email_auth_account" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_account"> autocomplete="off"</el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpPin')" class="has-tip" prop="email_auth_password">
              <el-input v-model="email.email_auth_password" type="password" :show-password="false" :disabled="email.email_enable == 'off'"  autocomplete="off" id="system-email-email_smtp_password"></el-input>
              <div class="el-form-item__tip">{{$t("config.system.email.pinTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.sendAccount')" class="has-tip" prop="email_send_account">
              <el-input v-model="email.email_send_account" :disabled="email.email_enable == 'off'" id="system-email-email_send_account"></el-input>
              <div class="el-form-item__tip">{{$t("config.system.email.sendAccountTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.testAccount')" class="has-tip" prop="email_test_reciver">
              <el-input v-model="email.email_test_account" :disabled="email.email_enable == 'off'" id="system-email-email_test_reciver"></el-input>
              <div class="el-form-item__tip">{{$t("config.system.email.testAccountTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.securityType')" prop="email_security_type">
              <el-select v-model="email.email_security_type" :disabled="email.email_enable == 'off'" popper-class="right-box-select-top">
                <el-option label="None" value="NONE"></el-option>
                <el-option label="SSL" value="SSL"></el-option>
                <el-option label="TLS" value="TLS"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item style="padding-top: 20px;">
<!--              <button id="system-email-reset" @click="resetForm('emailForm','email')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button">{{$t('overall.reset')}}</button>-->
              <button id="system-email-test" :class="{'nz-btn-disabled':email.email_enable == 'off','nz-btn-disabled':prevent_opt.save}" :disabled="email.email_enable == 'off' || prevent_opt.save" @click="testSetInfo('email','emailForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button">{{$t('config.system.email.testConnection')}}</button>
              <button id="system-email-save" v-has="'system_email_save'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="saveSetInfo('email','emailForm')">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.terminal.terminal')" name="terminal">
        <div class="system-config-form terminal" v-if="activeTab === 'terminal'">
          <div class="system-title">{{$t('config.system.basic.title')}}</div>
          <el-form :model="terminal"  label-width="180px" size="small" ref="terminalForm" :rules="terminalRules">
<!--            <el-form-item :label="$t('config.system.terminal.timeout')" prop="terminal_timeout">-->
<!--              <el-input v-model="terminal.terminal_timeout" controls-position="right" :min="1"  id="system-terminal-max_terminal_num">-->
<!--                <template slot="append"><span >{{$t('config.system.basic.second')}}</span></template>-->
<!--              </el-input>-->
<!--            </el-form-item>-->
            <el-form-item :label="$t('config.system.terminal.userTip')" prop="terminal_telnet_user_tip">
              <el-input id="system-terminal-user-tip" v-model="terminal.terminal_telnet_user_tip"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.terminal.pinTip')" prop="terminal_telnet_pin_tip">
              <el-input id="system-terminal_telnet_pin_tip" v-model="terminal.terminal_telnet_pin_tip"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.terminal.localRetention')" prop="terminal_record_local_retention">
              <el-input v-model="terminal.terminal_record_local_retention" controls-position="right" :min="1"  id="system-terminal_record_local_retention">
                <template slot="append"><span >{{$t('config.system.basic.day')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <button v-has="'system_terminal_save'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="saveSetInfo('terminal','terminalForm')">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.ldap.ldap')" name="ldap">
        <div class="system-config-form" v-if="activeTab === 'ldap'">
          <div class="system-title">{{$t('config.system.basic.title')}}</div>
          <el-form :model="ldap"  label-width="180px" size="small" ref="ldapForm" :rules="ldap.ldap_enable == 'on'?ldapRules:{}" :validate-on-rule-change="false">
            <el-form-item :label="$t('config.system.ldap.active')" prop="ldap_enable">
              <el-checkbox v-model="ldap.ldap_enable" true-label='on' false-label='off' @change="switchChange('ldapForm')" id="system-ldap-ldap_enable"></el-checkbox>
            </el-form-item>
            <el-form-item :label="$t('config.system.ldap.address')" prop="ldap_address">
              <el-input v-model="ldap.ldap_address" id="system-ldap-ldap_address"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.ldap.dn')" prop="ldap_dn">
              <el-input v-model="ldap.ldap_dn" id="system-ldap-ldap_dn"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.ldap.pin')" prop="ldap_password">
              <el-input id="system-ldap-ldap_password" v-model="ldap.ldap_password" type="password"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.ldap.ou')" class="has-tip" prop="ldap_ou">
              <el-input v-model="ldap.ldap_ou" id="system-ldap-ldap_ou"></el-input>
              <div class="el-form-item__tip">{{$t("config.system.ldap.ouTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.ldap.filter')" class="has-tip" prop="ldap_user_filter">
              <el-input v-model="ldap.ldap_user_filter" id="system-ldap-ldap_user_filter"></el-input>
              <div class="el-form-item__tip">{{$t("config.system.ldap.filterTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.ldap.map')" class="has-tip--two-row" prop="ldap_mapping">
              <el-input v-model="ldap.ldap_mapping" id="system-ldap-ldap_mapping"></el-input>
              <!--借用错误提示的样式-->
              <div class="el-form-item__tip el-form-item__tip--two-row">{{$t("config.system.ldap.mapTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.ldap.timeout')" prop="ldap_timeout">
              <el-input v-model.number="ldap.ldap_timeout" >
                <template slot="append"><span >{{$t('config.system.basic.second')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item>
<!--              <button id='system-ldap-reset' @click="resetForm('ldapForm','ldap')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button">{{$t('overall.reset')}}</button>-->
              <button id='system-ldap-test' :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-light" type="button" @click="testSetInfo('ldap','ldapForm')">{{$t('config.system.email.testConnection')}}</button>
              <button id='system-ldap-save' v-has="'system_ldap_save'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal" type="button" @click="saveSetInfo('ldap','ldapForm')">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.notification.notification')" name="notification" style="height: 100%;"><!--$t('config.system.reset.reset')-->
        <notify-method v-if="activeTab === 'notification'"></notify-method>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.link.link')" name="link" style="height: 100%;"><!--$t('config.system.reset.reset')-->
        <link-tab v-if="activeTab === 'link'"></link-tab>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.apiKey.apiKey')" name="apiKey" style="height: 100%;"><!--$t('config.system.reset.reset')-->
        <api-key-tab v-if="activeTab === 'apiKey'"></api-key-tab>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.reset.reset')" name="reset">
        <div class="system-config-form" v-if="activeTab === 'reset'">
          <div class="system-title">{{$t('config.system.basic.title')}}</div>
          <el-form :model="reset"  label-width="180px" size="small" ref="resetForm" :rules="resetRules" :validate-on-rule-change="false" class="reset-form">
            <el-form-item  prop="type" :label="$t('config.system.reset.type')">
              <el-select v-model="reset.type" :placeholder="$t('el.select.placeholder')" multiple popper-class="right-box-select-top">
                <template v-for="item in resetOptions" >
                  <el-option :label="item.label" :value="item.value" :key="item.label"></el-option>
                </template>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('config.system.reset.pin')" prop="pin">
              <el-input id="system-reset-pin" v-model="reset.pin" type="password"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button v-has="'system_reset_reset'" :class="{'nz-btn-disabled':prevent_opt.save}" :disabled="prevent_opt.save" class="nz-btn nz-btn-size-normal nz-btn-style-normal"  type="button" @click="resetSys()">{{$t('overall.reset')}}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { positiveInteger, port, hostPlus, host, uSize, latlng } from '../../common/js/validate'
import latlngPicker from '../../common/latlngPicker'
import bus from '../../../libs/bus'
import draggable from 'vuedraggable'
import notifyMethod from './system/notifyMethodTab'
import linkTab from './system/linkTab'
import apiKeyTab from './system/apiKeyTab'
import moment from 'moment-timezone'
export default {
  name: 'system',
  components: { draggable, latlngPicker, notifyMethod, linkTab, apiKeyTab },
  data () {
    return {
      imageFormatErr: false,
      basic: {
        // alert_api: '',
        asset_ping_interval: '300', // 检查周期，单位：s
        session_timeout: '30',
        storage_local_retention: 15 * 24,
        system_name: '',
        system_logo: '',
        current_site_url: '',
        timezone: '',
        default_cabinet_usize: '',
        query_max_series: '',
        unsaved_change: 'on',
        default_scrape_interval: '60',
        default_scrape_timeout: '30',
        snmp_trap_listen_port: 162,
        lnglat: '',
        map_center_config: { longitude: 116.39, latitude: 39.9, zoom: 4, minZoom: 1, maxZoom: 10 }
      },
      basicCopy: null,
      basicRules: {
        system_name: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        // alert_api: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: host, trigger: 'blur' }],
        asset_ping_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        default_scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        session_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        default_scrape_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        storage_local_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        snmp_trap_listen_port: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: port, trigger: 'blur' }],
        timezone: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_cabinet_usize: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }, { validator: uSize, trigger: 'blur' }],
        query_max_series: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        lnglat: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: latlng, trigger: 'blur' }
        ]
      },
      timezoneOption: [],
      email: {
        email_enable: 'on',
        email_host: '',
        email_port: 25,
        email_timeout: 10,
        email_auth_account: '',
        email_auth_password: '',
        email_send_account: '',
        email_test_account: '',
        email_security_type: 'NONE'
      },
      monitor: {
        // alert_api: '',
        asset_ping_from: '',
        asset_ping_interval: '',
        default_scrape_interval: '',
        default_scrape_timeout: '',
        logs_query_range_default_limit: '',
        logs_storage_retention: '',
        logs_storage_s3_access_key: '',
        logs_storage_s3_bucket: '',
        logs_storage_s3_endpoint: '',
        logs_storage_s3_secret_access_key: '',
        logs_storage_type: '',
        metrics_query_max_series: '',
        metrics_storage_retention: '',
        metrics_storage_s3_access_key: '',
        metrics_storage_s3_bucket: '',
        metrics_storage_s3_endpoint: '',
        metrics_storage_s3_secret_access_key: '',
        metrics_storage_type: '',
        prometheus_federation_enabled: ''
      },
      monitorRules: {
        // alert_api: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_from: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        asset_ping_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_scrape_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_query_range_default_limit: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_storage_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        logs_storage_type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_query_max_series: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_storage_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        metrics_storage_type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        prometheus_federation_enabled: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      },
      emailCopy: null,
      emailRules: {
        email_host: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: hostPlus, trigger: 'blur' }
        ],
        email_port: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: port, trigger: 'blur' }
        ],
        email_auth_account: [
          // { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { type: 'email', message: this.$t('validate.email'), trigger: 'blur' }
        ],
        email_send_account: [{ type: 'email', message: this.$t('validate.email'), trigger: 'blur' }],
        email_test_account: [{ type: 'email', message: this.$t('validate.email'), trigger: 'blur' }]
      },
      terminal: {
        terminal_timeout: 30,
        terminal_telnet_user_tip: 'ogin:',
        terminal_telnet_pin_tip: 'assword:',
        terminal_record_local_retention: 365
      },
      terminalCopy: null,
      terminalRules: {
        terminal_timeout: [{ validator: positiveInteger, trigger: 'blur' }],
        terminal_record_local_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }]
      },
      ldap: {
        ldap_address: '',
        ldap_dn: '',
        ldap_password: '',
        ldap_ou: '',
        ldap_user_filter: '',
        ldap_mapping: '',
        ldap_enable: 'off',
        ldap_timeout: ''
      },
      ldapCopy: null,
      ldapRules: {
        ldap_address: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ldap_user_filter: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ldap_mapping: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ldap_timeout: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }]
      },
      reset: {
        type: [],
        pin: ''
      },
      linkTemp: {
        name: '', url: ''
      },
      link: [],
      linkReserved: [],
      linkRules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { max: 64, message: this.$t('config.system.link.nameMaxLength'), trigger: 'blur' }
        ],
        url: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          // { type: 'url', message: this.$t('config.system.link.uriRequired'), trigger: 'blur' } /*检验网址是否正确*/
        ]
      },
      notificationRules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { max: 64, message: this.$t('config.system.link.nameMaxLength'), trigger: 'blur' }
        ],
        filePath: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { pattern: /^\/(.*\.*.+\/?)+$/, message: this.$t('config.system.notification.filePathReg') }
          // { type: 'url', message: this.$t('config.system.link.uriRequired'), trigger: 'blur' } /*检验网址是否正确*/
        ]
      },
      resetRules: {
        type: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        pin: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      },
      resetOptions: [
        {
          label: this.$t('config.system.reset.metric'),
          value: 'metric'
        },
        {
          label: this.$t('config.system.reset.alert'),
          value: 'alert'
        },
        {
          label: this.$t('config.system.reset.sysConfig'),
          value: 'sysconfig'
        }
      ],
      activeTab: 'basic'
    }
  },
  methods: {
    lnglatChange (lnglat, zoom) {
      const lnglatData = lnglat.split('.')
      this.basic.map_center_config.longitude = lnglatData[0]
      this.basic.map_center_config.latitude = lnglatData[1]
      this.basic.map_center_config.zoom = zoom
      this.basic.lnglat = lnglat
    },
    selectTab: function (tab) {
      this.querySetInfo(tab.name)
    },
    queryTimezone: function () {
      this.$get('/sys/timezone').then(response => {
        if (response.code == 200) {
          this.timezoneOption = response.data.list
        }
      })
    },
    querySetInfo: function (type) { // 切换tab
      if (!type) {
        console.error('type is required')
        return
      }
      if (type == 'reset' || type == 'link' || type == 'notification' || type == 'apiKey') {
        return
      }
      this.$get('/sys/config/' + type).then(response => {
        if (response.code == 200) {
          for (const key in response.data) {
            this[type][key] = response.data[key]
          }
          if (type == 'basic') {
            localStorage.setItem('nz-sys-name', this.basic.system_name)
            localStorage.setItem('nz-sys-timezone', this.basic.timezone)
            localStorage.setItem('nz-sys-logo', this.basic.system_logo)
            localStorage.setItem('nz-sys-default-cabinet-usize', this.basic.default_cabinet_usize)
            localStorage.setItem('nz-unsaved-change', this.basic.unsaved_change)
            this.basic.map_center_config = JSON.parse(this.basic.map_center_config)
            this.basic.lnglat = `${this.basic.map_center_config.longitude},${this.basic.map_center_config.latitude}`
          } else if (type == 'terminal') {
            localStorage.setItem('nz-sys-terminal-timeout', this.terminal.terminal_timeout)
            localStorage.setItem('nz-sys-terminal-telnet-user-tip', this.terminal.terminal_telnet_user_tip)
            localStorage.setItem('nz-sys-terminal-telnet-pin-tip', this.terminal.terminal_telnet_pin_tip)
            localStorage.setItem('nz-sys-terminal-record-local-retention', this.terminal.terminal_record_local_retention)
          }
          if (type == 'email') {
            this.email.email_auth_password = ''
            this.$refs.emailForm.clearValidate()
          }
          if (type == 'monitor') {

          }
          this[type + 'Copy'] = Object.assign({}, this[type])
        }
      })
    },
    saveSetInfo: function (type, formName) {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const param = Object.assign({}, this[type])
          if (type == 'basic') {
            const mapConfig = this.$refs.latlngPicker.getAttribute()
            param.map_center_config = JSON.stringify(mapConfig)
          }
          const postParam = Object.assign({}, param)
          for (const key in postParam[type]) {
            postParam[type][key] = postParam[type][key] + ''
          }
          this.$put('/sys/config/' + type, postParam).then(response => {
            this.prevent_opt.save = false
            if (response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
              // this.resetForm(formName);
              if (type == 'basic') {
                localStorage.setItem('nz-sys-timezone', param.timezone)
                localStorage.setItem('timezoneOffset', moment.tz(param.timezone).format('Z'))
              }
              setTimeout(() => {
                this.querySetInfo(type)
              }, 200)
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    testSetInfo: function (type, formName) {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const param = Object.assign({}, this[type])

          param[type + '_test'] = true
          const postParam = Object.assign({}, param)
          this.$put('/sys/config/' + type, postParam).then(response => {
            this.prevent_opt.save = false
            if (response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.testSuccess') })
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },

    resetForm (formName, type) {
      this.$refs[formName].resetFields()
      this[type] = Object.assign({}, this[type + 'Copy'])
    },
    switchChange: function (formName) {
      const $temp = this
      $temp.$refs[formName].clearValidate()
      setTimeout(() => {
        $temp.$refs[formName].validate()
      }, 100)
    },
    resetCheckBoxChange: function (e) {
      if (e.target.checked == true) {
        this.reset.type.push(e.target.value)
      } else {
        const index = this.reset.type.indexOf(e.target.value)
        this.reset.type.splice(index, 1)
      }
    },
    jumpTo (data, id) {
      bus.$emit('menu-change', data)
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
    },
    // link 移动
    change: function (evt) {
      // console.log(evt)
    },
    // start ,end ,add,update, sort, remove 得到的都差不多
    start: function (evt) {
      // console.log(evt)
    },
    notificationEnd: function (evt) {
      const length = this.notification.length
      if (evt.newIndex == evt.oldIndex) { // 如果没有移动返回
        return
      }
      const parmas = {
        id: this.notification[evt.newIndex].id,
        prev: 0,
        next: -1
      }
      if (evt.newIndex == length - 1) {
        parmas.prev = this.notification[evt.newIndex - 1].id
      } else if (evt.newIndex == 0) {
        parmas.next = this.notification[evt.newIndex + 1].id
      } else {
        parmas.prev = this.notification[evt.newIndex - 1].id
        parmas.next = this.notification[evt.newIndex + 1].id
      }
      this.$put('/alert/script/modify', parmas).then((response) => {
        // this.$store.commit('setLinkData',this.link);
      })
    },
    end: function (evt) {
      const length = this.link.length
      if (evt.newIndex == evt.oldIndex) { // 如果没有移动返回
        return
      }
      const parmas = {
        id: this.link[evt.newIndex].id,
        prev: 0,
        next: -1
      }
      if (evt.newIndex == length - 1) {
        parmas.prev = this.link[evt.newIndex - 1].id
      } else if (evt.newIndex == 0) {
        parmas.next = this.link[evt.newIndex + 1].id
      } else {
        parmas.prev = this.link[evt.newIndex - 1].id
        parmas.next = this.link[evt.newIndex + 1].id
      }
      this.$put('/link/modify', parmas).then((response) => {
        this.$store.commit('setLinkData', this.link)
      })
    },
    move: function (evt, originalEvent) {
      // console.log(evt)
      // console.log(originalEvent) //鼠标位置
    },
    getLinkData () {

    },
    // link add
    linkAdd () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs.linkTempForm.validate((valid) => {
        if (valid) {
          this.$post('/link', this.linkTemp).then(response => { // 新增link
            this.prevent_opt.save = false
            if (response.code == 200) {
              this.linkTemp = { name: '', url: '' }
              this.linkAddCallBack()
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.addSuccess') })
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    linkAddCallBack () {
      this.$get('/link').then(response => {
        this.link.push(response.data[response.data.length - 1])
        this.linkReserved.push(response.data[response.data.length - 1])
        this.$store.commit('setLinkData', this.link)
      })
    },
    // link edit
    linkEdit (item) {
      const index = this.link.findIndex((item1) => item.id == item1.id)
      this.$set(this.link, index, { ...this.link[index], isEdit: true })
    },
    // link update
    linkUpdate (item) {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs['linkForm' + item.id][0].validate((valid) => {
        if (valid) {
          const params = {
            id: item.id,
            name: item.name,
            url: item.url
          }
          this.$put('/link', params).then(response => {
            this.prevent_opt.save = false
            if (response.code == 200) {
              const index = this.link.findIndex((item1) => item.id == item1.id)
              this.$set(this.link, index, { ...this.link[index], isEdit: false })
              this.linkReserved = [...this.link]
              this.$store.commit('setLinkData', this.link)
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    // link cancel
    linkCancel (item) {
      const index = this.link.findIndex((item1) => item.id == item1.id)
      const indexReserved = this.linkReserved.findIndex((item1) => item.id == item1.id)
      this.$set(this.link, index, { ...this.linkReserved[indexReserved], isEdit: false })
    },
    // link del
    linkDel (item) {
      if (this.prevent_opt.query) { return } ;
      this.prevent_opt.query = true
      this.$delete('/link?ids=' + item.id).then((response) => {
        this.prevent_opt.query = false
        if (response.code == 200) {
          this.link = this.link.filter((item1) => item.id !== item1.id)
          this.linkReserved = this.linkReserved.filter((item1) => item.id !== item1.id)
          this.$store.commit('setLinkData', this.link)
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
        } else {
          this.$message.error(response.msg)
        }
      })
    },

    getNotificationData () {

    },
    // link add
    notificationAdd () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs.notificationTempForm.validate((valid) => {
        if (valid) {
          this.$post('/alert/script', this.notificationTemp).then(response => { // 新增notification
            this.prevent_opt.save = false
            if (response.code == 200) {
              this.notificationTemp = { name: '', filePath: '' }
              this.notificationAddCallBack()
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.addSuccess') })
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    notificationAddCallBack () {
      this.$get('/alert/script').then(response => {
        this.notification.push(response.data.list[response.data.list.length - 1])
        this.notificationReserved.push(response.data.list[response.data.list.length - 1])
        // this.$store.commit('setLinkData',this.link);
      })
    },
    // link edit
    notificationEdit (item) {
      const index = this.notification.findIndex((item1) => item.id == item1.id)
      this.$set(this.notification, index, { ...this.notification[index], isEdit: true })
    },
    // link update
    notificationUpdate (item) {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs['notificationForm' + item.id][0].validate((valid) => {
        if (valid) {
          const params = {
            id: item.id,
            name: item.name,
            filePath: item.filePath
          }
          this.$put('/alert/script', params).then(response => {
            this.prevent_opt.save = false
            if (response.code == 200) {
              const index = this.notification.findIndex((item1) => item.id == item1.id)
              this.$set(this.notification, index, { ...this.notification[index], isEdit: false })
              this.notificationReserved = [...this.notification]
              // this.$store.commit('setLinkData',this.notification);
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = false
          return false
        }
      })
    },
    // link cancel
    notificationCancel (item) {
      const index = this.notification.findIndex((item1) => item.id == item1.id)
      const indexReserved = this.notificationReserved.findIndex((item1) => item.id == item1.id)
      this.$set(this.notification, index, { ...this.notificationReserved[indexReserved], isEdit: false })
    },
    // link del
    notificationDel (item) {
      if (this.prevent_opt.query) { return } ;
      this.prevent_opt.query = true
      this.$delete('/alert/script?ids=' + item.id).then((response) => {
        this.prevent_opt.query = false
        if (response.code == 200) {
          this.notification = this.notification.filter((item1) => item.id !== item1.id)
          this.notificationReserved = this.notificationReserved.filter((item1) => item.id !== item1.id)
          // this.$store.commit('setLinkData',this.link);
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
        } else {
          this.$message.error(response.msg)
        }
      })
    },
    // openUrl 跳转页面
    openUrl (item) {
      // window.open(item.url)
    },
    handleLogoChange (file, fileList) {
      const imageTypes = ['image/jpeg', 'image/jpg', 'image/png']
      const isImage = imageTypes.some(t => file.raw.type === t)
      const isLt2M = file.raw.size / 1024 / 1024 < 2

      this.imageFormatErr = (!isImage || !isLt2M)

      if (isImage && isLt2M) {
        const self = this
        this.fileToBase64(file.raw).then(res => {
          self.basic.system_logo = res
        })
      }
    },
    fileToBase64: function (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)// 转化二进制流，异步方法
        let base64Str = ''
        reader.onload = function () { // 完成后this.result为二进制流;
          base64Str = this.result
          resolve(base64Str)
        }
      })
    },
    timezoneOptionHandler: function (offset) {
      const offsetHour = (offset / 1000 / 60 / 60).toFixed(0)

      const offsetMinute = offset % (1000 * 60 * 60) / (1000 * 60)

      const hour = offsetHour > 0 ? (offsetHour < 9 ? '+0' + offsetHour : '+' + offsetHour) : (offsetHour == 0 ? (offsetMinute == 0 ? '' : '+00') : (offsetHour > -10 ? '-0' + Math.abs(offsetHour) : offsetHour))

      const minute = offsetHour == 0 && offsetMinute == 0 ? '' : (offsetMinute == 0 ? ':00' : (Math.abs(offsetMinute) > 9 ? ':' + Math.abs(offsetMinute) : ':0' + Math.abs(offsetMinute)))

      return 'UTC' + hour + minute
    },
    resetSys () {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      const resetParams = {
        type: this.reset.type,
        pin: this.reset.pin
      }
      if (resetParams.type && resetParams.pin) {
        this.$confirm(this.$t('tip.resetPrompt'), {
          confirmButtonText: this.$t('tip.yes'),
          cancelButtonText: this.$t('tip.no'),
          type: 'warning'
        }).then(() => {
          this.$put('/sys/config/reset', resetParams).then(response => {
            if (response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.resetSuccess') })
              this.reset.type = ''
              this.reset.pin = ''
            } else {
              this.$message.error(response.msg)
            }
            this.prevent_opt.save = false
          })
        })
      } else {
        this.prevent_opt.save = false
        return false
      }
    }
  },
  mounted () {
    this.querySetInfo(this.activeTab)
    this.queryTimezone()
  }
}
</script>
