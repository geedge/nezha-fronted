<template>
  <div class="meta2d-image-box" v-clickoutside="changeSelectBoxShow">
    <div @click="selectBoxShow = !selectBoxShow">
      <img :src="selectImage" v-if="selectImage" class="image-box">
      <div v-else class="image-box image-box-null" />
    </div>
    <div class="image-select-box" v-if="selectBoxShow">
      <div class="image-box-item" @click="selectImageChange({image: '', id: ''})">
        <img  :src="imageNull" class="imag-src"/>
        <div class="img-text text-ellipsis">kong</div>
      </div>
      <div v-for="item in iconArray" :key="item.id" class="image-box-item" @click="selectImageChange(item)">
        <img  :src="item.image" class="imag-src"/>
        <div class="img-text text-ellipsis" :title="item.imageName">{{item.imageName}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { dealImg, topologyImg } from '@/components/common/js/common'

export default {
  name: 'meta2dSelectImage',
  props: {
    selectImage: {}
  },
  data () {
    return {
      tools: [],
      imgageLoading: false,
      iconArray: [],
      selectBoxShow: false,
      imageNull: ''
    }
  },
  mounted () {
    this.imageInit()
  },
  methods: {
    imageInit () { // 加载所有图片
      this.$get('monitor/project/topo/icon').then(res => {
        this.imgageLoading = true
        this.tools = []
        let imgArr = []
        let promiseArr = []
        res.data.list.forEach((item, index) => {
          item.imageName = item.name
          delete item.name
          promiseArr.push(topologyImg['img' + item.id] || dealImg(`monitor/project/topo/icon/${item.id}/1`, item.id))
          imgArr.push({ ...item })
        })
        Promise.all(promiseArr).then((res2, header) => {
          this.iconArray = [...res.data.list]
          this.iconArray.forEach((item, index) => {
            item.image = res2[index].data
          })
          this.imgInit = true
          this.imgageLoading = false
          imgArr = null
          promiseArr = null
        })
      })
    },
    changeSelectBoxShow () {
      this.selectBoxShow = false
    },
    selectImageChange (item) {
      this.$emit('updateImage', item)
    }
  }
}
</script>

<style scoped lang="scss">
.meta2d-image-box{
  position: relative;
  .image-box {
    width: 30px;
    height: 30px;
  }
  .image-box-null {
    border: 1px solid #999999;
    box-sizing: border-box;
  }
  .image-select-box {
    text-align: center;
    width: 254px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 1;
    padding: 10px 0px 0px 10px;
    position: absolute;
    top: 26px;
    background: #ffffff;
    border: 1px solid #999999;
    border-radius: 4px;
    left: 0;
    .image-box-item {
      width: 50px;
      height: 70px;
      margin: 0 10px 10px 0;
      flex-direction: column;
      align-items: center;
      display: inline-block;
      .imag-src{
        width: 50px;
        height: 50px;
      }
      .img-text {
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        text-align: center;
      }
    }
  }
}
</style>
