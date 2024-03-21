<template>
  <div class="chart-detail-new">
    <div class="asset-info">
      <el-collapse>
        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-basic-info"></i>
              <span>{{$t('asset.information')}}</span>
              <span>{{chartDetail.feature.os.hostname}}</span>
            </div>
          </template>
          <div class="asset-info-list">
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('license.hostname')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.os.hostname}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.boottime')}}</div>
              <div class="asset-info-value">{{utcTimeToTimezoneStr(chartDetail.feature.os.boottime)}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.platform')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.os.platform}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.platformFamily')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.os.family}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.platformVersion')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.os.versionInfo}}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-cpu"></i>
              <span>{{$t('asset.cpu')}}</span>
              <span v-for="(item,index) in chartDetail.feature.cpu" :key="index">
                {{item.name}}
              </span>
            </div>
          </template>
          <div class="asset-info-list" v-for="(item,index) in chartDetail.feature.cpu" :key="index">
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.vendorID')}}</div>
              <div class="asset-info-value">{{item.vendor}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.moduleName')}}</div>
              <div class="asset-info-value">{{item.name}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.packageCount')}}</div>
              <div class="asset-info-value">{{item.physicalPackageCount}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.processorCount')}}</div>
              <div class="asset-info-value">{{item.physicalProcessorCount}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('backup.frequency')}}</div>
              <div class="asset-info-value">{{Hertz(item.logicalProcessorCount,0,0)}}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-memory"></i>
              <span>{{$t('asset.memory')}}</span>
              <span>{{bits(chartDetail.feature.memory.total,0,0)}}</span>
            </div>
          </template>
          <div class="asset-info-list">
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.memorySize')}}</div>
              <div class="asset-info-value">{{bits(chartDetail.feature.memory.total,0,0)}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.swaptotal')}}</div>
              <div class="asset-info-value">{{bits(chartDetail.feature.memory.swaptotal,0,0)}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.pagesize')}}</div>
              <div class="asset-info-value">{{bits(chartDetail.feature.memory.pagesize,0,0)}}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-disk"></i>
              <span>{{$t('asset.disk')}}</span>
              <span>{{bits(calcTotal(chartDetail.feature.disk, 'size'),0,0)}}</span>
            </div>
          </template>
          <div class="asset-info-list" v-for="(item,index) in chartDetail.feature.disk" :key="index">
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.diskName')}}</div>
              <div class="asset-info-value">{{item.name}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.diskModel')}}</div>
              <div class="asset-info-value">{{item.model}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.diskSize')}}</div>
              <div class="asset-info-value">{{bits(item.size,0,0)}}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-network"></i>
              <span>{{$t('asset.interface')}}</span>
            </div>
          </template>
          <div class="asset-info-list" v-for="(item,index) in chartDetail.feature.interface" :key="index">
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.interfaceName')}}</div>
              <div class="asset-info-value">{{item.name}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">iPv4addr</div>
              <div class="asset-info-value">{{item.iPv4addr}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">iPv6addr</div>
              <div class="asset-info-value">{{item.iPv6addr}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">macaddr</div>
              <div class="asset-info-value">{{item.macaddr}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.subnetMasks')}}</div>
              <div class="asset-info-value">{{item.subnetMasks}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">mtu</div>
              <div class="asset-info-value">{{item.mtu}}</div>
            </div>
            <div class="asset-info-row">
              <div class="asset-info-title">{{$t('asset.ifOperStatus')}}</div>
              <div class="asset-info-value">
                <span v-if="item.ifOperStatus==1">up</span>
                <span v-else-if="item.ifOperStatus==2">down</span>
                <span v-else-if="item.ifOperStatus==3">testing</span>
                <span v-else-if="item.ifOperStatus==4">unknown</span>
                <span v-else-if="item.ifOperStatus==5">dormant</span>
                <span v-else-if="item.ifOperStatus==6">notPresent</span>
                <span v-else-if="item.ifOperStatus==7">lowerLayerDown</span>
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import chartDataFormat from '@/components/chart/chartDataFormat'
export default {
  name: 'chartDetailNew',
  props: {
    from: String,
    chartDetail: Object,
    chartInfo: Object
  },
  data () {
    return {
    }
  },
  methods: {
    bits: chartDataFormat.getUnit(6).compute,
    Hertz: chartDataFormat.getUnit(26).compute,
    calcTotal (arr, key) {
      return arr.reduce((acc, curr) => acc + Number(curr[key]), 0)
    }
  }
}
</script>
