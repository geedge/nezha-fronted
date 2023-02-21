<template>
  <div class="meta2d-image-box" v-clickoutside="changeSelectBoxShow">
    <div @click="selectBoxShow = !selectBoxShow" style="position: relative">
      <div v-if="selectImage" class="image-box">
        <img :src="selectImage"  class="image-box">
      </div>
      <div v-else class="image-box image-box-null" />
      <i class="nz-icon nz-icon-close" style="position: absolute;top: 0;right: 0;font-size: 10px" @click.stop="selectImageChange({image: '', id: ''})"/>
    </div>
    <div class="image-select-box" v-if="selectBoxShow">
<!--      <div v-for="item in iconArray" :key="item.id" class="image-box-item" @click="selectImageChange(item)">-->
<!--        <img  :src="item.image" class="imag-src"/>-->
<!--        <div class="img-text text-ellipsis" :title="item.imageName">{{item.imageName}}</div>-->
<!--      </div>-->
      <div style="height: 450px"  v-my-loading="imgageLoading">
        <el-card shadow="hover" style="height:420px;width:100%;overflow-y: auto"
                 class="project-topology-add-node">
          <el-collapse v-model="activeNames" v-for="(item, index) in tools" :key="index" class="collapse-box">
            <el-collapse-item :title="item.group" :name="item.group">
              <template slot="title">
                <div style="display: flex;width: 100%;">
                   <div style="flex: 1">{{item.group}}</div> <i class="nz-icon nz-icon-delete title-delete" @click.stop="tooltipDeleteTitle(item)" :title="$t('overall.delete')"></i>
                </div>
              </template>
              <div v-for="(btn, i) in item.children" :key="'info2'+'-'+index+'-'+i" class="buttons image-box-item">
                <img :src="btn.image" v-if="btn.image" class="image-src" @click.stop="selectImageChange(btn)">
                <div class="img-text text-ellipsis" :title="item.imageName">{{item.imageName}}</div>
                <i v-if="item.group!=='General'" class="delIcon nz-icon nz-icon-delete" @click.stop="tooltipDelete(btn)"></i>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
        <div class="upload-pic-box" @click="uploadPicChange">
          <i class="el-icon-plus"></i>
          <span>
                     {{ $t('overall.uploadCustomPicture') }}
                  </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { dealImg, topologyImg } from '@/components/common/js/common'
import { imageTemp } from '@/components/common/project/L5/services/canvas'

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
      imageNull: '',
      activeNames: []
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
            const group = this.tools.find(tool => tool.group === item.unit)
            if (group) {
              group.children.push({
                text: item.imageName,
                imageName: item.imageName,
                image: res2[index].data,
                imageId: item.id,
                id: item.id,
                unit: item.unit,
              })
            } else {
              this.tools.push({
                group: item.unit,
                children: [{
                  text: item.imageName,
                  imageName: item.imageName,
                  image: res2[index].data,
                  imageId: item.id,
                  id: item.id,
                  unit: item.unit,
                }]
              })
            }
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
    },
    tooltipDelete (item) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.delImg(item)
      })
    },
    tooltipDeleteTitle (item) {
      this.$confirm(this.$t('tip.confirmDelete'), {
        confirmButtonText: this.$t('tip.yes'),
        cancelButtonText: this.$t('tip.no'),
        type: 'warning'
      }).then(() => {
        this.delCollpseTitle(item)
      })
    },
    delImg (item) {
      this.$delete('monitor/project/topo/icon?ids=' + item.imageId).then(res => {
        if (res.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
          const findItem = this.tools.find(group => group.group === item.unit)
          findItem.children = findItem.children.filter(child => child.imageId !== item.imageId)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    delCollpseTitle (item) {
      this.$delete('monitor/project/topo/iconUnit?unit=' + item.group).then(res => {
        if (res.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
          this.tools = this.tools.filter(group => group.group !== item.unit)
        } else {
          this.$message.error(res.msg)
        }
      })
    },
    uploadPicChange () {

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
    border-radius: 2px;
  }
  .image-select-box {
    text-align: center;
    width: 225px;
    z-index: 1;
    padding: 5px 0px 0px 0px;
    position: absolute;
    top: 26px;
    background: #ffffff;
    border: 1px solid #999999;
    border-radius: 4px;
    left: 0;
    /deep/ .el-card__body {
      padding: 0;
    }
    .image-box-item {
      width: 30px;
      height: 50px;
      margin: 0 10px 10px 0;
      flex-direction: column;
      align-items: center;
      display: inline-block;
      position: relative;
      .image-src{
        width: 30px;
        height: 30px;
      }
      .image-text {
        width: 100%;
        height: 20px;
        line-height: 20px;
        font-size: 12px;
        text-align: center;
      }
      .delIcon{
        position: absolute;
        right: 0;
        top: 0;
      }
    }
  }
}
</style>
