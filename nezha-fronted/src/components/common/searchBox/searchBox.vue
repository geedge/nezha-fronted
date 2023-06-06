<template>
  <div id="nz-search-box" v-clickoutside="clickOutside">
    <el-popover
      placement="bottom-start"
      :width="inputWidth"
      trigger="manual"
      :append-to-body="false"
      v-model="visible">
      <div  slot="reference" class="search-box-input" tabindex="-99" @focus="focusSearchInput">
        <i class="nz-icon nz-icon-search"/>
        <div class="search-box-input-content" ref="search-box-input-content">
          <div v-for="(item, index) in selectArr" :key="index">
            <el-popover
              placement="bottom-start"
              trigger="hover"
              :popper-class="'tag-box'"
              :disabled="item.value.length == 1"
              :append-to-body="false"
            >
              <div class="tag-box-content">
                <div v-for="(tag, tIndex) in item.realValue" :key="tIndex">
                  <span  class="search-box-tag" @click="editTag(item, index)">
                    {{item.i18n}} :
                    <span >{{tag}}</span>
                    <i class="nz-icon nz-icon-close" @click.stop="removeTagValue(tIndex, item.i18n)"/>
                  </span>
                </div>
              </div>
              <span slot="reference" :key="index" class="search-box-tag" @click.stop="editTag(item, index)">
                {{item.i18n}} :
                <span v-if="item.value.length === 1">{{item.value[0]}}</span>
                <span v-else>{{item.value.length}}项</span>
                <i class="nz-icon nz-icon-close" @click.stop="removeSelectArr(index)"/>
              </span>
            </el-popover>
          </div>
          <el-input size="mini" v-model="searchStr" @focus="searchInputFocus" @keydown.native="keydown" @blur="changeSearchStr" @keyup.native="keyup" ref="searchStr" @keypress.native="keypress" :readonly="inputReadonly" @input="inputSearchStr"></el-input>
        </div>
      </div>
      <div
        class="search-content"
        id="search-box-scroll"
        ref="list"
        style="max-height: 300px;overflow-y: auto"
        infinite-scroll-disabled="disabled"
        v-loadMore="{
           load: valueListLoad,
           hasMore: (valueShow && valueList.length)&&(valueListInfo.total > valueList.length),
        }"
      >
        <div class="search-key" v-if="keyShow && searchList.length" v-my-loading="keywordLoad">
          <div v-for="(item, index) in searchList" @click="selectKey(item)" @mouseenter="selectIndex = index" :key="index" class="search-item" :ref="'search-item' + index" :class="{'search-item-select': index === selectIndex}">
            <span class="icon-k">K</span>  {{$t(item.i18n || item.name)}} <span style="margin-left: 30px" class="content-remark">{{item.type}}</span>
          </div>
        </div>
        <div class="search-symbol" v-if="symbolShow" >
          <div v-for="(item, index) in symbolList" @click="selectSymbol(item)"  @mouseenter="selectIndex = index" :key="index" class="search-item" :ref="'search-item' + index" :class="{'search-item-select': index === selectIndex}">
            <span class="icon-s">:</span> {{item.label}}    <span style="" class="content-remark">{{item.remark}}</span>
          </div>
        </div>
        <div class="search-value" v-if="valueShow && valueList.length" v-my-loading="valueListInfo.loading">
          <!--非枚举类型-->
          <div
            v-if="searchBoxType!== 'enum'"
            class="select-value-box">
            <div v-for="(item, index) in valueList" @click="selectValue(item)"  @mouseenter="selectIndex = index" :key="index" class="search-item" :ref="'search-item' + index" :class="{'search-item-select': index === selectIndex}">
              <span class="icon-v">V</span> {{item}}    <span style="margin-left: 30px" class="content-remark">{{item.remark}}</span>
            </div>
            <div v-if="valueListInfo.total > oldValueList.length" class="search-item" :ref="'search-item' + valueList.length" :class="{'search-item-select': selectIndex === valueList.length}" style="min-height: 28px">
              正在加载...
            </div>
          </div>
          <!--枚举类型-->
          <div v-else infinite-scroll-disabled="disabled">
            <div v-for="(item, index) in valueList" @click="selectValue(item.label)"  @mouseenter="selectIndex = index" :key="index" class="search-item" :ref="'search-item' + index" :class="{'search-item-select': index === selectIndex}">
              <span class="icon-v">V</span> {{item.label}}    <span style="margin-left: 30px" class="content-remark">{{item.remark}}</span>
            </div>
          </div>
        </div>
      </div>
    </el-popover>
    <el-dialog title="编辑筛选" class="no-transform-dialog" :visible.sync="dialogShow" @close="dialogClose" :append-to-body="false" :modal-append-to-body="false" :destroy-on-close="true">
      <el-form ref="tagEdit" v-model="editDialogObj" v-if="dialogShow">
        <el-form-item prop="key" title="key">
          <el-select prop="key" v-model="editDialogObj.name" size="small">
            <el-option v-for="item in oldSearchList" :value="item.name" :label="$t(item.i18n)" :key="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="symbol" title="symbol" size="small">
          <el-select v-model="editDialogObj.symbol">
            <el-option :value="1" label="属于"></el-option>
            <el-option :value="2" label="不属于"></el-option>
            <el-option :value="3" label="模糊匹配"></el-option>
            <el-option :value="4" label="反向模糊匹配"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="value">
          <el-select
            v-if="editDialogObj.type!=='enum'"
            size="small"
            v-model="editDialogObj.value"
            :placeholder="''"
            multiple
            filterable
            allow-create
            default-first-option
            :filter-method="dialogValueListSet"
            v-loadMore="{
              load: dialogValueListLoad,
              hasMore: valueListInfo.total > valueList.length,
              dom: '.el-select-dropdown .el-select-dropdown__wrap'
            }"
            ref="dialogValueSelect"
          >
            <el-option
              v-for="(item, index) in valueList"
              :key="index"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
          <el-select
            v-if="editDialogObj.type == 'enum'"
            size="small"
            :placeholder="''"
            v-model="editDialogObj.realValue"
            multiple
            filterable
            allow-create
            default-first-option
            :filter-method="dialogValueListSet"
            v-loadMore="{
              load: dialogValueListLoad,
              hasMore: false,
              dom: '.el-select-dropdown .el-select-dropdown__wrap'
            }"
            ref="dialogValueSelect"
          >
            <el-option
              v-for="(item, index) in valueList"
              :key="index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveTag">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import searchBoxInfo from './searchBoxInfo'

