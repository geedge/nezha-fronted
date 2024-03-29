<template>
  <div class="chart-detail-new">
    <div class="asset-info">
      <el-collapse>
        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-basic-info"></i>
              <span>{{$t('asset.information')}}</span>
              <span>{{chartDetail.feature.os.hostName}}</span>
            </div>
          </template>
          <div class="asset-info-list">
            <div class="asset-info-row" v-if="chartDetail.feature.os&&chartDetail.feature.os.hostName">
              <div class="asset-info-title">{{$t('license.hostname')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.os.hostName}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.os&&chartDetail.feature.os.bootTime">
              <div class="asset-info-title">{{$t('asset.boottime')}}</div>
              <div class="asset-info-value">{{momentTz(chartDetail.feature.os.bootTime*1000)}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.os&&chartDetail.feature.os.platform">
              <div class="asset-info-title">{{$t('asset.platform')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.os.platform}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.os&&chartDetail.feature.os.family">
              <div class="asset-info-title">{{$t('asset.platformFamily')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.os.family}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.os&&chartDetail.feature.os.versionInfo">
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
              <span>{{chartDetail.feature.cpu.name}}</span>
              <span v-if="chartDetail.feature.cpu.physicalPackageCount > 1">* {{chartDetail.feature.cpu.physicalPackageCount}}</span>
            </div>
          </template>
          <div class="asset-info-list">
            <div class="asset-info-row" v-if="chartDetail.feature.cpu&&chartDetail.feature.cpu.vendor">
              <div class="asset-info-title">{{$t('asset.vendorID')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.cpu.vendor}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.cpu&&chartDetail.feature.cpu.name">
              <div class="asset-info-title">{{$t('asset.moduleName')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.cpu.name}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.cpu&&chartDetail.feature.cpu.physicalPackageCount">
              <div class="asset-info-title">{{$t('asset.physicalPackageCount')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.cpu.physicalPackageCount}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.cpu&&chartDetail.feature.cpu.physicalProcessorCount">
              <div class="asset-info-title">{{$t('asset.physicalProcessorCount')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.cpu.physicalProcessorCount}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.cpu&&chartDetail.feature.cpu.logicalProcessorCount">
              <div class="asset-info-title">{{$t('asset.logicalProcessorCount')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.cpu.logicalProcessorCount}}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-memory"></i>
              <span>{{$t('asset.memory')}}</span>
              <span v-if="chartDetail.feature.memory.total>0">{{bytes(chartDetail.feature.memory.total,0,0)}}</span>
            </div>
          </template>
          <div class="asset-info-list">
            <div class="asset-info-row" v-if="chartDetail.feature.memory&&chartDetail.feature.memory.total">
              <div class="asset-info-title">{{$t('asset.memorySize')}}</div>
              <div class="asset-info-value">{{bytes(chartDetail.feature.memory.total,0,0)}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.memory&&chartDetail.feature.memory.swapTotal">
              <div class="asset-info-title">{{$t('asset.swaptotal')}}</div>
              <div class="asset-info-value">{{bytes(chartDetail.feature.memory.swapTotal,0,0)}}</div>
            </div>
            <div class="asset-info-row" v-if="chartDetail.feature.memory&&chartDetail.feature.memory.pageSize">
              <div class="asset-info-title">{{$t('asset.pagesize')}}</div>
              <div class="asset-info-value">{{chartDetail.feature.memory.pageSize}}</div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-disk"></i>
              <span>{{$t('asset.disk')}}</span>
              <span v-if="calcTotal(chartDetail.feature.disk, 'size')>0">{{bytes(calcTotal(chartDetail.feature.disk, 'size'),0,0)}}</span>
            </div>
          </template>
          <div class="asset-info-list" v-for="(item,index) in chartDetail.feature.disk" :key="index">
            <div class="asset-info-row" v-if="item&&item.name">
              <div class="asset-info-title">{{$t('asset.diskName')}}</div>
              <div class="asset-info-value">{{item.name}}</div>
            </div>
            <div class="asset-info-row" v-if="item&&item.model">
              <div class="asset-info-title">{{$t('asset.diskModel')}}</div>
              <div class="asset-info-value">{{item.model}}</div>
            </div>
            <div class="asset-info-row" v-if="item&&item.size">
              <div class="asset-info-title">{{$t('asset.diskSize')}}</div>
              <div class="asset-info-value">{{bytes(item.size,0,0)}}</div>
            </div>
          </div>
          <!-- 补充边距 -->
          <div class="asset-info-list" v-if="!(chartDetail.feature.disk && chartDetail.feature.disk.length)"></div>
        </el-collapse-item>

        <el-collapse-item>
          <template slot="title">
            <div class="asset-info-collapse">
              <i class="nz-icon nz-icon-network"></i>
              <span>{{$t('asset.interface')}}</span>
            </div>
          </template>
          <div class="asset-info-list" v-for="(item,index) in chartDetail.feature.interface" :key="index">
            <div class="asset-info-row" v-if="item&&item.name">
              <div class="asset-info-title">{{$t('asset.interfaceName')}}</div>
              <div class="asset-info-value">{{item.name}}</div>
            </div>
            <div class="asset-info-row" v-if="item&&item.iPv4addr">
              <div class="asset-info-title">IPv4 {{$t('overall.address')}}</div>
              <div class="asset-info-value">{{item.iPv4addr}}</div>
            </div>
            <div class="asset-info-row" v-if="item&&item.iPv6addr">
              <div class="asset-info-title">IPv6 {{$t('overall.address')}}</div>
              <div class="asset-info-value">{{item.iPv6addr}}</div>
            </div>
            <div class="asset-info-row" v-if="item&&item.macaddr">
              <div class="asset-info-title">MAC {{$t('overall.address')}}</div>
              <div class="asset-info-value">{{item.macaddr}}</div>
            </div>
            <div class="asset-info-row" v-if="item&&item.subnetMasks">
              <div class="asset-info-title">{{$t('asset.subnetMasks')}}</div>
              <div class="asset-info-value">{{item.subnetMasks}}</div>
            </div>
            <div class="asset-info-row" v-if="item&&item.mtu">
              <div class="asset-info-title">MTU</div>
              <div class="asset-info-value">{{item.mtu}}</div>
            </div>
            <div class="asset-info-row" v-if="item&&item.ifOperStatus">
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
          <!-- 补充边距 -->
          <div class="asset-info-list" v-if="!(chartDetail.feature.disk && chartDetail.feature.disk.length)"></div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script>
import chartDataFormat from '@/components/chart/chartDataFormat'
import bus from '@/libs/bus'
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
    bytes: chartDataFormat.getUnit(7).compute,
    calcTotal (arr, key) {
      return arr.reduce((acc, curr) => acc + Number(curr[key]), 0)
    }
  }
}
</script>
