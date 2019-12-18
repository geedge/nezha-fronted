<style scoped>
.project {
  height: 100%;
}
.content-right-option {
  cursor: pointer;
  display: inline-block;
  margin-right: 6px;
}
.content-right-option .el-icon-delete {
  color: #F98D9A;
}
.content-right-option .el-icon-delete:hover {
  color: #D96D7A;
}
.content-right-option .el-icon-view {
  color: #60BEFF;
}
.content-right-option .el-icon-view:hover {
  color: #409EFF;
}

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

/* begin--子弹框*/
.right-sub-box {
  width: 380px;
  height: 520px;
  position: absolute;
  top: 380px;
  right: 100px;
  z-index: 2;
  padding: 0 10px;
}
.right-sub-box .el-input-group {
  width: 227px;
  float: right;
  margin: 7px 0 0 0;
}
  /* begin--搜索框*/
.endpoint-asset-prepend {
  border-radius: 4px 0 0 4px;
}
.endpoint-asset-label {
  line-height: 26px;
  height: 26px;
}
.endpoint-asset-dropdown {
  position: absolute;
  top: 27px;
  background-color: #656565;
  border-radius: 4px;
  width: 52px;
  left: 0;
}
.endpoint-asset-dropdown-item {
  text-align: center;
  line-height: 22px;
  height: 22px;
  cursor: default;
}
.endpoint-asset-label-txt {
  display: inline-block;
  width: 19px;
  text-align: center;
}
.endpoint-asset-dropdown-item:first-of-type {
  border-radius: 4px 4px 0 0;
}
.endpoint-asset-dropdown-item:last-of-type {
  border-radius: 0 0 4px 4px;
}
.endpoint-asset-dropdown-item:hover {
  background-color: #3a8ee6;
}
  /* end--搜索框*/
  /* begin--table*/
.endpoint-sub-table {
  margin-top: 25px;
}
.line-100 {
  margin-bottom: 3px;
}
.endpoint-sub-table-head {
  line-height: 28px;
  height: 30px;
}
.endpoint-sub-table-row {
  line-height: 28px;
  height: 30px;
  color: #656565;
}
.endpoint-sub-table-row-active {
  background-color: #dadada;
}
.endpoint-sub-table-col {
  display: inline-block;
  width: 45%;
  padding-left: 10px;
}
.endpoint-sub-table-paginate-all {
  position: absolute;
  left: 10px;
  bottom: 17px;
  color: #5a5a5a;
}
.endpoint-sub-table-body {
  font-size: 15px;
}
  /* end--table*/

/* end--子弹框*/
</style>
<style>
  /* begin--覆盖分页组件样式*/
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    margin: 0 3px;
    min-width: 25px;
  }
  .right-sub-box .el-pagination button, .right-sub-box .el-pagination span:not([class*=suffix]) {
    margin: 0 3px;
    height: 25px;
    line-height: 25px;
  }
  .right-sub-box .el-pager li {
    height: 25px;
    line-height: 25px;
  }
  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled).active {
    background-color: #656565;
    border: 1px solid #656565;
  }
  .right-sub-box .el-pagination.is-background .btn-next, .right-sub-box .el-pagination.is-background .btn-prev, .right-sub-box .el-pagination.is-background .el-pager li {
    background-color: white;
  }
  .right-sub-box .el-pagination button, .right-sub-box .el-pager li {
    border: 1px solid #DADADA;
  }
  .right-sub-box .el-pager li.active+li {
    border: 1px solid #DADADA;
  }
  .right-sub-box .el-pagination.is-background .el-pager li:not(.disabled):hover {
    color: black;
  }
  .right-sub-box .el-pagination.is-background .el-pager li.active:hover {
    color: white;
  }
  .endpoint-sub-table-paginate .el-pagination {
    position: absolute;
    right: 10px;
    bottom: 13px;
  }
  .el-input-group__append {
    cursor: pointer;
  }

  /* end--覆盖分页组件样式*/
</style>

