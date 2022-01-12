<template>
  <div class="global-search-bac" v-if="globalShow" @click.self="close">
    <div class="global-search-box" :class="firstShow? '' : 'search-after'" @click.self="close">
      <div class="global-search-input" :class="firstShow? '' : 'search-after'">
        <i class="nz-icon nz-icon-search" v-loading="loading"></i>
        <el-input v-model="searchStr" @keydown.native.enter="searchAll" ref="searchStr"></el-input>
        <div @click="close" class="global-search-cancel">
          Cancel
        </div>
      </div>
      <div v-loading="loading" class="global-search-content" v-if="!firstShow">
        <div class="global-search-content-content" >
          content
        </div>
        <div class="global-search-footer">
          footer
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'globalSearch',
  computed: {
    globalShow () {
      return this.$store.getters.getGlobalShow
    }
  },
  data () {
    return {
      firstShow: true,
      searchStr: '',
      loading: false,
      selectIndex: ''
    }
  },
  watch: {
    globalShow: {
      immediate: true,
      deep: true,
      handler (n) {
        if (n) {
          this.bindEvent()
        }
      }
    }
  },
  methods: {
    close () {
      this.searchStr = ''
      this.firstShow = true
      this.$store.commit('setGlobalShow', false)
      this.unbindEvent()
    },
    bindEvent () {
      window.addEventListener('keydown', this.keyDown)
    },
    unbindEvent () {
      this.selectIndex = ''
      window.removeEventListener('keydown', this.keyDown)
    },
    keyDown (e) {
      console.log(e, e.target, e.keyCode)
      if (e.target._prevClass === 'el-input__inner') {
        console.log('blur')
        this.$refs.searchStr.blur()
        return
      }
      if (e.keyCode === '13') {
        this.jumpTo()
      }
      if (e.keyCode === '56') {
        this.selectIndex++
      }
      if (e.keyCode === '78') {
        this.selectIndex--
      }
    },
    searchAll () {
      this.selectIndex = 0
      this.firstShow = false
      this.loading = true
      // this.$get().then(res=>{
      //   this.loading = false
      // })
    }
  }
}
</script>

<style scoped>

</style>
