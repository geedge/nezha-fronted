<template>
    <div style="height:95%;overflow-y:auto">
        <div>
            <el-input
                    style="width: 90px;"
                    placeholder="请输入内容"
                    v-model="input"
                    clearable>
            </el-input>
        </div>
        <div>
            <el-table
                    :data="this.tableData"
            >
                <el-table-column
                        v-for="(item, index) in tableTitle"
                        v-if="item.show"
                        min-width="120"
                        :key="`col_${index}`"
                        :label="item.label"
                >
                    {{item}}
                    <template slot-scope="scope" :column="item">
                        <div v-if="item.prop=='ID'">
                            <p>
                                <span>{{scope.row['id']}}</span>
                            </p>
                        </div>
                        <div v-if="item.prop=='IP'">
                            <p>
                                <span>{{scope.row['host']}}</span>
                            </p>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                        fixed="right"
                        label="操作"
                        width="100">
                    <template slot-scope="scope">
                        <el-button type="text" size="small" @click.stop="tagShow('showAdd')">查看</el-button>
                        <el-button type="text" size="small" @click.stop="tagShow('showEdit')">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <Pagination :pageObj="pageObj" @pageNo='pageNo' @pageSize='pageSize' ref="Pagination"></Pagination>
        <transition name="el-zoom-in-center" @click.stop>
            <div class="right-menu" v-if="tabShow" v-clickoutside:tagHide="tagShow">
                <div v-if="this.tagType=='add'">
                    <el-form ref="form" :model="form" label-width="120px">
                        <div class="right-box__top-btns">
                            <div class="right-box__top-btn right-box__top-btn_full">
                                <div class="right-box__btn-icon">
                                    <i class="el-icon-close"></i>
                                </div>
                                <span>Esc</span>
                            </div>
                            <div class="right-box__top-btn right-box__top-btn_full">
                                <div class="right-box__btn-icon">
                                    <i class="el-icon-edit-outline"></i>
                                </div>
                                <span>Save</span>
                            </div>
                            <div class="right-box__top-btn">
                                <div class="right-box__btn-icon">
                                    <i class="el-icon-delete"></i>
                                </div>
                                <span>Delete</span>
                            </div>
                        </div>
                        <div class="el-form-style">
                            <el-form-item label="IP">
                                <el-input v-model="form.name"/>
                            </el-form-item>
                            <el-form-item label="SN">
                                <el-input v-model="form.name"/>
                            </el-form-item>
                            <el-form-item label="Asset Type">
                                <el-input v-model="form.name"/>
                            </el-form-item>
                            <el-form-item label="ModelId">
                                <el-input v-model="form.name"/>
                            </el-form-item>
                            <el-form-item label="IDC">
                                <el-input v-model="form.name"/>
                            </el-form-item>
                            <el-form-item label="Cabinet">
                                <el-input v-model="form.name"/>
                            </el-form-item>
                            <el-form-item label="Host">
                                <el-input v-model="form.name"/>
                            </el-form-item>
                            <el-form-item label="State">
                                <el-input v-model="form.name"/>
                            </el-form-item>
                            <el-form-item>
                                <el-button>取消</el-button>
                            </el-form-item>
                        </div>
                    </el-form>
                </div>
                <div v-if="this.tagType=='edit'">
                    <el-form ref="form" :model="form" label-width="120px" size="small">
                        <div class="right-box__top-btns">
                            <div class="right-box__top-btn right-box__top-btn_full">
                                <div class="right-box__btn-icon">
                                    <i class="el-icon-close"></i>
                                </div>
                                <span>Esc</span>
                            </div>
                            <div class="right-box__top-btn right-box__top-btn_full">
                                <div class="right-box__btn-icon">
                                    <i class="el-icon-edit-outline"></i>
                                </div>
                                <span>Save</span>
                            </div>
                            <div class="right-box__top-btn">
                                <div class="right-box__btn-icon">
                                    <i class="el-icon-delete"></i>
                                </div>
                                <span>Delete</span>
                            </div>
                        </div>
                        <div class="el-form-style">
                            <el-form-item label="IP">
                                <span>192.168.100.255</span>
                            </el-form-item>
                            <el-form-item label="SN">
                                <span>AAQWEROIUOWENKOIZLNWEROFPIAN</span>
                            </el-form-item>
                            <el-form-item label="Asset Type">
                                <span>服务器</span>
                            </el-form-item>
                            <el-form-item label="ModelId">
                                <span>No1</span>
                            </el-form-item>
                            <el-form-item label="IDC">
                                <span>国内地区/北京市/1号</span>
                            </el-form-item>
                            <el-form-item label="Cabinet">
                                <span>13排223机柜</span>
                            </el-form-item>
                            <el-form-item label="Host">
                                <span>192.158.22.22</span>
                            </el-form-item>
                            <el-form-item label="State">
                                <span>在库</span>
                            </el-form-item>
                            <el-form-item label="Alarm">
                                <div>111</div>
                            </el-form-item>
                        </div>
                        <div style="padding-top: 10px">
                            <span>endPoint:</span>
                        </div>
                        <div class="tag-table">
                            <el-table
                                    :data="tagTableData"
                                    :row-style="{height:'20px'}"
                                    :cell-style="{padding:'2px'}"
                            >
                                <el-table-column
                                        v-for="(item, index) in tagTableTitle"
                                        v-if="item.show"
                                        :key="`col_${index}`"
                                        :label="item.label"

                                >
                                    <template slot-scope="scope" :column="item">
                                        <div v-if="item.prop=='projectName'">
                                            <p>
                                                <span>{{scope.row['projectName']}}</span>
                                            </p>
                                        </div>
                                        <div v-if="item.prop=='moduleName'">
                                            <p>
                                                <span>{{scope.row['moduleName']}}</span>
                                            </p>
                                        </div>
                                        <div v-if="item.prop=='endPoint'">
                                            <div class="tableSquare">342</div>
                                        </div>
                                        <div v-if="item.prop=='alarm'">
                                            <div class="tableSquare">{{11}}/{{111}}</div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column
                                        fixed="right"
                                        label=""
                                        width="100">
                                    <template slot-scope="scope">
                                        <el-button type="text" size="small" @click.stop="tagShow('showAdd')">查看
                                        </el-button>
                                        <el-button type="text" size="small" @click.stop="tagShow('showEdit')">编辑
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
<!--                            <Pagination :pageobj="pageObj" ref="Pagination"></Pagination>-->
                            <el-divider></el-divider>
                            <span>默认CLI账户</span>
                            <div style="padding-top: 10px">
                                <el-select v-model="form.region" placeholder="请选择活动区域" style="width: 90%">
                                    <el-option label="区域一" value="shanghai">111111111111111111111</el-option>
                                    <el-option label="区域二" value="beijing">111111111111111111111</el-option>
                                    <el-option label="区域二" value="beijing">111111111111111111111</el-option>
                                    <el-option label="区域二" value="beijing">111111111111111111111</el-option>
                                </el-select>
                            </div>
                        </div>
                        <div class="el-form-style">
                            <el-form-item label="IP">
                                <span>192.168.100.255</span>
                            </el-form-item>
                            <el-form-item label="SN">
                                <span>AAQWEROIUOWENKOIZLNWEROFPIAN</span>
                            </el-form-item>
                            <el-form-item label="Asset Type">
                                <span>服务器</span>
                            </el-form-item>
                            <el-form-item label="ModelId">
                                <span>No1</span>
                            </el-form-item>
                            <el-form-item label="IDC">
                                <span>国内地区/北京市/1号</span>
                            </el-form-item>
                        </div>
                    </el-form>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
