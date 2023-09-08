<template>
  <div v-my-loading="topologyLoading" class="overview">
    <transition name = "el-zoom-in-center">
      <div v-if="allProject&&allProject.length>0" style="width: 100%;height: 100%;position: relative">
        <el-carousel :interval="5000" :trigger="'click'" :autoplay="true" arrow="hover" @change="carouselChange">
          <el-carousel-item v-for="(item,index) in allProject" :key="index" style="min-height: 10px;min-width: 10px">
            <div class="maskLayer" @click="toProject(item)"></div>
<!--            <span class="project-name">{{item.name}}</span>-->
            <meta2dMain
              v-if="item.isLoad"
              :meta2dId="'autoTopology' + item.id + (isFullscreen ? 'screen' : '')"
              :topoData="item.topoData"
              :minScale="0.01"
              :isPreview="true"
              :querysArray="item.querysArray"
              :project="item"
              :params="item.params"
              :show-zoom="false"
              class="meta2d-chart"
              :is-chart="true"
              :iconArray="iconArray"
              :time-range="filterTime"
              :ref="'topology' + index"
              :paddingTop="40"
            />
          </el-carousel-item>
        </el-carousel>
      </div>
    </transition>
    <div v-if="allProject.length===0" class="chart-no-data">No Data</div>
  </div>
</template>

<script>
import axios from 'axios'
import meta2dMain from '@/components/common/project/meta2d/meta2dMain'
import chartMixin from '@/components/chart/chartMixin'
import bus from '@/libs/bus'
export default {
  name: 'chartAutotopology',
  data () {
    return {
      topologyLoading: false,
      allProject: [],
      iconArray: []
    }
  },
  mixins: [chartMixin],
  components: {
    meta2dMain
  },
  methods: {
    initChart () {
      this.queryAllProjectData()
    },
    carouselChange (index) {
      this.allProject.forEach(item => {
        item.isLoad = false
      })
      this.allProject[index].isLoad = true
    },
    queryAllProjectData () {
      this.isInit = false
      this.$get('monitor/project', { pageSize: -1 }).then(res => {
        this.topologyLoading = true
        this.allProject = []
        this.timeArray = []
        let axiosAll = []
        let temp = []
        if (res.data.list.length === 0) {
          this.topologyLoading = false
        }
        res.data.list.forEach((item) => {
          axiosAll.push(axios.get(`monitor/project/topo?projectId=${item.id}`))
        })
        axios.all(axiosAll).then(res2 => {
          res2 = res2.map((item, index) => {
            return { ...item.data.data, ...res.data.list[index] }
          })
          res2 = res2.filter((item) => item.topo && item.topo.pens && item.topo.pens.length)
          if (res2.length == 0) {
            this.topologyLoading = false
          }
          res2.forEach((item, index) => {
            item.topoData = item.topo || {}
            if (item.topo.topo) {
              item.topoData = item.topo.topo || {}
            }
            item.querysArray = item.topo.elements || []
            item.params = {
              timeType: item.topo.timeType || 5
            }
            if (index === 0) {
              item.isLoad = true
            } else {
              item.isLoad = false
            }
            this.allProject.push(item)
            // setTimeout(() => {
            //   item.isLoad = true
            // }, index * 200)
          })
          // temp.push(res2[2])
          // this.allProject = JSON.parse(JSON.stringify(temp))
          temp = null
          axiosAll = null
          this.topologyLoading = false
        })
      })
    },
    toProject (projectInfo) { // 跳转对应project页面
      this.$store.commit('currentProjectChange', {
        id: projectInfo.id,
        name: projectInfo.name
      })
      this.jumpTo('project')
    },
    jumpTo (data, id) {
      if (data == 'asset') {
        bus.$emit('clear-asset-filter') // 清除leftMenu左侧菜单过滤条件
        // if(this.$store.getters.getIdcArr.length===0){return}//如果不存在idc 则不跳转
      }
      // if (data === 'project' || data === 'module' || data === 'endpoint') {
      //   data = data
      // }
      if (data === 'alertList') {
        data = 'alertMessage'
      }
      this.$router.push({
        path: '/' + data,
        query: {
          t: +new Date()
        }
      })
    },
    resize () {
      this.allProject.forEach((item, index) => {
        this.$refs['topology' + index][0] && this.$refs['topology' + index][0].topoResize()
      })
    }
  },
  mounted () {
    this.queryAllProjectData()
    this.$get('/topology/icon').then(res => {
      this.iconArray = [...res.data.list]
    })
  },
  beforeDestroy () {
    this.allProject = []
  }
}
</script>