export default {
  name: 'searchBox',
  mixins: [searchBoxInfo],
  props: {
    searchMsg: {}, // 默认搜索条件
    from: {}, // 来自那个页面
    // inTransform: {}
    position: {}, // 底弹窗页面
    targetTab: {} // 底弹窗页面 所选择的
  },
  data () {
    return {
      inputWidth: 400,
      visible: false, // 显示下拉框
      searchBoxType: '', // 查询接口的 type 和name参数
      searchStr: '', // input 的内容
      oldSearchStr: '', // 上一次的内容
      searchList: [], // 搜索条件列表
      oldSearchList: [], // 所有搜索条件列表
      selectArr: [], // 已被选择的条件
      key: '', // 当前被选中的 key
      symbol: false, // 当前被选中的 symbol
      selectSymbolValue: '', // 当前被选中的 symbol 的值
      value: '', // 当前被选中的 value
      keyShow: false, // key 的下拉
      symbolShow: false, // symbol 的下拉 显示根据key的类型 自定义的不包含 大于小于
      valueShow: false, // value 的下拉
      inputReadonly: false,
      dialogObjValueList: [],
      selectIndex: -1, // 当前选择的选项
      oldSelectIndex: -1, // 上一次选择的选项
      blurTimer: null,
      valueList: [],
      oldValueList: [],
      symbolList: [],
      editTagIndex: '',
      dialogStr: '',
      dialogSraechStr: '',
      editTagObj: {}, // 保存一份编辑的备份数据
      editDialogObj: {
        symbol: '',
        value: [],
        i18n: '',
        name: '',
        realValue: []
      },
      dialogShow: false,
      oldSymbolList: [
        {
          label: '=',
          value: '=',
          remark: '等于'
        },
        {
          label: '≠',
          value: '≠',
          remark: '不等于'
        },
        {
          label: '>=',
          value: '>=',
          remark: '大于等于'
        },
        {
          label: '<=',
          value: '<=',
          remark: '小于等于'
        },
        {
          label: '>',
          value: '>',
          remark: '大于'
        },
        {
          label: '<',
          value: '<',
          remark: '小于'
        },
        {
          label: 'wildcard',
          value: 'wildcard',
          remark: '模糊匹配'
        },
        {
          label: 'not wildcard',
          value: 'not wildcard',
          remark: '反向模糊匹配'
        }
        // {
        //   label: 'exist',
        //   value: 'exist',
        //   remark: '存在'
        // },
        // {
        //   label: 'not exist',
        //   value: 'not exist',
        //   remark: '不存在'
        // }
      ],
      keyword: [0, 1, 6, 7, 8, 9],
      text: [0, 1, 6, 7, 8, 9],
      number: [0, 1, 2, 3, 4, 5, 8, 9],
      enum: [0, 1],
      keywordLoad: false,
      valueListInfo: {
        pageNo: 1,
        pageSize: 20,
        total: 0,
        loading: false
      }
    }
  },
  mounted () {
    this.keywordLoad = true
    this.initSelectArr()
  },
  methods: {
    /*
     * 键盘事件需要处理各种情况
     * 1. 删除删完后 逐一删除已被选择的条件 // keydown处理
     * 2. 输入:号后 改为选择下拉 keyup处理
     * 3. 冒号不是最后一个 显示value下拉(value 下拉是否显示根据当前key的类型) keyup处理
     * 4. 回车后 新增条件 keyup处理
     * 5. 方向键 上下切换item
     * 6. 回车键 选择
     * */
    keypress (e) {
      // console.log(e, 'keypress')
    },
    keydown (e) {
      // 1 删除
      if (e.keyCode == 8 && !this.searchStr && this.selectArr.length) {
        this.selectArr.pop()
        this.emitSearch()
      } else if (e.keyCode == 8) {
        // console.log(this.oldSearchStr, this.searchStr)
      }
      // 5
      if (e.keyCode == 38) { // 向上
        if (this.selectIndex == -1 || this.selectIndex == 0) return
        this.selectIndex--
        this.scroll()
      }
      if (e.keyCode == 40 && (this.keyShow || this.valueShow || this.symbolShow)) { // 向下
        if (this.keyShow && this.selectIndex == this.searchList.length - 1) {
          return
        }
        if (this.symbolShow && this.selectIndex == this.symbolList.length - 1) {
          return
        }
        if (this.valueShow && this.valueListInfo.total > this.valueList.length && this.selectIndex != this.valueList.length) {
          this.selectIndex++
          this.scroll()
          return
        }
        if (this.valueShow && (this.selectIndex == this.valueList.length - 1 || this.selectIndex == this.valueList.length)) {
          return
        }
        this.selectIndex++
        this.scroll()
      }
      // this.oldSearchStr = this.searchStr
    },
    keyup (e) {
      // 6
      if (e.keyCode == 13 && (this.keyShow || this.valueShow || this.symbolShow)) {
        // 选择对应条件
        setTimeout(() => {
          if (this.keyShow) {
            if (this.selectIndex === -1) {
              this.emitSearch()
            } else {
              this.selectKey(this.searchList[this.selectIndex] || { name: this.searchStr })
            }
          } else if (this.symbolShow) {
            this.selectSymbol(this.symbolList[this.selectIndex])
          } else if (this.valueShow) {
            if (this.valueList[this.selectIndex]) {
              if (this.searchBoxType === 'enum') {
                this.selectValue(this.valueList[this.selectIndex].label)
              } else {
                this.selectValue(this.valueList[this.selectIndex])
              }
            } else if (this.selectIndex == this.valueList.length) {
              this.valueListLoad()
            } else {
              this.addSelectArr(this.searchStr)
              this.searchStr = ''
              this.contentShow()
              this.symbol = false
              this.key = ''
            }
          }
        }, 100)
        this.$refs.searchStr.focus()
        return
      }
      // 4
      const index = this.searchStr.indexOf(':')
      if (e.keyCode == 13 && index !== -1 && this.symbol) {
        this.addSelectArr(this.searchStr)
        this.searchStr = ''
        this.contentShow('key')
        this.symbol = false
      }
    },
    selectKey (item) {
      console.log(item)
      this.key = item.name
      this.searchStr = this.$t(item.i18n || item.name) + ':'
      this.contentShow('symbol')
      this.$refs.searchStr.focus()
      this.setSymBolList()
    },
    searchInputFocus () { // 根据input的内容显示对应的下拉框
      clearTimeout(this.blurTimer)
      this.blurTimer = null
      const index = this.searchStr.indexOf(':')
      this.visible = true
      if (index === -1) {
        this.symbol = false
        this.contentShow('key')
      } else if ((index == this.searchStr.length - 1) && !this.symbol) {
        this.contentShow('symbol')
      } else {
        this.symbol = true
        this.setValueList()
        this.contentShow('value')
      }
    },
    selectSymbol (item) {
      this.symbol = true
      if (!item) {
        this.selectSymbolValue = '='
        this.addSelectArr(this.searchStr)
        this.searchStr = ''
        this.contentShow()
        this.symbol = false
        this.key = ''
        return
      }
      this.selectSymbolValue = item.value
      switch (item.value) {
        case '=' :
          this.$refs.searchStr.focus()
          this.inputEnd()
          break
        case '≠' :
          if (this.searchBoxType === 'number') {
            this.searchStr += '-'
          } else {
            this.searchStr = '-' + this.searchStr
          }
          this.$refs.searchStr.focus()
          break
        case '>=' :
          this.searchStr = this.searchStr + '>='
          this.$refs.searchStr.focus()
          break
        case '<=' :
          this.searchStr = this.searchStr + '<='
          this.$refs.searchStr.focus()
          break
        case '>' :
          this.searchStr = this.searchStr + '>'
          this.$refs.searchStr.focus()
          break
        case '<' :
          this.searchStr = this.searchStr + '<'
          this.$refs.searchStr.focus()
          break
        case 'wildcard' :
          this.searchStr = '*' + this.searchStr
          this.$refs.searchStr.focus()
          break
        case 'not wildcard' :
          this.searchStr = '-*' + this.searchStr
          this.$refs.searchStr.focus()
          break
        case 'exist' :
          this.selectValue('*')
          this.$refs.searchStr.focus()
          break
        case 'not exist' :
          this.searchStr = '-' + this.searchStr + '*'
          this.selectValue('*')
          this.$refs.searchStr.focus()
          break
      }
      this.setValueList()
      this.contentShow('value')
    },
    delSymbol () {
      const length = this.searchStr.length
      switch (this.selectSymbolValue) {
        case '=' :
          this.$refs.searchStr.focus()
          break
        case '≠' :
          if (this.searchBoxType !== 'number') {
            if (this.searchStr[0] !== '-') {
              return
            }
            this.searchStr = this.searchStr.substring(1)
          }
          this.$refs.searchStr.focus()
          break
        case '>=' :
          // this.searchStr = this.searchStr + '>='
          // this.$refs.searchStr.focus()
          break
        case '<=' :
          // this.searchStr = this.searchStr + '<='
          // this.$refs.searchStr.focus()
          break
        case '>' :
          // this.searchStr = this.searchStr + '>'
          // this.$refs.searchStr.focus()
          break
        case '<' :
          // this.searchStr = this.searchStr + '<'
          // this.$refs.searchStr.focus()
          break
        case 'wildcard' :
          this.searchStr = this.searchStr.substring(1)
          if (this.searchStr[0] !== '*') {
            return
          }
          this.$refs.searchStr.focus()
          break
        case 'not wildcard' :
          if (this.searchStr[0] === '-') {
            this.searchStr = this.searchStr.substring(1)
          }
          if (this.searchStr[0] === '*') {
            this.searchStr = this.searchStr.substring(1)
          }
          this.$refs.searchStr.focus()
          break
        case 'exist' :
          // this.selectValue('*')
          // this.$refs.searchStr.focus()
          break
        case 'not exist' :
          if (this.searchStr[0] === '-') {
            this.searchStr = this.searchStr.substring(1)
          }
          // this.searchStr = '-' + this.searchStr + '*'
          // this.selectValue('*')
          this.$refs.searchStr.focus()
          break
      }
      this.selectSymbolValue = ''
    },
    selectValue (value) {
      const arr = this.searchStr.split(':')
      this.searchStr = arr[0] + ':' + value
      this.addSelectArr(this.searchStr)
      this.searchStr = ''
      this.contentShow()
      this.symbol = false
      this.key = ''
    },
    focusSearchInput () {
    },
    contentShow (key) {
      this.keyShow = false // key 的下拉
      this.symbolShow = false // symbol 的下拉
      this.valueShow = false // value 的下拉
      if (key === 'symbol') {
        this.setSymBolList(this.key)
        this.symbolShow = true
      }
      if (key === 'key') {
        this.keyShow = true
      }
      if (key === 'value') {
        this.valueShow = true
      }
      const keyStr = this.searchStr.split(':')[0]
      if (keyStr[0] === '-' && keyStr[1] === '*') {
        const findItem = this.oldSearchList.find(item => this.$t(item.i18n) == keyStr.substring(2))
        if (findItem) {
          this.key = findItem.name
        } else {
          this.key = keyStr.substring(2)
        }
      } else if (keyStr[0] === '-' || keyStr[0] === '*') {
        const findItem = this.oldSearchList.find(item => this.$t(item.i18n) == keyStr.substring(1))
        if (findItem) {
          this.key = findItem.name
        } else {
          this.key = keyStr.substring(1)
        }
      } else {
        const findItem = this.oldSearchList.find(item => this.$t(item.i18n) == keyStr)
        if (findItem) {
          this.key = findItem.name
        } else {
          this.key = keyStr
        }
      }
      // console.log(this.key)
      if (key === 'symbol') { // 处理valueList
        // this.setValueList('')
        // const findItem = this.oldSearchList.find(item => item.name === this.key)
        // if (findItem && findItem.type !== 'input') {
        //   // this.inputReadonly = true
        //   this.oldValueList = this[findItem.label]
        // } else {
        //   this.oldValueList = []
        // }
      }
    },
    inputSearchStr () {
      this.selectIndex = -1
      const arr = this.searchStr.split(':')
      if (arr.length > 1) {
        if (this.searchBoxType === 'enum') {
          this.valueList = this.oldValueList.filter(item => item.label.indexOf(arr[1]) !== -1)
        }
        if (this.searchBoxType !== 'keyword') {
          return
        }
        this.setValueList(arr[1])
      } else {
        this.setSearchList(arr[0])
      }
    },
    changeSearchStr () {
      console.log(this.searchStr, 'this.oldSelectIndex', this.oldSearchStr)
      // const arr = this.searchStr.split(':')
      this.blurTimer = setTimeout(() => {
        if (this.searchStr !== this.oldSearchStr) {
          this.oldSearchStr = this.searchStr
          this.emitSearch()
        }
      }, 100)
    },
    setSearchList (str) {
      this.selectIndex = -1
      if (!str) {
        this.searchList = this.$lodash.cloneDeep(this.oldSearchList)
        return
      }
      this.searchList = this.oldSearchList.filter(item => this.$t(item.i18n).indexOf(str) !== -1)
    },
    setSymBolList (str) {
      let findItemType = 'text'
      const findItem = this.oldSearchList.find(item => item.name === this.key)
      if (findItem) {
        findItemType = findItem.type || 'keyword'
      }
      if (findItemType === 'enum') {
        // this.inputReadonly = true
      }
      this.searchBoxType = findItemType
      this.selectIndex = -1
      this.symbolList = this.oldSymbolList.filter((item, index) => {
        if (!this[findItemType]) {
          return true
        }
        return this[findItemType].indexOf(index) !== -1
      })
    },
    setValueList () {
      const key = this.dialogStr || this.key
      const findItem = this.oldSearchList.find(item => this.$t(item.i18n) == key || key == item.name)
      this.selectIndex = -1
      this.valueShow = false
      this.searchBoxType = ''
      if (findItem.type === 'enum') {
        this.oldValueList = []
        this.valueList = []
        this.valueListInfo.pageNo = 0
        this.valueListInfo.total = -1
        this.selectEnum(findItem)
        this.searchBoxType = findItem.type
        return
      }
      if (!findItem || findItem.type !== 'keyword') {
        this.valueList = []
        return
      } else {
        this.searchBoxType = findItem.type
      }
      this.oldValueList = []
      this.valueList = []
      this.valueListInfo.pageNo = 0
      this.valueListInfo.total = -1
      if (this.dialogStr) {
        this.dialogValueListLoad()
      } else {
        this.valueListLoad('')
      }
    },
    valueListLoad () {
      this.valueListInfo.pageNo++
      this.valueListInfo.loading = true
      let name = ''
      if (this.key) {
        name = this.key
      } else {
        name = this.searchStr.split(':')[0]
      }
      const params = {
        name: name,
        text: this.searchStr.split(':')[1],
        pageNo: this.valueListInfo.pageNo,
        pageSize: this.valueListInfo.pageSize
      }
      this.$get('/fulltext/keyword', params).then(res => {
        this.valueListInfo.loading = false
        if (res.code == 200) {
          this.oldValueList = [...this.oldValueList, ...res.data.list]
          this.valueList = [...this.oldValueList]
          this.valueListInfo.total = res.data.total
          // if (!this.valueList.length) {
          //   this.valueShow = false
          // } else {
          //   this.valueShow = true
          // }
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    dialogValueListSet (str) {
      if (this.editDialogObj.type !== 'enum') {
        this.oldValueList = []
      }
      this.valueList = []
      this.valueListInfo.pageNo = 0
      this.valueListInfo.total = -1
      this.dialogSraechStr = str
      this.dialogValueListLoad()
    },
    dialogValueListLoad () {
      if (this.editDialogObj.type == 'enum') {
        this.valueList = this.oldValueList.filter(item => item.label.indexOf(this.dialogSraechStr) !== -1)
        return
      }
      this.valueListInfo.pageNo++
      this.valueListInfo.loading = true
      const params = {
        name: this.dialogStr,
        text: this.dialogSraechStr,
        pageNo: this.valueListInfo.pageNo,
        pageSize: this.valueListInfo.pageSize
      }
      this.$get('/fulltext/keyword', params).then(res => {
        this.valueListInfo.loading = false
        if (res.code == 200) {
          this.oldValueList = [...this.oldValueList, ...res.data.list]
          this.valueList = [...this.oldValueList]
          this.valueListInfo.total = res.data.total
          // if (!this.valueList.length) {
          //   this.valueShow = false
          // } else {
          //   this.valueShow = true
          // }
        } else {
          this.$message.error(res.msg || res.error)
        }
      })
    },
    addSelectArr (str) {
      const key = str.split(':')[0]
      const value = str.split(':')[1]
      let realValue = value // 主要用于枚举类型 value存的是 i18n realValue存的是查询的值 非枚举类型 value 和 realValue一样
      console.log(this.searchBoxType)
      if (this.searchBoxType === 'enum') {
        const findItem = this.oldValueList.find(item => item.label == value)
        console.log(findItem)
        realValue = findItem ? findItem.value : value
      }
      const findItem = this.selectArr.find(item => item.i18n === key)
      const findKeyItem = this.oldSearchList.find(item => item.name === this.key)
      if (!findKeyItem) {
        this.setSearchList()
        this.oldSearchStr = ''
        this.searchStr = ''
        return
      }
      let name = this.key
      if (key[0] === '-' && key[1] === '*') {
        name = '-*' + this.key
      } else if (key[0] === '-' || key[0] === '*') {
        name = key[0] + this.key
      }
      if (findItem) {
        if (findItem.value.indexOf(value) === -1) {
          findItem.value.push(value)
          findItem.realValue.push(realValue)
        }
      } else {
        this.selectArr.push({
          i18n: key,
          name: name,
          realValue: [realValue],
          value: [value]
        })
      }
      this.setSearchList()
      this.emitSearch()
      this.inputReadonly = false
      // todo 更新路径参数
      if (this.targetTab) {
        const params = this.$lodash.cloneDeep(this.$route.query)
        Object.keys(params).forEach(key => {
          if (!params[key]) {
            delete params[key]
          }
        })
        params.bottomSelectArr = this.$lodash.cloneDeep(this.selectArr)
        this.$router.replace({ path: this.$route.path, query: params }).catch(err => {})
      }
      this.oldSearchStr = ''
      // todo 更新历史记录
    },
    emitSearch () {
      this.$nextTick(() => {
        const obj = {}
        this.selectArr.forEach(item => {
          obj[item.name] = item.realValue
        })
        if (this.searchStr) {
          obj.q = this.searchStr
          this.oldSearchStr = this.searchStr
        } else {
          obj.q = ''
          this.oldSearchStr = ''
        }
        this.$emit('search', obj)
      })
    },
    removeSelectArr (index) {
      this.selectArr.splice(index, 1)
      this.emitSearch()
    },
    removeTagValue (tIndex, key) {
      const findItem = this.selectArr.find(item => item.i18n === key)
      findItem.value.splice(tIndex, 1)
      findItem.realValue.splice(tIndex, 1)
      this.emitSearch()
    },
    editTag (tag, index) {
      this.editTagIndex = index
      this.editTagObj = this.$lodash.cloneDeep(tag)
      this.dialogSraechStr = ''
      this.dialogShow = true
      console.log(tag, this.editTagObj)
      this.editDialogObj.value = this.editTagObj.value
      this.editDialogObj.realValue = this.editTagObj.realValue
      this.editDialogObj.name = this.editTagObj.name
      this.editDialogObj.i18n = this.editTagObj.i18n
      this.editTagObj.type = ''
      const keyStr = this.editTagObj.name
      if (keyStr[0] === '-' && keyStr[1] === '*') {
        this.editDialogObj.name = this.editDialogObj.name.substring(2)
        this.editDialogObj.symbol = 4
      } else if (keyStr[0] === '-') {
        this.editDialogObj.name = this.editDialogObj.name.substring(1)
        this.editDialogObj.symbol = 2
      } else if (keyStr[0] === '*') {
        this.editDialogObj.name = this.editDialogObj.name.substring(1)
        this.editDialogObj.symbol = 3
      } else {
        this.editDialogObj.symbol = 1
      }
      const findItem = this.oldSearchList.find(item => this.editDialogObj.name == item.name)
      this.editDialogObj.type = findItem.type
      if (findItem.type === 'enum') {
        this.oldValueList = []
        this.valueList = []
        this.valueListInfo.pageNo = 0
        this.valueListInfo.total = -1
        this.selectEnum(findItem)
        this.contentShow('')
        this.dialogStr = this.editDialogObj.name
        return
      }
      // const findItem = this.oldSearchList.find(item => item.name == tag.key)
      // if (findItem && findItem.type !== 'input') {
      //   // this.inputReadonly = true
      //   this.dialogObjValueList = this[findItem.label]
      // } else {
      //   this.dialogObjValueList = []
      // }
      this.contentShow('')
      this.dialogStr = this.editDialogObj.name
      this.setValueList()
    },
    dialogClose () {
      this.dialogShow = false
      this.dialogStr = ''
      this.dialogSraechStr = ''
    },
    saveTag () {
      /*
      * 成功修改时 需要判断 成功修改的key 是否已存在 如果存在 需要合并 去重
      * */
      this.dialogShow = false
      this.searchBoxType = ''
      this.dialogStr = ''
      this.dialogSraechStr = ''
      this.dialogObjValueList = []
      const findSearch = this.oldSearchList.find(item => this.editDialogObj.name == item.name)
      switch (this.editDialogObj.symbol) {
        case 1:
          this.editDialogObj.i18n = this.$t(findSearch.i18n)
          this.editDialogObj.name = this.editDialogObj.name + ''
          break
        case 2:
          this.editDialogObj.i18n = '-' + this.$t(findSearch.i18n)
          this.editDialogObj.name = '-' + this.editDialogObj.name
          break
        case 3:
          this.editDialogObj.i18n = '*' + this.$t(findSearch.i18n)
          this.editDialogObj.name = '*' + this.editDialogObj.name
          break
        case 4:
          this.editDialogObj.i18n = '-*' + this.$t(findSearch.i18n)
          this.editDialogObj.name = '-*' + this.editDialogObj.name
          break
      }
      if (this.editDialogObj.type === 'enum') { // 处理枚举类型
        // this.editDialogObj.realValue = this.editTagObj.value
        this.editTagObj.value = this.editTagObj.realValue.map(item => {
          return this.oldValueList.find(i => i.value === item).label
        })
      } else {
        this.editDialogObj.realValue = this.editDialogObj.value
      }
      const findItem = this.selectArr.find(item => item.name === this.editDialogObj.name)
      if (findItem && findItem.name != this.editTagObj.name) {
        this.selectArr.splice(this.editTagIndex, 1)
        findItem.value = findItem.value.concat(this.editDialogObj.value)
        findItem.value = findItem.value.filter(function (item, index) {
          return findItem.value.indexOf(item) === index // 因为indexOf 只能查找到第一个
        })
      } else {
        this.selectArr[this.editTagIndex] = this.$lodash.cloneDeep(this.editDialogObj)
      }
      this.emitSearch()
    },
    querySearch (queryString, cb) {
      const restaurants = this.oldSearchList.map(item => { return { value: this.$t(item.i18n || item.name) } })
      const results = queryString ? restaurants.filter(name => name.value.indexOf(queryString) !== -1) : restaurants
      cb(results)
    },
    handleSelect () {

    },
    inputEnd () { // 光标最后一位
      const ele = this.$refs.searchStr.$el
      const obj = ele.getElementsByClassName('el-input__inner')[0]
      obj.focus()
      const len = obj.value.length
      if (document.selection) {
        const sel = obj.createTextRange()
        sel.moveStart('character', len); sel.collapse(); sel.select()
      } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
        setTimeout(() => {
          obj.selectionStart = obj.selectionEnd = len
        }, 100)
      }
    },
    initSelectArr () {
      // console.log(this.from)
      // console.log(this.inTransform)
      // console.log(this.position)
      // console.log(this.targetTab)
      // 初始化已选择的条件
      const type = this.calcType()
      this.$get(`/fulltext/metadata/${type}`).then(res => {
        if (res.code == 200) {
          this.searchList = res.data.list || []
          this.oldSearchList = res.data.list || []
        } else {
          this.$message.error(res.msg || res.error)
        }
        this.keywordLoad = false
      })
      // todo 初始化已选择的参数
      // 普通表格页面
      if (!this.targetTab) {
        this.selectArr = this.$router.query ? this.$router.query.selectArr : []
      }
      // 底部弹窗页面
      if (this.targetTab) {
        this.selectArr = this.$router.query ? this.$router.query.bottomSelectArr : []
      }
      this.emitSearch()
    },
    calcType () { // 处理各个页面的from targetTab 确定查询的type
      if (this.from && !this.targetTab) {
        switch (this.from) {
          case 'alertMessage':
            return 'alertmessage'
        }
      }
      if (this.targetTab) {
        switch (this.targetTab) {
          case 'alertMessageTab':
            return 'alertmessage'
        }
      }
    },
    clickOutside () { // 点击页面其他地方触发
      this.visible = false
      this.keyShow = false // key 的下拉
      this.symbolShow = false // symbol 的下拉
      this.valueShow = false // value 的下拉
      this.inputWidth = 400
      // this.searchStr = ''
      this.searchList = this.$lodash.cloneDeep(this.oldSearchList)
      this.symbolList = []
      this.valueList = []
      this.inputReadonly = false
      // this.emitSearch()
    },
    scroll () { // 键盘上下选择 显示已选择的选项
      const ulBox = this.$refs.list
      let liBox = this.$refs['search-item' + this.selectIndex]
      if (!liBox) {
        return
      } else if (liBox[0]) {
        liBox = liBox[0]
      }
      const liHeight = liBox.clientHeight
      const height = ulBox.clientHeight
      const offsetTop = liBox.offsetTop - ulBox.offsetTop
      const scrollTop = ulBox.scrollTop
      // liBox.focus()
      if (offsetTop - scrollTop < 0) {
        ulBox.scrollTop = offsetTop
      } else if (offsetTop - scrollTop >= height - liHeight) {
        ulBox.scrollTop = offsetTop - height + liHeight
      }
    },
    selectEnum (findItem) { // 选择对应的枚举类型
      console.log(findItem)
      switch (findItem.name) {
        case 'priority':
          this.valueList = [...this.severity]
          this.oldValueList = [...this.severity]
          break
        default:
          this.valueList = []
      }
    }
  },
  watch: {
    // selectIndex: {
    //   immediate: true,
    //   deep: true,
    //   handler (n, o) {
    //     console.log(n, o)
    //     this.oldSelectIndex = o
    //     if (typeof o === 'undefined') {
    //       this.oldSelectIndex = -1
    //     }
    //   }
    // },
    searchStr: {
      handler (n, o) {
        // this.oldSearchStr = o
        // 2 3
        const index = this.searchStr.indexOf(':')
        if (index === -1) {
          this.symbol = false
          this.inputReadonly = false
          this.contentShow('key')
        } else if (index === this.searchStr.length - 1 && !this.symbol) {
          this.contentShow('symbol')
        } else {
          this.symbol = true
          this.contentShow('value')
        }
        if (n.indexOf(':') === -1 && o.indexOf(':') !== -1) {
          this.symbol = false
          this.delSymbol()
        }
        // if (n.indexOf(':'))
      }
    }
  }
}
</script>
