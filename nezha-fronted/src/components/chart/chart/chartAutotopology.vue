<template>
  <div v-my-loading="topologyLoading" class="overview">
    <transition name = "el-zoom-in-center">
      <div v-if="allProject&&allProject.length>0" style="width: 100%;height: 100%;position: relative">
        <el-carousel :interval="5000" :trigger="'click'" arrow="hover">
          <el-carousel-item v-for="(item,index) in allProject" :key="index">
            <div class="maskLayer" @click="toProject(item)"></div>
<!--            <span class="project-name">{{item.name}}</span>-->
            <topology
              :fromOverView="true"
              :from-chart="true"
              :obj="item"
              :ref="'topology' + index"
              :topologyIndexF="isFullscreen?('screen'+chartInfo.id+'-'+index):(chartInfo.id+'-'+index)"
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
import topology from '@/components/common/project/topologyL5'
import chartMixin from '@/components/chart/chartMixin'
import bus from '@/libs/bus'
export default {
  name: 'chartAutotopology',
  data () {
    return {
      topologyLoading: false,
      allProject: []
    }
  },
  mixins: [chartMixin],
  components: {
    topology
  },
  methods: {
    initChart () {
      this.queryAllProjectData()
    },
    queryAllProjectData () {
      this.isInit = false
      this.$get('monitor/project', { pageSize: -1 }).then(res => {
        this.topologyLoading = true
        this.allProject = []
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
            // temp.push(item)
            setTimeout(() => {
              this.allProject.push(item)
            }, index * 200)
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
      this.$store.commit('currentProjectChange', projectInfo)
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
        this.$refs['topology' + index][0] && this.$refs['topology' + index][0].winResize()
      })
    }
  },
  mounted () {
    // this.queryAllProjectData()
  },
  beforeDestroy () {
    this.allProject = []
  }
}
</script>

<style scoped>

</style>
