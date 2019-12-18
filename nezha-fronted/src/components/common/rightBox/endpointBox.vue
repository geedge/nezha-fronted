<template>
  <transition name="right-box">
    <div class="right-box right-box-endpoint" v-if="rightBox.show" @click.stop>
      <!-- begin--顶部按钮-->
      <div class="right-box-top-btns">
        <div class="right-box-top-btn right-box-top-btn-full" @click="esc">
          <div class="right-box-btn-icon">
            <i class="el-icon-close"></i>
          </div>
          <span>{{$t('overall.esc')}}</span>
        </div>
        <div class="right-box-top-btn right-box-top-btn-full" @click="saveOrToEdit">
          <div class="right-box-btn-icon">
            <i class="el-icon-edit-outline"></i>
          </div>
          <span v-if="rightBox.isEdit">{{$t('overall.save')}}</span>
          <span v-else>{{$t('overall.edit')}}</span>
        </div>
        <div class="right-box-top-btn" v-if="rightBox.isEdit && endpoint.id != ''" @click="del()">
          <div class="right-box-btn-icon">
            <i class="el-icon-delete"></i>
          </div>
          <span>{{$t('overall.delete')}}</span>
        </div>
      </div>
      <!-- end--顶部按钮-->

      <!-- begin--标题-->
      <div class="right-box-title">{{rightBox.title}}</div>
      <!-- end--标题-->

      <!-- begin--表单-->
      <div class="right-box-form">
        <!--project-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.project.project")}}</div>
          <div class="right-box-form-content">
            <el-select @change="((val) => {getToSelectModuleData(val.id)})" value-key="id" popper-class="config-dropdown" v-model="endpoint.project" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.project.name}}</div>
          </div>
        </div>
        <!--module-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.module.module")}}</div>
          <div class="right-box-form-content">
            <el-select @change="((val) => {})" value-key="id" popper-class="config-dropdown" v-model="currentModule" placeholder="" v-if="rightBox.isEdit" size="small">
              <el-option v-for="item in toSelectModuleData" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.module.name}}</div>
          </div>
        </div>
        <!--host-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.endpoint.host")}}</div>
          <div class="right-box-form-content">
            <el-input
              class="right-box-row-with-btn"
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="endpoint.host"
              size="small"
            ></el-input>
            <div @click="showSubBox" class="right-box-row-btn right-box-row-btn-active" v-if="rightBox.isEdit">
              <span class="el-icon-more"></span>
            </div>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.host}}</div>
          </div>
        </div>
        <!--port-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.endpoint.port")}}</div>
          <div class="right-box-form-content">
            <el-input
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="endpoint.port"
              size="small"
            ></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.port}}</div>
          </div>
        </div>
        <!--path-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">{{$t("project.endpoint.path")}}</div>
          <div class="right-box-form-content">
            <el-input
              v-if="rightBox.isEdit"
              placeholder=""
              v-model="endpoint.path"
              size="small"
            ></el-input>
            <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.path}}</div>
          </div>
        </div>
        <!--param-->
        <div class="right-box-form-row">
          <div class="right-box-form-label">
            {{$t("project.endpoint.param")}}
            <el-button v-if="rightBox.isEdit" class="param-btn param-btn-active margin-l-10" size="mini" @click="addParam"><i class="el-icon-plus"></i>{{$t('overall.add')}}</el-button>
            <el-button v-if="rightBox.isEdit" class="param-btn param-btn-clear" size="mini" @click="clearAllParam">{{$t('overall.clearAll')}}</el-button>
          </div>
          <div class="right-box-form-content">
            <div class="param-box param-box-endpoint">
              <div class="param-box-row" v-for="(item, index) in paramObj">
                <el-input :disabled="!rightBox.isEdit" placeholder="key" class="param-box-row-key" size="mini" v-model="item.key"></el-input>
                <span class="param-box-row-eq">=</span>
                <el-input :disabled="!rightBox.isEdit" placeholder="value" class="param-box-row-value" size="mini" v-model="item.value"></el-input>
                <span v-if="rightBox.isEdit" class="param-box-row-symbol" @click="removeParam(index)"><i class="el-icon-minus"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- end--表单-->

      <!-- begin--底部按钮-->
      <div class="right-box-bottom-btns">
        <div @click="esc" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save()" v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{endpoint.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
      </div>
      <!-- end--底部按钮-->
    </div>
  </transition>
</template>

<script>
  export default {
    name: "endpointBox",
    props: {
      endpoint: Object,
      currentProject: Object,
      currentModule: Object
    },
    data() {
      return {
        // 清除param
        clearAllParam: function() {
          this.module.paramObj = [];
        },

        // 新增param
        addParam: function() {
          this.module.paramObj.push({key: '', value: ''});
        },

        // 移除单个param
        removeParam: function(index) {
          this.module.paramObj.splice(index, 1);
        },

        //将param转为json字符串格式
        paramToJson: function(param) {
          let tempParam = {};
          for (let i = 0; i < param.length; i++) {
            eval('tempParam.' + param[i].key + '="' + param[i].value + '"');
          }
          let jsonString = JSON.stringify(tempParam);
          if (jsonString == '{}') {
            return "";
          } else {
            return jsonString;
          }
        },
      }
    }
  }
</script>

<style scoped>
  /* start--param*/
  .param-btn {
    float: right;
    height: 27px;
    margin-top: -3px;
  }
  .param-btn-active {
    background-color: #656565;
    color: white;
    border: 1px solid #656565;
  }
  .param-btn-active:hover, .param-btn-active:focus {
    background-color: #656565;
    color: white;
  }
  .param-btn-clear {
    background-color: #D4D4D4;
    border: 1px solid #D4D4D4;
    color: white;
  }
  .param-btn-clear:hover, .param-btn-clear:focus {
    background-color: #D4D4D4;
    color: white;
  }

  .param-box {
    border: 1px solid #DCDFE6;
    border-radius: 4px;
    padding: 0 10px;
  }
  .param-box-endpoint {
    height: 325px;
  }
  .param-box-module {
    height: 227px;
  }
  .param-box-row {
    padding: 7px 0 0 0;
    position: relative;
  }
  .param-box-row:last-of-type {
    padding-bottom: 7px;
  }
  .param-box-row-key, .param-box-row-value {
    display: inline-block;
    width: 41.5%;
  }
  .param-box-row-eq {
    display: inline-block;
    width: 22px;
    text-align: center;
    height: 32px;
    line-height: 32px;
    color: #c4c7cF;
  }
  .param-box-row-symbol {
    font-size: 12px;
    color: #c4c7cF;
    border: 1px solid #c4c7cF;
    text-align: center;
    height: 12px;
    width: 14px;
    display: inline-block;
    position: absolute;
    top: 17px;
    right: 25px;
    cursor: pointer;
  }
  .param-box-row-symbol>i {
    position: absolute;
    top: 1px;
    right: 1px;
  }
  /* end--param*/
</style>
