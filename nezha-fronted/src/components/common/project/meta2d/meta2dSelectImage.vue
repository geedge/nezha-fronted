<template>
  <div class="meta2d-image-box">
    <div @click="changeSelectBoxShow(true)" style="position: relative">
      <div class="image-input">
        <span v-if="imageName" class="image-input-message text-ellipsis">{{unit}} / {{imageName}}</span>
        <i class="el-icon-circle-close" style="position: absolute;top: 10px;right: 10px;font-size: 14px" @click.stop="selectImageChange({image: '', id: ''}, true)"/>
      </div>
    </div>
<!--    <div class="image-select-box" v-if="selectBoxShow">-->
<!--     -->
<!--    </div>-->
    <!--selectImg-->
    <el-dialog
      :title="$t('project.topology.image')"
      custom-class="nz-select-img-dialog nz-new-dialog"
      :visible.sync="selectBoxShow"
      width="auto"
      :append-to-body="true"
      :modal-append-to-body="false"
      @close="changeSelectBoxShow(false)"
      destroy-on-close
    >
      <div class="image-select-box" style="width: 650px;height:446px;margin-top: 10px"  v-my-loading="imgageLoading">
        <el-card shadow="hover" style="height:446px;width:100%;overflow-y: auto"
                 class="project-topology-add-node">
          <div  v-for="(item, index) in tools" :key="index" class="collapse-box" v-if="item.group !== 'General' || showDefault">
            <div :title="item.group" :name="item.group">
              <div class="nz-collapse-header" :class="item.show ? 'is-active' : ''" @click.stop="selectGroup(item)">
                <span class="nz-icon-caret-right-box">
                  <i class="nz-icon nz-icon-caret-right" :class="item.show ? 'rotate90': ''" />
                </span>
                <div class="text-ellipsis nz-collapse-header-content">{{item.group}}</div>
                <i class="nz-icon nz-icon-delete title-delete" v-if="item.group!== 'General'" @click.stop="tooltipDeleteTitle(item)" :title="$t('overall.delete')" />
                <span class="title-all">{{item.children.length}}</span>
              </div>
              <transition name="el-zoom-in-top">
                <div v-show="item.show" class="nz-collapse-body">
                  <div v-for="(btn, i) in item.children" :key="'info2'+'-'+index+'-'+i" class="buttons image-box-item" :class="btn.id == selectImgId ? 'is-select':''">
                    <img :src="btn.image" v-if="btn.image" class="image-src" @click.stop="selectImageChange(btn)">
                    <i v-if="btn.nzClassName" class="nz-icon image-src" :class="btn.nzClassName" style="font-size: 40px" @click.stop="selectImageChange(btn)"/>
                    <div class="img-text text-ellipsis" :title="btn.imageName">{{btn.imageName}}</div>
                    <i v-if="item.group!=='General'" class="delIcon nz-icon nz-icon-delete" @click.stop="tooltipDelete(btn)"></i>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </el-card>
      </div>
      <div slot="footer" class="nz-select-img-dialog-footer">
        <button class="nz-btn nz-btn-size-normal nz-btn-style-light"  @click="uploadPicChange">
          <i class="el-icon-plus"></i>
          <span>
             {{ $t('overall.uploadCustomPicture') }}
          </span>
        </button>
        <span>
          <button class="nz-btn nz-btn-size-normal nz-btn-style-light" style="margin-right: 20px" @click="changeSelectBoxShow(false)">
             {{$t('overall.cancel')}}
          </button>

          <button class="nz-btn nz-btn-size-normal nz-btn-style-normal" @click="changImage" :disabled="prevent_opt.save"
                      :class="{'nz-btn-disabled':prevent_opt.save}"
                      style="">
             {{$t('el.datepicker.confirm')}}
          </button>
        </span>
      </div>
    </el-dialog>
    <!--Custom picture-->
    <el-dialog
      :title="title"
      :visible.sync="uploadPicShow"
      custom-class="nz-select-img-dialog nz-new-dialog"
      width="452px"
      :append-to-body="true"
      :modal-append-to-body="false"
      @close="uploadPicShow = false"
      destroy-on-close>
      <el-row class="upload-pic-row" style="margin-top: 20px;margin-bottom: 20px;">
        <el-col :span="24">
          <div class="upload-body">
            <el-upload
              drag
              class="upload-demo"
              action=" "
              :show-file-list="true"
              :on-change="beforeAvatarUpload"
              :auto-upload="false"
              accept=".jpg,.png,.gif"
              :limit="1"
              :id="'upload-pic-show'">
              <!--<div slot="tip" class="el-upload__tip" >{{$t('overall.importTipImg')}}</div>-->
              <i class="nz-icon nz-icon-upload"></i>
              <div class="el-upload__text">{{$t('overall.dragFileTip')}}，{{$t('overall.or')}}&nbsp;<em>{{$t('overall.clickUpload')}}</em></div>
            </el-upload>
          </div>
        </el-col>
      </el-row>
      <el-row class="upload-pic-row">
        <el-col :span="4" class="upload-pic-label" style="text-align: left">{{ $t('overall.name') }}</el-col>
        <el-col :span="20">
          <el-input maxlength="64" show-word-limit v-model="uploadPic.name" size="small"  :placeholder="$t('project.topology.placeholderImg')"></el-input>
        </el-col>
      </el-row>
      <el-row class="upload-pic-row" style="margin-bottom: 30px">
        <el-col :span="4" class="upload-pic-label" style="text-align: left">{{ $t('overall.folder') }}</el-col>
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
      <div slot="footer" class="upload-pic-row" style="text-align: right;margin-bottom: 0;width: 100%">
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
import { Tools } from '@/components/common/project/meta2d/js/defaultIcon'
export default {
  name: 'meta2dSelectImage',
  props: {
    selectImage: {},
    icon: {},
    imgId: {},
    showDefault: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      tools: [...Tools],
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
      selectImgId: '',
      selectImg: '',
      unit: '',
      imageName: '',
      baseUrl: '',
      token: ''
    }
  },
  mounted () {
    // this.baseUrl = localStorage.getItem('nz-baseURL')
    this.token = localStorage.getItem('nz-token')
    if (this.icon) {
      const iconId = this.icon.charCodeAt().toString(16)
      const findItem = this.tools[0].children.find(item => item.id === iconId)
      if (findItem) {
        this.unit = findItem.unit
        this.imageName = findItem.name
        this.selectImgId = findItem.id
      }
    }
    this.imageInit()
  },
  methods: {
    imageInit () { // 加载所有图片
      this.$get('/topology/icon').then(res => {
        this.imgageLoading = true
        this.tools = [...Tools]
        this.iconArray = [...res.data.list]
        this.iconArray.forEach((item, index) => {
          item.imageName = item.name
          item.image = `/topology/icon/0/${item.unit}/${item.name}`
          if (this.imgId == item.id) {
            this.unit = item.unit
            this.imageName = item.imageName
            this.selectImgId = item.id
          } else if (this.selectImage === item.image) {
            this.unit = item.unit
            this.imageName = item.imageName
            this.selectImgId = item.id
          }
          const group = this.tools.find(tool => tool.group === item.unit)
          if (group) {
            group.children.push({
              text: item.imageName,
              imageName: item.imageName,
              image: item.image,
              imageId: item.id,
              id: item.id,
              unit: item.unit,
              type: item.type
            })
          } else {
            this.tools.push({
              group: item.unit,
              show: false,
              children: [{
                text: item.imageName,
                imageName: item.imageName,
                image: item.image,
                imageId: item.id,
                id: item.id,
                unit: item.unit,
                type: item.type
              }]
            })
          }
        })
        const findItem = this.tools.find(group => group.group === this.unit)
        if (findItem) {
          findItem.show = true
        }
        this.imgInit = true
        this.imgageLoading = false
      })
    },
    changeSelectBoxShow (flag) {
      this.selectBoxShow = flag
      // this.selectImgId = this.imgId
      const findItem = this.tools.find(group => {
        group.show = false
        return group.group === this.unit
      })
      if (findItem) {
        findItem.show = true
        findItem.children.forEach(item => {
          if (item.id === this.selectImgId) {
            this.selectImg = item
          }
        })
      }
    },
    selectGroup (item) {
      item.show = !item.show
    },
    selectImageChange (item, isChange) {
      this.selectImgId = item.id
      this.selectImg = item
      if (isChange) {
        this.changImage()
      }
    },
    changImage () {
      this.unit = this.selectImg.unit
      this.imageName = this.selectImg.imageName
      this.selectImgId = this.selectImg.id
      this.$emit('updateImage', this.selectImg)
      this.changeSelectBoxShow(false)
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
      this.$delete('topology/icon?ids=' + item.imageId).then(res => {
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
      this.$delete('/topology/unit?unit=' + item.group).then(res => {
        if (res.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.deleteSuccess') })
          this.tools = this.tools.filter(group => group.group !== item.group)
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
      const isJPG = (file.raw.type === 'image/jpeg' || file.raw.type === 'image/png' || file.raw.type === 'image/gif')
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
      this.$post('/topology/icon', form, { 'Content-Type': 'multipart/form-data' }).then(res => {
        this.imageSave = false
        if (res.code == 200) {
          this.$message({ duration: 2000, type: 'success', message: this.$t('tip.saveSuccess') })
          this.uploadPicShow = false
          this.imageInit()
        } else {
          this.$message.error(res.msg)
        }
      })
    }
  }
}
</script>
