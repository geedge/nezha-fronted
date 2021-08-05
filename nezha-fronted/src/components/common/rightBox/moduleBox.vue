<template>
  <div class="right-box right-box-module" v-clickoutside="{obj:editModule,func:clickOutside}">
    <div class="right-box__header">
      <!-- begin--标题-->
      <div class="header__title">{{editModule.id ? $t("project.module.editModule") : $t("project.module.createModule")}}</div>
      <!-- end--标题-->
      <div class="header__operation">
        <span v-cancel="{obj: editModule, func: esc}"><i class="nz-icon nz-icon-close"></i></span>
      </div>
    </div>

    <!-- begin--表单-->
    <div class="right-box__container">
      <div class="container__form">
        <el-form ref="moduleForm" :model="editModule" :rules="rules" label-position="top" label-width="120px">
          <!--name-->
          <el-form-item :label='$t("project.module.moduleName")' label-width="125px" prop="name">
            <el-input id="module-box-input-name" v-model="editModule.name" maxlength="64" placeholder="" show-word-limit size="small"></el-input>
          </el-form-item>
          <!--project-->
          <el-form-item :label='$t("project.project.projectName")' prop="projectId">
            <el-select id="module-box-input-project" v-model="editModule.projectId" :disabled="!!editModule.id" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id">
              <el-option v-for="item in projectList" :id="'module-project-'+item.id" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
          <!--remark-->
          <el-form-item :label='$t("overall.remark")' prop="remark">
            <el-input
              id="module-box-input-remark"
              v-model="editModule.remark"
              :autosize="{ minRows: 1, maxRows: 6}"
              class="not-fixed-height no-resize"
              maxlength="256"
              show-word-limit
              placeholder=""
              size="small"
              type="textarea"></el-input>
          </el-form-item>
          <!--Enpoint template-->
          <div class="right-box-sub-title">{{ $t("overall.endpointTemplate") }}
            <el-tooltip effect="light" placement="top">
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
              v-model="editModule.endpointNameTmpl"
              :fetch-suggestions="querySearch"
              :placeholder="$t('overall.placeHolder')"
              class="inline-input"
              size="small"
            ></el-autocomplete>
          </el-form-item>
          <!-- ChartTemplate  -->
          <el-form-item :label="$t('config.model.ChartTemplate')" prop="ChartTemplate">
            <v-selectpage
              :data="chartTempList"
              :tb-columns="ChartSearchShowFields"
              :params="{
                varType: 2, panelId: 0,
                returnChildren:0,groupId:0,
              }"
              :multiple="true"
              :language="language"
              title="ChartSearch"
              key-field="id"
              show-field="name"
              v-model="editModule.chartIds"
              class="form-control"
              :result-format="resultFormat"
            ></v-selectpage>
          </el-form-item>
          <div class="endpoint-title">
            <span class="endpoint-title-content">
              <i class="nz-icon nz-icon-arrow-down" :class="metricsShow?'':'is-active'" @click="metricsShow = !metricsShow"></i>
              Metrics
            </span>
            <el-switch v-model="editModule.configs[0].enable"  active-color="#ee9d3f" size="small" :active-value="1" :inactive-value="0"></el-switch>
          </div>
          <transition name="el-zoom-in-top">
            <el-tabs v-model="activeName" v-show="metricsShow" v-if="editModule.configs[0].enable">
            <el-tab-pane label="Basic" name="Basic">
              <!--path-->
              <el-form-item :label='$t("project.endpoint.path")' class="half-form-item" prop="configs.metrics_path">
                <el-input id="module-box-input-path" v-model="editModule.configs[0].config.metrics_path" placeholder="" size="small"></el-input>
              </el-form-item>
              <!--port-->
              <el-form-item :label='$t("project.endpoint.port")' class="half-form-item" prop="configs.0.config.port" :rules="[
                { validator: port, trigger: 'blur' },
                { required: true, message: this.$t('validate.required'), trigger: 'blur' }
              ]">
                <el-input id="module-box-input-port" v-model.number="editModule.configs[0].config.port" placeholder="" size="small"></el-input>
              </el-form-item>
              <!--type-->
              <el-form-item :label='$t("project.endpoint.type")' class="half-form-item" prop="type">
                <el-select id="module-box-input-type" v-model="editModule.configs[0].config.protocol" :disabled="!!editModule.id" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id" @change="changeAuthType">
                  <el-option v-for="item in typeList" :id="'module-type-'+item.id" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <!--host-->
              <el-form-item :label='$t("project.endpoint.host")' class="half-form-item" prop="configs.0.config.host" :rules="[{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]">
                <el-input id="module-box-input-host" v-model="editModule.configs[0].config.host" placeholder="" size="small"></el-input>
              </el-form-item>
              <!-- snmp表单 -->
              <div v-if="editModule.configs[0].config.protocol && editModule.configs[0].config.protocol == 'snmp'" class="">
                <el-row>
                  <el-col :span="6">
                    <div class="sub-label sub-label-required" style="padding-left: 0">{{$t('project.module.walk')}}</div>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item prop="configs.0.config.walk" :rules="[{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]">
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
                                  <div class="walk-close-box" @click.stop="removeWalk(item)">
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
                <el-select id="module-box-input-credentials" v-model="editModule.configs[0].config.snmpCredentialsId" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id">
                  <el-option v-for="item in credentialList" :id="'module-type-'+item.id" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
          </div>
              <transition name="el-zoom-in-top">
                <div v-show="showAllBasicOption" >
                  <!--scrape_interval-->
                  <el-form-item :label='$t("project.endpoint.scrape_interval")' class="half-form-item" prop="configs.0.config.scrape_interval">
                    <el-input id="module-box-input-scrape_interval" v-model.number="editModule.configs[0].config.scrape_interval" :placeholder='$t("project.endpoint.scrape_interval_placeholder")' size="small">
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
                <span class="nz-btn nz-btn-size-normal-new nz-btn-style-light-new" style="border: none" @click="showAllBasicOption=!showAllBasicOption">
                  {{$t('overall.moreOption')}}
                  <i :class="showAllBasicOption?'is-active':''" class="nz-icon nz-icon-arrow-down need-rotate" ></i>
                </span>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Parameter" name="Parameter">
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
                      :placeholder="'add parameter'"
                      :tags="item.value"
                      @tags-changed="(newTags)=>{tagsChange(newTags, index)}"
                    />
                  </el-form-item>
                  <span :id="'moduel-remove-param-'+index" class="param-box-row-symbol" @click="removeParam(index)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
                </div>
              </div>
              <div style="text-align: center">
                 <span id="module-add-param" class="right-box-form-add module-add-label" type="button" @click="addParam">
                <span><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
              </span>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Labels" name="Labels">
              <div id="module-box-labels" ref="labelBoxScrollbar" style="height: 100%; overflow: auto;">
                <div v-for="(item, index) in editModule.labelModule" :key="index" class="param-box-row">
                  <el-form-item :prop="'labelModule.' + index + '.key'" :rules="[{ pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('validate.key') ,trigger: 'blur'}]" class="param-box-row-key">
                    <el-input v-model="item.key" placeholder="key" size="mini"></el-input>
                  </el-form-item>
                  <span class="param-box-row-eq">=</span>
                  <el-form-item :prop="'labelModule.' + index + '.value'" class="param-box-row-value">
                    <el-input v-model="item.value" placeholder="value" size="mini"></el-input>
                  </el-form-item>
                  <span :id="'moduel-remove-label-'+index" class="param-box-row-symbol" @click="removeLabel(index)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
                </div>
              </div>
              <div style="text-align: center">
                 <span id="module-add-label" class="right-box-form-add module-add-label" type="button" @click="addLabel">
                <span><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
              </span>
              </div>
            </el-tab-pane>
            <el-tab-pane v-if="editModule.configs[0].config.protocol !== 'snmp'" label="Auth" name="Auth">
              <!--authtype-->
              <el-form-item :label='$t("project.endpoint.type")' prop="authtype">
                <el-select id="module-box-input-auth-type" v-model="authType" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" value-key="id" @change="changeAuthType">
                  <el-option v-for="item in authTypeList" :id="'module-type-'+item.id" :key="item.value" :label="item.name" :value="item.value"></el-option>
                </el-select>
              </el-form-item>

              <!--authtype 1-->
              <el-form-item v-if="authType === 1" :label='$t("project.endpoint.username")' class="half-form-item" prop="configs.0.config.basic_auth.username" :rules="[{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]">
                <el-input id="module-box-input-uername" v-model.number="editModule.configs[0].config.basic_auth.username" placeholder='' size="small"></el-input>
              </el-form-item>

              <el-form-item v-if="authType === 1" :label='$t("project.endpoint.pin")' class="half-form-item" prop="configs.0.config.basic_auth.pin" :rules="[{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]">
                <el-input id="module-box-input-password" v-model.number="editModule.configs[0].config.basic_auth.pin" placeholder='' size="small"></el-input>
              </el-form-item>

              <!--authtype 2-->
              <el-form-item v-if="authType === 2" :label='$t("project.endpoint.bearer_token")' prop="configs.0.config.bearer_token" :rules="[{ required: true, message: this.$t('validate.required'), trigger: 'blur' }]">
                <el-input id="module-box-input-bearer_token" v-model.number="editModule.configs[0].config.bearer_token" placeholder='' size="small"></el-input>
              </el-form-item>

            </el-tab-pane>
          </el-tabs>
          </transition>
          <div class="endpoint-title" style="margin-top: 10px">
            <span class="endpoint-title-content">
               <i class="nz-icon nz-icon-arrow-down" :class="logsShow?'':'is-active'" @click="logsShow = !logsShow"></i>
              Logs
            </span>
            <el-switch v-model="editModule.configs[1].enable"  active-color="#ee9d3f" size="small" :active-value="1" :inactive-value="0"></el-switch>
          </div>
          <transition name="el-zoom-in-top">
          <div v-show="logsShow" v-if="editModule.configs[1].enable">
            <div v-for="(item, index) in editModule.configs[1].config" :key="index" style="position: relative">
              <el-tabs v-model="activeNameLogs[index]" class="special-tabs" @tab-click="()=>{tabClick(index)}" :ref="'logsTabs' + index">
                <el-tab-pane label="Basic" name="Basic">
                  <!--type-->
                  <el-form-item :label='$t("project.endpoint.type")' class="half-form-item">
                    <el-select id="module-box-input-type" v-model="item.type" class="right-box__select" placeholder="" popper-class="right-box-select-dropdown prevent-clickoutside" size="small" @change="logsBasicTypeChange(index)">
                      <el-option v-for="item in logsBasicList" :id="'module-type-'+item.id" :key="item.value" :label="item.name" :value="item.value"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    v-if='item.type === "file"'
                    :label='item.type === "file" ? $t("project.endpoint.basicTypeFile"):( item.type === "journal" ? $t("project.endpoint.basicTypeJournal") : $t("project.endpoint.basicTypeSyslog"))' class="half-form-item"
                    :prop="'configs.1.config.'+ index +'.fileName'"
                    :rules="[ { required: true, message: $t('validate.required'), trigger: 'blur' }]"
                  >
                    <el-input v-if='item.type === "file"' v-model="item.fileName" :id="'module-box-basic-value' +index" placeholder='' size="small"></el-input>
                  </el-form-item>
                  <el-form-item
                    v-if='item.type === "journal"'
                    :label='item.type === "file" ? $t("project.endpoint.basicTypeFile"):( item.type === "journal" ? $t("project.endpoint.basicTypeJournal") : $t("project.endpoint.basicTypeSyslog"))' class="half-form-item"
                    :prop="'configs.1.config.'+ index +'.unit'"
                    :rules="[ { required: true, message: $t('validate.required'), trigger: 'blur' }]"
                  >
                    <el-input v-if='item.type === "journal"' v-model="item.unit" :id="'module-box-basic-value' +index" placeholder='' size="small"></el-input>
                  </el-form-item>
                  <el-form-item
                    v-if='item.type === "syslog"'
                    :label='item.type === "file" ? $t("project.endpoint.basicTypeFile"):( item.type === "journal" ? $t("project.endpoint.basicTypeJournal") : $t("project.endpoint.basicTypeSyslog"))' class="half-form-item"
                    :prop="'configs.1.config.'+ index +'.listenAddress'"
                    :rules="[ { required: true, message: $t('validate.required'), trigger: 'blur' }]"
                  >
                    <el-input v-if='item.type === "syslog"' v-model="item.listenAddress" :id="'module-box-basic-value' +index" placeholder='' size="small"></el-input>
                  </el-form-item>
                  <el-form-item
                    v-if="item.type === 'syslog'"
                    :label=' $t("project.endpoint.basicAppName")'
                    class="half-form-item"
                    :prop="'configs.1.config.'+ index +'.appName'"
                    :rules="[ { required: true, message: $t('validate.required'), trigger: 'blur' }]"
                  >
                    <el-input  v-model="item.appName" :id="'module-box-basic-appName' +index" placeholder='' size="small"></el-input>
                  </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="Labels" name="Labels">
                  <div id="module-box-logs-labels" ref="labelBoxScrollbar" style="height: 100%; overflow: auto;">
                    <div v-for="(item1, i) in item.labelModule" :key="i" class="param-box-row">
                      <el-form-item :prop="'configs.1.config.'+ index +'.labelModule.' + i + '.key'" :rules="[{ pattern: /[a-zA-Z_:][a-zA-Z0-9_:]*/, message: $t('validate.key') ,trigger: 'blur'}]" class="param-box-row-key">
                        <el-input v-model="item1.key" placeholder="key" size="mini"></el-input>
                      </el-form-item>
                      <span class="param-box-row-eq">=</span>
                      <el-form-item class="param-box-row-value">
                        <el-input v-model="item1.value" placeholder="value" size="mini"></el-input>
                      </el-form-item>
                      <span :id="'moduel-remove-label-'+i" class="param-box-row-symbol" @click="removeLogsLabel(index, i)"><i class="nz-icon nz-icon-shanchu1" style="color:#666;"></i></span>
                    </div>
                  </div>
                  <div style="text-align: center">
                 <span id="module-add-logs-label" class="right-box-form-add module-add-label" type="button" @click="addLogsLabel(index)">
                <span><i class="nz-icon nz-icon-plus" style="font-size: 16px;"></i></span>
              </span>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="Pipeline" name="Pipeline">
                  <div v-for="(item2, index2) in item.pipeline" :key="index2">
                    <div class="pipeline-box">
                      <span class="pipeline-title">{{item2.type}}</span>
                      <span class="pipeline-option">
                      <pipelineSelect :index="index2" :father-pipeline="item.pipeline" @addPipeline="(pipelineIndex,obj)=>{addPipeline(obj,index,pipelineIndex,'splice')}" :type="'splice'"/>
                      <i class="nz-icon nz-icon-shanchu1" @click="delPipeline(index,index2)"></i>
                    </span>
                    </div>
                    <div v-if="item2.type === 'regex'">
                      <el-form-item
                        :label="'Expression'"
                        :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.expression'"
                        :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      >
                        <el-input v-model="item2.expression" placeholder="key" size="mini"></el-input>
                      </el-form-item>
                      <el-form-item
                        :label="'Source'"
                        :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                        :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      >
                        <el-input v-model="item2.source" placeholder="key" size="mini"></el-input>
                      </el-form-item>
                    </div>
                    <div v-if="item2.type === 'json'">
                      <label style="padding-bottom: 6px;font-size: 14px;line-height: 16px;color: #666;">Expressions</label>
                      <div v-for="(expressions, eindex) in item2.expressions"  :key="eindex" style="display: flex;justify-content: space-around;align-items: center;margin-bottom: 16px">
                        <el-form-item
                          :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.expressions.'+eindex"
                          :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                          style="width: 90%;margin: 0"
                        >
                          <el-input v-model="item2.expressions[eindex]" placeholder="key" size="mini"></el-input>
                        </el-form-item>
                        <span style="display: inline-block;width: 10%">
                        <i class="nz-icon nz-icon-plus" @click="addPipelineItem(index, index2)"></i>
                        <i class="nz-icon nz-icon-shanchu1" @click="delPipelineItem((index, index2, eindex))"></i>
                      </span>
                      </div>
                      <el-form-item
                        :label="'Source'"
                        :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                        :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      >
                        <el-input v-model="item2.source" placeholder="key" size="mini"></el-input>
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
                        <el-input v-model="item2.template" placeholder="key" size="mini"></el-input>
                      </el-form-item>
                    </div>
                    <div v-if="item2.type === 'timestamp'">
                      <el-form-item
                        :label="'Source'"
                        :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                        :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      >
                        <el-input v-model="item2.source" placeholder="key" size="mini"></el-input>
                      </el-form-item>
                      <el-form-item
                        :label="'Timestamp'"
                        :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.timestamp'"
                        :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      >
                        <el-input v-model="item2.timestamp" placeholder="key" size="mini"></el-input>
                      </el-form-item>
                    </div>
                    <div v-if="item2.type === 'labels'">
                      <label style="padding-bottom: 6px;font-size: 14px;line-height: 16px;color: #666;">Key/value</label>
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
                          <el-input v-model="item2.labels[eindex].value" placeholder="key" size="mini" ></el-input>
                        </el-form-item>
                        <i class="nz-icon nz-icon-plus" @click="addPipelineItem(index, index2)"></i>
                        <i class="nz-icon nz-icon-shanchu1" @click="delPipelineItem((index, index2, eindex))"></i>
                      </div>
                    </div>
                    <div v-if="item2.type === 'output'">
                      <el-form-item
                        :label="'Source'"
                        :prop="'configs.1.config.'+ index +'.pipeline.' + index2 + '.source'"
                        :rules="[{ required: true, message: $t('validate.required'), trigger: 'blur' }]"
                      >
                        <el-input v-model="item2.source" placeholder="key" size="mini"></el-input>
                      </el-form-item>
                    </div>
                  </div>
                  <div style="text-align: center">
                    <div class="value-mapping-add" style="text-align: center;width: 25px;display: inline-block;margin-right: 44px">
                      <pipelineSelect :index="item.pipeline.length - 1" :father-pipeline="item.pipeline" @addPipeline="(pipelineIndex,obj)=>{addPipeline(obj,index,pipelineIndex,'push')}" :type="'push'"/>
                    </div>
                  </div>
                </el-tab-pane>
