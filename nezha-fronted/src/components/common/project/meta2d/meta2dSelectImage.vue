<template>
  <div class="meta2d-image-box" v-clickoutside="changeSelectBoxShow">
    <div @click="selectBoxShow = !selectBoxShow" style="position: relative">
      <div class="image-input">
        <span v-if="imageName">{{unit}} / {{imageName}}</span>
        <i class="nz-icon nz-icon-circle-close" style="position: absolute;top: 2px;right: 10px;font-size: 8px" @click.stop="selectImageChange({image: '', id: ''})"/>
      </div>
    </div>
    <div class="image-select-box" v-if="selectBoxShow">
<!--      <div v-for="item in iconArray" :key="item.id" class="image-box-item" @click="selectImageChange(item)">-->
<!--        <img  :src="item.image" class="imag-src"/>-->
<!--        <div class="img-text text-ellipsis" :title="item.imageName">{{item.imageName}}</div>-->
<!--      </div>-->
      <div style="height: 350px"  v-my-loading="imgageLoading">
        <el-card shadow="hover" style="height:320px;width:100%;overflow-y: auto"
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
<!--                <div class="img-text text-ellipsis" :title="item.imageName">{{item.imageName}}</div>-->
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
    <!--Custom picture-->
    <el-dialog
      :title="title"
      :visible.sync="uploadPicShow"
      width="auto"
      @close="uploadPicShow = false"
      destroy-on-close>
      <el-row class="upload-pic-row">
        <el-col :span="4" class="upload-pic-label">{{ $t('overall.name') }}</el-col>
        <el-col :span="20">
          <el-input maxlength="64" show-word-limit v-model="uploadPic.name" size="small"  :placeholder="$t('project.topology.placeholderImg')"></el-input>
        </el-col>
      </el-row>
      <el-row class="upload-pic-row">
        <el-col :span="4" class="upload-pic-label">{{ $t('overall.folder') }}</el-col>
        <el-col :span="20">
          <el-autocomplete
            popper-class="right-box-select-top right-public-box-dropdown-top"
            :maxlength="64" show-word-limit
            class="inline-input"
            v-model="uploadPic.unit"
            :fetch-suggestions="querySearch"
            size="small"
          ></el-autocomplete>
        </el-col>
      </el-row>

      <el-row class="upload-pic-row">
        <el-col :span="4" class="upload-pic-label"> </el-col>
        <el-col :span="20">
          <div class="upload-body">
            <el-upload
              drag
              class="upload-demo"
              action=" "
              :show-file-list="true"
              :on-change="beforeAvatarUpload"
              :auto-upload="false"
              accept=".jpg,.png"
              :limit="1"
              :id="'upload-pic-show'">
              <!--<div slot="tip" class="el-upload__tip" >{{$t('overall.importTipImg')}}</div>-->
              <i class="nz-icon nz-icon-upload"></i>
              <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
            </el-upload>
          </div>
        </el-col>
      </el-row>
      <div class="upload-pic-row" style="text-align: center">
            <span>
               <button class="nz-btn nz-btn-size-normal nz-btn-style-light" style="margin-right: 20px" @click="uploadPicShow=false">
             {{$t('project.topology.exit')}}
           </button>

              <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="imgUpload" :disabled="prevent_opt.save"
                      :class="{'nz-btn-disabled':prevent_opt.save}"
                      style="">
             {{$t('overall.save')}}
           </button>
            </span>
      </div>

    </el-dialog>
  </div>
</template>

<script>
import { dealImg, topologyImg } from '@/components/common/js/common'
import { imageTemp } from '@/components/common/project/L5/services/canvas'

