<style scoped>
  .prom {
    height: 100%;
  }
</style>
<template>
    <div class="prom">
        <div class="content-left">
            <div class="sidebar-title">{{$t('config.config')}}</div>
            <div class="sidebar-info">
                <div class="sidebar-info-item sidebar-info-top" @click="jumpTo('account')">{{$t('config.account.account')}}</div>
                <div class="sidebar-info-item sidebar-info-item-active">{{$t('config.promServer.promServerList')}}</div>
            </div>
        </div>
        <div class="content-right">
            <div class="top-tools">
              <button @click="toAdd" class="nz-btn nz-btn-size-normal nz-btn-style-normal float-right">
                <span class="top-tool-btn-txt">{{$t('overall.add')}}</span>
              </button>
              <div class="top-tool-search float-right"><search-input :searchMsg="searchMsg" @search="search"></search-input></div>
            </div>
            <el-table :data="tableData" border height="calc(100% - 65px)" style="width: 100%;">
                <el-table-column :resizable="false" v-for="(item, index) in tablelable" v-if="item.show" :width="item.width" :key="`col-${index}`" :label="item.label">
                    <template slot="header" slot-scope="scope">
                        <span v-if="index==0">
                            <span @click.stop="elementsetShow('shezhi',$event)">
                                <i class="el-icon-setting"></i>
                            </span>
                            <span>{{item.label}}</span>
                        </span>
                        <div v-else>
                            <span>{{item.label}}</span>
                        </div>
                    </template>
                    <template slot-scope="scope" :column="item">
                        <span v-if="item.prop == 'idc'">{{scope.row[item.prop].name}}</span>
                        <span v-else-if="item.prop == 'type'">
                            {{scope.row[item.prop] == '1' ? 'Global' : ''}}
                            {{scope.row[item.prop] == '2' ? 'Per-Datacenter' : ''}}
                        </span>
                        <div v-else-if="item.prop == 'option'" class="content-right-options">
                            <span @click="del(scope.row)" class="content-right-option"><i class="el-icon-delete"></i></span>
                            <span @click="detail(scope.row)" class="content-right-option"><i class="el-icon-view"></i></span>
                            <span @click="toEdit(scope.row)" class="content-right-option"><i class="el-icon-edit-outline"></i></span>
                        </div>
                        <span v-else>{{scope.row[item.prop]}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        </div>

        <transition name="right-box">
            <div class="right-box right-box-prom" v-if="rightBox.show">
                <!-- begin--顶部按钮-->
              <div class="right-box-top-btns">
                <button type="button" v-if="rightBox.isEdit && promServer.id != ''" @click="del(promServer)" class="nz-btn nz-btn-size-normal nz-btn-style-light">
                  <span class="top-tool-btn-txt">{{$t('overall.delete')}}</span>
                </button>
                <button type="button" @click="saveOrToEdit" class="nz-btn nz-btn-size-normal nz-btn-style-normal">
                  <span v-if="rightBox.isEdit" class="top-tool-btn-txt">{{$t('overall.save')}}</span>
                  <span v-else class="top-tool-btn-txt">{{$t('overall.edit')}}</span>
                </button>

                <button type="button" @click="esc" class="nz-btn nz-btn-size-normal nz-btn-style-light nz-btn-style-square">
                  <span class="top-tool-btn-txt"><i class="el-icon-close"></i></span>
                </button>
              </div>
                <!-- end--顶部按钮-->

                <!-- begin--标题-->
                <div class="right-box-title">{{rightBox.title}}</div>
                <!-- end--标题-->

                <!-- begin--表单-->
              <el-scrollbar class="right-box-form-box">
                <el-form class="right-box-form" :model="promServer" label-position="top" label-width="80px" :rules="rules" ref="promServerForm">
                  <!--DC start-->
                  <el-form-item label="DC"  prop="idc.name">
                    <div class="right-box-form-content">
                    <el-select class="right-box-row-with-btn" value-key="id" popper-class="config-dropdown" v-model="promServer.idc" placeholder="" v-if="rightBox.isEdit" size="small">
                      <el-option @click.native="blurEditIdc()" v-for="item in idcData" :key="item.id" :label="item.name" :value="item">
                        <span class="config-dropdown-label-txt">{{item.name}}</span>
                        <idc-config-box :post-idc="item" placement="left" @after="getIdcData" :button-class="'config-dropdown-btn'">
                          <template v-slot:optionZone>
                            <i class="el-icon-edit-outline"></i>
                          </template>
                        </idc-config-box>
                        <span class="config-dropdown-btn config-dropdown-btn-delete" @click.stop="toDelIdc(item)"><i class="el-icon-delete"></i></span>
                      </el-option>
                    </el-select>


                    <div class="right-box-row-btn" v-if="rightBox.isEdit">
                      <idc-config-box placement="left" @after="getIdcData"></idc-config-box>
                    </div>
                    <div class="right-box-form-content-txt" v-if="!rightBox.isEdit">{{promServer.idc.name}}</div>
                    </div>
                  </el-form-item>
                  <!--DC end-->

                  <!--host-->
                  <el-form-item label="Host" prop="host">
                    <el-input type="text" v-if="rightBox.isEdit" placeholder="" v-model="promServer.host" size="small"></el-input>
                    <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{promServer.host}}</div>
                  </el-form-item>
                  <!--Port-->
                  <el-form-item label="Port" prop="port">
                    <el-input type="text" v-if="rightBox.isEdit" placeholder="" v-model.number="promServer.port" size="small"></el-input>
                    <div v-if="!rightBox.isEdit" class="right-box-form-content-txt">{{promServer.port}}</div>
                  </el-form-item>
                  <!--type-->
                  <el-form-item :label="$t('config.promServer.type')" prop="type">
                    <el-select popper-class="config-dropdown" v-model="promServer.type" placeholder="" v-if="rightBox.isEdit" size="small">
                      <el-option v-for="item in typeData" :key="item.key" :label="item.value" :value="item.key"></el-option>
                    </el-select>
                    <div v-for="item in typeData" v-if="!rightBox.isEdit && item.key == promServer.type" class="right-box-form-content-txt">{{item.value}}</div>
                  </el-form-item>
                </el-form>
              </el-scrollbar>
                <!-- end--表单-->
            </div>
        </transition>
        <element-set
          v-clickoutside="elementsetHide"
          :dropCol="dropCol"
          @tablelable="tablelabelEmit"
          ref="elementset"
        ></element-set>
    </div>

