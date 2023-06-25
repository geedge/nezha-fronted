<template>
  <div class="right-box right-box-module" v-clickoutside="{obj:editModule,func:clickOutside}">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{editModule.id ? $t("project.module.editModule") : $t("overall.createModule")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: editModule, func: esc}"><i class="nz-icon nz-icon-close" :title="$t('overall.close')"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="moduleForm" :model="editModule" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label='$t("overall.name")' label-width="125px" prop="name">
            <el-input id="module-box-input-name" v-model="editModule.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
          </el-form-item>
          <!--project-->
          <el-form-item :label='$t("project.project.projectName")' prop="projectId">
            <el-select id="module-box-input-project" v-model="editModule.projectId" :disabled="!!editModule.id" class="right-box__select" placeholder="" popper-class="right-box-select-top module-project-box-dropdown prevent-clickoutside" size="small" value-key="id">
              <el-option v-for="item in projectList" :id="'module-project-'+item.id" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <!--remark-->
          <el-form-item :label='$t("overall.remark")' prop="remark">
            <el-input
              id="module-box-input-remark"
              v-model="editModule.remark"
              class="not-fixed-height no-resize"
              maxlength="256"
              show-word-limit
              placeholder=""
              size="small" :rows="2"
              type="textarea"></el-input>
          </el-form-item>
          <!--Enpoint template-->
          <div class="right-box-sub-title">{{ $t("overall.endpointTemplate") }}
            <el-tooltip effect="light" placement="top" popper-class="prevent-clickoutside">
              <div slot="content">
                {{$t('project.module.tip.defaultEndpointSet')}}
                <div></div>
                {{$t('project.module.tip.relation')}}
              </div>
              <i class="nz-icon nz-icon-info-normal"></i>
            </el-tooltip>
          </div>
          <div class="right-box-line"></div>
          <!--name pattern-->
          <el-form-item :label='$t("project.endpoint.pattern")' prop="pattern">
            <!--              <el-input placeholder="" v-model=""></el-input>-->
            <el-autocomplete
              id="module-box-input-pattern"
              :maxlength="64"
              v-model="editModule.endpointNameTmpl"
              :fetch-suggestions="querySearch"
              :placeholder="$t('overall.placeHolder')"
              popper-class="right-box-select-top right-public-box-dropdown-top"
              class="inline-input"
              size="small"
            ></el-autocomplete>
          </el-form-item>
          <!-- DashboardTemplate  -->
          <el-form-item :label="$t('model.dashboardtemplate')" prop="dashboardId" ref="dashboardTemplate">
            <v-selectpage
            :data="dashboardList"
            :tb-columns="DashboardSearchShowFields"
            :params="{
              varType: 2,type: 'template'}"
            :multiple="false"
            :language="language"
            title="DashboardSearch"
            key-field="id"
            :width="634"
            v-model="editModule.dashboardId"
            show-field="name"
            class="form-control"
            @values="(data) => {editModule.dashboardId = data.map(d => d.id).join(',')}"
            :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>

          <!-- Metrics -->
          <div class="endpoint-title">
            <span class="endpoint-title-content">
              <i class="nz-icon nz-icon-arrow-down" :class="metricsShow?'':'is-active'" @click="metricsShow = !metricsShow"></i>
              {{$t('overall.metrics')}}
            </span>
            <el-switch v-model="editModule.configs[0].enable" size="small" :active-value="1" :inactive-value="0"></el-switch>
          </div>
          <transition name="el-zoom-in-top">
            <el-tabs v-model="activeName" v-show="metricsShow" v-if="editModule.configs[0].enable">
            <!-- Basic -->
            <el-tab-pane :label="$t('project.endpoint.basic')" name="Basic">
              <!--type-->
              <el-form-item :label='$t("webshell.protocol")' class="half-form-item" prop="type">
                <el-select id="module-box-input-type" v-model="editModule.configs[0].config.protocol" :disabled="!!editModule.id && editModule.configs[0].config.protocol === 'snmp'" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id" @change="changeBasicType">
                  <el-option v-for="item in typeList" :id="'module-type-'+item.id" :key="item.value" :label="item.name" :value="item.value" :disabled="item.disabled && !!editModule.id"></el-option>
                </el-select>
              </el-form-item>
              <!--host-->
              <el-form-item :label='$t("asset.host")' class="half-form-item" prop="configs.0.config.host" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]">
                <el-input id="module-box-input-host" v-model="editModule.configs[0].config.host" placeholder="" size="small"></el-input>
              </el-form-item>
              <!--path-->
              <el-form-item :label='$t("config.terminallog.path")' class="half-form-item" prop="configs.metrics_path" :disabled="editModule.configs[0].config.protocol === 'snmp'">
                <el-input id="module-box-input-path" v-model="editModule.configs[0].config.metrics_path" placeholder="" size="small" :disabled="editModule.configs[0].config.protocol === 'snmp'"></el-input>
              </el-form-item>
              <!--port-->
              <el-form-item :label='$t("asset.port")' class="half-form-item" prop="configs.0.config.port" :rules="[
                { validator: port, trigger: 'blur' },
                { required: true, message: $t('validate.required'), trigger: 'blur' }
              ]">
                <el-input id="module-box-input-port" v-model.number="editModule.configs[0].config.port" placeholder="" size="small"></el-input>
              </el-form-item>
              <!-- snmp表单 -->
              <div v-if="editModule.configs[0].config.protocol && editModule.configs[0].config.protocol == 'snmp'" class="">
                <el-row>
                  <el-col :span="6">
                    <div class="sub-label sub-label-required" style="padding-left: 0">{{$t('project.module.walk')}}</div>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item prop="configs.0.config.walk" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]">
                      <select-walk ref="selectWalk" :currentWalk="editModule.configs[0].config.walk" :expandedWalk="expandedWalkData" :placement="'bottom-start'" :walkData="walkData" @selectWalk="selectWalk">
                        <template v-slot:trigger>
                          <div class="el-cascader">
                            <div class="el-input">
                              <input aria-expanded="false" autocomplete="off" class="el-input__inner" readonly="readonly" type="text">
                            </div>
                            <div class="el-cascader__tags">
                              <div ref="walkScrollbar" style="height: 100%; overflow: auto;">
                                <span v-for="(item, index) in editModule.configs[0].config.walk" :key="index" class="el-tag el-tag--info el-tag--small el-tag--light">
                                  <span v-html="mibName(item)"></span>
                                  <div class="walk-close-box" @click.stop="removeWalk(item)" :title="$t('overall.close')">
                                    <i class="el-tag__close nz-icon nz-icon-close walk-close"></i>
                                  </div>
                                </span>
                              </div>
                            </div>
                          </div>
                        </template>
                      </select-walk>
                    </el-form-item>
                  </el-col>
                </el-row>
                <!--credentials-->
              <el-form-item :label='$t("project.endpoint.credentials")' prop="credentials">
                <el-select id="module-box-input-credentials" v-model="editModule.configs[0].config.snmpCredentialsId" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id">
                  <el-option v-for="item in credentialList" :id="'module-type-'+item.id" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </div>
              <!-- more option-->
              <transition name="el-zoom-in-top">
                <div v-show="showAllBasicOption" >
                  <!--scrape_interval-->
                  <el-form-item :label='$t("project.endpoint.scrape_interval")' class="half-form-item" prop="configs.0.config.scrape_interval">
                    <el-input id="module-box-input-scrape_interval" v-model.number="editModule.configs[0].config.scrape_interval" :placeholder='$t("alert.config.inrPlaceholder")' size="small">
                     <template slot="append">s</template>
                    </el-input>
                  </el-form-item>
                  <!--scrape_timeout-->
                  <el-form-item :label='$t("project.endpoint.scrape_timeout")' class="half-form-item" prop="configs.0.config.scrape_timeout">
                    <el-input id="module-box-input-scrape_timeout" v-model.number="editModule.configs[0].config.scrape_timeout" :placeholder='$t("project.endpoint.scrape_timeout_placeholder")' size="small">
                      <template slot="append">s</template>
                    </el-input>
                  </el-form-item>
                </div>
              </transition>

              <div style="text-align: center">
                <span class="nz-btn nz-btn-size-normal nz-btn-style-light" style="border: none" @click="showAllBasicOption=!showAllBasicOption">
                  {{$t('overall.moreOption')}}
                  <i :class="showAllBasicOption?'is-active':''" class="nz-icon nz-icon-arrow-down need-rotate" ></i>
                </span>
              </div>
            </el-tab-pane>
            <!-- Parameter -->
            <el-tab-pane :label="$t('config.assetLabel.params')" name="Parameter">
              <div id="module-box-params" ref="labelBoxScrollbar" style="height: 100%; overflow: auto;">
                <div v-for="(item, index) in editModule.paramObj" :key="index" class="param-box-row">
                  <el-form-item :prop="'paramObj.' + index + '.key'" class="param-box-row-key">
                    <el-input v-model="item.key" placeholder="key" size="mini" ></el-input>
                  </el-form-item>
                  <span class="param-box-row-eq">=</span>
                  <el-form-item :prop="'paramObj.' + index + '.value'" class="param-box-row-value">
                    <vue-tags-input
                      v-model="item.tags"
                      :maxlength="32"
                      :placeholder="$t('overall.addParameter')"
                      :tags="item.value"
                      @tags-changed="(newTags)=>{tagsChange(newTags, index)}"
                    />
                  </el-form-item>
                  <span :id="'moduel-remove-param-'+index" class="param-box-row-symbol" @click="removeParam(index)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-shanchu1"></i></span>
                </div>
              </div>
              <div style="text-align: center">
                 <span id="module-add-param" class="right-box-form-add module-add-label" type="button" @click="addParam">
                <span :title="$t('tip.add')"><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
              </span>
              </div>
            </el-tab-pane>
            <!-- Labels -->
            <el-tab-pane :label="$t('project.endpoint.labels2')" name="Labels">
              <div id="module-box-labels" ref="labelBoxScrollbar" style="height: 100%; overflow: auto;">
                <div v-for="(item, index) in editModule.labelModule" :key="index" class="param-box-row">
                  <el-form-item :prop="'labelModule.' + index + '.key'" :rules="[{ pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('overall.ASCIIKey') ,trigger: 'blur'}]" class="param-box-row-key">
                    <el-input v-model="item.key" placeholder="key" size="mini"></el-input>
                  </el-form-item>
                  <span class="param-box-row-eq">=</span>
                  <el-form-item :prop="'labelModule.' + index + '.value'" class="param-box-row-value">
                    <el-input v-model="item.value" placeholder="value" size="mini"></el-input>
                  </el-form-item>
                  <span :id="'moduel-remove-label-'+index" class="param-box-row-symbol" @click="removeLabel(index)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-shanchu1"></i></span>
                </div>
              </div>
              <div style="text-align: center">
                 <span id="module-add-label" class="right-box-form-add module-add-label" type="button" @click="addLabel">
                <span :title="$t('tip.add')"><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
              </span>
              </div>
            </el-tab-pane>
            <!-- Relabel -->
            <el-tab-pane :label="$t('project.endpoint.relabel')" name="Relabel">
              <div id="module-box-relabel" ref="labelBoxScrollbar" style="height: 100%; overflow: hidden;">
                <div v-for="(item, index) in editModule.configs[0].config.relabel_config" :key="index" class="">
                  <div class="pipeline-box">
                    <span class="pipeline-title">{{$t('project.endpoint.item') + index}}</span>
                    <span class="pipeline-option" :title="$t('overall.delete')">
                    <i class="nz-icon nz-icon-shanchu1" @click="removeRelabel(index)"></i>
                  </span>
                  </div>
                  <div>
                    <el-form-item :prop="'configs.0.config.relabel_config.' + index + '.action'" class="" :label="'Action'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' }]">
                      <el-select v-model="item.action" :id="'action' + index " class="right-box__select " placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" @change="actionChange(index)" :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' }]">
                        <el-option v-for="item2 in actionList" :id="'module-action-'+item2.label" :key="item2.label" :label="item2.label" :value="item2.value"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item
                      :prop="'configs.0.config.relabel_config.' + index + '.source_labels'"
                      class="half-form-item" :label="'Source labels'"
                      :rules="[
                        { required: item.action === 'replace' || item.action === 'keep' || item.action === 'drop', message: $t('validate.required'), trigger: 'change' },
                        { validator: item.action === 'replace' || item.action === 'keep' || item.action === 'drop'? arrLength : requirdRelabel, trigger: 'change' }
                      ]">
                      <vue-tags-input
                        v-model="item.tags"
                        :maxlength="32"
                        ref="relabelTag"
                        tabindex="9999"
                        :placeholder="$t('overall.addParameter')"
                        :tags="item.source_labels"
                        @before-adding-tag="beforeAddingTag"
                        @blur="relabelTabBlur"
                        @tags-changed="(newTags)=>{tagsChangeRelabel(newTags, index)}"
                      />
                    </el-form-item>
                    <el-form-item
                      :prop="'configs.0.config.relabel_config.' + index + '.target_label'"
                      class="half-form-item" :label="'Target label'"
                      :rules="[
                        { required: item.action === 'replace', message: $t('validate.required'), trigger: 'blur' },
                        { pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('overall.ASCIIKey') ,trigger: 'blur'}]"
                      >
                      <el-input id="module-box-input-target_label" v-model="item.target_label" placeholder='' size="small"></el-input>
                    </el-form-item>
                  </div>
                  <!-- more option-->
                  <transition name="el-zoom-in-top">
                    <div v-show="item.showAllRelabelOption" >
                      <!--Regex-->
                      <el-form-item
                        :label='"Regex"'
                        class="half-form-item"
                        :prop="'configs.0.config.relabel_config.' + index + '.regex'"
                        :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' }]">
                        <el-input id="module-box-input-regex" v-model="item.regex" :placeholder="$t('overall.relabelConfigRegex')" size="small"></el-input>
                      </el-form-item>
                      <!--replacement-->
                      <el-form-item
                        :label='"Replacement"'
                        class="half-form-item"
                        :prop="'configs.0.config.relabel_config.' + index + '.replacement'"
                        :rules="[{ required: item.action === 'replace' || item.action === 'labelmap', message: $t('validate.required'), trigger: 'change' }]">
                        <el-input id="module-box-input-replacement" v-model="item.replacement" :placeholder="$t('overall.relabelConfigReplacement')" size="small"></el-input>
                      </el-form-item>
                    </div>
                  </transition>
                  <div style="text-align: center">
                <span class="nz-btn nz-btn-size-normal nz-btn-style-light" style="border: none" @click="item.showAllRelabelOption=!item.showAllRelabelOption">
                  {{$t('overall.moreOption')}}
                  <i :class="item.showAllRelabelOption?'is-active':''" class="nz-icon nz-icon-arrow-down need-rotate" ></i>
                </span>
                  </div>
                </div>
              </div>
              <div style="text-align: center">
                <span id="module-add-relabel" class="right-box-form-add module-add-label margin-t-10" type="button" @click="addRelabel">
                  <span :title="$t('tip.add')"><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
                </span>
              </div>
            </el-tab-pane>
            <!-- Authentication  -->
            <el-tab-pane v-if="editModule.configs[0].config.protocol !== 'snmp'" :label="$t('config.mib.credential.auth')" name="Auth">
              <!--authtype-->
              <el-form-item :label='$t("overall.type")' prop="authtype">
                <el-select id="module-box-input-auth-type" v-model="authType" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id" @change="changeAuthType">
                  <el-option v-for="item in authTypeList" :id="'module-type-'+item.id" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>

              <!--authtype 1-->
              <el-form-item v-if="authType === 1" :label='$t("profile.username")' class="half-form-item" prop="configs.0.config.basic_auth.username" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]" key="username">
                <el-input id="module-box-input-uername" v-model="editModule.configs[0].config.basic_auth.username" placeholder='' size="small"></el-input>
              </el-form-item>
              <el-form-item v-if="authType === 1" :label='$t("login.pin")' class="half-form-item" prop="configs.0.config.basic_auth.password" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]" key="password">
                <el-input id="module-box-input-password" v-model="editModule.configs[0].config.basic_auth.password" type="password" auto-complete="new-password"  autocomplete="new-password" placeholder='' size="small"></el-input>
              </el-form-item>

              <!--authtype 2-->
              <el-form-item v-if="authType === 2" :label='$t("project.endpoint.authTypeToken")' prop="configs.0.config.bearer_token" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]" key="bearer_token">
                <el-input id="module-box-input-bearer_token" v-model="editModule.configs[0].config.bearer_token" placeholder='' size="small"></el-input>
              </el-form-item>
            </el-tab-pane>
          </el-tabs>
          </transition>

          <!-- Log -->
          <div class="endpoint-title" style="margin-top: 10px">
            <span class="endpoint-title-content">
               <i class="nz-icon nz-icon-arrow-down" :class="logsShow?'':'is-active'" @click="logsShow = !logsShow"></i>
              {{$t('overall.logs')}}
            </span>
            <el-switch v-model="editModule.configs[1].enable" size="small" :active-value="1" :inactive-value="0"></el-switch>
          </div>
          <transition name="el-zoom-in-top">
            <div v-show="logsShow" v-if="editModule.configs[1].enable">
              <div v-for="(item, index) in editModule.configs[1].config" :key="index" style="position: relative">
                <el-tabs v-model="activeNameLogs[index]" class="special-tabs" @tab-click="()=>{tabClick(index)}" :ref="'logsTabs' + index">
                  <!-- Basic -->
                  <el-tab-pane :label="$t('project.endpoint.basic')" name="Basic">
                    <!--type-->
                    <el-form-item :label='$t("overall.type")' class="half-form-item">
                      <el-select id="module-box-input-type" v-model="item.type" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" @change="logsBasicTypeChange(item,$event)">
                        <el-option v-for="item in logsBasicList" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                    <!-- fileName -->
                    <el-form-item
                      v-if='item.type === "file"'
                      :label='item.type === "file" ? $t("config.terminallog.path"):( item.type === "journal" ? $t("dashboard.dashboard.chartForm.unit") : $t("project.endpoint.basicTypeSyslog"))' class="half-form-item"
                      :prop="'configs.1.config.'+ index +'.fileName'"
                      :rules="[ { required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      key="fileName"
                    >
                      <el-input v-if='item.type === "file"' v-model="item.fileName" :id="'module-box-basic-value' +index" placeholder='' size="small"></el-input>
                    </el-form-item>
                    <!-- unit -->
                    <el-form-item
                      v-if='item.type === "journal"'
                      :label='item.type === "file" ? $t("config.terminallog.path"):( item.type === "journal" ? $t("dashboard.dashboard.chartForm.unit") : $t("project.endpoint.basicTypeSyslog"))' class="half-form-item"
                      :prop="'configs.1.config.'+ index +'.unit'"
                      :rules="[ { required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      key="unit"
                    >
                      <el-input v-if='item.type === "journal"' v-model="item.unit" :id="'module-box-basic-value' +index" placeholder='' size="small"></el-input>
                    </el-form-item>
                    <!-- listenAddress -->
                    <el-form-item
                      v-if='item.type === "syslog"'
                      :label='item.type === "file" ? $t("config.terminallog.path"):( item.type === "journal" ? $t("dashboard.dashboard.chartForm.unit") : $t("project.endpoint.basicTypeSyslog"))' class="half-form-item"
                      :prop="'configs.1.config.'+ index +'.listenAddress'"
                      :rules="[ { required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      key="listenAddress"
                    >
                      <el-input v-if='item.type === "syslog"' v-model="item.listenAddress" :id="'module-box-basic-value' +index" placeholder='' size="small"></el-input>
                    </el-form-item>
                    <!-- appName -->
                    <el-form-item
                      v-if="item.type === 'syslog'"
                      :label=' $t("project.endpoint.basicAppName")'
                      class="half-form-item"
                      :prop="'configs.1.config.'+ index +'.appName'"
                      :rules="[ { required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      key="appName"
                    >
                      <el-input  v-model="item.appName" :id="'module-box-basic-appName' +index" placeholder='' size="small"></el-input>
                    </el-form-item>
                    <!-- apiServer -->
                    <el-form-item
                      v-if="item.type === 'kubernetes'"
                      :label='$t("project.endpoint.apiServer")'
                      class="half-form-item"
                      :prop="'configs.1.config.'+ index +'.apiServer'"
                      key="apiServer"
                    >
                      <el-input  v-model="item.apiServer" :id="'module-box-basic-apiServer' +index" placeholder='' size="small"></el-input>
                    </el-form-item>
                    <!-- role -->
                    <el-form-item
                      v-if='item.type === "kubernetes"'
                      :label='$t("profile.role")'
                      class="half-form-item"
                      :prop="'configs.1.config.'+ index +'.role'"
                      key="role"
                    >
                      <el-select v-model="item.role" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small">
                        <el-option v-for="item in logsRoleList" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>
                    <!-- namespaces -->
                    <el-form-item
                      v-if="item.type === 'kubernetes'"
                      :label=' $t("project.endpoint.namespaces")'
                      class="half-form-item"
                      :prop="'configs.1.config.'+ index +'.namespaces.names'"
                      key="namespaces"
                    >
                      <vue-tags-input
                        v-model="item.namespaces.tags"
                        :maxlength="32"
                        :placeholder="$t('overall.addParameter')"
                        :tags="item.namespaces.names"
                        @tags-changed="(newTags)=>{logsTagsChange(newTags,item)}"
                      />
                    </el-form-item>
                  </el-tab-pane>
                  <!-- Labels -->
                  <el-tab-pane v-if="item.type!=='kubernetes'" :label="$t('project.endpoint.labels2')" name="Labels">
                    <div id="module-box-logs-labels" ref="labelBoxScrollbar" style="height: 100%; overflow: auto;">
                      <div v-for="(item1, i) in item.labelModule" :key="i" class="param-box-row">
                        <el-form-item :prop="'configs.1.config.'+ index +'.labelModule.' + i + '.key'" :rules="[{ pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('overall.ASCIIKey') ,trigger: 'blur'}]" class="param-box-row-key">
                          <el-input v-model="item1.key" placeholder="key" size="mini"></el-input>
                        </el-form-item>
                        <span class="param-box-row-eq">=</span>
                        <el-form-item class="param-box-row-value">
                          <el-input v-model="item1.value" placeholder="value" size="mini"></el-input>
                        </el-form-item>
                        <span :id="'moduel-remove-label-'+i" class="param-box-row-symbol" @click="removeLogsLabel(index, i)" :title="$t('overall.delete')"><i class="nz-icon nz-icon-shanchu1"></i></span>
                      </div>
                    </div>
                    <div style="text-align: center">
                      <span id="module-add-logs-label" class="right-box-form-add module-add-label" type="button" @click="addLogsLabel(index)">
                        <span :title="$t('tip.add')"><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
                      </span>
                    </div>
                  </el-tab-pane>
                  <!-- Relabel -->
                  <el-tab-pane :label="$t('project.endpoint.logRelabel')" name="Relabel">
                    <div id="module-box-relabel" ref="labelBoxScrollbar" style="height: 100%; overflow: hidden;">
                      <div v-for="(subItem, subIndex) in editModule.configs[1].config[index].relabel_config" :key="subIndex" class="">
                        <div class="pipeline-box">
                          <span class="pipeline-title">{{$t('project.endpoint.item') + subIndex}}</span>
                          <span class="pipeline-option" :title="$t('overall.delete')">
                          <i class="nz-icon nz-icon-shanchu1" @click="logsRemoveRelabel(index,subIndex)"></i>
                        </span>
                        </div>
                        <div>
                          <el-form-item :prop="'configs.1.config.' + index + '.relabel_config.' + subIndex + '.action'" class="" :label="'Action'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' }]">
                            <el-select v-model="subItem.action" :id="'action' + subIndex " class="right-box__select " placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" @change="logsActionChange(index,subIndex)" :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' }]">
                              <el-option v-for="item2 in actionList" :id="'module-action-'+item2.label" :key="item2.label" :label="item2.label" :value="item2.value"></el-option>
                            </el-select>
                          </el-form-item>
                          <el-form-item
                            :prop="'configs.1.config.' + index + '.relabel_config.' + subIndex + '.source_labels'"
                            class="half-form-item" :label="'Source labels'"
                            :rules="[
                              { required: subItem.action === 'replace' || subItem.action === 'keep' || subItem.action === 'drop', message: $t('validate.required'), trigger: 'change' },
                              { validator: subItem.action === 'replace' || subItem.action === 'keep' || subItem.action === 'drop'? arrLength : requirdRelabel, trigger: 'change' }
                            ]">
                            <vue-tags-input
                              v-model="subItem.tags"
                              :maxlength="32"
                              :ref="'logsRelabelTag'+index+subIndex"
                              tabindex="9999"
                              :placeholder="$t('overall.addParameter')"
                              :tags="subItem.source_labels"
                              @before-adding-tag="beforeAddingTag"
                              @blur="logsRelabelTabBlur(index,subIndex)"
                              @tags-changed="(newTags)=>{logsTagsChangeRelabel(newTags, index,subIndex)}"
                            />
                          </el-form-item>
                          <el-form-item
                            :prop="'configs.1.config.' + index + '.relabel_config.' + subIndex + '.target_label'"
                            class="half-form-item" :label="'Target label'"
                            :rules="[
                              { required: subItem.action === 'replace', message: $t('validate.required'), trigger: 'blur' },
                              { pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('overall.ASCIIKey') ,trigger: 'blur'}]"
                            >
                            <el-input id="module-box-input-target_label" v-model="subItem.target_label" placeholder='' size="small"></el-input>
                          </el-form-item>
                        </div>
                        <!-- more option-->
                        <transition name="el-zoom-in-top">
                          <div v-show="subItem.showAllRelabelOption" >
                            <!--Regex-->
                            <el-form-item
                              :label='"Regex"'
                              class="half-form-item"
                              :prop="'configs.1.config.' + index + '.relabel_config.' + subIndex + '.regex'"
                              :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' }]">
                              <el-input id="module-box-input-regex" v-model="subItem.regex" :placeholder="$t('overall.relabelConfigRegex')" size="small"></el-input>
                            </el-form-item>
                            <!--replacement-->
                            <el-form-item
                              :label='"Replacement"'
                              class="half-form-item"
                              :prop="'configs.1.config.' + index + '.relabel_config.' + subIndex + '.replacement'"
                              :rules="[{ required: subItem.action === 'replace' || subItem.action === 'labelmap', message: $t('validate.required'), trigger: 'change' }]">
                              <el-input id="module-box-input-replacement" v-model="subItem.replacement" :placeholder="$t('overall.relabelConfigReplacement')" size="small"></el-input>
                            </el-form-item>
                          </div>
                        </transition>
                        <div style="text-align: center">
                      <span class="nz-btn nz-btn-size-normal nz-btn-style-light" style="border: none" @click="subItem.showAllRelabelOption=!subItem.showAllRelabelOption">
                        {{$t('overall.moreOption')}}
                        <i :class="subItem.showAllRelabelOption?'is-active':''" class="nz-icon nz-icon-arrow-down need-rotate" ></i>
                      </span>
                        </div>
                      </div>
                    </div>
                    <div style="text-align: center">
                      <span id="module-add-relabel" class="right-box-form-add module-add-label margin-t-10" type="button" @click="logsAddRelabel(index)">
                        <span :title="$t('tip.add')"><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
                      </span>
                    </div>
                  </el-tab-pane>
                  <!-- Pipeline -->
                  <el-tab-pane :label="$t('project.endpoint.pipeline')" name="Pipeline">
                    <div v-for="(item2, index2) in item.pipeline" :key="index2">
                      <div class="pipeline-box">
                        <span class="pipeline-title">{{item2.type}}</span>
                        <span class="pipeline-option">
                        <pipelineSelect :index="index2" :father-pipeline="item.pipeline" @addPipeline="(pipelineIndex,obj)=>{addPipeline(obj,index,pipelineIndex,'splice')}" :type="'splice'"/>
                        <i class="nz-icon nz-icon-shanchu1" @click="delPipeline(index,index2)" :title="$t('overall.delete')"></i>
                      </span>
                      </div>
                      <div v-if="item2.type === 'regex'">
                        <el-form-item
                          :label="'Expression'"
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.expression'"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                        >
                          <el-input v-model="item2.expression" placeholder="" size="mini"></el-input>
                        </el-form-item>
                        <el-form-item
                          :label="'Source'"
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                        >
                          <el-input v-model="item2.source" placeholder="" size="mini"></el-input>
                        </el-form-item>
                      </div>
                      <div v-if="item2.type === 'json'">
                        <label class="module-form__label">Expressions</label>
                        <div  v-for="(expressions, eindex) in item2.expressions"  :key="eindex" style="display: flex;justify-content: space-around;align-items: center;margin-bottom: 16px">
                          <el-form-item
                            :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.expressions.'+eindex+'.key'"
                            :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                            style="width: 45%;margin: 0"
                          >
                            <el-input v-model="item2.expressions[eindex].key" placeholder="key" size="mini" ></el-input>
                          </el-form-item>
                          <span class="param-box-row-eq">=</span>
                          <el-form-item
                            :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.expressions.'+eindex+'.value'"
                            :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                            style="width: 45%;margin: 0"
                          >
                            <el-input v-model="item2.expressions[eindex].value" placeholder="value" size="mini" ></el-input>
                          </el-form-item>
                          <i class="nz-icon nz-icon-plus" @click="addPipelineItem(index, index2)" :title="$t('tip.add')"></i>
                          <i class="nz-icon nz-icon-shanchu1" @click="delPipelineItem(index, index2, eindex)" :title="$t('overall.delete')"></i>
                        </div>
                        <el-form-item
                          :label="'Source'"
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                        >
                          <el-input v-model="item2.source" placeholder="" size="mini"></el-input>
                        </el-form-item>
                      </div>
                      <div v-if="item2.type === 'template'">
                        <el-form-item
                          :label="'Source'"
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                        >
                          <el-input v-model="item2.source" placeholder="key" size="mini"></el-input>
                        </el-form-item>
                        <el-form-item
                          :label="'Template'"
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.template'"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                        >
                          <el-input v-model="item2.template" placeholder="" size="mini"></el-input>
                        </el-form-item>
                      </div>
                      <div v-if="item2.type === 'timestamp'">
                        <el-form-item
                          :label="'Source'"
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                        >
                          <el-input v-model="item2.source" placeholder="" size="mini"></el-input>
                        </el-form-item>
                        <el-form-item
                          :label="'Format'"
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.format'"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'change' }]"
                        >
                          <el-select v-model="item2.format" :id="'timestamp' + index +'-' + index2" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small">
                            <el-option v-for="item in timestampList" :id="'module-timestamp-'+item" :key="item" :label="item" :value="item"></el-option>
                          </el-select>
                        </el-form-item>
                      </div>
                      <div v-if="item2.type === 'labels'">
                        <label class="module-form__label" style="padding-bottom: 6px;font-size: 14px;line-height: 16px;color: #666;">Key/value</label>
                        <div  v-for="(expressions, eindex) in item2.labels"  :key="eindex" style="display: flex;justify-content: space-around;align-items: center;margin-bottom: 16px">
                          <el-form-item
                            :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.labels.'+eindex+'.key'"
                            :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                            style="width: 45%;margin: 0"
                          >
                            <el-input v-model="item2.labels[eindex].key" placeholder="key" size="mini" ></el-input>
                          </el-form-item>
                          =
                          <el-form-item
                            :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.labels.'+eindex+'.value'"
                            :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                            style="width: 45%;margin: 0"
                          >
                            <el-input v-model="item2.labels[eindex].value" placeholder="value" size="mini" ></el-input>
                          </el-form-item>
                          <i class="nz-icon nz-icon-plus" @click="addPipelineItem(index, index2)" :title="$t('tip.add')"></i>
                          <i class="nz-icon nz-icon-shanchu1" @click="delPipelineItem(index, index2, eindex)" :title="$t('overall.delete')"></i>
                        </div>
                      </div>
                      <div v-if="item2.type === 'output'">
                        <el-form-item
                          :label="'Source'"
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                        >
                          <el-input v-model="item2.source" placeholder="" size="mini"></el-input>
                        </el-form-item>
                      </div>
                    </div>
                    <div style="text-align: center">
                      <div class="value-mapping-add module-box-add" style="text-align: center;width: 30px;display: inline-block;">
                        <pipelineSelect :index="item.pipeline.length - 1" :father-pipeline="item.pipeline" @addPipeline="(pipelineIndex,obj)=>{addPipeline(obj,index,pipelineIndex,'push')}" :type="'push'"/>
                      </div>
                    </div>
                  </el-tab-pane>
                  <!-- Authentication -->
                  <el-tab-pane v-if="item.type==='kubernetes'" :label="$t('config.mib.credential.auth')" name="Auth">
                    <!--authtype-->
                    <el-form-item :label='$t("overall.type")' prop="authtype">
                      <el-select id="module-box-input-auth-type" v-model="logsAuthType[index]" class="right-box__select" placeholder="" popper-class="right-box-select-top prevent-clickoutside" size="small" value-key="id" @change="logsAuthTypeChange(item)">
                        <el-option v-for="item in authTypeList" :id="'module-type-'+item.id" :key="item.value" :label="item.name" :value="item.value"></el-option>
                      </el-select>
                    </el-form-item>

                    <!--authtype 1-->
                    <el-form-item v-if="logsAuthType[index] === 1" :label='$t("profile.username")' class="half-form-item" :prop="'configs.1.config.'+index+'.basic_auth.username'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]" key="username">
                      <el-input id="module-box-input-uername" v-model="item.basic_auth.username" placeholder='' size="small"></el-input>
                    </el-form-item>
                    <el-form-item v-if="logsAuthType[index] === 1" :label='$t("login.pin")' class="half-form-item" :prop="'configs.1.config.'+index+'.basic_auth.password'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]" key="password">
                      <el-input id="module-box-input-password" v-model="item.basic_auth.password" type="password" auto-complete="new-password"  autocomplete="new-password" placeholder='' size="small"></el-input>
                    </el-form-item>

                    <!--authtype 2-->
                    <el-form-item v-if="logsAuthType[index] === 2" :label='$t("project.endpoint.authTypeToken")' :prop="'configs.1.config.'+index+'.bearer_token'" :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]" key="bearer_token">
                      <el-input id="module-box-input-bearer_token" v-model="item.bearer_token" placeholder='' size="small"></el-input>
                    </el-form-item>
                  </el-tab-pane>

                </el-tabs>
                <span class="nz-icon-minus-medium" :title="$t('overall.delete')">
                  <i class="nz-icon nz-icon-minus" @click="removeLogsArr(index)"></i>
                </span>
              </div>
              <div class="value-mapping-add" style="text-align: center;margin: 10px 144px 10px 144px;" @click="logsArrAdd()" :title="$t('tip.add')">
                <i class="nz-icon nz-icon-plus"></i>
              </div>
            </div>
          </transition>

          <!--Preview-->
          <div class="right-box-sub-title" :style="`margin-top:${logsShow&&editModule.configs[1].enable?'0':'10px'}`">
            {{$t('overall.preview')}}
          </div>
          <div class="right-box-line"></div>
          <div id="module-box-preview" ref="previewBoxScrollbar"  class="configs-copy-value"  style="overflow: auto;">
            <span class="copy-value-content" :title="$t('overall.duplicate')"> <i class="nz-icon nz-icon-override" @click="copyValue"></i></span>
            <pre>{{configsCopyValue}}</pre>
          </div>
        </el-form>
      </div>
    </div>

    <!--底部按钮-->
    <div class="right-box__footer">
      <button v-cancel="{obj:editModule,func:esc}" id="module-box-esc" class="footer__btn footer__btn--light">
        <span>{{$t('overall.cancel')}}</span>
      </button>
      <button :class="{'nz-btn-disabled':prevent_opt.save}" v-has="'monitor_module_add'" :disabled="prevent_opt.save" @click="save" class="footer__btn" id="module-box-save">
        <span>{{$t('overall.save')}}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { noSpecialChar, port, nzNumber, arrLength } from '../js/validate'
