<template>
  <div>
    <!-- alertRule -->
    <div class="messgae-info" v-my-loading="loading" v-if="type === 'alertRule'">
      <div class="messgae-info-header">{{$t('overall.alertRule')}}</div>
      <div class="messgae-info-content">
        <div class="messgae-info-row">
          <div class="messgae-info-title">ID</div>
          <span class="messgae-info-value">{{alertLabelData.id ? alertLabelData.id : '--'}}</span>
        </div>
        <div class="messgae-info-row">
          <div class="document-copy-block" style="display:flex">
            <div class="messgae-info-title">{{$t('overall.name')}}</div>
            <span class="messgae-info-value document-copy-text" :title="alertLabelData.name ? alertLabelData.name : '--'">{{alertLabelData.name ? alertLabelData.name : '--'}}</span>
            <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{$t('overall.type')}}</div>
          <span class="messgae-info-value">
            <span v-if="alertLabelData.type === 1">
              {{$t('overall.metric')}}
            </span>
            <span v-else-if="alertLabelData.type === 2">
              {{$t('overall.logs')}}
            </span>
            <span v-else-if="alertLabelData.type === 3">SNMP trap</span>
            <span v-else>--</span>
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{$t('alert.config.expr')}}</div>
          <span class="messgae-info-value">{{alertLabelData.expr ? alertLabelData.expr : '--'}}</span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{$t('alert.alertNum')}}</div>
          <div class="messgae-info-value" v-if="alertLabelData">
            <i :class="alertLabelData.alertNum ? 'red' : 'green'" class="nz-icon nz-icon-overview-alert vertical-align-top;"  @mouseenter="tooltipHover('',true, $event)" @mouseleave="tooltipHover('',false, $event)"></i>
            <div v-if="alertNumtooltipShow" class="alert-days-info-tooltip" :style="{left: position.left + 'px',top:position.top + 'px'}">
              <div class="tooltip-title">{{$t('project.topology.alert')}}({{$t('overall.active')}})</div>
              <div class="severity-info" style='justify-content: space-between'>
                <div class="severity-name">{{$t('overall.result.total')}}</div>
                <div class="severity-value">{{alertLabelData.alertNum}}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!trendLoading"
              :alertDaysData="alertDaysData"
            />
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{$t('alert.config.trbShot')}}</div>
          <div class="messgae-info-value" @click="trbShotShow"><i class="nz-icon nz-icon-guzhangshuju"></i></div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{$t('overall.state')}}</div>
          <div class="messgae-info-value" style="margin-left: 3px">
            <div v-if="alertLabelData.state === 1">
              <i class="active-icon green-bg inline-block"></i>
              <span class="messgae-info-text">{{ $t('overall.enabled') }}</span>
            </div>
            <div v-else-if="alertLabelData.state === 0">
              <i class="active-icon gray-bg inline-block"></i>
              <span class="messgae-info-text">{{ $t('overall.disabled') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- dc -->
    <div class="messgae-info" v-if="type === 'dc'" v-my-loading="loading">
      <div class="messgae-info-header">{{$t('overall.dc')}}</div>
      <div class="messgae-info-content">
        <div class="messgae-info-row">
          <div class="messgae-info-title">ID</div>
          <span class="messgae-info-value">{{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}</span>
        </div>
          <div class="messgae-info-row">
            <div class="document-copy-block">
              <div class="messgae-info-title">{{$t('overall.name')}}</div>
              <span class="messgae-info-value  document-copy-text" :title="alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">
                {{alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
              </span>
              <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
            </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.location") }}</div>
          <span class="messgae-info-value">
            {{alertLabelData && alertLabelData.location && alertLabelData.location ? alertLabelData.location  : "--"}}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.cabinet") }}</div>
          <div class="messgae-info-value">
            <i
              v-if="alertLabelData"
              class="nz-icon nz-icon-cabinet monitorColor"
              :class="alertLabelData && alertLabelData.cabinetNum > 0 ? 'color23BF9A' : 'colorEF7458' "
            />&nbsp;
            <span class="messgae-info-text">
              {{alertLabelData && alertLabelData.cabinetNum ? alertLabelData.cabinetNum : 0 }}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.asset") }}</div>
          <div class="messgae-info-value">
            <i
              class="nz-icon nz-icon-overview-project monitorColor color23BF9A"
            />&nbsp;
            <span class="messgae-info-text">
              {{alertLabelData && alertLabelData.assetNum && alertLabelData.assetNum? alertLabelData.assetNum: 0}}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.alert") }}</div>
          <div class="messgae-info-value" v-if="alertLabelData">
            <i
              :class="alertLabelData.alertNum ? 'red' : 'green'"
              class="nz-icon nz-icon-overview-alert vertical-align-top;"
              @mouseenter="tooltipHover('', true, $event)"
              @mouseleave="tooltipHover('', false, $event)"
            ></i>
            <div
              v-if="alertNumtooltipShow"
              class="alert-days-info-tooltip"
              :style="{ left: position.left + 'px', top: position.top + 'px' }"
            >
              <div class="tooltip-title">
                {{ $t("project.topology.alert") }}({{ $t("overall.active") }})
              </div>
              <div class="severity-info" style="justify-content: space-between">
                <div class="severity-name">{{ $t("overall.result.total") }}</div>
                <div class="severity-value">{{ alertLabelData.alertNum }}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!trendLoading"
              :alertDaysData="alertDaysData"
            />
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.state") }}</div>
          <div class="messgae-info-value" style="margin-left: 3px">
            <i
              v-if="alertLabelData"
              :class="{
                'green-bg': alertLabelData && alertLabelData.state === 'ON',
                'red-bg': alertLabelData && alertLabelData.state === 'OFF',
              }"
              class="active-icon"
            >
            </i>
            <span class="messgae-info-text" v-if="alertLabelData && alertLabelData.state === 'ON'">
              {{$t("overall.enabled")}}
            </span>
            <span class="messgae-info-text" v-if="alertLabelData && alertLabelData.state === 'OFF'">
              {{$t("overall.disabled")}}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- asset -->
    <div
      class="messgae-info"
      v-if="type === 'asset'"
      v-my-loading="loading"
    >
      <div class="messgae-info-header">{{$t('asset.asset')}}</div>
      <div class="messgae-info-content">
        <div class="messgae-info-row">
          <div class="messgae-info-title">ID</div>
          <span class="messgae-info-value">
            {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="document-copy-block">
            <div class="messgae-info-title">{{$t('overall.name')}}</div>
            <span class="messgae-info-value document-copy-text">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</span>
            <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
          </div>
        </div>
        <div class="messgae-info-row document-copy-block">
          <div class="messgae-info-title">{{ $t("asset.manageIp") }}</div>
          <span class="messgae-info-value document-copy-text" :title="alertLabelData && alertLabelData.manageIp? alertLabelData.manageIp  : '--'">
            {{ alertLabelData && alertLabelData.manageIp ? alertLabelData.manageIp : "--" }}
          </span>
          <i v-if="alertLabelData && alertLabelData.manageIp" class="nz-icon nz-icon-override asset-manage-ip" style="visibility: hidden" @click.stop="onCopy(alertLabelData.manageIp)" :title="$t('overall.copyText')"></i>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.type") }}</div>
          <span class="messgae-info-value">
            {{alertLabelData && alertLabelData.type && alertLabelData.type.name? alertLabelData.type.name   : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.state") }}</div>
          <span class="messgae-info-value">
            {{alertLabelData && alertLabelData.state && alertLabelData.state.name ? alertLabelData.state.name : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">Ping</div>
          <div class="messgae-info-value">
            <div
              v-if="alertLabelData"
              :class="{
                'green-bg':
                  alertLabelData &&
                  alertLabelData.pingInfo &&
                  alertLabelData.pingInfo.status === 1,
                'red-bg':
                  alertLabelData &&
                  alertLabelData.pingInfo &&
                  alertLabelData.pingInfo.status === 0,
              }"
              class="active-icon"
            ></div>
            <span class="messgae-info-text" v-if="alertLabelData">
              {{ alertLabelData &&  alertLabelData.pingInfo && alertLabelData.pingInfo.rtt ? alertLabelData.pingInfo.rtt + "ms"  : ""}}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.dc") }}</div>
          <span class="messgae-info-value">
            {{ alertLabelData && alertLabelData.dc && alertLabelData.dc.name ? alertLabelData.dc.name: "--"}}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.cabinet") }}</div>
          <span class="messgae-info-value">
            {{ alertLabelData && alertLabelData.cabinet && alertLabelData.cabinet.name  ? alertLabelData.cabinet.name : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.brand") }}</div>
          <span class="messgae-info-value">
            {{alertLabelData && alertLabelData.brand && alertLabelData.brand.name? alertLabelData.brand.name : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.model") }}</div>
          <span class="messgae-info-value">
            {{alertLabelData && alertLabelData.model && alertLabelData.model.name ? alertLabelData.model.name: "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.alert") }}</div>
          <div class="messgae-info-value" v-if="alertLabelData">
            <i
              :class="alertLabelData.alertNum ? 'red' : 'green'"
              class="nz-icon nz-icon-overview-alert vertical-align-top;"
              @mouseenter="tooltipHover('', true, $event)"
              @mouseleave="tooltipHover('', false, $event)"
            ></i>
            <div
              v-if="alertNumtooltipShow"
              class="alert-days-info-tooltip"
              :style="{ left: position.left + 'px', top: position.top + 'px' }"
            >
              <div class="tooltip-title">
                {{ $t("project.topology.alert") }}({{ $t("overall.active") }})
              </div>
              <div class="severity-info" style="justify-content: space-between">
                <div class="severity-name">{{ $t("overall.result.total") }}</div>
                <div class="severity-value">{{ alertLabelData.alertNum }}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!trendLoading"
              :alertDaysData="alertDaysData"
            />
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.endpoint") }}</div>
          <div class="messgae-info-value">
            <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
            <span class="messgae-info-text">
              {{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- project -->
    <div
      class="messgae-info"
      v-if="type === 'project'"
      v-my-loading="loading"
    >
      <div class="messgae-info-header">{{$t('project.project.projectName')}}</div>
      <div class="messgae-info-content">
        <div class="messgae-info-row">
          <div class="messgae-info-title">ID</div>
          <span class="messgae-info-value">
            {{ alertLabelData && alertLabelData ? alertLabelData.id : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="document-copy-block">
            <div class="messgae-info-title">{{$t('overall.name')}}</div>
            <span class="messgae-info-value document-copy-text" :title="alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">
              {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
            </span>
            <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.module") }}</div>
          <div class="messgae-info-value">
            <i
              style="cursor: pointer"
              class="nz-icon nz-icon-overview-module monitorColor"
            />&nbsp;
            <span class="messgae-info-text">
              {{alertLabelData && alertLabelData.moduleNum? alertLabelData.moduleNum: "--"}}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{$t('asset.endpoint')}}</div>
          <div class="messgae-info-value">
            <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
            <span class="messgae-info-text">
              {{alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum: 0}}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.asset") }}</div>
          <div class="messgae-info-value">
            <i
              class="nz-icon nz-icon-overview-project monitorColor color23BF9A"
            />
            <span class="messgae-info-text">
              {{alertLabelData && alertLabelData.assetNum? alertLabelData.assetNum : 0 }}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.alert") }}</div>
          <div class="messgae-info-value" v-if="alertLabelData">
            <i
              :class="alertLabelData.alertNum ? 'red' : 'green'"
              class="nz-icon nz-icon-overview-alert vertical-align-top;"
              @mouseenter="tooltipHover('', true, $event)"
              @mouseleave="tooltipHover('', false, $event)"
            ></i>
            <div
              v-if="alertNumtooltipShow"
              class="alert-days-info-tooltip"
              :style="{ left: position.left + 'px', top: position.top + 'px' }"
            >
              <div class="tooltip-title">
                {{ $t("project.topology.alert") }}({{ $t("overall.active") }})
              </div>
              <div class="severity-info" style="justify-content: space-between">
                <div class="severity-name">{{ $t("overall.result.total") }}</div>
                <div class="severity-value">{{ alertLabelData.alertNum }}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!trendLoading"
              :alertDaysData="alertDaysData"
            />
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.remark") }}</div>
          <span class="messgae-info-value">
            {{alertLabelData && alertLabelData.remark? alertLabelData.remark : "--" }}
          </span>
        </div>
      </div>
    </div>

    <!-- module -->
    <div
      class="messgae-info"
      v-if="type === 'module'"
      v-my-loading="loading"
    >
      <div class="messgae-info-header">{{$t('overall.module')}}</div>
      <div class="messgae-info-content">
        <div class="messgae-info-row">
          <div class="messgae-info-title">ID</div>
          <span class="messgae-info-value">
            {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="document-copy-block">
            <div class="messgae-info-title">{{$t('overall.name')}}</div>
            <span class="messgae-info-value document-copy-text" :title="alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">
              {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
            </span>
            <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("project.project.projectName") }}</div>
          <span class="messgae-info-value">
            {{ alertLabelData &&alertLabelData.project &&alertLabelData.project.name? alertLabelData.project.name  : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.endpoint") }}</div>
          <div class="messgae-info-value">
            <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
            <span class="messgae-info-text">
              {{ alertLabelData && alertLabelData.endpointNum ? alertLabelData.endpointNum : 0}}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.asset") }}</div>
          <div class="messgae-info-value">
            <i
              class="nz-icon nz-icon-overview-project monitorColor color23BF9A"
            />&nbsp;
            <span class="messgae-info-text">
              {{alertLabelData && alertLabelData.assetNum ? alertLabelData.assetNum : 0}}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.alert") }}</div>
          <div class="messgae-info-value" v-if="alertLabelData">
            <i
              :class="alertLabelData.alertNum ? 'red' : 'green'"
              class="nz-icon nz-icon-overview-alert vertical-align-top;"
              @mouseenter="tooltipHover('', true, $event)"
              @mouseleave="tooltipHover('', false, $event)"
            ></i>
            <div
              v-if="alertNumtooltipShow"
              class="alert-days-info-tooltip"
              :style="{ left: position.left + 'px', top: position.top + 'px' }"
            >
              <div class="tooltip-title">
                {{ $t("project.topology.alert") }}({{ $t("overall.active") }})
              </div>
              <div class="severity-info" style="justify-content: space-between">
                <div class="severity-name">{{ $t("overall.result.total") }}</div>
                <div class="severity-value">{{ alertLabelData.alertNum }}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!trendLoading"
              :alertDaysData="alertDaysData"
            />
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.remark") }}</div>
          <span class="messgae-info-value">
            {{alertLabelData && alertLabelData.remark ? alertLabelData.remark  : "--"}}
          </span>
        </div>
      </div>
    </div>

    <!-- endpoint -->
    <div
      class="messgae-info"
      v-if="type === 'endpoint'"
      v-my-loading="loading"
    >
      <div class="messgae-info-header">{{$t('asset.endpoint')}}</div>
      <div class="messgae-info-content">
        <div class="messgae-info-row">
          <div class="messgae-info-title">ID</div>
          <span class="messgae-info-value">
            {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="document-copy-block">
            <div class="messgae-info-title">{{$t('overall.name')}}</div>
              <span class="messgae-info-value document-copy-text" :title="alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">
                {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
              </span>
            <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("project.project.projectName") }}</div>
          <span class="messgae-info-value">
            {{alertLabelData &&alertLabelData.project && alertLabelData.project.name? alertLabelData.project.name: "--"}}
          </span>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.module") }}</div>
          <div class="messgae-info-value">
            <i
              style="cursor: pointer"
              class="nz-icon nz-icon-overview-module monitorColor"
            />&nbsp;
            <span class="messgae-info-text">
              {{alertLabelData &&alertLabelData.module &&alertLabelData.module.name? alertLabelData.module.name: "--"}}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("asset.asset") }}</div>
          <div class="messgae-info-value">
            <i
              class="nz-icon nz-icon-overview-project monitorColor color23BF9A"
            ></i
            >&nbsp;
            <span class="messgae-info-text">
              {{alertLabelData && alertLabelData.asset.name? alertLabelData.asset.name: "--"}}
            </span>
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.alert") }}</div>
          <div class="messgae-info-value" v-if="alertLabelData">
            <i
              :class="alertLabelData.alertNum ? 'red' : 'green'"
              class="nz-icon nz-icon-overview-alert vertical-align-top;"
              @mouseenter="tooltipHover('', true, $event)"
              @mouseleave="tooltipHover('', false, $event)"
            ></i>
            <div
              v-if="alertNumtooltipShow"
              class="alert-days-info-tooltip"
              :style="{ left: position.left + 'px', top: position.top + 'px' }"
            >
              <div class="tooltip-title">
                {{ $t("project.topology.alert") }}({{ $t("overall.active") }})
              </div>
              <div class="severity-info" style="justify-content: space-between">
                <div class="severity-name">{{ $t("overall.result.total") }}</div>
                <div class="severity-value">{{ alertLabelData.alertNum }}</div>
              </div>
            </div>
            <alertDaysInfo
              v-show="!trendLoading"
              :alertDaysData="alertDaysData"
            />
          </div>
        </div>
        <div class="messgae-info-row">
          <div class="messgae-info-title">{{ $t("overall.state") }}</div>
          <div class="messgae-info-value">
            <span style="width: auto">
              <span class="endpoint-cell-left"
                ><i class="nz-icon nz-icon-Metrics active" />
                {{ $t("overall.metric") }}
              </span>
              <span
                v-if="alertLabelData && alertLabelData.configs[0].state === 0"
              >
                <span class="active-icon red-bg inline-block"></span>
              </span>
              <span
                v-else-if="alertLabelData && alertLabelData.configs[0].state === 1"
              >
                <span class="active-icon green-bg inline-block"></span>
              </span>
              <span v-else-if="alertLabelData && alertLabelData.configs[0].state">
                <span class="active-icon gray-bg inline-block"></span>
              </span>
            </span>
            <span style="width: auto">
              <span class="endpoint-cell-left" style="margin-left: 10px">
                <i class="nz-icon nz-icon-logs active"/>
                {{ $t("overall.logs") }}
              </span>
              <span
                v-if="alertLabelData && alertLabelData.configs[1].state === 0"
              >
                <span class="active-icon red-bg inline-block"></span>
              </span>
              <span
                v-else-if="alertLabelData && alertLabelData.configs[1].state === 1"
              >
                <span class="active-icon green-bg inline-block"></span>
              </span>
              <span v-else-if="alertLabelData && alertLabelData.configs[1].state">
                <span class="active-icon gray-bg inline-block"></span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import trendMixins from '@/components/common/alert/trendMixins'
export default {
  name: 'alertDetail',
  mixins: [trendMixins],
  props: {
    id: {},
    type: {},
    that: {}
  },
  data () {
    return {
      loading: true,
      alertLabelData: '',
      severityDataWeight: this.$store.getters.severityDataWeight
    }
  },
  computed: {
  },
  watch: {
    id: {
      immediate: true,
      deep: true,
      handler () {
        this.init()
      }
    }
  },
  methods: {
    init () {
      this.loading = true

      if (this.type === 'alertRule') {
        this.$get('/alert/rule/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            res.data.condition = JSON.parse(res.data.condition)
            res.data.condition = this.severityDataWeight.map(item => {
              item = {
                ...item,
                value: '',
                operator: '>'
              }
              res.data.condition.forEach(subItem => {
                if (item.id === subItem.id) {
                  item = {
                    ...item,
                    operator: subItem.operator,
                    value: subItem.value
                  }
                }
              })
              return item
            })
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }

      if (this.type === 'dc') {
        this.$get('dc/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }

      if (this.type === 'asset') {
        this.$get('asset/asset/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }

      if (this.type === 'project') {
        this.$get('monitor/project/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }

      if (this.type === 'module') {
        this.$get('monitor/module/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }

      if (this.type === 'endpoint') {
        this.$get('monitor/endpoint/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
          } else {
            this.$message.error(res.msg)
          }
        })
      }

      const weekDays = this.getWeeksTime()
      if (this.trendTimer) {
        clearTimeout(this.trendTimer)
        this.trendTimer = null
      }
      this.trendTimer = setTimeout(() => {
        this.trendLoading = true
        const params = {
          type: 'total',
          dimension: 'priority',
          step: 'd'
        }
        if (this.type === 'alertRule') {
          params['rule' + 'Id'] = this.id
        } else {
          params[this.type + 'Id'] = this.id
        }
        this.$get('/stat/alertMessage/trend', params).then((res) => {
          if (!res.data) {
            return
          }
          const alertDaysData = res.data.result ? res.data.result[0].values : []
          const newWeekDays = JSON.parse(JSON.stringify(weekDays))
          alertDaysData.forEach(item => {
            item.values.forEach(time => {
              const findItem = newWeekDays.find(days => days.time == time[0])
              if (findItem) {
                findItem[item.metric.priority] = time[1]
              }
            })
          })
          setTimeout(() => {
            this.alertDaysData = newWeekDays
            this.trendLoading = false
          })
        })
      })
    },
    trbShotShow () {
      this.$emit('showText')
    }
  },
  mounted () { }
}

</script>
