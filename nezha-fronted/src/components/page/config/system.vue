<template>
  <div class="system">
    <el-tabs type="border-card" @tab-click="selectTab" v-model="activeTab" class="system-tabs" >
      <el-tab-pane :label="$t('config.system.basic.basic')" name="basic">
        <div class="system-config-form basicForm">
          <el-form :model="basic"  label-width="180px" size="small" ref="basicForm" :rules="basic.asset_ping_switch == 'on'?basicRules:basicRules2" :validate-on-rule-change="false">
            <el-form-item :label="$t('config.system.basic.systemName')" prop="system_name">
              <el-input v-model="basic.system_name" id="system-baisc-system_name"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.curUrl')" prop="alert_api">
              <el-input id="system-baisc-alert_api" v-model="basic.alert_api"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.assetPingSwith')" prop="asset_ping_switch">
              <el-switch id="system-baisc-asset_ping_switch" v-model.number="basic.asset_ping_switch"  active-color="rgb(238, 157, 63)" active-value='on' inactive-value='off'>
              </el-switch>
            </el-form-item>
            <!--<el-form-item :label="$t('config.system.basic.assetPingInterval')" prop="asset_ping_interval">
              <el-input v-model.number="basic.asset_ping_interval" :disabled="basic.asset_ping_switch == 'off'"></el-input><span class="nz-input-append">s</span>
            </el-form-item>-->
            <el-form-item :label="$t('config.system.basic.defaultCabinetUsize')" prop="default_cabinet_usize">
              <el-input v-model.number="basic.default_cabinet_usize" id="system-baisc-default_cabinet_usize"></el-input>
            </el-form-item>
            <!--<el-form-item :label="$t('config.system.basic.exporterTarget')" prop="node_exporter_target_path">
              <el-input v-model="basic.node_exporter_target_path"></el-input>
            </el-form-item>-->
            <el-form-item :label="$t('config.system.basic.scrapeInterval')" prop="scrape_interval" class="append">
              <el-input v-model.number="basic.scrape_interval" id="system-baisc-scrape_interval">
                <template slot="append"><span >{{$t('config.system.basic.second')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.storageRetention')" prop="storage_local_retention" style="width:458px;">
              <el-input v-model.number="basic.storage_local_retention" id="system-baisc-storage_local_retention">
                <template slot="append"><span >{{$t('config.system.basic.day')}}</span></template>
              </el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.maxSeries')" prop="storage_local_retention">
              <el-input-number v-model="basic.query_max_series" controls-position="right" :min="-1" :max="1000" :precision="0" id="system-baisc-query_max_series"></el-input-number>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.timezone')" prop="timezone">
              <!--                <el-input v-model.number="basic.timezone" ></el-input>-->
              <el-select v-model="basic.timezone" id="system-baisc-timezone" >
                <el-option v-for="(item,index) in timezoneOption" :key="index" :label="item.label" :value="item.value" ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.mapConfig')" >
              <latlng-picker :init-data="basic.map_center_config" ref="latlngPicker"></latlng-picker>
            </el-form-item>
            <el-form-item :label="$t('config.system.basic.unsaved')" prop="unsaved_change">
              <el-switch v-model.number="basic.unsaved_change" active-color="rgb(238, 157, 63)"  active-value='on' inactive-value='off' id="system-baisc-unsaved_change">
              </el-switch>
            </el-form-item>
            <el-form-item>
              <button
                @click="resetForm('basicForm','basic')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button" id="system-basic-reset"
                :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}"
              >{{$t('overall.reset')}}</button>
              <button id="system-basic-save" @click="saveSetInfo('basic','basicForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" type="button" v-has="'system_basic_save'"  :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.email.email')" name="email" >
        <div class="system-config-form">
          <el-form :model="email"  label-width="180px" size="small" ref="emailForm" :rules="email.email_enable=='on'?emailRules:{}" :validate-on-rule-change="false">
            <el-form-item :label="$t('config.system.email.enable')" prop="email_enable">
              <el-checkbox v-model="email.email_enable" true-label="on" false-label="off"  @change="switchChange('emailForm')" id="system-email-email_enable"></el-checkbox>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpHost')" prop="email_smtp_host">
              <el-input v-model="email.email_smtp_host" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_host"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpPort')" prop="email_smtp_port">
              <el-input v-model.number="email.email_smtp_port" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_port"></el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpAccount')" prop="email_smtp_account">
              <el-input  v-model="email.email_smtp_account" :disabled="email.email_enable == 'off'" id="system-email-email_smtp_account"> autocomplete="off"</el-input>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.smtpPwd')" class="has-tip" prop="email_smtp_password">
              <el-input v-model="email.email_smtp_password" type="password" :show-password="false" :disabled="email.email_enable == 'off'"  autocomplete="off" id="system-email-email_smtp_password"></el-input>
              <div class="el-form-item__tip">{{$t("config.system.email.pwdTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.sendAccount')" class="has-tip" prop="email_send_account">
              <el-input v-model="email.email_send_account" :disabled="email.email_enable == 'off'" id="system-email-email_send_account"></el-input>
              <div class="el-form-item__tip">{{$t("config.system.email.sendAccountTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.testAccount')" class="has-tip" prop="email_test_reciver">
              <el-input v-model="email.email_test_reciver" :disabled="email.email_enable == 'off'" id="system-email-email_test_reciver"></el-input>
              <div class="el-form-item__tip">{{$t("config.system.email.testAccountTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.useSSL')" prop="email_ssl_flag">
              <el-row :gutter="10">
                <el-col :span="5"><el-checkbox v-model="email.email_ssl_flag" true-label="on" false-label="off" :disabled="email.email_enable == 'off'" id="system-email-email_ssl_flag"></el-checkbox></el-col>
                <el-col :span="15"></el-col>
              </el-row>
              <div class="el-form-item__tip" style="margin-top: 0;">{{$t("config.system.email.sslTip")}}</div>
            </el-form-item>
            <el-form-item :label="$t('config.system.email.useTLS')" prop="email_tls_flag">
              <el-row :gutter="10">
                <el-col :span="5"><el-checkbox v-model="email.email_tls_flag" true-label='on' false-label='off' :disabled="email.email_enable == 'off'" id="system-email-email_tls_flag"></el-checkbox></el-col>
                <el-col :span="16"></el-col>
              </el-row>
              <div class="el-form-item__tip" style="margin-top: 0;">{{$t("config.system.email.tlsTip")}}</div>
            </el-form-item>
            <el-form-item style="padding-top: 20px;">
              <button id="system-email-reset" @click="resetForm('emailForm','email')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button">{{$t('overall.reset')}}</button>
              <button id="system-email-test" :class="{'nz-btn-disabled':email.email_enable == 'off','nz-btn-disabled':prevent_opt.save}" :disabled="email.email_enable == 'off' || prevent_opt.save" @click="testSetInfo('email','emailForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button">{{$t('config.system.email.testConnection')}}</button>
              <button id="system-email-save" @click="saveSetInfo('email','emailForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" type="button" v-has="'system_email_save'" :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.terminal.terminal')" name="terminal">
        <div class="system-config-form terminal">
          <el-form :model="terminal"  label-width="180px" size="small" ref="terminalForm" :rules="terminalRules">
            <el-form-item :label="$t('config.system.terminal.terminalNum')" prop="max_terminal_num">
              <el-input-number v-model="terminal.max_terminal_num" controls-position="right" :min="1" :max="50" id="system-terminal-max_terminal_num"></el-input-number>
            </el-form-item>
            <el-form-item>
              <button @click="saveSetInfo('terminal','terminalForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" type="button" v-has="'system_terminal_save'" :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.ldap.ldap')" name="ldap">
        <div class="system-config-form">
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
            <el-form-item :label="$t('config.system.ldap.pwd')" prop="ldap_password">
              <el-input v-model="ldap.ldap_password" type="password" id="system-ldap-ldap_password"></el-input>
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
            <el-form-item>
              <button id='system-ldap-reset' @click="resetForm('ldapForm','ldap')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button">{{$t('overall.reset')}}</button>
              <button id='system-ldap-test' @click="testSetInfo('ldap','ldapForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" type="button" :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}">{{$t('config.system.email.testConnection')}}</button>
              <button id='system-ldap-save' @click="saveSetInfo('ldap','ldapForm')" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" type="button" v-has="'system_ldap_save'" :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}">{{$t('overall.submit')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('config.system.notification.notification')" name="notification"><!--$t('config.system.reset.reset')-->
        <div class="linkBox notificationMessage">
          <i class="nz-icon nz-icon-info-normal"></i>
          <div style="margin-left: 15px">
            <div>. Please make sure the script file exists and has executable permissions</div>
            <div>. The script file receives two parameters:</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;① Notification account</div>
            <div>&nbsp;&nbsp;&nbsp;&nbsp;② Alert message(json)
              <el-tooltip placement="right" effect="light">
              <pre slot="content" style="word-break: break-all">
               {
                  "assetId": 1,
                  "dcId": 1,
                  "description": "The endpoint is down, the detailed information
                  Asset : 192.168.40.161, Project: system, Module: node_exporter,
                  Data center: center, EndpointId: 1",
                  "endAt": 1606240496000,
                  "endpointId": 1,
                  "hashKey": "34a17b57f289592a94ff65ee0864094b",
                  "id": 1,
                  "labels": "{\"severity\":\"P2\",\"endpoint\":\"1\",\"alertname\":\"1\",
                  \"module\":\"node_exporter\",\"project\":\"system\",\"datacenter\":
                  \"center\",\"asset\":\"192.168.40.161\"}",
                  "moduleId": 1,
                  "projectId": 1,
                  "ruleId": 1,
                  "severity": "P2",
                  "startAt": 1606009916000,
                  "state": 2,
                  "summary": "The endpoint is down, endpointId is 1"
              }
              </pre>
                <span class="more">...</span>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div class="linkBox" >
          <div class="linkTitle">
            <span class="linkTitleHandle"></span>
            <div class="linkTitleName">{{$t('config.system.notification.name')}}</div>
            <div class="linkTitleUrl">{{$t('config.system.notification.filePath')}}</div>
            <div class="linkTitleBtn">{{$t('config.system.notification.operation')}}</div>
          </div>
          <!--linkAdd-->
          <div class="linkContent linkAddBox">
            <span class="linkTitleHandle"></span>
            <el-form :inline="true"  :model="notificationTemp"  :rules="notificationRules" :validate-on-rule-change="false" class="reset-form" label-width="160px" ref="notificationTempForm" size="small">
              <el-form-item  prop="name">
                <el-input v-model="notificationTemp.name"  class="linkName" id="system-notification-name"/>
              </el-form-item>
              <el-form-item  prop="filePath">
                <el-input  v-model="notificationTemp.filePath" class="linkUrl" id="system-notification-filepath"/>
              </el-form-item>
              <el-form-item  prop="btn">
                <i @click="notificationAdd" id="system-notification-add" class="nz-icon-create-square nz-icon" v-has="'system_notification_add'"></i>
              </el-form-item>
            </el-form>
          </div>
          <!--notificationEdit-->
          <div class="scrollBox">
            <draggable v-model="notification"
                       :options="{group:'people',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}"
                       @change="change"
                       @start="start"
                       @end="notificationEnd"
                       :move="move"
                       handle=".handle"
            >
              <div v-for="(item,index) in notification" :id="'notificationDiv'+item.id" :key="index" class="linkContent">
                <i class="nz-icon nz-icon-sort4 handle" style="display:none"></i>
                <span style="display: inline-block;width: 26px"></span>
                <el-form v-if="item.isEdit"  :key="index" :ref="'notificationForm'+item.id" :inline="true" :model="notification[index]" :rules="notificationRules" :validate-on-rule-change="false" class="reset-form" label-width="180px" size="small" >
                  <el-form-item  prop="name" class="linkName">
                    <el-input v-model="item.name" width="140px" />
                  </el-form-item>
                  <el-form-item  prop="filePath" class="linkUrl">
                    <el-input  v-model="item.filePath" width="460px" />
                  </el-form-item>
                  <el-form-item  prop="btn">
                    <button @click="notificationUpdate(item)" class="linkBtn nz-btn nz-btn-size-small-new nz-btn-style-normal-new" type="button" v-has="'system_notification_save'">Update</button>
                    <button type="button" class="linkBtn nz-btn nz-btn-size-small-new nz-btn-style-light-new" @click="notificationCancel(item)">Cancel</button>
                  </el-form-item>
                </el-form>
                <div class="linkFormContent" v-else>
                  <div class="linkTitleName" :title="item.name">{{item.name}}</div>
                  <div class="linkTitleUrl">
                    <!--<span class="linkTitleUrlContent" @click="openUrl(item)" @dblclick.stop="linkEdit(item)">-->
                      <!--<el-tooltip class="item" effect="dark" :content="item.url" placement="top" popper-class="linkUrlTip">-->
                      <span>{{item.filePath}}</span>
                      <!--</el-tooltip>-->
                    <!--</span>-->
                  </div>
                  <div class="linkFormBtn">
                    <i @click.stop="notificationEdit(item)" class="nz-icon nz-icon-edit" v-has="'system_notification_toEdit'"></i>
                    <i @click="notificationDel(item)" class="nz-icon nz-icon-delete" v-has="'system_notification_delete'"></i>
                  </div>
                </div>
              </div>
            </draggable>
          </div>
        </div>
      </el-tab-pane>
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
                <el-input v-model="linkTemp.name"  class="linkName" id="system-link-name"/>
              </el-form-item>
              <el-form-item  prop="url">
                <el-input  v-model="linkTemp.url" class="linkUrl"  id="system-link-url"/>
              </el-form-item>
              <el-form-item  prop="btn">
                <i @click="linkAdd" class="nz-icon-create-square nz-icon" v-has="'system_link_add'" id="system-link-add"></i>
              </el-form-item>
            </el-form>
          </div>
          <!--linkEdit-->
          <div class="scrollBox">
            <draggable v-model="link"
                       :options="{group:'people',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}"
                       @change="change"
                       @start="start"
                       @end="end"
                       :move="move"
                       handle=".handle"
            >
              <div v-for="(item,index) in link" :id="'linkDiv'+item.id" :key="index" class="linkContent">
                <i class="nz-icon nz-icon-sort4 handle"></i>
                <el-form v-if="item.isEdit"  :key="index" :ref="'linkForm'+item.id" :inline="true" :model="link[index]" :rules="linkRules" :validate-on-rule-change="false" class="reset-form" label-width="180px" size="small" >
                <el-form-item  prop="name" class="linkName">
                  <el-input v-model="item.name" width="140px" />
                </el-form-item>
                <el-form-item  prop="url" class="linkUrl">
                  <el-input  v-model="item.url" width="460px" />
                </el-form-item>
                <el-form-item  prop="btn">
                  <button @click="linkUpdate(item)" class="linkBtn nz-btn nz-btn-size-small-new nz-btn-style-normal-new" type="button" v-has="'system_link_save'">Update</button>
                  <button type="button" class="linkBtn nz-btn nz-btn-size-small-new nz-btn-style-light-new" @click="linkCancel(item)">Cancel</button>
                </el-form-item>
              </el-form>
                <div class="linkFormContent" v-else>
                  <div class="linkTitleName" :title="item.name">{{item.name}}</div>
                  <div class="linkTitleUrl">
                    <span @click="openUrl(item)" @dblclick.stop="linkEdit(item)" class="linkTitleUrlContent" v-has="'system_link_toEdit'">
                      <span>{{item.url}}</span>
                    </span>
                  </div>
                  <div class="linkFormBtn">
                    <i @click.stop="linkEdit(item)" class="nz-icon nz-icon-edit" v-has="'system_link_toEdit'" v-if="item.buildIn=='0'"></i>
                    <i @click="linkDel(item)" class="nz-icon nz-icon-delete" v-has="'system_link_delete'" v-if="item.buildIn=='0'"></i>
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
              <button @click="resetSys()" class="nz-btn nz-btn-size-normal-new nz-btn-style-normal-new" type="button" v-has="'system_reset_reset'"  :disabled="prevent_opt.save" :class="{'nz-btn-disabled':prevent_opt.save}">{{$t('overall.reset')}}</button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { positiveInteger, port, hostPlus, host, uSize } from '../../common/js/validate'
import latlngPicker from "../../common/latlngPicker";
import bus from '../../../libs/bus'
import draggable from 'vuedraggable'

export default {
  name: 'system',
  components: { draggable ,latlngPicker},
  data () {
    return {
      basic: {
        alert_api: '',
        asset_ping_switch: 'on', // 主机连通性检查开关，'on'：开启，off：关闭
        asset_ping_interval: null, // 检查周期，单位：s
        node_exporter_target_path: '',
        scrape_interval: 15,
        storage_local_retention: 15 * 24,
        system_name: '',
        current_site_url: '',
        timezone: '',
        default_cabinet_usize: '',
        query_max_series: '',
        unsaved_change: 'on',
        map_center_config: { longitude: 116.39, latitude: 39.9, zoom: 4, minZoom: 1, maxZoom: 10 }
      },
      basicCopy: null,
      basicRules: {
        system_name: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        // node_exporter_target_path:[{required:true,message:this.$t('validate.required'),trigger:'blur'},],
        alert_api: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: host, trigger: 'blur' }],
        asset_ping_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        storage_local_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        timezone: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_cabinet_usize: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }, { validator: uSize, trigger: 'blur' }],
        query_max_series: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      },
      basicRules2: {
        system_name: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        node_exporter_target_path: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        alert_api: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: host, trigger: 'blur' }],
        scrape_interval: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        storage_local_retention: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }, { validator: positiveInteger, trigger: 'blur' }],
        timezone: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        default_cabinet_usize: [{ validator: positiveInteger, trigger: 'blur' }, { validator: uSize, trigger: 'blur' }],
        query_max_series: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      },
      timezoneOption: [
        { label: 'UTC-12:00', value: '-12' },
        { label: 'UTC-11:00', value: '-11' },
        { label: 'UTC-10:00', value: '-10' },
        { label: 'UTC-09:00', value: '-9' },
        { label: 'UTC-08:00', value: '-8' },
        { label: 'UTC-07:00', value: '-7' },
        { label: 'UTC-06:00', value: '-6' },
        { label: 'UTC-05:00', value: '-5' },
        { label: 'UTC-04:00', value: '-4' },
        { label: 'UTC-03:00', value: '-3' },
        { label: 'UTC-02:00', value: '-2' },
        { label: 'UTC-01:00', value: '-1' },
        { label: 'UTC 00:00', value: '0' },
        { label: 'UTC+01:00', value: '1' },
        { label: 'UTC+02:00', value: '2' },
        { label: 'UTC+03:00', value: '3' },
        { label: 'UTC+04:00', value: '4' },
        { label: 'UTC+05:00', value: '5' },
        { label: 'UTC+06:00', value: '6' },
        { label: 'UTC+07:00', value: '7' },
        { label: 'UTC+08:00', value: '8' },
        { label: 'UTC+09:00', value: '9' },
        { label: 'UTC+10:00', value: '10' },
        { label: 'UTC+11:00', value: '11' },
        { label: 'UTC+12:00', value: '12' }
      ],
      email: {
        email_enable: 'on',
        email_smtp_host: '',
        email_smtp_port: 25,
        email_smtp_account: '',
        email_smtp_password: '',
        email_send_account: '',
        email_test_reciver: '',
        email_ssl_flag: 'off',
        email_tls_flag: 'off'
      },
      emailCopy: null,
      emailRules: {
        email_smtp_host: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: hostPlus, trigger: 'blur' }
        ],
        email_smtp_port: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: port, trigger: 'blur' }
        ],
        email_smtp_account: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { type: 'email', message: this.$t('validate.email'), trigger: 'blur' }
        ],
        email_send_account: [{ type: 'email', message: this.$t('validate.email'), trigger: 'blur' }],
        email_test_reciver: [{ type: 'email', message: this.$t('validate.email'), trigger: 'blur' }]
      },
      terminal: {
        max_terminal_num: 10
      },
      terminalCopy: null,
      terminalRules: {
        max_terminal_num: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: positiveInteger, trigger: 'blur' }
        ]
      },
      ldap: {
        ldap_address: '',
        ldap_dn: '',
        ldap_password: '',
        ldap_ou: '',
        ldap_user_filter: '',
        ldap_mapping: '',
        ldap_enable: 'off'
      },
      ldapCopy: null,
      ldapRules: {
        ldap_address: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ldap_user_filter: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }],
        ldap_mapping: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
      },
      reset: {
        type: [],
        password: ''
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
      notificationTemp: {
        name: '', filePath: ''
      },
      notification: [],
      notificationReserved: [],
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
        password: [{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]
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
    selectTab: function (tab) {
      this.querySetInfo(tab.name)
    },
    querySetInfo: function (type) { // 切换tab
      if (!type) {
        console.error('type is required')
        return
      }
      if (type == 'reset') {
        return
      }
      if (type == 'link') {
        this.getLinkData()
        return
      }
      if (type == 'notification') {
        this.getNotificationData()
        return
      }
      this.$get('sysConfig?type=' + type).then(response => {
        if (response.code == 200) {
          const sets = response.data[type]
          for (const key in sets) {
            this[type][key] = sets[key]
          }
          if (type == 'basic') {
            localStorage.setItem('nz-sys-name', this.basic.system_name)
            localStorage.setItem('nz-sys-timezone', this.basic.timezone)
            localStorage.setItem('nz-sys-asset-ping-switch', this.basic.asset_ping_switch)
            localStorage.setItem('nz-sys-default-cabinet-usize', this.basic.default_cabinet_usize)
            localStorage.setItem('nz-unnsaved-change', this.basic.unsaved_change)
            this.basic.map_center_config = JSON.parse(this.basic.map_center_config)
          } else if (type == 'terminal') {
            localStorage.setItem('nz-sys-max-terminal-num', this.terminal.max_terminal_num)
          }
          if (type == 'email') {
            this.$refs.emailForm.clearValidate()
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
          const param = {}
          if (type == 'basic') {
            this.basic.map_center_config = this.$refs.latlngPicker.getAttribute();
            this.basic.map_center_config = JSON.stringify(this.basic.map_center_config)
          }
          param[type] = Object.assign({}, this[type])
          this.$set(param[type], 'test', 'false')
          const postParam = Object.assign({}, param)
          for (const key in postParam[type]) {
            postParam[type][key] = postParam[type][key] + ''
          }
          this.$put('/sysConfig', postParam).then(response => {
            this.prevent_opt.save = false
            if (response.code == 200) {
              this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
              // this.resetForm(formName);
              setTimeout(() => {
                this.querySetInfo(type)
              }, 200)
            } else {
              this.$message.error(response.msg)
            }
          })
        } else {
          this.prevent_opt.save = true
          return false
        }
      })
    },
    testSetInfo: function (type, formName) {
      if (this.prevent_opt.save) { return } ;
      this.prevent_opt.save = true
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const param = {}
          param[type] = Object.assign({}, this[type])
          this.$set(param[type], 'test', 'true')
          const postParam = Object.assign({}, param)
          for (const key in postParam[type]) {
            postParam[type][key] = postParam[type][key] + ''
          }
          this.$put('/sysConfig', postParam).then(response => {
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
      this.linkTemp = { name: '', url: '' }
      this.$refs.linkTempForm.clearValidate()
      this.$get('/link').then(response => {
        this.link = response.data
        this.linkReserved = [...this.link]
      })
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
      this.notificationTemp = { name: '', filePath: '' }
      this.$refs.notificationTempForm.clearValidate()
      this.$get('/alert/script').then(response => {
        this.notification = response.data.list
        this.notificationReserved = [...this.notification]
      })
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
    }
  },
  mounted () {
    this.querySetInfo('basic')
  }
}
</script>

<style lang="scss" scoped>
  .system {
    height: 100%;
    position: relative;
    margin-top: 10px;
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
  .notificationMessage{
    display: flex;
    width: 780px;
    background: #F6F6F6;
    color: #999999;
    margin-bottom: 10px;
    padding: 10px 10px 5px 10px;
    font-size: 14px;
    justify-content: left;
    justify-items: center;
    align-items: center;
  }
  .notificationMessage .more{
    font-size: 14px;
    cursor: pointer;
  }
</style>
<style lang="scss">
  .system {
    .el-tabs__nav-scroll {
      background-color: #eee;
    }
    .el-form-item:last-of-type {

      .el-form-item__content {
        margin-left: 0 !important;
        text-align: center;
      }
      .nz-btn {
        margin: 0 10px;
      }
    }
    .el-tabs__content {
      padding-top: 25px;
    }
    .el-tabs__item {
      outline: none;
      box-sizing: border-box;
    }
    .el-tabs--border-card>.el-tabs__header .el-tabs__item.is-active {
      color: $global-text-color-active;
      border-bottom: none;
      border-left: none;
      border-right: none;
      border-top: 4px solid $global-text-color-active;
    }
    .el-tabs--border-card>.el-tabs__header .el-tabs__item:not(.is-disabled):hover {
      color: $global-text-color-active;
      opacity: .8;
    }
    .el-tabs--border-card>.el-tabs__header .el-tabs__item {
      border-bottom: none;
      border-left: none;
      border-right: none;
      border-top: 4px solid transparent;
    }
  }
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
    /*width: 512px;*/
  }
  .system-tabs {
    box-shadow: unset !important;
    border-color: #eee !important;
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
  .el-form-item__tip {
    color: #999 !important;
    position: absolute;
    font-size: 12px;
    margin-top: 5px;
    line-height: 12px;
  }
  .el-form-item__tip + .el-form-item__error {
    margin-top: 20px;
  }
  .el-form-item__tip.el-form-item__tip--two-row + .el-form-item__error {
    margin-top: 34px;
  }
  .el-form-item.has-tip {
    margin-bottom: 34px;
  }
  .el-form-item.has-tip--two-row {
    margin-bottom: 54px;
  }

</style>