export default {
  name: 'meta2dSelectImage',
  props: {
    selectImage: {},
    imgId: {}
  },
  data () {
    return {
      tools: [],
      title: this.$t('overall.uploadCustomPicture'),
      imgageLoading: false,
      iconArray: [],
      selectBoxShow: false,
      imageNull: '',
      activeNames: [],
      uploadPicShow: false,
      imgWidth: 0,
      imgHeight: 0,
      uploadPic: {
        name: '',
        unit: ''
      },
      unit: '',
      imageName: ''
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
            if (this.imgId == item.id) {
              this.unit = item.unit
              this.imageName = item.imageName
            } else if (this.selectImage === item.image) {
              this.unit = item.unit
              this.imageName = item.imageName
            }
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
      this.unit = item.unit
      this.imageName = item.imageName
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
      this.unitArr = []
      this.tools.forEach((item, index) => {
        if (index > 0) {
          this.unitArr.push({
            value: item.group
          })
        }
      })
      this.uploadPic.name = ''
      this.uploadPic.unit = ''
      this.file = null
      this.uploadPicShow = true
    },
    querySearch (queryString, cb) {
      const restaurants = this.unitArr
      const results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants
      // 调用 callback 返回建议列表的数据
      cb(results)
    },
    createFilter (queryString) {
      return (restaurant) => {
        return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0)
      }
    },
    beforeAvatarUpload (file, fileList) {
      const this_ = this
      const isJPG = (file.raw.type === 'image/jpeg' || file.raw.type === 'image/png')
      const isLt2M = (file.size / 1024 / 1024) < 2
      if (!isJPG) {
        this.$message.error(this_.$t('project.topology.imgFormat'))
        fileList = fileList.splice(fileList.length - 1, 1)
        return false
      }
      if (!isLt2M) {
        this.$message.error(this_.$t('project.topology.imgSize'))
        fileList = fileList.splice(fileList.length - 1, 1)
        return false
      }
      new Promise(function (resolve, reject) {
        const width = 0
        const height = 0
        const _URL = window.URL || window.webkitURL
        const img = new Image()
        img.onload = function () {
          const valid = img.width > width && img.height > height
          this_.imgWidth = img.width
          this_.imgHeight = img.height
          valid ? resolve() : reject()
        }
        img.src = _URL.createObjectURL(file.raw)
      }).then(() => {
        if (isJPG) {
          this.file = file.raw
        }
        return file.raw
      }, () => {
        this.$message.error(this_.$t('project.topology.imgMeasure'))
        return Promise.reject()
      })
      return false
    },
    imgUpload () {
      const this_ = this
      if (!this.imageSave) {
        this.imageSave = true
      }
      if (!this.uploadPic.unit) {
        this.$message({
          message: this_.$t('project.topology.unitError'),
          type: 'error'
        })
        return
      }
      if (!this.file) {
        this.$message({
          message: this_.$t('project.topology.imgError'),
          type: 'error'
        })
        return
      }
      this.upload()
    },
    upload () {
      const form = new FormData()
      form.append('file', this.file)
      if (this.uploadPic.name) {
        form.append('name', this.uploadPic.name)
      } else {
        form.append('name', this.file.name.substring(0, this.file.name.lastIndexOf('.')))
      }
      form.append('unit', this.uploadPic.unit)
      form.append('width', this.imgWidth)
      form.append('height', this.imgHeight)
      this.$post('monitor/project/topo/icon', form, { 'Content-Type': 'multipart/form-data' }).then(res => {
        this.imageSave = false
        if (res.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.uploadPicShow = false
          this.$get('monitor/project/topo/icon', { id: res.data.id }).then(iconInfo => {
            dealImg(`monitor/project/topo/icon/${res.data.id}/1`, res.data.id).then((data, header) => {
              const group = this.tools.find(tool => tool.group === this.uploadPic.unit)
              this.iconArray.push({
                ...iconInfo.data.list[0],
                image: data.data
              })
              if (group) {
                group.children.push({
                  text: res.data.imageName,
                  imageName: res.data.imageName,
                  image: data.data,
                  imageId: res.data.id,
                  id: res.data.id,
                  unit: this.uploadPic.unit,
                })
              } else {
                this.tools.push({
                  group: this.uploadPic.unit,
                  children: [{
                    text: res.data.imageName,
                    imageName: res.data.imageName,
                    image: data.data,
                    imageId: res.data.id,
                    id: res.data.id,
                    unit: this.uploadPic.unit
                  }]
                })
              }
            })
          })
        } else {
          this.$message.error(res.msg)
        }
      })
    },
  }
}
</script>

<style scoped lang="scss">
  .image-box-item{

  }
.image-box-item {

}
  .image-box-item:hover {
    border-color: #fa901c;
    .delIcon {
      display: inline-block;
      color: #fa901c;
    }
  }

</style>
