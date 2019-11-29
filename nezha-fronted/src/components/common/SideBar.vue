<template>
    <div class="sidebar">
        <div class="cartTitle">
            <div>Project</div>
        </div>
        <div v-for="{item} in arr" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="1">
            <div class="projectCard" :id="gett(item)"></div>
        </div>
    </div>
</template>

<script>
export default {
  name: "SiderBar",
  data(){
    return{
      arr:[12,3,4,5,6,7,8,98,54]
    }
  },
  methods: {
    gett: function (index) {
      return "sdf" + index
    },
    loadMore() {
      this.busy = true
      setTimeout(() => {
        this.page++
      }, 1000)
      this.arr.push('1')
    }
  }
}

</script>

<style scoped>
.cartTitle{
    padding-left: 30px;
    padding-top: 20px;
}
.projectCard{
    margin-left: 30px;
    margin-top: 20px;
    width: 80%;
    height: 100px;
    background-color: #ffffff;
    border-radius: 8px;
    border-top:10px solid #777777
}
.sidebar {
    display: block;
    position: absolute;
    width: 300px;
    left: 0;
    top: 60px;
    bottom: 0;
    box-shadow: 0 10px 16px #ccc;
    overflow-y: scroll;
    background: rgba(242, 242, 242, 0.94);
}
</style>