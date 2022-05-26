<template>
  <div class="main-list main-list--project">
    <projectList ref="dataList" :class="showList?'projectList':'hide'" v-has="'project_view'"/>
    <projectTopo :class="showList?'projectTopo':'projectTopo'" v-has="'project_view'"/>
  </div>
</template>

<script>
import projectList from './projectList'
import projectTopo from './project'
export default {
  name: 'index',
  props: {},
  computed: {
    showList () {
      return !this.$store.getters.getShowTopoScreen
    }
  },
  components: {
    projectList,
    projectTopo
  },
  data () {
    return {}
  },
  watch: {
    $route: {
      immediate: true,
      handler () {
        // 是否弹出侧滑
        const add = this.$route.query.add
        if (add) {
          if (add === 'project') {
            this.$nextTick(() => {
              this.$refs.dataList.add()
            })
          }
        }
      }
    }
  },
  mounted () {
    this.$store.commit('setShowTopoScreen', false)
  },
  methods: {}
}
</script>