<template>
  <div class="project">
    <div class="content-left">
      <div class="sidebar-title">{{$store.state.projectData.name}}</div>
      <div class="sidebar-info">
        <div
          v-for="item in moduleData"
          class="sidebar-info-item"
          :class="{'sidebar-info-item-active': item.id == currentModule.id}"
          @click="changeListModule(item)"
        >
          {{item.name}}
          <div class="side-bar-menu-edit" @click.stop="toEditModule(item)"><i class="el-icon-edit-outline"></i></div>
        </div>
      </div>
    </div>
    
    <!--metrics-->
    <div class="content-right" v-if="tableShow == 2">
      <div class="top-tools">
        <el-button-group>
          <el-button @click="tableShow = 1" class="top-tool-btn top-tool" size="mini">
            <span class="top-tool-btn-txt">{{$t('project.endpoint.endpoint')}}</span>
          </el-button>
          <el-button @click="" class="top-tool-btn top-tool top-tool-btn-active" size="mini">
            <span class="top-tool-btn-txt">{{$t('project.metrics.metrics')}}</span>
          </el-button>
        </el-button-group>
        <div class="top-tool-search top-tool top-tool-right"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
      </div>
      <el-table
        :data="metricsTableData"
        border
        height="calc(100% - 65px)"
        style="width: 100%;">
        <el-table-column
          v-for="(item, index) in metricsTableTitle"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
        >
          <template slot-scope="scope" :column="item">
            <span>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :pageObj="metricsPageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    </div>

    <!--endpoint-->
    <div class="content-right" v-if="tableShow == 1">
      <div class="top-tools">
        <el-button-group>
          <el-button @click="" class="top-tool-btn top-tool top-tool-btn-active" size="mini">
            <span class="top-tool-btn-txt">{{$t('project.endpoint.endpoint')}}</span>
          </el-button>
          <el-button @click="tableShow = 2" class="top-tool-btn top-tool" size="mini">
            <span class="top-tool-btn-txt">{{$t('project.metrics.metrics')}}</span>
          </el-button>
        </el-button-group>
        <el-button @click.stop="toAdd" class="top-tool-btn top-tool-btn-active top-tool margin-l-10 top-tool-right" size="mini">
          <span><i class="el-icon-plus"></i></span>
          <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
        </el-button>
        <div class="top-tool-search top-tool top-tool-right"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
      </div>
      <el-table
        :data="endPointTableData"
        border
        height="calc(100% - 65px)"
        style="width: 100%;">
        <el-table-column
          v-for="(item, index) in endpointTableTitle"
          v-if="item.show"
          :width="item.width"
          :key="`col-${index}`"
          :label="item.label"
        >
          <template slot-scope="scope" :column="item">
            <span v-if="item.prop == 'asset'">{{scope.row[item.prop].host}}</span>
            <span v-else>{{scope.row[item.prop]}}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('overall.option')" width="100">
          <template slot-scope="scope" :column="item">
            <div class="content-right-options">
              <span @click.stop="detail(scope.row)" class="content-right-option"><i class="el-icon-view"></i></span>
              <span @click.stop="toEdit(scope.row)" class="content-right-option"><i class="el-icon-edit-outline"></i></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
    </div>

    <!-- begin--右弹框-->
    <transition name="right-box">
      <div class="right-box right-box-endpoint" v-if="rightBox.show" @click.stop>
        <!-- begin--顶部按钮-->
        <div class="right-box-top-btns">
          <div class="right-box-top-btn right-box-top-btn-full" @click="esc(1)">
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
                <el-option v-for="item in projectData" :key="item.id" :label="item.name" :value="item"></el-option>
              </el-select>
              <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{endpoint.project.name}}</div>
            </div>
          </div>
          <!--module-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.module.module")}}</div>
            <div class="right-box-form-content">
              <el-select @change="((val) => {changeSelectedModule(val)})" value-key="id" popper-class="config-dropdown" v-model="selectedModule" placeholder="" v-if="rightBox.isEdit" size="small">
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
          <div @click="esc(1)" :class="{'right-box-bottom-btn-50': rightBox.isEdit}" class="right-box-bottom-btn right-box-bottom-btn-cancel">{{$t('overall.cancel')}}</div><div @click="save()" v-if="rightBox.isEdit" class="right-box-bottom-btn right-box-bottom-btn-50">{{endpoint.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
        </div>
        <!-- end--底部按钮-->
      </div>
    </transition>

    <!-- begin--子弹框-->
    <transition name="right-sub-box">
      <div class="right-sub-box" @click.stop v-if="rightSubBox.show">
        <!-- begin--标题-->
        <div class="right-box-title">{{rightSubBox.title}}</div>
        <!-- end--标题-->

        <!-- begin--搜索框-->
        <el-input placeholder="" v-model="assetSearch.text">
          <template slot="prepend">
            <div class="endpoint-asset-prepend">
              <div class="endpoint-asset-label">
                <span class="endpoint-asset-label-txt">{{assetSearch.label}}</span>
                <span @click="assetSearch.dropdownShow = !assetSearch.dropdownShow">
                  <i v-if="assetSearch.dropdownShow" class="el-icon-arrow-up"></i>
                  <i v-if="!assetSearch.dropdownShow" class="el-icon-arrow-down"></i>
                </span>
              </div>
              <div class="endpoint-asset-dropdown" v-if="assetSearch.dropdownShow">
                <div @click="dropdownSelect('IP')" class="endpoint-asset-dropdown-item">IP</div>
                <div @click="dropdownSelect('SN')" class="endpoint-asset-dropdown-item">SN</div>
              </div>
            </div>
          </template>
          <template slot="append"><i @click="searchAsset" class="el-icon-search"></i></template>
        </el-input>
        <!-- end--搜索框-->

        <!-- begin--table-->
        <div class="endpoint-sub-table">
          <div class="endpoint-sub-table-head">
            <div class="endpoint-sub-table-col">IP</div>
            <div class="endpoint-sub-table-col">SN</div>
          </div>
          <div class="line-100"></div>
          <div class="endpoint-sub-table-body">
            <div v-if="selectedAsset.id != ''" :data="selectedAsset.id" class="endpoint-sub-table-row endpoint-sub-table-row-active">
              <div class="endpoint-sub-table-col">{{selectedAsset.host}}</div>
              <div class="endpoint-sub-table-col">{{selectedAsset.sn}}</div>
            </div>
            <div @click="selectAsset(item)" :data="item.id" v-for="item in assetData" class="endpoint-sub-table-row" :class="{'endpoint-sub-table-row-active': item.id == selectedAsset.id}">
              <div class="endpoint-sub-table-col">{{item.host}}</div>
              <div class="endpoint-sub-table-col">{{item.sn}}</div>
            </div>
          </div>
          <div class="endpoint-sub-table-paginate">
            <div class="endpoint-sub-table-paginate-all">All:&nbsp;{{assetPageObj.total}}</div>
            <el-pagination
              background
              :pager-count="5"
              layout="prev, pager, next"
              @current-change="(currentPage) => {getAssetData(currentPage)}"
              :total="assetPageObj.total">
            </el-pagination>
          </div>
        </div>
        <!-- end--table-->
      </div>
    </transition>
    <!-- end--子弹框-->

    <!-- begin--project弹框-->
    <transition name="right-box">
      <div class="right-box right-box-endpoint" v-if="projectRightBox.show" @click.stop>
        <!-- begin--顶部按钮-->
        <div class="right-box-top-btns">
          <div class="right-box-top-btn right-box-top-btn-full" @click="esc(2)">
            <div class="right-box-btn-icon">
              <i class="el-icon-close"></i>
            </div>
            <span>{{$t('overall.esc')}}</span>
          </div>
          <div class="right-box-top-btn right-box-top-btn-full" @click="projectSave">
            <div class="right-box-btn-icon">
              <i class="el-icon-edit-outline"></i>
            </div>
            <span>{{$t('overall.save')}}</span>
          </div>
          <div class="right-box-top-btn" v-if="project.id != ''" @click="projectDel">
            <div class="right-box-btn-icon">
              <i class="el-icon-delete"></i>
            </div>
            <span>{{$t('overall.delete')}}</span>
          </div>
        </div>
        <!-- end--顶部按钮-->

        <!-- begin--标题-->
        <div class="right-box-title">{{projectRightBox.title}}</div>
        <!-- end--标题-->

        <!-- begin--表单-->
        <div class="right-box-form">
          <!--name-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.project.projectName")}}</div>
            <div class="right-box-form-content">
              <el-input v-if="!projectRightBox.isCreate" placeholder="" maxlength="64" show-word-limit v-model="project.name" size="small"></el-input>
              <el-input v-if="projectRightBox.isCreate" placeholder="" maxlength="64" show-word-limit v-model="newProject.name" size="small"></el-input>
            </div>
          </div>
          <!--description-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.project.description")}}</div>
            <div class="right-box-form-content">
              <el-input v-if="!projectRightBox.isCreate" type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="project.remark" size="small"></el-input>
              <el-input v-if="projectRightBox.isCreate" type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="newProject.remark" size="small"></el-input>
            </div>
          </div>
        </div>

        <!-- begin--底部按钮-->
        <div class="right-box-bottom-btns">
          <div @click="esc(2)" class="right-box-bottom-btn right-box-bottom-btn-cancel right-box-bottom-btn-50">{{$t('overall.cancel')}}</div><div @click="projectSave" class="right-box-bottom-btn right-box-bottom-btn-50">{{project.id == '' ? $t('overall.create') : $t('overall.save')}}</div>
        </div>
        <!-- end--底部按钮-->
      </div>
    </transition>
    <!-- end--project弹框-->

    <!-- begin--module弹框-->
    <transition name="right-box">
      <div class="right-box right-box-endpoint" v-if="moduleRightBox.show" @click.stop>
        <el-scrollbar style="height: 100%">
        <!-- begin--顶部按钮-->
        <div class="right-box-top-btns">
          <div class="right-box-top-btn right-box-top-btn-full" @click="esc(3)">
            <div class="right-box-btn-icon">
              <i class="el-icon-close"></i>
            </div>
            <span>{{$t('overall.esc')}}</span>
          </div>
          <div class="right-box-top-btn right-box-top-btn-full" @click="moduleSave">
            <div class="right-box-btn-icon">
              <i class="el-icon-edit-outline"></i>
            </div>
            <span>{{$t('overall.save')}}</span>
          </div>
          <div class="right-box-top-btn" v-if="currentModule.id != '' && !moduleRightBox.isCreate" @click="moduleDel">
            <div class="right-box-btn-icon">
              <i class="el-icon-delete"></i>
            </div>
            <span>{{$t('overall.delete')}}</span>
          </div>
        </div>
        <!-- end--顶部按钮-->

        <!-- begin--标题-->
        <div class="right-box-title">{{moduleRightBox.title}}</div>
        <!-- end--标题-->

        <!-- begin--表单-->
        <div class="right-box-form">
          <!--project-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.project.project")}}</div>
            <div class="right-box-form-content">
              <el-select v-if="!moduleRightBox.isCreate" value-key="id" popper-class="config-dropdown" v-model="currentModule.project" placeholder="" size="small">
                <el-option v-for="item in projectData" :key="item.id" :label="item.name" :value="item"></el-option>
              </el-select>
              <el-select v-if="moduleRightBox.isCreate" popper-class="config-dropdown" v-model="newModule.projectId" placeholder="" size="small">
                <el-option v-for="item in projectData" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
          </div>
          <!--name-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.module.moduleName")}}</div>
            <div class="right-box-form-content">
              <el-input v-if="!moduleRightBox.isCreate" placeholder="" maxlength="64" show-word-limit v-model="currentModule.name" size="small"></el-input>
              <el-input v-if="moduleRightBox.isCreate" placeholder="" maxlength="64" show-word-limit v-model="newModule.name" size="small"></el-input>
            </div>
          </div>
          <!--description-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.module.description")}}</div>
            <div class="right-box-form-content">
              <el-input v-if="!moduleRightBox.isCreate" type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="currentModule.remark" size="small"></el-input>
              <el-input v-if="moduleRightBox.isCreate" type="textarea" placeholder="" maxlength="1024" show-word-limit v-model="newModule.remark" size="small"></el-input>
            </div>
          </div>
          <!--tip-->
          <div class="right-box-form-row">
            <div class="right-box-form-content">
              <div class="right-box-form-tip">
                {{$t('project.module.tip.defaultEndpointSet')}}
                <div class="line-100"></div>
                {{$t('project.module.tip.relation')}}
              </div>
            </div>
          </div>
          <!--port-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.endpoint.port")}}</div>
            <div class="right-box-form-content">
              <el-input v-if="!moduleRightBox.isCreate" placeholder="" v-model="currentModule.port" size="small"></el-input>
              <el-input v-if="moduleRightBox.isCreate" placeholder="" v-model="newModule.port" size="small"></el-input>
            </div>
          </div>
          <!--path-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">{{$t("project.endpoint.path")}}</div>
            <div class="right-box-form-content">
              <el-input v-if="!moduleRightBox.isCreate" placeholder="" v-model="currentModule.path" size="small"></el-input>
              <el-input v-if="moduleRightBox.isCreate" placeholder="" v-model="newModule.path" size="small"></el-input>
            </div>
          </div>
          <!--param-->
          <div class="right-box-form-row">
            <div class="right-box-form-label">
              {{$t("project.endpoint.param")}}
              <el-button class="param-btn param-btn-active margin-l-10" size="mini" @click="addParam"><i class="el-icon-plus"></i>{{$t('overall.add')}}</el-button>
              <el-button class="param-btn param-btn-clear" size="mini" @click="clearAllParam">{{$t('overall.clearAll')}}</el-button>
            </div>
            <div class="right-box-form-content">
              <div class="param-box param-box-module">
                <div class="param-box-row" v-for="(item, index) in paramObj">
                  <el-input placeholder="key" class="param-box-row-key" size="mini" v-model="item.key"></el-input>
                  <span class="param-box-row-eq">=</span>
                  <el-input placeholder="value" class="param-box-row-value" size="mini" v-model="item.value"></el-input>
                  <span class="param-box-row-symbol" @click="removeParam(index)"><i class="el-icon-minus"></i></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- begin--底部按钮-->
        <div class="right-box-bottom-btns">
          <div @click="esc(3)" class="right-box-bottom-btn right-box-bottom-btn-cancel right-box-bottom-btn-50">{{$t('overall.cancel')}}</div><div @click="moduleSave" class="right-box-bottom-btn right-box-bottom-btn-50">{{currentModule.id == '' && moduleRightBox.isCreate ? $t('overall.create') : $t('overall.save')}}</div>
        </div>
        <!-- end--底部按钮-->
        </el-scrollbar>
      </div>
    </transition>
    <!-- end--module弹框-->
  </div>
</template>

<script>
export default {
  name: "project",
  data() {
    return {
      tableShow: 1, // 1.endpoint; 2.metrics
      projectRightBox: {
        show: false,
        title: '',
        isCreate: false
      },
      project: {id: '', name: '', remark: ''},
      newProject: {id: '', name: '', remark: ''},
      newModule: {id: '', name: '', project: {}, port: '', path: '', param: '', paramObj: []},
      rightBox: { //弹出框相关
        show: false,
        isEdit: false, //false查看，true编辑
        title: ''
      },
      rightSubBox: { //弹出框相关
        show: false,
        title: this.$t("overall.asset")
      },
      assetSearch: { //侧滑框中asset的搜索相关
        host: '',
        sn: '',
        text: '',
        label: 'IP',
        dropdownShow: false
      },
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:0
      },
      assetPageObj: {
        pageNo: 1,
        pageSize: 11,
        total: 0
      },
      metricsPageObj: {
        pageNo: 1,
        pageSize: 20,
        total: 0
      },
      endpoint: {
        id: '',
        host: '',
        port: '',
        param: '',
        path: '',
        asset: {id: '', name: '', host: ''},
        project: {id: '', name: ''},
        module: {id: '', name: '', param: '', paramObj: {}, projectId: ''},
        moduleId: '',
        assetId: ''
      },
      moduleRightBox: {
        show: false,
        title: '',
        isCreate: false
      },
      currentModule: { //左侧列表当前选中的module
        id: '',
        name: '',
        projectId: ''
      },
      selectedModule: { //endpoint侧滑框中选中的module
        id: '',
        name: '',
        projectId: ''
      },
      selectedAsset: { //endpoint侧滑框中选中的asset
        id: '',
        host: '',
        sn: ''
      },
      searchMsg: { //给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        },{
          id: 12,
          name: this.$t('project.project.project'),
          type: 'project',
          label: 'project',
          disabled: false
        },{
          id: 13,
          name: this.$t('project.module.module'),
          type: 'module',
          label: 'module',
          disabled: false
        },{
          id: 14,
          name: this.$t('asset.asset'),
          type: 'asset',
          label: 'asset',
          disabled: false
        }],
      },
      searchLabel: { //搜索参数

      },
      endpointTableTitle: [
        {
          label: this.$t("project.endpoint.endpointId"),
          prop: 'id',
          show: true,
          width: 110
        },
        {
          label: this.$t("project.endpoint.host"),
          prop: 'host',
          show: true,
        },
        {
          label: this.$t("project.endpoint.port"),
          prop: 'port',
          show: true,
        },
        {
          label: this.$t("project.endpoint.param"),
          prop: 'param',
          show: true,
        },
        {
          label: this.$t("project.endpoint.path"),
          prop: 'path',
          show: true,
        },
        {
          label: this.$t("project.endpoint.asset"),
          prop: 'asset',
          show: true,
        }
      ],
      endPointTableData: [],
      projectData: [], //侧滑框中可选的project
      moduleData: [], //左侧列表的module信息
      toSelectModuleData: [], //侧滑框中可选的module
      paramObj: [], //侧滑框中的param信息
      assetData: [],  //侧滑框中可选的asset
      metricsTableData: [
        {
          name: 'Topic.msg',
          type: 'Counter',
          desc: '10000'
        }
      ],
      metricsTableTitle: [
        {
          label: this.$t("project.metrics.name"),
          prop: 'name',
          show: true,
        },
        {
          label: this.$t("project.metrics.type"),
          prop: 'type',
          show: true,
        },
        {
          label: this.$t("project.metrics.description"),
          prop: 'desc',
          show: true,
        },
      ]
    }
  },
  methods: {
    // endpoint弹框中asset子弹框控制
    showSubBox: function() {
      this.rightSubBox.show = !this.rightSubBox.show;
      this.selectedAsset = this.endpoint.asset;
    },
    // table数据
    getEndPointTableData: function() {
      this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
      this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
      this.$set(this.searchLabel, 'moduleId', this.currentModule.id);
      this.$get('endpoint', this.searchLabel).then(response => {
        if (response.code === 200) {
          for (var i = 0; i < response.data.list.length; i++) {
            try {
              var tempObj = JSON.parse(response.data.list[i].param);
            } catch (err) {
              console.info(response.data.list[i]);
              console.info(err);
            }
            response.data.list[i].paramObj = [];
            for (let k in tempObj) {
              response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
            }
          }
          this.endPointTableData = response.data.list;
          this.pageObj.total = response.data.total;
        }
      });
    },
    // 获取module、endpoint弹框中project下拉框数据
    getProjectData: function(name) {
      this.$get('project').then(response => {
        if (response.code === 200) {
          this.projectData = response.data.list;
          if (name) {
            for (let i = 0; i < this.projectData.length; i++) {
              if (this.projectData[i].name == name) {
                this.project = this.projectData[i];
                this.$store.commit('setProject', this.project);
                break;
              }
            }
          } else {
            this.project = this.projectData[0];
          }
        }
      });
    },
    // 获取endpoint弹框中的asset子弹框里asset列表数据
    getAssetData: function(currentPage) {
      if (currentPage) {
        this.assetPageObj.pageNo = currentPage;
      } else {
        this.assetPageObj.pageNo = 1;
      }
      this.$get('asset', this.assetPageObj).then(response => {
        if (response.code === 200) {
          this.assetData = response.data.list;
          this.assetPageObj.total = response.data.total;
        }
      });
    },
    // endpoint弹框中的asset子弹框里asset选择事件
    selectAsset: function(obj) {
      this.selectedAsset = obj;
      this.endpoint.host = obj.host;
      this.endpoint.assetId = obj.id;
    },
    // endpoint弹框中的asset子弹框搜索
    searchAsset: function() {
      if (this.assetSearch.label == 'IP') {
        this.assetSearch.host = this.assetSearch.text;
        this.assetSearch.sn = '';
      } else if (this.assetSearch.label == 'SN') {
        this.assetSearch.sn = this.assetSearch.text;
        this.assetSearch.host = '';
      }
      this.assetPageObj = Object.assign({}, this.assetPageObj, this.assetSearch);
      this.getAssetData(false);
    },
    // 获取左侧module列表数据
    getModuleData: function() {
      this.$get('module', {projectId: this.$store.state.projectData.id}).then(response => {
        if (response.code === 200) {
          this.moduleData = response.data.list;
          for (let i = 0; i < response.data.list.length; i++) {
            try {
              let tempObj = JSON.parse(response.data.list[i].param);
            } catch (err) {
              console.info(response.data.list[i]);
              console.info(err);
            }
            response.data.list[i].paramObj = [];
            for (let k in tempObj) {
              response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
            }
          }
          if (this.moduleData.length > 0) {
            this.currentModule = this.moduleData[0];
            this.getEndPointTableData();
          } else {
            this.endPointTableData = [];
            this.pageObj.total = 0;
          }
        }
      });
    },
    // 获取endpoint弹框中module下拉框数据
    getToSelectModuleData: function(projectId) {
      this.selectedModule = {id: '', name: ''};
      this.$get('module', {projectId: projectId}).then(response => {
        if (response.code === 200) {
          for (var i = 0; i < response.data.list.length; i++) {
            try {
              var tempObj = JSON.parse(response.data.list[i].param);
            } catch(err) {
              console.info(response.data.list[i]);
              console.info(err);
            }
            response.data.list[i].paramObj = [];
            for (let k in tempObj) {
              response.data.list[i].paramObj.push({key: k, value: tempObj[k]})
            }
          }
          this.toSelectModuleData = response.data.list;
        }
      });
    },
    // 左侧module列表点击事件
    changeListModule: function(module) {
      this.currentModule = Object.assign({}, module);
      this.esc(3);
      this.getEndPointTableData();
    },
    // endpoint弹框中module下拉框点击事件
    changeSelectedModule: function(module) {
      if (module.id == this.endpoint.moduleId) {
        try {
          this.paramObj = JSON.parse(JSON.stringify(this.endpoint.paramObj));
        } catch(err) {
          console.info(this.endpoint.paramObj);
          console.info(err);
        }
      } else {
        try {
          this.paramObj = JSON.parse(JSON.stringify(this.selectedModule.paramObj));
        } catch(err) {
          console.info(this.selectedModule.paramObj);
          console.info(err);
        }
      }
      this.endpoint.port = module.port;
      this.endpoint.path = module.path;
    },
    // 打开endpoint编辑页
    toEdit: function(endpoint) {
      this.getToSelectModuleData(endpoint.project.id);
      this.selectedModule = Object.assign({}, endpoint.module);
      this.endpoint = Object.assign({}, endpoint);
      try {
        this.paramObj = JSON.parse(JSON.stringify(this.endpoint.paramObj));
      } catch(err) {
        console.info(this.endpoint.paramObj);
        console.info(err);
      }

      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("project.endpoint.editEndpoint") + "  ID：" + endpoint.id;
      this.rightBox.show = true;
    },
    // 打开module编辑页
    toEditModule: function(module) {
      this.currentModule = Object.assign({}, module);
      try {
        this.paramObj = JSON.parse(JSON.stringify(this.currentModule.paramObj));
      } catch(err) {
        console.info(this.currentModule.paramObj);
        console.info(err);
      }
      this.moduleRightBox.show = true;
      this.getEndPointTableData();
      this.moduleRightBox.title = this.$t('project.module.editModule') + "  ID：" + module.id;
    },
    // 删除endpoint
    del: function() {
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("endpoint?ids=" + this.endpoint.id).then(response => {
          if (response.code === 200) {
            this.$message({duration: 3000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.getEndPointTableData();
          } else {
            this.$message.error(response.msg);
          }
        })
      });
    },
    // 删除module
    moduleDel: function() {
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("module?ids=" + this.currentModule.id).then(response => {
          if (response.code === 200) {
            this.$message({duration: 3000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.esc(3);
            this.getModuleData();
          } else {
            this.$message.error(response.msg);
          }
        })
      });
    },
    projectDel: function() {
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("project?ids=" + this.project.id).then(response => {
          if (response.code === 200) {
            this.$message({duration: 3000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.$store.commit('projectRightBoxShow', false);
            this.getProjectData();
            setTimeout(() => {
              this.getModuleData();
            }, 50);

            if (this.projectData.length > 0) {
              this.$store.commit('setProject', this.projectData[0]);
            }
            this.$store.commit('projectListReloadChange', true);
          } else {
            this.$message.error(response.msg);
          }
        })
      });
    },
    // 打开endpoint新增页
    toAdd: function() {
      this.cleanEndpoint();
      this.endpoint.project = Object.assign({}, this.project);
      this.paramObj = Object.assign([], this.currentModule.paramObj);
      this.getToSelectModuleData(this.project.id);
      this.selectedModule = Object.assign({}, this.currentModule);
      this.endpoint.port = this.selectedModule.port;
      this.endpoint.path = this.selectedModule.path;
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("project.endpoint.createEndpoint");
      this.rightBox.show = true;
    },
    toAddProject: function() {

    },
    // 打开endpoint详情页
    detail: function(u) {
      this.endpoint = Object.assign({}, u);
      this.paramObj = Object.assign([], u.paramObj);
      this.rightBox.isEdit = false;
      this.rightBox.title = this.$t("project.endpoint.endpoint") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    // endpoint弹框保存或编辑
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.rightBox.isEdit = true;
        this.getToSelectModuleData(this.endpoint.project.id);
        this.selectedModule = Object.assign({}, this.currentModule);
        this.rightBox.title = this.$t("project.endpoint.editEndpoint") + "  ID：" + this.endpoint.id;
      } else {
        this.save();
      }
    },
    // 保存project
    projectSave: function() {
      if (!this.projectRightBox.isCreate) {
        this.$put('project', this.project).then(response => {
          if (response.code === 200) {
            this.$store.commit('setProject', this.project);
            this.$store.commit('projectListReloadChange', true);
            this.$store.commit('projectRightBoxShow', false);
          }
        });
      } else {
        this.$post('project', this.newProject).then(response => {
          if (response.code === 200) {
            this.projectRightBox.isCreate = false;
            this.getProjectData(this.newProject.name);
            this.$store.commit('projectListReloadChange', true);
            this.$store.commit('projectRightBoxShow', false);
            this.getModuleData();
            this.newProject = {id:'', name:'', remark:''};
          }
        });
      }
    },
    // 保存module
    moduleSave: function() {
      if (!this.moduleRightBox.isCreate) {
        this.currentModule.param = this.paramToJson();
        this.currentModule.projectId = this.currentModule.project.id;
        this.$put('module', this.currentModule).then(response => {
          if (response.code === 200) {
            this.esc(3);
            this.getModuleData();
          }
        });
      } else {
        this.newModule.param = this.paramToJson();
        this.$post('module', this.newModule).then(response => {
          if (response.code === 200) {
            this.esc(3);
            this.getModuleData();
            this.moduleRightBox.isCreate = false;
          }
        });
      }
    },
    // 保存endpoint
    save: function() {
      this.endpoint.param = this.paramToJson();
      this.endpoint.moduleId = this.selectedModule.id;
      if (this.endpoint.id) {
        this.$put('endpoint', this.endpoint).then(response => {
          if (response.code === 200) {
            this.rightBox.isEdit = false;
            this.esc(1);
            this.getEndPointTableData();
          }
        });
      } else {
        this.$post('endpoint', this.endpoint).then(response => {
          if (response.code === 200) {
            this.rightBox.isEdit = false;
            this.esc(1);
            this.getEndPointTableData();
          }
        });
      }
    },
    paramToJson: function() {
      let tempParam = {};
      for (let i = 0; i < this.paramObj.length; i++) {
        eval('tempParam.' + this.paramObj[i].key + '="' + this.paramObj[i].value + '"');
      }
      let jsonString = JSON.stringify(tempParam);
      if (jsonString == '{}') {
        return "";
      } else {
        return jsonString;
      }
    },
    // 清除module、endpoint弹框中的param
    clearAllParam: function() {
      this.paramObj = [];
    },
    // 新增module、endpoint弹框中的param
    addParam: function() {
      this.paramObj.push({key: '', value: ''});
    },
    // 移除单个module、endpoint弹框中的param
    removeParam: function(index) {
      this.paramObj.splice(index, 1);
    },
    // 关闭右侧弹框
    esc: function(type) {
      if (type == 1) {
        this.rightBox.show = false;
      }
      if (type == 2) {
        this.$store.commit('projectRightBoxShow', false);
      }
      if (type == 3) {
        this.moduleRightBox.show = false;
      }
    },
    cleanEndpoint: function() {
      this.endpoint = {
        id: '',
        host: '',
        port: '',
        param: '',
        path: '',
        asset: {id: '', name: '', host: ''},
        project: {id: '', name: ''},
        module: {id: '', name: ''}
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getEndPointTableData();
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getEndPointTableData();
    },
    // endpoint弹框的asset子弹框顶部搜索条件选中事件
    dropdownSelect: function(label) {
      this.assetSearch.label = label;
      this.assetSearch.dropdownShow = false;
    },
    search: function(searchObj) {
      this.searchLabel = {};
      for (let item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item]);
        }
      }
      this.getEndPointTableData();
    }
  },
  created: function() {
    window.addEventListener('click', () => {
      this.esc(1);
      this.$store.commit('projectRightBoxShow', false);
      this.esc(3);
    });
    this.getModuleData();
    this.getProjectData();
    this.getAssetData();
  },
  computed:{
    sProject() {
      return this.$store.state.projectData;
    },
    projectBoxShow() {
      return this.$store.state.projectBoxShow;
    },
    toCreateProject() {
      return this.$store.state.createProject;
    },
    toCreateModule() {
      return this.$store.state.createModule;
    },
    toCreateEndpoint() {
      return this.$store.state.createEndpoint;
    },
  },
  watch: {
    sProject(n, o) {
      this.project = Object.assign({}, n);
      this.esc(3);
      this.esc(1);
      this.projectRightBox.title = this.$t("project.project.editProject") + "  ID：" + n.id;
      this.getModuleData();
    },
    projectBoxShow(n, o) {
      this.projectRightBox.show = n;
    },
    toCreateProject(n ,o) {
      if (n) {
        this.$store.commit('toCreateProject', false);
        this.projectRightBox.isCreate = true;
        this.projectRightBox.title = this.$t('project.project.createProject');
      }
    },
    toCreateModule(n ,o) {
      if (n) {
        this.$store.commit('toCreateModule', false);
        this.moduleRightBox.show = true;
        this.moduleRightBox.isCreate = true;
        this.moduleRightBox.title = this.$t('project.module.createModule');
        this.newModule = {id: '', name: '', projectId: this.project.id, project: this.project, port: '', path: '', param: '', paramObj: []};
        this.paramObj = [];
      }
    },
    toCreateEndpoint(n, o) {
      if (n) {
        this.$store.commit('toCreateEndpoint', false);
        this.cleanEndpoint();
        this.rightBox.show = true;
        this.rightBox.isEdit = true;
        this.rightBox.title = this.$t('project.endpoint.createEndpoint');
      }
    }
  }
}
</script>