<!--                <el-tab-pane label="Preview" name="Preview">-->
<!--                  <div id="module-box-logs-preview" ref="previewBoxScrollbar"  class="configs-copy-value"  style="height: 100%; overflow: auto;">-->
<!--                    <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyLogsValue(index)"></i></span>-->
<!--                    <pre style="overflow-y: auto;height:100%;width: 97%;">{{logsCopyValue[index]}}</pre>-->
<!--                  </div>-->
<!--                </el-tab-pane>-->
              </el-tabs>
              <span class="nz-icon-minus-medium">
              <i class="nz-icon nz-icon-minus" @click="removeLogsArr(index)"></i>
          </span>
            </div>
            <div class="value-mapping-add" style="text-align: center;margin: 10px 180px 10px 144px;" @click="logsLogsArrAdd()">
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
            <span class="copy-value-content"> <i class="nz-icon nz-icon-override" @click="copyValue"></i></span>
            <pre style="overflow-y: auto;height:100%">{{configsCopyValue}}</pre>
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
import { noSpecialChar, port, nzNumber } from '../js/validate'
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
      chartTempList: [],
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
      ChartSearchShowFields: [ // ChartSearch 下拉搜索表头
        { title: 'ID', data: 'id' },
        {
          title: this.$t('config.model.titleName'),
          data: function (row) {
            if (row.name.length > 15) {
              return row.name.substring(0, 12) + '...'
            }
            return row.name
          }
        },
        { title: this.$t('config.model.titleType'), data: 'type' },
        {
          title: this.$t('overall.remark'),
          data: function (row) {
            if (row.remark && row.remark.length > 15) {
              return row.remark.substring(0, 12) + '...'
            }
            return row.remark
          }
        }
      ],
      language: localStorage.getItem('nz-language'),
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
          name: 'HTTP'
        },
        {
          value: 'snmp',
          name: 'SNMP'
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
        }
      ],
      authType: 0,
      authTypeList: [
        { name: this.$t('project.endpoint.authTypeNull'), value: 0 },
        { name: this.$t('project.endpoint.authTypeWord'), value: 1 },
        { name: this.$t('project.endpoint.authTypeToken'), value: 2 }
      ],
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
      metricsShow: true,
      logsShow: true
    }
  },
  methods: {
    port: port,
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
      if (type !== 'http') {
        this.$refs.selectWalk.show()
      }
    },
    /* 保存 */
    save () {
      setTimeout(() => {
        this.editModule.configs[0].config.params = this.paramToJson(this.editModule.paramObj)
        this.editModule.configs[0].config.labels = this.labelsToJson(this.editModule.labelModule)
        this.editModule.configs[1].config.forEach(item => {
          if (item.labelModule) {
            item.labels = this.labelsToJson(item.labelModule)
          } else {
            item.labels = ''
          }
        })
        const params = JSON.parse(JSON.stringify(this.editModule))
        params.configs[1].config.forEach(item => {
          item.pipeline && item.pipeline.forEach((pipeline) => {
            if (pipeline.type === 'labels') {
              pipeline.labels = this.labelsToJson(pipeline.labels)
            }
          })
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
              } else if (keyArr[3] === 'basic' || keyArr[3] === 'port') {
                this.activeName = 'Basic'
              }
            } else if (key.indexOf('configs.1') !== -1) {
              const keyArr = key.split('.')
              this.activeNameLogs[keyArr[3]] = keyArr[4].trim().toLowerCase().replace(keyArr[4][0], keyArr[4][0].toUpperCase())
              this.activeNameLogs = [...this.activeNameLogs]
            }
          }
          if (valid) {
            this.prevent_opt.save = true
            if (this.editModule.id) {
              this.$put('monitor/module', params).then(response => {
                if (response.code === 200) {
                  this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
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
                  this.$message({ duration: 1000, type: 'success', message: this.$t('tip.saveSuccess') })
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
    tagsChange (newTags, index) {
      this.editModule.paramObj[index].value = newTags.map(item => item.text)
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
    changeAuthType () {
      this.editModule.configs[0].config.bearer_token = ''
      this.editModule.configs[0].config.basic_auth = {
        username: '',
        pin: ''
      }
    },
    logsLogsArrAdd () {
      this.activeNameLogs.push('Basic')
      this.logsCopyValue.push('')
      this.editModule.configs[1].config.push({
        type: 'file',
        fileName: '',
        labels: '',
        labelModule: [{ key: '', value: '' }],
        pipeline: []
      })
    },
    removeLogsArr (index) {
      if (this.editModule.configs[1].config.length !== 1) {
        this.editModule.configs[1].config.splice(index, 1)
      }
    },
    logsBasicTypeChange (i) {
      const type = this.editModule.configs[1].config[i].type
      if (type === 'file') {
        this.editModule.configs[1].config[i].fileName = ''
        delete this.editModule.configs[1].config[i].unit
        delete this.editModule.configs[1].config[i].appName
        delete this.editModule.configs[1].config[i].listenAddress
      } else if (type === 'journal') {
        delete this.editModule.configs[1].config[i].fileName
        this.editModule.configs[1].config[i].unit = ''
        delete this.editModule.configs[1].config[i].appName
        delete this.editModule.configs[1].config[i].listenAddress
      } else if (type === 'syslog') {
        delete this.editModule.configs[1].config[i].fileName
        delete this.editModule.configs[1].config[i].unit
        this.editModule.configs[1].config[i].appName = ''
        this.editModule.configs[1].config[i].listenAddress = ''
      }
    },
    copyValue () {
      const domUrl = document.createElement('input')
      domUrl.value = this.configsCopyValue
      domUrl.id = 'creatDom'
      document.body.appendChild(domUrl)
      domUrl.select() // 选择对象
      document.execCommand('Copy') // 执行浏览器复制命令
      const creatDom = document.getElementById('creatDom')
      creatDom.parentNode.removeChild(creatDom)
      this.$message.success(this.$t('overall.copySuccess'))
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
    /* 获取chart列表数据 */
    ChartTemplateList () {
      this.$get('visual/panel/chart', { pageSize: -1, varType: 2, panelId: 0, returnChildren: 0, groupId: 0 }).then(res => {
        this.chartTempList = res.data.list
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
    },
    // 添加pipelineItem
    addPipelineItem (logsIndex, pipelineIndex) {
      const val = this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].type
      if (val === 'regex') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expression.push('')
      } else if (val === 'json') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expressions.push('')
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
      if (val === 'json') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].expressions.splice(itemIndex, 1)
      } else if (val === 'labels') {
        this.editModule.configs[1].config[logsIndex].pipeline[pipelineIndex].labels.splice(itemIndex, 1)
      }
    }
  },
  mounted () {

  },
  created () {
    this.getProjectList()
    this.getCredential()
    this.getWalkData()
    this.ChartTemplateList()
  },
  computed: {
    mibName () {
      return (value) => {
        return this.getMibName(this.walkData, value)
      }
    }
  },
  watch: {
    module: {
      immediate: true,
      deep: true,
      handler (n, o) {
        this.isEdit = true
        this.editModule = JSON.parse(JSON.stringify(n))
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
            if (Array.isArray(params[0].config[key]) && !params[0].config[key].length) {
              delete params[0].config[key]
            }
          })
          if (params[0].config.basic_auth && !params[0].config.basic_auth.username) {
            delete params[0].config.basic_auth
          }
          if (params[0].config.basic_auth && !params[0].config.basic_auth.pin) {
            delete params[0].config.basic_auth
          }
          if (params[0].config.param && !Object.keys(params[0].config.param).length) {
            delete params[0].config.param
          }
          if (params[0].config.labels && !Object.keys(params[0].config.labels).length) {
            delete params[0].config.labels
          }
          params[1].config.forEach(item => {
            if (item.labelModule) {
              item.labels = this.labelsToJson(item.labelModule)
              delete item.labelModule
            }
          })
          this.configsCopyValue = JSON.stringify(params, null, 2)
        }
      }
    }
  }
}
</script>
<style scoped lang="scss">
  .module-walk-box {
    width: 100%;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    min-height: 32px;
    margin-bottom: 22px;
    padding: 3px 0;
  }
  .module-walk-box i {
    color: #C0C4CC;
  }
  .walk-box-item {
    padding: 5px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .walk-box-item-txt {
    color: #606266;
  }
  .walk-box-item-op span:first-of-type {
    margin-right: 4px;
  }
  .walk-box-item-op span {
    cursor: pointer;
  }
  .walk-box-op {
    width: 18px;
    margin: 5px 0 5px 15px;
    cursor: pointer;
  }
  .el-cascader {
    width: 100%;
  }
  .el-cascader__tags {
    height: calc(100% - 10px);
    width: 100%;
  }
  .right-box-module .el-cascader .el-input__inner {
    height: 150px;
  }
  .right-box-form-tip{
    color: #999999;
    line-height: 21px;
  }
  .half-form-item {
    width: calc(50% - 21px);
    display: inline-block;
    padding: 0 0px 0 0px;
  }
  .half-form-item:nth-child(even){
    padding-left: 0;
  }
  /deep/ .el-tabs__item{
    width: 90px;
    padding: 0;
    text-align: center;
  }
  /deep/ .el-tabs__item.is-active{
    color: #FA901C
  }
  /deep/ .el-tabs__active-bar{
    background-color: #FA901C
  }
  /deep/ .el-radio-group{
    width: 100%;
  }
  /deep/ .el-radio{
    width: 100%;
  }
  /deep/ .el-autocomplete{
    width: 100%;
  }
  /deep/ .el-tabs__content{
    /*padding-left: 18px;*/
  }
  .need-rotate.nz-icon-arrow-down{
    display: inline-block;
    transition: transform .3s;
  }
  .need-rotate.nz-icon-arrow-down.is-active{
    transform: rotate(
      -180deg
    );
  }
  .module-add-label{
    display: inline-block;
    width: 16px;
    height: 18px;
    background: rgba(250,144,28,0.1);
    border: 1px solid #FFE0BD;
    border-radius: 2px;
    text-align: center;
    line-height: 18px;
    margin-right: 55px;
  }
  .configs-copy-value{
    opacity: 0.9;
    background: #F6F8FA;
    border: 1px solid #E7EAED;
    border-radius: 2px;
    height: 140px;
    position: relative;
    margin-top: 10px;
    padding: 10px 0px 10px 15px;
    width:100%;
    margin-left: 0px;
    pre{
      max-height: 300px;
      min-height: 100px;
    }
  }
  .configs-copy-value .copy-value-content{
    position: absolute;
    right: 20px;
    top: 14px;
    cursor: pointer;
  }
  /deep/ .ti-input{
    min-height: 30px;
    overflow-x: hidden;
    border-radius: 2px;
    padding: 0 !important;
  }
  /deep/ .ti-tag{
    background-color: #f4f4f5;
    border-color: #e9e9eb;
    color: #909399;
    padding: 2px 4px!important;;
  }
  /deep/ .el-form-item__content .el-input-group {
    vertical-align: unset;
  }
  /deep/ .special-tabs.el-tabs.el-tabs--top{
    border: 1px dashed #D8D9DA;
    padding: 7px 10px;
    margin-top: 10px;
    position: relative;
  }
  .nz-icon-minus-medium {
    position: absolute;
    right: 20px;
    top: 15px;
    background: rgba(236,127,102,0.1);
    padding: 2px 6px;
    color: #EC7F66;
  }
  .endpoint-title{
    border: 1px solid #E7EAED;
    border-radius: 2px;
    display: flex;
    padding: 8px 10px;
    justify-content: space-between;
  }
  .endpoint-title .endpoint-title-content{
    font-family: Roboto-Medium;
    font-size: 14px;
    color: #333333;
    letter-spacing: 0;
    text-align: right;
    font-weight: 500;
    .nz-icon-arrow-down{
      display: inline-block;
      transition: transform .3s;
      color: #BDBDBD;
      font-size: 12px;
    }
    .nz-icon-arrow-down.is-active{
      transform: rotate(
          -90deg
      );
    }
  }
  .value-mapping-add {
    background: rgba(250,144,28,0.1);
    border: 1px solid #FFE0BD;
    margin-bottom: 10px;
    height: 24px;
    line-height: 24px;
    color: #FA901C;
    box-sizing: border-box;
  }
  .pipeline-box{
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #E7EAED;
    padding-bottom: 3px;
    margin-bottom: 10px;
    .pipeline-title{
      font-family: Roboto-Medium;
      font-size: 14px;
      color: #FA901C;
      letter-spacing: 0;
      font-weight: 600;
      text-transform: Capitalize;
    }
  }
</style>
<style>
  .sub-label {
    padding-right: 15px;
    font-size: 14px;
    color: #666;
    text-align: left;
    line-height: 30px;
    padding-left: 15px;
    font-weight: bold;
  }
  .sub-label-required::after {
    content: '*';
    color: #F56C6C;
    margin-left: 4px;
  }
  .module-box-type {
    margin: 25px 0 10px -15px;
  }
  .walk-close-box {
    margin-left: 6px;
    width: 14px;
  }
  .walk-close {
    font-size: 12px;
  }
  .config-dropdown.hide-element{
    border: none!important;
  }
</style>
