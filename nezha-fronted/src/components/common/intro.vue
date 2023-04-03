<template>
  <el-dialog
    width="100%"
    height="100%"
    title="内层 Dialog"
    :custom-class="'is-intro'"
    :show-close="false"
    :visible.sync="showIntro"
    append-to-body>
    <div>
      <div v-if="introStep==='main'">
        <el-button @click="introStepChange('dc')">设置dc</el-button>
        <el-button>设置asset</el-button>
        <el-button>设置project</el-button>
        <el-button>设置dc</el-button>
      </div>
      <div v-if="introStep === 'dc'" style="height: 100%">
        <div v-if="step === 0" class="dc-img"></div>
        <div v-else-if="step === 1" class="dc-img1"></div>
        <div v-else-if="step === 2" class="dc-img2"></div>
        <div v-else-if="step === 3" class="dc-img3"></div>
        <div v-else>
          <el-button @click="introStepChange('asset')">继续设置asset</el-button>
        </div>
      </div>
      <div v-if="introStep === 'asset'" style="height: 100%">
        <div v-if="step === 0" >设置asset</div>
        <div v-if="step === 1" ></div>
        <div v-if="step === 2" ></div>
        <div v-if="step === 3" ></div>
        <div v-if="step === 4" ></div>
      </div>
      <div class="intro-bottom">
        <el-button @click="prev()">上一步</el-button>
        <el-button @click="next()">下一步</el-button>
        <el-button @click="exit()">退出</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'intro',
  data: function () {
    return {
      showIntro: false,
      introStep: 'main',
      step: 0,
      timer: ''
    }
  },
  methods: {
    introStepChange (type) {
      this.step = 0
      this.introStep = type
    },
    prev () {
      this.step--
    },
    next () {
      this.step++
      if (this.introStep == 'dc' && this.step === 4) {
        this.timer = setTimeout(() => {
          this.introStepChange('main')
        })
      }
    },
    exit () {
      this.showIntro = false
    }
  }
}
</script>