</template>
<script>
export default {
  name: "prom",
  data() {
    let checkHost=(rule, value, callback) => {
      if(!value || value == ''){
        callback(new Error(this.$t('validate.required')))
      }
      const hostReg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        setTimeout(() => {
          if (hostReg.test(value)) {
            callback()
          } else {
            callback(new Error(this.$t('validate.host')))
          }

      }, 100)
    }
    return {
      rightBox: { //弹出框相关
        show: false,
        isEdit: false, //false查看，true编辑
        title: ''
      },
      promServer: {
        id: '',
        host: '',
        port:9090,
        idc: {id: '', name: '', location: ''}
      },
      rules:{
        'idc.name':[
          {required:true,message:this.$t('validate.required'),trigger:'change'}
        ],
        host:[
          { validator: checkHost, trigger: 'blur'}
        ],
        port:[
          {required:true,message:this.$t('validate.required'),trigger:'blur'},
          {type:'number',message: this.$t('validate.number')}
        ],
        type:[
          {required:true,message:this.$t('validate.required'),trigger:'change'},
        ]
      },
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:0
      },
      tableTitle: [
        {
          label: 'ID',
          prop: 'id',
          show: true,
          width: 80
        }, {
          label: 'DC',
          prop: 'idc',
          show: true,
        }, {
          label: 'Host',
          prop: 'host',
          show: true,
        }, {
          label: 'Port',
          prop: 'port',
          show: true,
        }, {
          label: this.$t("config.promServer.type"),
          prop: 'type',
          show: true,
        }, {
          label: this.$t('config.account.option'),
          prop: 'option',
          show: true,
          width: 100
        }
      ],
      tablelable: [],
      dropCol: [],
      tableData: [],
      idcData: [],
      typeData: [
        {
          key: 1,
          value: 'Global'
        }, {
          key: 2,
          value: 'Per-Datacenter'
        }
      ],
      searchMsg: { //给搜索框子组件传递的信息
        zheze_none: true,
        searchLabelList: [{
          id: 1,
          name: 'ID',
          type: 'input',
          label: 'id',
          disabled: false
        },{
          id: 5,
          name: 'DC',
          type: 'dc',
          label: 'dc',
          disabled: false
        },{
          id: 6,
          name: this.$t('config.promServer.type'),
          type: 'select',
          label: 'promType',
          disabled: false
        },{
          id: 8,
          name: this.$t('project.endpoint.host'),
          type: 'input',
          label: 'host',
          disabled: false
        },{
          id: 9,
          name: this.$t('project.endpoint.port'),
          type: 'input',
          label: 'port',
          disabled: false
        }],
      },
      searchLabel: {}, //搜索参数
      idcSelectedData: {
        id: '',
        name: '',
        location: '',
        principal: '',
        tel: ''
      },
      addIdcData: {
        id: '',
        name: '',
        location: '',
        principal: '',
        tel: ''
      },
      popIdcData: {
        id: '',
        name: '',
        location: '',
        principal: '',
        tel: ''
      },
      idcUserData: '',
    }
  },
  methods: {
    elementsetShow(s, e) {
      var eventfixed = {
        shezhi: 0,
        screen: 0
      };
      eventfixed[s] = 1;
      e.preventDefault();
      this.$store.commit('setHeaderTable', this.tablelable);
      this.$store.commit('setEventfixed', eventfixed);
      const h = document.documentElement.clientHeight;
      const w = document.documentElement.clientWidth;
      const dw = this.$refs.elementset.$el.offsetWidth;
      const dh = this.$refs.elementset.$el.offsetHeight;
      let positionx =
        e.clientX + dw <= w - 10 ? e.clientX - 250 : e.clientX - 250 - dw;
      let positiony =
        e.clientY + dh <= h - 10
          ? e.clientY - 70
          : e.clientY - 70 - (e.clientY + dh - h);
      this.$store.commit('setPosition', { positionx, positiony });
    },
    elementsetHide() {
      //悬浮点击空白隐藏
      this.$refs.elementset.elementsetHide();
    },
    tablelabelEmit(data) {
      //获取子组件传过来的参数
      this.$store.commit('setHeaderTable', data);
      this.tablelable = data;
    },
    toEdit: function(u) {
      this.promServer = Object.assign({}, u);
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("config.promServer.editProm") + "  ID：" + u.id;
      this.rightBox.show = true;
    },
    del: function(u) {
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("promServer?ids=" + u.id).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.getTableData();
            this.rightBox.show = false;
          } else {
            this.$message.error(response.msg);
          }
        })
      });
    },
    detail: function(u) {
      this.promServer = Object.assign({}, u);
      this.rightBox.isEdit = false;
      this.rightBox.title = "Prometheus Server ID：" + u.id;
      this.rightBox.show = true;
    },
    toAdd: function() {
      this.cleanPromServer();
      this.rightBox.isEdit = true;
      this.rightBox.title = this.$t("config.promServer.createProm");
      this.rightBox.show = true;
    },
    save: function() {
      this.$refs.promServerForm.validate((valid => {
        if(valid){
          if (this.promServer.id) {
            this.$put('promServer', this.promServer).then(response => {
              if (response.code === 200) {
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                this.getTableData();
                this.rightBox.isEdit = false;
                this.esc();
              } else {
                this.$message.error(response.msg);
              }
            });
          } else {
            this.$post('promServer', this.promServer).then(response => {
              if (response.code === 200) {
                this.$message({duration: 1000, type: 'success', message: this.$t("tip.saveSuccess")});
                this.getTableData();
                this.rightBox.isEdit = false;
                this.esc();
              } else {
                this.$message.error(response.msg);
              }
            });
          }
        }else{
          return false;
        }
      }))
    },
    saveOrToEdit: function() {
      if (!this.rightBox.isEdit) {
        this.toEdit(this.promServer);
      } else {
        this.save();
      }
    },
    toEditIdc: function(item) {
      if (!item.isEdit) {
        //如果不在编辑状态，那么其他项如果有改动，则还原改动，最后开始编辑
        this.blurEditIdc();
        item.isEdit = true;
      } else {
        //如果已在编辑状态，判断name是否有变更，有变更则发请求
        if (item.name != item.oldName) {
          this.$put('idc', item).then(response => {
            if (response.code === 200) {
              item.errorMessage = '';
              item.oldName = item.name;
              item.isEdit = false;
              this.getIdcData();
            } else {
              this.$set(item, 'errorMessage', response.msg);
            }
          })
        } else {
          item.errorMessage = '';
          item.isEdit = false;
        }
      }
    },
    blurEditIdc: function() {
      for (var i = 0; i < this.idcData.length; i++) {
        if (this.idcData[i].isEdit) {
          this.idcData[i].name = this.idcData[i].oldName;
          this.idcData[i].isEdit = false;

          this.idcData[i].errorMessage = '';
          break;
        }
      }
    },
    toDelIdc: function(item) {
      this.blurEditIdc();
      this.$confirm(this.$t("tip.confirmDelete"), {
        confirmButtonText: this.$t("tip.yes"),
        cancelButtonText: this.$t("tip.no"),
        type: 'warning'
      }).then(() => {
        this.$delete("idc?ids=" + item.id).then(response => {
          if (response.code === 200) {
            this.$message({duration: 1000, type: 'success', message: this.$t("tip.deleteSuccess")});
            this.getTableData();
            this.getIdcData();
          } else {
            this.$message.error(response.msg);
          }
        });
      });
    },
    getIdcData: function() {
      this.$get('idc', this.pageObj).then(response => {
        if (response.code === 200) {
          this.idcData = response.data.list;
          for (var i = 0; i < this.idcData.length; i++) {
            this.$set(this.idcData[i], 'oldName', this.idcData[i].name);
            this.$set(this.idcData[i], 'isEdit', false);
            this.$set(this.idcData[i], this.idcData[i].name, false)
          }
          this.getTableData();
        }
      })

    },
    esc: function() {
      this.rightBox.show = false;
    },
    jumpTo(data,id) {
      this.$store.state.assetData.moduleData = data
      this.$store.state.assetData.selectedData = id
      this.$router.push({
        path: "/" + data,
        query: {
          t: +new Date()
        }
      });
    },
    getTableData: function() {
      this.$set(this.searchLabel, "pageNo", this.pageObj.pageNo);
      this.$set(this.searchLabel, "pageSize", this.pageObj.pageSize);
      this.$get('promServer', this.searchLabel).then(response => {
        if (response.code === 200) {
          for (var i = 0; i < response.data.list.length; i++) {
            for (var j = 0; j < this.idcData.length; j++) {
              if (response.data.list[i].idcId == this.idcData[j].id) {
                response.data.list[i].idc = Object.assign({}, this.idcData[j]);
                break;
              }
            }
          }
          this.tableData = response.data.list;
          this.pageObj.total = response.data.total
        }
      })
    },
    cleanPromServer: function() {
      this.promServer = {
        id: '',
        host: '',
        port:9090,
        idcId: '',
        idc: {id: '', name: '', location: ''}
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getTableData();
    },
    pageSize(val) {
      this.pageObj.pageSize = val;
      this.getTableData();
    },
    search: function(searchObj) {
      this.searchLabel = {};
      for (let item in searchObj) {
        if (searchObj[item]) {
          this.$set(this.searchLabel, item, searchObj[item]);
        }
      }
      this.getTableData();
    },
    addNewData(type) {
      if (type === 'IDC') {
        this.$post('idc', this.addIdcData).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '添加成功'),
              duration: 2000
            });
            this.getIdcData()
          }else{
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            });
          }
        })
      }
    },
    getSingleIDCData(data, item) {
      if (item !== 'edit') {
        this.idcSelectedData = '';
        this.idcData.forEach(item => {
          if (item.id === data) {
            this.idcSelectedData = item
          }
        });
      } else {
        this.idcData.forEach(item => {
          if (item.id === data) {
            console.log(item)
            this.popIdcData.name = item.name
            this.popIdcData.location = item.location
            this.popIdcData.principal = item.principal
            this.popIdcData.tel = item.tel
          }
        });
      }
    },
    getUserData() {
      this.$get('sys/user/list').then(response => {

        if (response.code === 200) {
          this.idcUserData = response.data.list
        }
      })
    },
    editData(data, id, item) {
        item.id = id;
        this.$put(data, item).then(res => {
          if (res.code === 200) {
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, '修改成功'),
              duration: 2000
            })
          }else{
            const h = this.$createElement;
            this.$notify({
              message: h('i', {style: 'color: teal'}, res.msg),
              duration: 2000
            })
          }
        })
    },
  },
  mounted: function() {
    this.getIdcData();
    this.getUserData();
    this.tablelable = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
      ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
      : this.tableTitle;
    this.dropCol = localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path)
      ? JSON.parse(localStorage.getItem("nz-tableTitle-" + localStorage.getItem("nz-username") + "-" + this.$route.path))
      : this.tableTitle;
  },
  watch: {
    'promServer.idc': function(n, o) {
      this.promServer.idcId = n.id;
    }
  }
}
</script>