import selectWalk from '../popBox/selectWalk'
import editRigthBox from '../mixin/editRigthBox'
import pipelineSelect from './pipelineSelect'
import VueTagsInput from '@johmun/vue-tags-input'

export default {
  name: 'moduleBox',
  props: {
    module: Object,
    currentProject: Object
  },
  components: {
    'select-walk': selectWalk,
    VueTagsInput,
    pipelineSelect
  },
  mixins: [editRigthBox],
  data () {
    return {
      walkData: [],
      requirdRelabel (rule, value, callback) {
        callback()
      },
      dashboardList: [], // dashboard 列表数据
      activeName: 'Basic',
      activeNameLogs: ['Basic'],
      pipelineOptionValue: '',
      expandedWalkData: [],
      radio: 'password',
      editModule: {},
      restaurants: [
        { value: '{{module.name}}-{{asset.name}}' },
        { value: '{{module.name}}-{{asset.manageIp}}' }
      ],
      DashboardSearchShowFields: [ // DashboardSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        {
          title: this.$t('overall.name'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          },
          key: 'name'
        },
        {
          title: this.$t('overall.remark'),
          data: function (row) {
            if (row.remark && row.remark.length > 15) {
              return row.remark.substring(0, 12) + '...'
            }
            return row.remark
          },
          key: 'remark'
        }
      ],
      showAllBasicOption: false,
      rules: {
        name: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' },
          { validator: noSpecialChar, trigger: 'change' }
        ],
        projectId: [
          { required: true, message: this.$t('validate.required'), trigger: 'change' }
        ],
        walk: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        username: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        pin: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        priv_pin: [
          { required: true, message: this.$t('validate.required'), trigger: 'blur' }
        ],
        max_repetitions: [
          { validator: nzNumber, trigger: 'blur' }
        ],
        retries: [
          { validator: nzNumber, trigger: 'blur' }
        ],
        timeout: [
          { validator: nzNumber, trigger: 'blur' }
        ]
      },
      projectList: [],
      credentialList: [],
      typeList: [
        {
          value: 'http',
          name: 'HTTP',
          disabled: false
        },
        {
          value: 'https',
          name: 'HTTPS',
          disabled: false
        },
        {
          value: 'snmp',
          name: 'SNMP',
          disabled: true
        }
      ],
      logsBasicList: [
        {
          value: 'file',
          name: 'File'
        },
        {
          value: 'journal',
          name: 'Journal'
        },
        {
          value: 'syslog',
          name: 'Syslog'
        },
        {
          value: 'kubernetes',
          name: 'Kubernetes'
        }
      ],
      authType: 0,
      authTypeList: [
        { name: this.$t('project.topology.none'), value: 0 },
        { name: this.$t('project.endpoint.authTypeWord'), value: 1 },
        { name: this.$t('project.endpoint.authTypeToken'), value: 2 }
      ],

      logsAuthType: [0],
      configsCopyValue: '',
      logsCopyValue: [],
      pipelineOption: [
        {
          label: 'Parsing stages',
          pipelineOption: [
            {
              value: 'regex',
              label: 'Regex'
            }, {
              value: 'json',
              label: 'Json'
            }
          ]
        },
        {
          label: 'Transform stages',
          pipelineOption: [
            {
              value: 'template',
              label: 'Template'
            }
          ]
        },
        {
          label: 'Action stages',
          pipelineOption: [
            {
              value: 'timestamp',
              label: 'Timestamp'
            },
            {
              value: 'labels',
              label: 'Labels'
            },
            {
              value: 'output',
              label: 'Output'
            }
          ]
        }],
      timestampList: ['ANSIC', 'UnixDate', 'RubyDate', 'RFC822', 'RFC822Z', 'RFC850', 'RFC1123', 'RFC1123Z', 'RFC3339', 'RFC3339Nano', 'Unix', 'UnixMs', 'UnixUs', 'UnixNs'],
      actionList: [{
        value: 'replace',
        label: 'Replace'
      }, {
        value: 'keep',
        label: 'Keep'
      }, {
        value: 'drop',
        label: 'Drop'
      }, {
        value: 'labelmap',
        label: 'Labelmap'
      }, {
        value: 'labeldrop',
        label: 'Labeldrop'
      }, {
        value: 'labelkeep',
        label: 'Labelkeep'
      }],
      metricsShow: true,
      logsShow: true,

      logsRoleList: [
        {
          value: 'endpoints',
          label: 'endpoints'
        },
        {
          value: 'service',
          label: 'service'
        },
        {
          value: 'pod',
          label: 'pod'
        },
        {
          value: 'node',
          label: 'node'
        },
        {
          value: 'ingress',
          label: 'ingress'
        }
      ]
    }
  },
  methods: {
    port: port,
    arrLength: arrLength,
    selectWalk (walk) {
      if (this.editModule.configs[0].config.walk.indexOf(walk) != -1) {
        this.editModule.configs[0].config.walk.splice(this.editModule.configs[0].config.walk.indexOf(walk), 1)
      } else {
        this.editModule.configs[0].config.walk.push(walk)
      }
    },
    // 从mibData里取得oid对应的mib名称
    getMibName (walkData, walk) {
      let mibName = ''
      let objectName = ''
      walkData.forEach((item, index) => {
        if (!mibName && item.subTree && item.subTree.length > 0) {
          item.subTree.forEach((item2, index2) => {
            if (!mibName && getMibName(item2, walk)) {
              mibName = item.name
            }
          })
        }
      })
      function getMibName (tree, oid) {
        if (oid.indexOf(tree.objectID) > -1) {
          if (tree.objectID == oid) {
            objectName = tree.name
            return true
          } else {
            if (tree.subTree && tree.subTree.length > 0) {
              let result = false
              for (let i = 0; i < tree.subTree.length; i++) {
                if (getMibName(tree.subTree[i], oid)) {
                  result = true
                  break
                }
              }
              return result
            } else {
              return false
            }
          }
        } else {
          return false
        }
      }
      if (!objectName) {
        objectName = walk
      }
      objectName = "<span style='font-weight:bold'>" + objectName + '</span>'
      return mibName ? mibName + '：' + objectName : objectName
    },

    removeWalk (walk) {
      this.editModule.configs[0].config.walk.splice(this.editModule.configs[0].config.walk.indexOf(walk), 1)
      this.$refs.selectWalk.$refs.walkTree.setChecked(walk, false)
    },

    initWalk () {
      this.$nextTick(() => {
        if (this.$refs.selectWalk) {
          this.$refs.selectWalk.show()
        }
      })
    },

    getWalkData () {
      this.$get('mib/tree', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          const obj = JSON.parse(response.data)
          this.walkData = []
          for (const item in obj) {
            setAttr(obj[item], 'detailShow', false)
            this.walkData.push({ name: item, detailShow: false, subTree: obj[item] })
          }
        }
      })
      function setAttr (tree, name, value) {
        if (tree && tree.length > 0) {
          for (let i = 0; i < tree.length; i++) {
            tree[i][name] = value
            if (tree[i].subTree && tree[i].subTree.length > 0) {
              setAttr(tree[i].subTree, name, value)
            }
          }
        }
      }
    },

    /* 关闭弹框 */
    esc (refresh) {
      this.$emit('close', refresh)
    },

    clickOutside () {
      this.esc(false)
    },
    changeType (type) {
      if (this.editModule.id) {
        return
      }
      this.editModule.type = type
      if (type == 'snmp') {
        this.$refs.selectWalk.show()
      }
    },
    /* 保存 */
    save () {
      setTimeout(() => {
        this.editModule.configs[0].config.params = this.paramToJson(this.editModule.paramObj)
        this.editModule.configs[0].config.labels = this.labelsToJson(this.editModule.labelModule)
        const params = JSON.parse(JSON.stringify(this.editModule))
        params.configs[1].config.forEach(item => {
          if (item.labelModule) {
            item.labels = this.labelsToJson(item.labelModule)
          } else {
            item.labels = ''
          }
          delete item.labelModule
        })
        delete params.labelModule
        delete params.paramObj
        params.configs[1].config.forEach(item => {
          item.pipeline && item.pipeline.forEach((pipeline) => {
            if (pipeline.type === 'labels') {
              pipeline.labels = this.labelsToJson(pipeline.labels)
            }
            if (pipeline.type === 'json') {
              pipeline.expressions = this.labelsToJson(pipeline.expressions)
            }
          })
          item.namespaces && delete item.namespaces.tags
          item.relabel_config && item.relabel_config.forEach(subItem => {
            delete subItem.tags
            delete subItem.showAllRelabelOption
          })
        })
        params.configs[0].config.relabel_config && params.configs[0].config.relabel_config.forEach(item => {
          delete item.tags
          delete item.showAllRelabelOption
        })
        params.configs = JSON.stringify(params.configs)
        this.$refs.moduleForm.validate((valid, errorKey) => {
          let key = Object.keys(errorKey)
          if (key.length) {
            key = key[0]
            if (key.indexOf('configs.0') !== -1) {
              const keyArr = key.split('.')
              if (keyArr[3] === 'basic_auth' || keyArr[3] === 'bearer_token') {
                this.activeName = 'Auth'
              } else if (keyArr[3] === 'basic' || keyArr[3] === 'port' || keyArr[3] === 'host') {
                this.activeName = 'Basic'
              } else {
                this.activeName = 'Relabel'
              }
            } else if (key.indexOf('configs.1') !== -1) {
              const keyArr = key.split('.')
              const str = keyArr[4]
              if (str === 'fileName' || str === 'unit' || str === 'listenAddress' || str === 'appName') {
                this.activeNameLogs[keyArr[3]] = 'Basic'
              } else if (str === 'labels') {
                this.activeNameLogs[keyArr[3]] = 'Labels'
              } else if (str === 'pipeline') {
                this.activeNameLogs[keyArr[3]] = 'Pipeline'
              } else if (str === 'relabel_config') {
                this.activeNameLogs[keyArr[3]] = 'Relabel'
              } else if (str === 'basic_auth' || str === 'bearer_token') {
                this.activeNameLogs[keyArr[3]] = 'Auth'
              }
              this.activeNameLogs = [...this.activeNameLogs]
            }
          }
          if (valid) {
            this.prevent_opt.save = true
            params.dashboardId = this.editModule.dashboardId !== '' ? Number(this.editModule.dashboardId) : null
            if (this.editModule.id) {
              this.$put('monitor/module', params).then(response => {
                if (response.code === 200) {
                  // this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
                  this.messageShow(this.$t('tip.saveSuccess'), '/endpoint', { projectId: this.editModule.projectId, moduleId: response.data.id }, false, 'tip.endpoint')
                  this.$store.commit('setReloadFacade')
                  this.esc(true)
                } else {
                  this.$message.error(response.msg)
                }
                this.prevent_opt.save = false
              })
            } else {
              this.$post('monitor/module', params).then(response => {
                if (response.code === 200) {
                  this.messageShow(this.$t('tip.saveSuccess'), '/endpoint', { projectId: this.editModule.projectId, moduleId: response.data.id }, true, 'tip.endpoint')
                  this.$store.commit('setReloadFacade')
                  this.esc(true)
                } else {
                  this.$message.error(response.msg)
                }
                this.prevent_opt.save = false
              })
            }
          } else {
            this.prevent_opt.save = false
            return false
          }
        })
      }, 10)
    },
    /* 删除 */
    del () {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.$delete('monitor/module?ids=' + this.editModule.id).then(response => {
          if (response.code === 200) {
            this.$message({ duration: 1000, type: 'success', message: this.$t('tip.deleteSuccess') })
            this.$store.commit('setReloadFacade')
            this.esc(true)
          } else {
            this.$message.error(response.msg)
          }
        })
      })
    },

    /* 获取project列表 */
    getProjectList () {
      this.$get('monitor/project', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.projectList = response.data.list
        }
      })
    },
    // get snmp
    getCredential () {
      this.$get('/snmp/credential', { pageSize: -1, pageNo: 1 }).then(response => {
        if (response.code === 200) {
          this.credentialList = response.data.list
        }
      })
    },
    // 清除param
    clearAllParam () {
      this.editModule.paramObj = []
    },

    // 新增param
    addParam () {
      this.editModule.paramObj.push({ key: '', value: [], showList: false })
    },
    // 移除单个param
    removeParam (index) {
      if (this.editModule.paramObj.length === 1) {
        this.editModule.paramObj = [{ key: '', value: [] }]
      }
      this.editModule.paramObj.splice(index, 1)
    },
    // 新增label
    addLabel () {
      this.editModule.labelModule.push({ key: '', value: '' })
    },
    addLogsLabel (index) {
      this.editModule.configs[1].config[index].labelModule.push({ key: '', value: '' })
    },
    // 移除单个Label
    removeLabel (index) {
      if (this.editModule.labelModule.length === 1) {
        this.editModule.labelModule = [{ key: '', value: '' }]
        return
      }
      this.editModule.labelModule.splice(index, 1)
    },
    removeLogsLabel (logsIndex, i) {
      if (this.editModule.configs[1].config[logsIndex].labelModule.length === 1) {
        this.editModule.configs[1].config[logsIndex].labelModule = [{ key: '', value: '' }]
        return
      }
      this.editModule.configs[1].config[logsIndex].labelModule.splice(i, 1)
    },
    actionChange (index) {
      this.$refs.moduleForm.clearValidate('configs.0.config.relabel_config.' + index + '.target_label')
      this.$refs.moduleForm.clearValidate('configs.0.config.relabel_config.' + index + '.source_labels')
      this.$refs.moduleForm.clearValidate('configs.0.config.relabel_config.' + index + '.regex')
      this.$refs.moduleForm.clearValidate('configs.0.config.relabel_config.' + index + '.replacement')
    },
    logsActionChange (index, subIndex) {
      this.$refs.moduleForm.clearValidate('configs.1.config.' + index + '.relabel_config.' + subIndex + '.target_label')
      this.$refs.moduleForm.clearValidate('configs.1.config.' + index + '.relabel_config.' + subIndex + '.source_labels')
      this.$refs.moduleForm.clearValidate('configs.1.config.' + index + '.relabel_config.' + subIndex + '.regex')
      this.$refs.moduleForm.clearValidate('configs.1.config.' + index + '.relabel_config.' + subIndex + '.replacement')
    },

    addRelabel () {
      this.editModule.configs[0].config.relabel_config.push({
        source_labels: [],
        target_label: '',
        action: 'replace',
        regex: '(.*)',
        replacement: '$1',
        showAllRelabelOption: false
      })
    },
    removeRelabel (index) {
      // if (this.editModule.configs[0].config.relabel_config.length === 1) {
      //   this.editModule.configs[0].config.relabel_config = [{
      //     source_labels: [],
      //     target_label: '',
      //     action: '',
      //     regex: '',
      //     replacement: '',
      //     showAllRelabelOption: false
      //   }]
      //   return
      // }
      this.editModule.configs[0].config.relabel_config.splice(index, 1)
      this.$refs.moduleForm.clearValidate()
    },

    logsAddRelabel (index) {
      this.editModule.configs[1].config[index].relabel_config.push({
        source_labels: [],
        target_label: '',
        action: 'replace',
        regex: '(.*)',
        replacement: '$1',
        showAllRelabelOption: false
      })
    },
    logsRemoveRelabel (index, subIndex) {
      this.editModule.configs[1].config[index].relabel_config.splice(subIndex, 1)
      this.$refs.moduleForm.clearValidate()
    },

    tagsChange (newTags, index) {
      this.editModule.paramObj[index].value = newTags.map(item => item.text)
    },
    logsTagsChange (newTags, item) {
      this.$set(item.namespaces, 'names', newTags.map(item => item.text))
    },

    beforeAddingTag (tag) {
      const regx = /[a-zA-Z_:][a-zA-Z0-9_:]*/
      if (regx.test(tag.tag.text)) {
        tag.addTag()
      } else {
        this.$message.error(this.$t('tip.tagError'))
      }
    },
    tagsChangeRelabel (newTags, index) {
      this.editModule.configs[0].config.relabel_config[index].source_labels = newTags.map(item => item.text)
      this.$refs.moduleForm.clearValidate('configs.0.config.relabel_config.' + index + '.source_labels')
    },
    relabelTabBlur (tag) {
      this.$nextTick(() => {
        this.$refs.relabelTag[0].newTag = ''
      })
    },

    logsTagsChangeRelabel (newTags, index, subIndex) {
      this.editModule.configs[1].config[index].relabel_config[subIndex].source_labels = newTags.map(item => item.text)
      this.$refs.moduleForm.clearValidate('configs.1.config.' + index + '.relabel_config.' + subIndex + '.source_labels')
    },
    logsRelabelTabBlur (index, subIndex) {
      this.$nextTick(() => {
        this.$refs['logsRelabelTag' + index + subIndex][0].newTag = ''
      })
    },

    // 将param转为json字符串格式
    paramToJson (param) {
      const tempParam = {}
      for (let i = 0; i < param.length; i++) {
        if (!param[i].key || !param[i].value.length) {
          continue
        }
        tempParam[param[i].key] = param[i].value
      }
      return tempParam
    },
    // 将labels转为json字符串格式
    labelsToJson (param) {
      const tempParam = {}
      for (let i = 0; i < param.length; i++) {
        if (!param[i].key || !param[i].value) {
          continue
        }
        eval('tempParam["' + param[i].key + '"]="' + param[i].value + '"')
      }
      return tempParam
    },
    // 输入建议
    querySearch (queryString, cb) {
      const restaurants = this.restaurants
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },

    changeBasicType () {
      if (this.editModule.configs[0].config.protocol === 'snmp') {
        this.editModule.configs[0].config.metrics_path = ''
        this.editModule.configs[0].config.bearer_token = ''
        this.editModule.configs[0].config.basic_auth = {
          username: '',
          password: ''
        }
      }
    },
    changeAuthType () {
      this.editModule.configs[0].config.bearer_token = ''
      this.editModule.configs[0].config.basic_auth = {
        username: '',
        password: ''
      }
    },

    logsAuthTypeChange (item) {
      this.$set(item, 'bearer_token', '')
      this.$set(item, 'basic_auth', {
        username: '',
        password: ''
      })
    },
    logsArrAdd () {
      this.activeNameLogs.push('Basic')
      this.logsCopyValue.push('')
      this.logsAuthType.push(0)
      this.editModule.configs[1].config.push({
        type: 'file',
        fileName: '',
        unit: '',
        appName: '',
        listenAddress: '',
        apiServer: '',
        role: '',
        namespaces: {
          tags: '',
          names: []
        },
        labels: '',
        labelModule: [{ key: '', value: '' }],
        pipeline: [],
        basic_auth: {
          username: '',
          password: ''
        },
        bearer_token: '',
        relabel_config: []
      })
    },
    removeLogsArr (index) {
      if (this.editModule.configs[1].config.length !== 1) {
        this.activeNameLogs.splice(index, 1)
        this.logsCopyValue.splice(index, 1)
        this.logsAuthType.splice(index, 1)
        this.editModule.configs[1].config.splice(index, 1)
      }
    },
    logsBasicTypeChange (item, val) {
      item.fileName = ''
      item.unit = ''
      item.appName = ''
      item.listenAddress = ''
      item.apiServer = ''
      item.role = ''
      this.$set(item, 'namespaces', {
        tags: '',
        names: []
      })
      if (val === 'kubernetes') {
        item.apiServer = '127.0.0.1'
        item.role = 'pod'
      } else {
        item.bearer_token = ''
        item.basic_auth = {
          username: '',
          password: ''
        }
      }
    },

    copyValue () {
      this.$copyText(this.configsCopyValue).then(() => {
        this.$message.success({ message: this.$t('overall.copySuccess') })
      })
    },
    copyLogsValue (index) {
      const domUrl = document.createElement('input')
      domUrl.value = this.logsCopyValue[index]
      domUrl.id = 'creatDom'
      document.body.appendChild(domUrl)
      domUrl.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      const creatDom = document.getElementById('creatDom')
      creatDom.parentNode.removeChild(creatDom)
      this.$message.success(this.$t('overall.copySuccess'))
    },
    tabClick (index) {
      if (this.activeNameLogs[index] === 'Preview') {
        const params = JSON.parse(JSON.stringify(this.editModule.configs[1].config[index]))
        params.labels = this.labelsToJson(params.labelModule)
        delete params.labelModule
        Object.keys(params).forEach(key => {
          if (!params[key]) {
            delete params[key]
          }
          if (Array.isArray(params[key]) && !params[key].length) {
            delete params[key]
          }
        })
        if (params.labels && !Object.keys(params.labels).length) {
          delete params.labels
        }
        Object.keys(params.basic).forEach(key => {
          if (!params.basic[key]) {
            delete params.basic[key]
          }
        })
        params.pipeline && params.pipeline.forEach(item => {
          if (item.type === 'labels') {
            item.labels = this.labelsToJson(item.labels)
          }
        })
        this.logsCopyValue[index] = JSON.stringify(params, null, 2)
      }
    },
    syntaxHighlight (json) {
      if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2)
      }
      json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        function (match) {
          let cls = 'number'
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key'
            } else {
              cls = 'string'
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean'
          } else if (/null/.test(match)) {
            cls = 'null'
          }
          return '<span class="' + cls + '">' + match + '</span>'
        }
      )
    },
    paramObjchange (val, index) {
      this.editModule.paramObj[index].value = val.filter(item => item.trim())
    },
    resultFormat (resp) {
      if (resp && resp.data) {
        const assetData = {}
        assetData.list = resp.data.list
        assetData.totalRow = resp.data.total
        return assetData
      }
    },
    /* 获取Dashboard列表数据 */
    DashboardTemplateList () {
      this.$get('visual/dashboard', { pageSize: -1, varType: 2, type: 'template' }).then(res => {
        this.dashboardList = res.data.list
      })
    },
    // 添加pipeline
    addPipeline (obj, logsIndex, pipeLineIndex, type) {
      if (type == 'splice') {
        this.editModule.configs[1].config[logsIndex].pipeline.splice(pipeLineIndex, 0, obj)
      }
      if (type == 'push') {
        this.editModule.configs[1].config[logsIndex].pipeline.push(obj)
      }
    },
    // 删除pipeline
    delPipeline (logsIndex, pipeLineIndex) {
      this.editModule.configs[1].config[logsIndex].pipeline.splice(pipeLineIndex, 1)
      this.$refs.moduleForm.clearValidate()
    },
    // 添加pipelineItem
    addPipelineItem (logsIndex, pipelineIndex) {
      const val = this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].type
      if (val === 'regex') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expression.push('')
      } else if (val === 'json') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expressions.push(
          {
            key: '',
            value: ''
          }
        )
      } else if (val === 'template') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expressions.push('')
      } else if (val === 'timestamp') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expressions.push('')
      } else if (val === 'labels') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].labels.push({
          key: '',
          value: ''
        })
      } else if (val === 'output') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expressions.push('')
      }
    },
    delPipelineItem (logsIndex, pipelineIndex, itemIndex) {
      const val = this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].type
      if (val === 'json' && this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expressions.length > 1) {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expressions.splice(itemIndex, 1)
      } else if (val === 'labels' && this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].labels.length > 1) {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].labels.splice(itemIndex, 1)
      }
      this.$refs.moduleForm.clearValidate()
    }
  },
  mounted () {

  },
  created () {
    this.getProjectList()
    this.getCredential()
    this.getWalkData()
    this.DashboardTemplateList()
  },
  computed: {
    mibName () {
      return (value) => {
        return this.getMibName(this.walkData, value)
      }
    },
    language () { return this.$store.getters.getLanguage }
  },
  watch: {
    module: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        this.editModule = JSON.parse(JSON.stringify(n))
        this.editModule.dashboardId = n.dashboardId ? n.dashboardId + '' : ''
        this.activeName = 'Basic'
        this.activeNameLogs = this.editModule.configs[1].config.map(() => 'Basic')
        this.logsCopyValue = this.editModule.configs[1].config.map(() => '')
        if (this.editModule.configs[0].config.bearer_token) {
          this.authType = 2
        } else if (this.editModule.configs[0].config.basic_auth.username) {
          this.authType = 1
        } else {
          this.authType = 0
        }
        if (n.type && n.type.toLowerCase() == 'snmp') {
          this.$refs.selectWalk.show()
          for (let i = 0; i < this.editModule.configs[0].config.walk.length; i++) {
            this.expandedWalkData.push(this.editModule.configs[0].config.walk[i].substring(0, this.editModule.configs[0].config.walk[i].lastIndexOf('.')))
          }
        }

        this.editModule.configs[1].config.forEach((item, index) => {
          if (item.bearer_token) {
            this.logsAuthType[index] = 2
          } else if (item.basic_auth && item.basic_auth.username) {
            this.logsAuthType[index] = 1
          } else {
            this.logsAuthType[index] = 0
          }
        })
      }
    },
    editModule: {
      deep: true,
      immediate: true,
      handler (n) {
        if (n && n.configs) {
          const params = JSON.parse(JSON.stringify(n.configs))
          params[0].config.params = this.paramToJson(this.editModule.paramObj)
          params[0].config.labels = this.labelsToJson(this.editModule.labelModule)
          Object.keys(params[0].config).forEach(key => {
            if (!params[0].config[key]) {
              delete params[0].config[key]
            }
            if ((Array.isArray(params[0].config[key]) && !params[0].config[key].length) || (JSON.stringify(params[0].config[key]) == '{}')) {
              delete params[0].config[key]
            }
          })
          if (params[0].config.basic_auth && !params[0].config.basic_auth.username) {
            delete params[0].config.basic_auth
          }
          if (params[0].config.basic_auth && !params[0].config.basic_auth.password) {
            delete params[0].config.basic_auth
          }
          if (params[0].config.param && !Object.keys(params[0].config.param).length) {
            delete params[0].config.param
          }
          if (params[0].config.labels && !Object.keys(params[0].config.labels).length) {
            delete params[0].config.labels
          }
          params[0].config.relabel_config && params[0].config.relabel_config.forEach(item => {
            delete item.tags
            delete item.showAllRelabelOption
          })

          params[1].config.forEach(item => {
            if (item.labelModule) {
              item.labels = this.labelsToJson(item.labelModule)
              delete item.labelModule
            }
            item.pipeline && item.pipeline.forEach((pipeline) => {
              if (pipeline.type === 'labels') {
                pipeline.labels = this.labelsToJson(pipeline.labels)
              }
              if (pipeline.type === 'json') {
                pipeline.expressions = this.labelsToJson(pipeline.expressions)
              }
            })

            if (item.namespaces) {
              delete item.namespaces.tags
              if (!item.namespaces.names.length) {
                delete item.namespaces.names
              }
            }
            Object.keys(item).forEach(key => {
              if (!item[key]) {
                delete item[key]
              }
              if ((Array.isArray(item[key]) && !item[key].length) || (JSON.stringify(item[key]) == '{}')) {
                delete item[key]
              }
            })
            if (item.basic_auth && !item.basic_auth.username) {
              delete item.basic_auth
            }
            if (item.basic_auth && !item.basic_auth.password) {
              delete item.basic_auth
            }

            item.relabel_config && item.relabel_config.forEach(subItem => {
              delete subItem.tags
              delete subItem.showAllRelabelOption
            })
          })
          this.configsCopyValue = JSON.stringify(params, null, 2)
        }
      }
    }
  }
}
</script>
