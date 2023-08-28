<template>
  <div
    :class="calcHeight(that.position, that)"
    :style="calcPosition(that.position, that)"
    class="alert-label__border"
    ref="alertLabels"
    @mouseenter="tipHover(true)"
    @mouseleave="tipHover(false)"
  >
  <!-- user info -->
  <template v-if="type === 'user'">
    <div class="alert-label-header-title">
      <div
        class="alert-label-header-circle"
        :style="alertLabelData.online === 1 ? `background: ${userColor}` : `background: ${unUserColor}`"
      >
        <i class="nz-icon-user1 nz-icon  user-online" :class="selectIcon(type)"></i>
      </div>
      <div class="alert-label-header-name">
        {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
      </div>
      <div class="flex-align-center">
       <el-tag class="alert-label-fa" size="mini" v-if="alertLabelData.mfaLevel > 0" style="margin-left: 5px">2FA</el-tag>
      </div>
    </div>
  </template>
  <template v-else>
    <div class="alert-label-header-title">
      <div
        class="alert-label-header-circle"
        :style="`background: ${alertColor}`"
      >
        <i class="nz-icon" :class="selectIcon(type)"></i>
      </div>
      <div class="alert-label-header-name">
        {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
      </div>
    </div>
   </template>
    <div
      class="alert-label-info"
      v-if="type === 'asset'"
      v-my-loading="loading"
    >
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
        </div>
      </div>
      <div class="alert-label-box name-labe">
        <div class="document-copy-block">
          <div class="alert-label-title">{{$t('overall.name')}}</div>
          <div class="alert-label-value document-copy-text" :title="alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">{{alertLabelData && alertLabelData.name ? alertLabelData.name : '--'}}</div>
          <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
         </div>
      </div>
       <!-- <div class="alert-label-box name-labe">
        <div class="alert-label-title">Name</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
        </div>
      </div> -->
      <div class="alert-label-box document-copy-block">
        <div class="alert-label-title">{{ $t("asset.manageIp") }}</div>
        <div class="alert-label-value document-copy-text" :title="alertLabelData && alertLabelData.manageIp
              ? alertLabelData.manageIp
              : '--'">
          {{
            alertLabelData && alertLabelData.manageIp
              ? alertLabelData.manageIp
              : "--"
          }}
        </div>
        <i v-if="alertLabelData && alertLabelData.manageIp" class="nz-icon nz-icon-override asset-manage-ip" style="visibility: hidden" @click.stop="onCopy(alertLabelData.manageIp)" :title="$t('overall.copyText')"></i>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.type") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData && alertLabelData.type && alertLabelData.type.name
              ? alertLabelData.type.name
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.state") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData && alertLabelData.state && alertLabelData.state.name
              ? alertLabelData.state.name
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">Ping</div>
        <div class="alert-label-value">
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
          <span v-if="alertLabelData">{{
            alertLabelData &&
            alertLabelData.pingInfo &&
            alertLabelData.pingInfo.rtt
              ? alertLabelData.pingInfo.rtt + "ms"
              : ""
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.dc") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData && alertLabelData.dc && alertLabelData.dc.name
              ? alertLabelData.dc.name
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.cabinet") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData &&
            alertLabelData.cabinet &&
            alertLabelData.cabinet.name
              ? alertLabelData.cabinet.name
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.brand") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData && alertLabelData.brand && alertLabelData.brand.name
              ? alertLabelData.brand.name
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.model") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData && alertLabelData.model && alertLabelData.model.name
              ? alertLabelData.model.name
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.alert") }}</div>
        <div class="alert-label-value" v-if="alertLabelData">
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
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.endpoint") }}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{
            alertLabelData && alertLabelData.endpointNum
              ? alertLabelData.endpointNum
              : 0
          }}</span>
        </div>
      </div>
    </div>

    <div
      class="alert-label-info"
      v-if="type === 'module'"
      v-my-loading="loading"
    >
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
        </div>
      </div>
      <div class="alert-label-box name-labe">
         <div class="document-copy-block">
           <div class="alert-label-title">{{$t('overall.name')}}</div>
           <div class="alert-label-value document-copy-text" :title="alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">
             {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
           </div>
           <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
         </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("project.project.projectName") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData &&
            alertLabelData.project &&
            alertLabelData.project.name
              ? alertLabelData.project.name
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.endpoint") }}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{
            alertLabelData && alertLabelData.endpointNum
              ? alertLabelData.endpointNum
              : 0
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.asset") }}</div>
        <div class="alert-label-value">
          <i
            class="nz-icon nz-icon-overview-project monitorColor color23BF9A"
          />&nbsp;
          <span>{{
            alertLabelData && alertLabelData.assetNum
              ? alertLabelData.assetNum
              : 0
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.alert") }}</div>
        <div class="alert-label-value" v-if="alertLabelData">
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
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.remark") }}</div>
        <div class="alert-label-value alert-label-remark">
          {{
            alertLabelData && alertLabelData.remark
              ? alertLabelData.remark
              : "--"
          }}
        </div>
      </div>
    </div>

    <div
      class="alert-label-info"
      v-if="type === 'project'"
      v-my-loading="loading"
    >
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData ? alertLabelData.id : "--" }}
        </div>
      </div>
       <div class="alert-label-box name-labe">
        <div class="document-copy-block">
           <div class="alert-label-title">{{$t('overall.name')}}</div>
           <div class="alert-label-value document-copy-text" :title="alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">
             {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
           </div>
           <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
         </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.module") }}</div>
        <div class="alert-label-value">
          <i
            class="nz-icon nz-icon-overview-module monitorColor"
          />&nbsp;
          <span>{{
            alertLabelData && alertLabelData.moduleNum
              ? alertLabelData.moduleNum
              : "--"
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{$t('asset.endpoint')}}</div>
        <div class="alert-label-value">
          <i class="nz-icon nz-icon-overview-endpoint monitorColor"></i>&nbsp;
          <span>{{
            alertLabelData && alertLabelData.endpointNum
              ? alertLabelData.endpointNum
              : 0
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.asset") }}</div>
        <div class="alert-label-value">
          <i
            class="nz-icon nz-icon-overview-project monitorColor color23BF9A"
          />
          <span>{{
            alertLabelData && alertLabelData.assetNum
              ? alertLabelData.assetNum
              : 0
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.alert") }}</div>
        <div class="alert-label-value" v-if="alertLabelData">
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
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.remark") }}</div>
        <div class="alert-label-value alert-label-remark">
          {{
            alertLabelData && alertLabelData.remark
              ? alertLabelData.remark
              : "--"
          }}
        </div>
      </div>
    </div>

    <div
      class="alert-label-info"
      v-if="type === 'endpoint'"
      v-my-loading="loading"
    >
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
        </div>
      </div>
      <div class="alert-label-box name-labe">
         <div class="document-copy-block">
          <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value document-copy-text" :title=" alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">
          {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
        </div>
          <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
         </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("project.project.projectName") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData &&
            alertLabelData.project &&
            alertLabelData.project.name
              ? alertLabelData.project.name
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.module") }}</div>
        <div class="alert-label-value">
          <i
            class="nz-icon nz-icon-overview-module monitorColor"
          />&nbsp;
          <span>{{
            alertLabelData &&
            alertLabelData.module &&
            alertLabelData.module.name
              ? alertLabelData.module.name
              : "--"
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.asset") }}</div>
        <div class="alert-label-value">
          <i
            class="nz-icon nz-icon-overview-project monitorColor color23BF9A"
          ></i
          >&nbsp;
          <span>{{
            alertLabelData && alertLabelData.asset
              ? alertLabelData.asset.name
              : "--"
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.alert") }}</div>
        <div class="alert-label-value" v-if="alertLabelData">
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
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.state") }}</div>
        <div class="alert-label-value">
          <span style="width: auto">
            <span class="endpoint-cell-left"
              ><i class="nz-icon nz-icon-Metrics active" />
              {{ $t("overall.metric") }}
            </span>
            <span
              v-if="alertLabelData && alertLabelData.configs && alertLabelData.configs[0].state === 0"
            >
              <span class="active-icon red-bg inline-block"></span>
            </span>
            <span
              v-else-if="alertLabelData && alertLabelData.configs && alertLabelData.configs[0].state === 1"
            >
              <span class="active-icon green-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs && alertLabelData.configs[0].state">
              <span class="active-icon gray-bg inline-block"></span>
            </span>
          </span>
          <span style="width: auto">
            <span class="endpoint-cell-left" style="margin-left: 10px"
              ><i class="nz-icon nz-icon-logs active" />
              {{ $t("overall.logs") }}
            </span>
            <span
              v-if="alertLabelData && alertLabelData.configs && alertLabelData.configs[1].state === 0"
            >
              <span class="active-icon red-bg inline-block"></span>
            </span>
            <span
              v-else-if="alertLabelData && alertLabelData.configs && alertLabelData.configs[1].state === 1"
            >
              <span class="active-icon green-bg inline-block"></span>
            </span>
            <span v-else-if="alertLabelData && alertLabelData.configs && alertLabelData.configs[1].state">
              <span class="active-icon gray-bg inline-block"></span>
            </span>
          </span>
        </div>
      </div>
    </div>

    <div class="alert-label-info" v-if="type === 'dc'" v-my-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
        </div>
      </div>
       <div class="alert-label-box name-labe">
         <div class="document-copy-block">
           <div class="alert-label-title">{{$t('overall.name')}}</div>
           <div class="alert-label-value document-copy-text" :title="alertLabelData && alertLabelData.name ? alertLabelData.name : '--'">
             {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
           </div>
           <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
         </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.location") }}</div>
        <div class="alert-label-value">
          {{
            alertLabelData && alertLabelData.location && alertLabelData.location
              ? alertLabelData.location
              : "--"
          }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.cabinet") }}</div>
        <div class="alert-label-value">
          <i
            v-if="alertLabelData"
            class="nz-icon nz-icon-cabinet monitorColor"
            :class="
              alertLabelData && alertLabelData.cabinetNum > 0
                ? 'color23BF9A'
                : 'colorEF7458'
            "
          />&nbsp;
          <span>{{
            alertLabelData && alertLabelData.cabinetNum
              ? alertLabelData.cabinetNum
              : 0
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("asset.asset") }}</div>
        <div class="alert-label-value">
          <i
            class="nz-icon nz-icon-overview-project monitorColor color23BF9A"
          />&nbsp;
          <span>{{
            alertLabelData && alertLabelData.assetNum && alertLabelData.assetNum
              ? alertLabelData.assetNum
              : 0
          }}</span>
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.alert") }}</div>
        <div class="alert-label-value" v-if="alertLabelData">
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
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.state") }}</div>
        <div class="alert-label-value" style="margin-left: 3px">
          <div
            v-if="alertLabelData"
            :class="{
              'green-bg': alertLabelData && alertLabelData.state === 'ON',
              'red-bg': alertLabelData && alertLabelData.state === 'OFF',
            }"
            class="active-icon"
          ></div>
          <span v-if="alertLabelData && alertLabelData.state === 'ON'">{{
            $t("overall.enabled")
          }}</span>
          <span v-if="alertLabelData && alertLabelData.state === 'OFF'">{{
            $t("overall.disabled")
          }}</span>
        </div>
      </div>
    </div>

    <!-- type === 'user' -->
    <div class="alert-label-info" v-if="type === 'user'" v-my-loading="loading">
      <div class="alert-label-box">
        <div class="alert-label-title">ID</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.id ? alertLabelData.id : "--" }}
        </div>
      </div>
      <div class="alert-label-box name-labe document-copy-block">
        <div class="alert-label-title">{{$t('overall.name')}}</div>
        <div class="alert-label-value document-copy-text">
          {{ alertLabelData && alertLabelData.name ? alertLabelData.name : "--" }}
        </div>
        <i v-if="alertLabelData && alertLabelData.name" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.name)" :title="$t('overall.copyText')"></i>
      </div>
      <div class="alert-label-box document-copy-block">
        <div class="alert-label-title">{{ $t("profile.username") }}</div>
        <div class="alert-label-value document-copy-text">
          {{ alertLabelData && alertLabelData.username ? alertLabelData.username : "--" }}
        </div>
        <i v-if="alertLabelData && alertLabelData.username" class="nz-icon nz-icon-override" style="visibility: hidden" @click.stop="onCopy(alertLabelData.username)" :title="$t('overall.copyText')"></i>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("profile.role") }}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.roles ? alertLabelData.roles[0].name : "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("config.system.email.email") }}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.email ? alertLabelData.email : "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("profile.source") }}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.source ? alertLabelData.source : "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("overall.state") }}</div>
        <div class="alert-label-value">
          <div
            v-if="alertLabelData"
            :style="alertLabelData.status === '1' ? `background: ${userColor}` : `background: ${unUserColor}`"
            class="active-icon"
          ></div>
         {{ alertLabelData && alertLabelData.status === "1" ? $t("overall.enabled") : "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("config.user.language") }}</div>
        <div class="alert-label-value" v-if="alertLabelData">
          {{alertLabelData.lang === "en" ? $t("overall.english") : $t("overall.chinese") }}
        </div>
        <div class="alert-label-value" v-else>
          {{"--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("profile.lastLoginIp") }}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.lastLoginIp ? alertLabelData.lastLoginIp : "--" }}
        </div>
      </div>
      <div class="alert-label-box">
        <div class="alert-label-title">{{ $t("profile.lastLoginTime") }}</div>
        <div class="alert-label-value">
          {{ alertLabelData && alertLabelData.lastLoginTime ? alertLabelData.lastLoginTime : "--" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import trendMixin from './trendMixins'

export default {
  name: 'alertLabel',
  mixins: [trendMixin],
  props: {
    id: {},
    type: {},
    // labelLoading:{},
    that: {},
    detailList: Boolean,
    alertTableDialog: Boolean
  },
  data () {
    return {
      alertLabelData: null,
      loading: true,
      heightList: 0,
      boxWidth: 0,
      severityDataWeight: this.$store.getters.severityDataWeight,
      alertColor: '#23bf9a',
      userColor: '#1e9e09',
      unUserColor: '#bbbbbb'
    }
  },
  watch: {
    id: {
      immediate: true,
      deep: true,
      handler (n) {
        this.init()
      }
    },
    that: {
      immediate: true,
      deep: true,
      handler (n) {}
    },
    LRTriangle: {
      immediate: true,
      deep: true,
      handler (n) {}
    }
  },
  computed: {
    calcPosition () {
      return function (position) {
        if (this.$refs.alertLabels) {
          this.heightList = this.$refs.alertLabels.getBoundingClientRect().height
          this.boxWidth = this.$refs.alertLabels.getBoundingClientRect().width
        } else {
          this.heightList = 0
          this.boxWidth = 0
        }
        const clientHeight =
          document.body.clientHeight < document.documentElement.clientHeight
            ? document.body.clientHeight
            : document.documentElement.clientHeight
        const clientWidth =
          document.body.clientWidth < document.documentElement.clientWidth
            ? document.body.clientWidth
            : document.documentElement.clientWidth
        let leftOffSetView = 0
        let leftOffSet = this.detailList ? -80 : 10
        let topOffSet = this.detailList ? 60 : 22
        let topOffSetView = 0
        let labelPosition = {
          top: 0,
          left: 0,
          right: 0
        }
        if (this.alertTableDialog) {
          let dialog = document.querySelector(
            '#dialog-alert-massage .el-dialog'
          )
          if (!dialog) {
            dialog = document.querySelector('#viewGraphDialog .el-dialog')
          }
          const dialogHeight = dialog.getBoundingClientRect()
          leftOffSet = leftOffSet - 3 * dialogHeight.x
          leftOffSetView = dialogHeight.x
          topOffSet = topOffSet - dialogHeight.y
          topOffSetView = topOffSet
        }
        if (position.top > clientHeight / 2) {
          labelPosition = {
            left: `${position.left + position.width + leftOffSet}px`,
            top: this.that.type === 'chartTopology' ? `${position.top - this.heightList - topOffSetView}px` : `${position.top - this.heightList - topOffSetView + position.height / 2}px`
          }
        } else {
          labelPosition = {
            left: `${position.left + position.width + leftOffSet}px`,
            top: this.that.type === 'chartTopology' ? `${position.top + topOffSet}px` : `${position.top + position.height / 2}px`
          }
        }
        if (position.left > clientWidth / 2) {
          delete labelPosition.left

          labelPosition.right =
            clientWidth - position.left - leftOffSetView + 'px'
        }
        return labelPosition
      }
    },
    calcHeight () {
      const self = this
      return function (position) {
        const clientHeight =
          document.body.clientHeight < document.documentElement.clientHeight
            ? document.body.clientHeight
            : document.documentElement.clientHeight
        const elHeight =
          self.type === 'asset' ? 318 : self.type === 'project' ? 70 : 70
        if (position.top + elHeight > clientHeight) {
          return 'alert-labelUp'
        } else {
          return 'alert-label'
        }
      }
    }
  },
  methods: {
    init () {
      this.loading = true
      if (this.type === 'asset') {
        this.$get('asset/asset/' + this.id).then((res) => {
          if (res.msg === 'success') {
            this.loading = false
            this.alertLabelData = res.data
            this.alertColor = this.returnColor(res.data.alert)
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
            this.alertColor = this.returnColor(res.data.alert)
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
            this.alertColor = this.returnColor(res.data.alert)
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
            this.alertColor = this.returnColor(res.data.alert)
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
            this.alertColor = this.returnColor(res.data.alert)
          } else {
            this.$message.error(res.msg)
          }
        })
      }
      if (this.type === 'user') {
        this.loading = false
        this.alertLabelData = this.that
      }
      if (this.type === 'recordRule') {
        this.loading = false
        this.alertLabelData = this.that
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
        params[this.type + 'Id'] = this.id
        this.$get('/stat/alertMessage/trend', params).then((res) => {
          if (!res.data) {
            return
          }
          const alertDaysData = res.data.result
            ? res.data.result[0].values
            : []
          const newWeekDays = JSON.parse(JSON.stringify(weekDays))
          alertDaysData.forEach((item) => {
            item.values.forEach((time) => {
              const findItem = newWeekDays.find((days) => days.time == time[0])
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
    alertActiveStr () {
      return this.$t('overall.active')
    },
    alertStateStr (num) {
      if (num == 1) {
        return this.$t('asset.inStock')
      } else {
        return this.$t('asset.notInStock')
      }
    },
    selectIcon (type) {
      switch (type) {
        case 'asset':
          return 'nz-icon-overview-project'
        case 'dc':
          return 'nz-icon-Datacenter2'
        case 'project':
          return 'nz-icon-project'
        case 'module':
          return 'nz-icon-overview-module'
        case 'endpoint':
          return 'nz-icon-overview-endpoint'
        case 'alertrule':
          return 'nz-icon-Alertrule'
        case 'user':
          return 'nz-icon-user1'
        case 'recordRule':
          return 'nz-icon-Alertrule'
      }
      return 'nz-icon-module5'
    },
    returnColor (obj) {
      let color = ''
      if (!obj) {
        return '#23bf9a'
      } else {
        this.severityDataWeight.forEach((severity) => {
          const num = obj.find((alert) => alert.priority === severity.name)
          if (num && !color && num.num > 0) {
            color = severity.color
          }
        })
        if (!color) {
          color = '#23bf9a'
        }
        return color
      }
    },
    tipHover (tipLoading) {
      this.$emit('tipHover', tipLoading)
    }
  },
  mounted () {
    if (this.$refs.alertLabels) {
      this.heightList = this.$refs.alertLabels.getBoundingClientRect().height
      this.boxWidth = this.$refs.alertLabels.getBoundingClientRect().width
    } else {
      this.heightList = 0
      this.boxWidth = 0
    }
  },
  beforeDestroy () {}
}
</script>
<style>
</style>