export default {
  name: "asset",
  data() {
    return {
      tableTitle: this.$t('asset.tableTitle'),
      tagTableTitle: this.$t('asset.tagTableTitle'),
      tableData: [],
      tagTableData: [
        {
          projectName: '2016-05-02',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1518 弄'
        }, {
          projectName: '2016-05-04',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1517 弄'
        }, {
          projectName: '2016-05-01',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1519 弄'
        }, {
          projectName: '2016-05-03',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1516 弄'
        }, {
          projectName: '2016-05-02',
          moduleName: '王小虎',
          endPoint: '上海市普陀区金沙江路 1518 弄'
        },
      ],
      pageObj: {
        pageNo: 1,
        pageSize: 20,
        total:0
      },
      input: '',
      tabShow: false,
      tagType: 'add',
      form: {
        name: ''
      },
    }
  },
  methods: {
    getListData() {
      new Promise((resolve, reject) => {
        this.$get('api/asset',this.pageObj).
        then(response => {
          if(response.code==200){
            this.tableData = response.data.list
            console.log(this.tableData)
            this.pageObj.total = response.data.total
          }
          resolve(response.data)
        }).catch(err => {
          reject(err.response)
        })
      })
    },
    tagShow(t) {
      this.tabShow = false
      if (t === 'showAdd') {
        this.tabShow = true
        this.tagType = 'add'
      }
      if (t === 'showEdit') {
        this.tabShow = true
        this.tagType = 'edit'
      }
    },
    pageNo(val) {
      this.pageObj.pageNo = val;
      this.getListData()
    },
    pageSize(val){
      this.pageObj.pageSize = val;
      this.getListData()
    }
  },
  mounted() {
    this.getListData()
  }
}
</script>
<style>
.el-table{
    font-size: 10px;
}

.el-form-style .el-form-item {
    margin-bottom: 0px;
}

.el-form-style .el-form-item .el-form-item__content {
    height: 25px;
    font-size: 10px;
}

.el-table__body-wrapper::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
</style>
<style scoped>
.right-menu {
    position: fixed;
    top: 20px;
    right: 0;
    z-index: 500;
    border-radius: 8px;
    box-shadow: 0 0 15px #ccc;
    background-color: white;
    padding: 0 20px;
    width: 580px;
    height: calc(100% - 60px);
    overflow-y: auto
}


.right-box__top-btn {
    border-radius: 0 0 9px 9px;
    float: right;
    color: #656565;
    height: 35px;
    font-size: 12px;
    padding: 3px 8px 1px 8px;
    border: 1px solid #aaaaaa;
    border-top: none;
    cursor: pointer;
    margin-left: 20px;
}

.right-box__top-btn_full {
    background-color: #656565;
    border: 1px solid #656565;
    border-top: none;
    color: white;
}

.el-form-style {
    padding-top: 40px;
}

.tableSquare {
    border: 1px solid #000;
    height: 25px;
    width: 90px;
    border-radius: 8px;
    text-align: center;
}
</style>