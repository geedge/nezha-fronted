<template>
  <div class="main-list">
    <projectList  :class="showList?'projectList':'hide'" />
    <projectTopo  :class="showList?'projectTopo':'projectTopo ml10'" />
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
  watch: {},
  mounted () {
  },
  methods: {}
}
</script>

<style scoped lang="scss">
.main-list{
  height: 100%;
  width: 100%;
  display: flex;
  background: #fff;
  .projectList{
    flex: 1;
  }
  .projectTopo{
    flex: 1;
  }
  .hide{
    display: none;
  }
  .ml10{
    margin-left: 10px;
  }
}
</style>
