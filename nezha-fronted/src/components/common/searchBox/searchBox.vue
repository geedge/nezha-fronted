<template>
  <div id="nz-search-box" v-clickoutside="clickOutside">
    <el-popover
      placement="bottom-start"
      :width="inputWidth"
      trigger="click"
      ref="historyPopover"
      style="display: inline-block;vertical-align: middle"
      :append-to-body="false"
    >
      <div slot="reference" class="history-icon" @click="historyFocus">
        <el-input ref="history" style="display: none" @keydown.native="keydown"/>
        <i class="nz-icon nz-icon-time"/>
      </div>
      <div class="history-content-box">
        <div class="history-content-header">{{$t('search.recentSearch')}} <i class="nz-icon nz-icon-close" @click="closeHistoryPopover"/></div>
        <div class="search-content history-content" v-if="historyArr.length">
          <div
            v-for="(item, index) in historyArr"
            @mouseenter="historyIndex = index"
            :key="'search-item-history' + index"
            class="search-item text-ellipsis"
            :ref="'search-item-history' + index"
            :class="{'search-item-select': index === historyIndex}"
            :title="renderHistoryTitle(item)"
            @click="selectHistory(item, index)"
          >
          <span  v-for="(tag, tIndex) in item" :key="index + '-' +tIndex" style="margin-right: 3px">
            <span>{{tag.i18n}}:[</span>
            <span v-for="(value, vIndex) in tag.value" :key="'history-item-'+index + '-' +tIndex+'-' + vIndex">"{{value}}"<span v-if="tag.value.length - 1 > vIndex">,</span></span>]
          </span>
          </div>
        </div>
        <div v-else class="search-history-box-noData">{{$t('overall.noData')}}</div>
      </div>
    </el-popover>
    <el-popover
      placement="bottom-start"
      trigger="manual"
      :popper-class="'search-content-box'"
      style="display: inline-block;width: calc(100% - 66px);vertical-align: middle;position: relative;"
      :append-to-body="false"
      v-model="visible">
      <div  slot="reference" class="search-box-input" tabindex="-99" @focus="focusSearchInput" ref="searchBoxInput">
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
                <div v-for="(tag, tIndex) in item.value" :key="tIndex">
                  <span  class="search-box-tag" @click="editTag(item, index)">
                    {{item.i18n}} :
                    <span  style="margin-left: 4px">{{tag}}</span>
                    <i class="nz-icon nz-icon-close" @click.stop="removeTagValue(tIndex, item.i18n)"/>
                  </span>
                </div>
              </div>
              <span slot="reference" :key="index" class="search-box-tag" @click.stop="editTag(item, index)">
                {{item.i18n}} :
                <span v-if="item.value.length === 1" style="margin-left: 4px">{{item.value[0]}}</span>
                <span v-else  style="margin-left: 4px">{{item.value.length}} {{$t('items')}}</span>
                <i class="nz-icon nz-icon-close" @click.stop="removeSelectArr(index)"/>
              </span>
            </el-popover>
          </div>
          <el-input
            size="mini"
            v-model="searchStr"
            @focus="searchInputFocus"
            @keydown.native="keydown"
            @blur="changeSearchStr"
            @keyup.native="keyup"
            ref="searchStr"
            @keypress.native="keypress"
            :readonly="inputReadonly"
            @input="inputSearchStr"
            clearable
          >
          </el-input>
        </div>
        <div class="col-line"></div>
      </div>
      <div
        class="search-content"
        id="search-box-scroll"
        ref="list"
        infinite-scroll-disabled="disabled"
        v-loadMore="{
           load: valueListLoad,
           hasMore: (valueShow && valueList.length)&&(valueListInfo.total > valueList.length),
        }"
      >
        <div class="search-key" v-if="keyShow && searchList.length" v-my-loading="keywordLoad">
          <div v-for="(item, index) in searchList" @click="selectKey(item)" @mouseenter="selectIndex = index" :key="index" class="search-item" :ref="'search-item' + index" :class="{'search-item-select': index === selectIndex}">
            <span class="icon-k">K</span>  <span :title="$t(item.i18n || item.name)" class="search-item-content text-ellipsis">{{$t(item.i18n || item.name)}}</span> <span class="content-remark text-ellipsis" :title="item.type">{{item.type}}</span>
          </div>
        </div>
        <div class="search-symbol" v-else-if="symbolShow" >
          <div v-for="(item, index) in symbolList" @click="selectSymbol(item)"  @mouseenter="selectIndex = index" :key="index" class="search-item" :ref="'search-item' + index" :class="{'search-item-select': index === selectIndex}">
            <span class="icon-s">:</span> <span :title="item.label" class="search-item-content text-ellipsis">{{item.label}}</span>    <span class="content-remark text-ellipsis" :title="item.remark">{{item.remark}}</span>
          </div>
        </div>
        <div class="search-value" v-else-if="valueShow && valueList.length" v-my-loading="valueListInfo.loading">
          <!--非枚举类型-->
          <div
            v-if="searchBoxType!== 'enum'"
            class="select-value-box">
            <div v-for="(item, index) in valueList" @click="selectValue(item)"  @mouseenter="selectIndex = index" :key="index" class="search-item" :ref="'search-item' + index" :class="{'search-item-select': index === selectIndex}">
              <span class="icon-v">V</span> <span :title="item" class="search-item-content text-ellipsis">{{item}} </span>   <span class="content-remark text-ellipsis" :title="item.remark">{{item.remark}}</span>
            </div>
            <div v-if="valueListInfo.total > oldValueList.length" class="search-item" :ref="'search-item' + valueList.length" :class="{'search-item-select': selectIndex === valueList.length}" style="min-height: 28px">
              正在加载...
            </div>
          </div>
          <!--枚举类型-->
          <div v-else infinite-scroll-disabled="disabled">
            <div v-for="(item, index) in valueList" @click="selectValue(item.label)"  @mouseenter="selectIndex = index" :key="index" class="search-item" :ref="'search-item' + index" :class="{'search-item-select': index === selectIndex}">
              <span class="icon-v">V</span> <span :title="item.label" class="search-item-content text-ellipsis">{{item.label}}</span>    <span style="margin-left: 30px" class="content-remark text-ellipsis" :title="item.remark">{{item.remark}}</span>
            </div>
          </div>
        </div>
        <div v-else class="search-item-title search-item-nodata" style="border-bottom: none">
          {{$t('overall.noDataAvailable')}}
        </div>
      </div>
      <div class="search-item-title">{{$t('searchBox.enterNext')}}</div>
    </el-popover>
    <span class="nz-icon-search-box">
      <i class="nz-icon nz-icon-search" @click="emitSearch"/>
    </span>
    <!--编辑暂未用到-->
    <el-dialog :title="$t('overall.edit')" class="no-transform-dialog" :visible.sync="dialogShow" @close="dialogClose" :append-to-body="false" :modal-append-to-body="false" :destroy-on-close="true">
      <el-form ref="tagEdit" v-model="editDialogObj" v-if="dialogShow">
        <el-form-item prop="key" title="key">
          <el-select prop="key" v-model="editDialogObj.name" size="small" :popper-append-to-body="false">
            <el-option v-for="item in oldSearchList" :value="item.name" :label="$t(item.i18n)" :key="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="symbol" title="symbol" size="small" >
          <el-select v-model="editDialogObj.symbol" :popper-append-to-body="false">
            <el-option :value="1" :label="$t('searchBox.belong')"></el-option>
            <el-option :value="2" :label="$t('searchBox.notbelong')"></el-option>
            <el-option :value="3" :label="$t('searchBox.wildcard')"></el-option>
            <el-option :value="4" :label="$t('searchBox.notWildcard')"></el-option>
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
            :popper-append-to-body="false"
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
            allow-create :maxlength="64"
            default-first-option
            :filter-method="dialogValueListSet"
            v-loadMore="{
              load: dialogValueListLoad,
              hasMore: false,
              dom: '.el-select-dropdown__wrap .el-scrollbar__wrap'
            }"
            :popper-append-to-body="false"
            ref="dialogValueSelect"
          >
            <el-option
              v-for="(item, index) in valueList"
              :key="'dialogValueSelect' + '-' + index"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="saveTag">{{$t('overall.save')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import searchBoxInfo from './searchBoxInfo'
import bus from '@/libs/bus'

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
      inputWidth: 380,
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
      historyIndex: -1,
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
          remark: this.$t('searchBox.equal')
        },
        {
          label: '≠',
          value: '≠',
          remark: this.$t('searchBox.unequal')
        },
        {
          label: '>=',
          value: '>=',
          remark: this.$t('searchBox.GTOET')
        },
        {
          label: '<=',
          value: '<=',
          remark: this.$t('searchBox.LTOET')
        },
        {
          label: '>',
          value: '>',
          remark: this.$t('searchBox.greater')
        },
        {
          label: '<',
          value: '<',
          remark: this.$t('searchBox.less')
        },
        {
          label: this.$t('searchBox.wildcard'),
          value: 'wildcard',
          remark: this.$t('searchBox.wildcard')
        },
        {
          label: this.$t('searchBox.notWildcard'),
          value: 'not wildcard',
          remark: this.$t('searchBox.notWildcard')
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
      },
      where: this.$route.path,
      historyArr: [] // 历史记录
    }
  },
  mounted () {
    this.keywordLoad = true
    this.initSelectArr()
    this.initHistory()
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
    historyFocus () {
      this.$refs.history.focus()
      this.visible = false
    },
    closeHistoryPopover () { // 关闭历史记录弹窗
      this.$refs.historyPopover.doClose()
    },
    renderHistoryTitle (item) {
      let str = ''
      item.forEach(tag => {
        str += this.$t(tag.code)
        str += ':'
        tag.value.forEach(value => {
          str += value + ','
        })
        str = str.substring(0, str.length - 1)
        str += '; '
      })
      return str
    },
    selectHistory (item, index) { // 选择历史记录后 更新顺序
      this.selectArr = item
      this.historyArr.splice(index, 1)
      this.historyArr.unshift(item)
      localStorage.setItem('nz-history-' + this.where, JSON.stringify(this.historyArr))
      this.closeHistoryPopover()
      this.emitSearch()
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
    setValueList: bus.debounce(function () {
      const key = this.dialogStr || this.key
      const findItem = this.oldSearchList.find(item => this.$t(item.i18n) == key || key == item.name)
      this.selectIndex = -1
      this.valueShow = false
      this.searchBoxType = ''
      this.contentShow('value')
      if (findItem.type === 'enum') {
        this.oldValueList = []
        this.valueList = []
        this.valueListInfo.pageNo = 0
        this.valueListInfo.total = -1
        const arr = this.selectEnum(findItem)
        this.valueList = [...arr]
        this.oldValueList = [...arr]
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
    }, 200),
    setValueListFn () {
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
        const arr = this.selectEnum(findItem)
        this.valueList = [...arr]
        this.oldValueList = [...arr]
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
      this.contentShow('')
      if (this.editDialogObj.type == 'enum') {
        this.valueList = this.oldValueList.filter(item => item.label.indexOf(this.dialogSraechStr) !== -1)
        return
      }
      if (this.editDialogObj.type != 'keyword') {
        this.valueList = []
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
      if (this.searchBoxType === 'enum') {
        const findItem = this.oldValueList.find(item => item.label == value)
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
      let symbol = ''
      if (key[0] === '-' && key[1] === '*') {
        symbol = '-*'
        name = '-*' + this.key
      } else if (key[0] === '-' || key[0] === '*') {
        symbol = key[0]
        name = key[0] + this.key
      }
      if (findItem) {
        if (findItem.value.indexOf(value) === -1) {
          findItem.value.push(value)
          findItem.realValue.push(realValue)
        }
      } else {
        this.selectArr.push({
          i18n: symbol + this.$t(findKeyItem.i18n),
          code: findKeyItem.i18n,
          name: name,
          realValue: [realValue],
          value: [value]
        })
      }
      this.setSearchList()
      this.emitSearch()
      this.inputReadonly = false
      // todo 更新路径参数 只更新底弹窗的 正常表格使用 body的参数
      if (this.targetTab) {
        const params = this.$lodash.cloneDeep(this.$route.query)
        Object.keys(params).forEach(key => {
          if (!params[key]) {
            delete params[key]
          }
        })
        params.bottomSelectArr = JSON.stringify(this.$lodash.cloneDeep(this.selectArr))
        this.$router.replace({ path: this.$route.path, query: params }).catch(err => {})
      }
      this.oldSearchStr = ''
      // todo 更新历史记录
      this.setHistoryArr()
      setTimeout(() => {
        this.visible = false
        this.$refs.searchStr.$el.scrollIntoView()
        this.$refs.searchStr.blur()
      })
    },
    emitSearch: bus.debounce(function () {
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
        this.visible = false
        this.$refs.searchStr.blur()
        this.$emit('search', obj)
      })
    }, 100),
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
      return false
      this.editTagIndex = index
      this.editTagObj = this.$lodash.cloneDeep(tag)
      this.dialogSraechStr = ''
      this.dialogShow = true
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
        const arr = this.selectEnum(findItem)
        this.valueList = [...arr]
        this.oldValueList = [...arr]
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
        this.editDialogObj.value = this.editDialogObj.realValue.map(item => {
          return this.oldValueList.find(i => i.value === item).label
        })
      } else {
        this.editDialogObj.realValue = this.editDialogObj.value
      }
      const findItem = this.selectArr.find(item => item.name === this.editDialogObj.name)
      if (findItem && findItem.name != this.editTagObj.name) {
        this.selectArr.splice(this.editTagIndex, 1)
        findItem.value = findItem.value.concat(this.editDialogObj.value)
        findItem.realValue = findItem.realValue.concat(this.editDialogObj.realValue)
        findItem.value = findItem.value.filter(function (item, index) {
          return findItem.value.indexOf(item) === index // 因为indexOf 只能查找到第一个
        })
        findItem.realValue = findItem.realValue.filter(function (item, index) {
          return findItem.realValue.indexOf(item) === index // 因为indexOf 只能查找到第一个
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
      // 初始化已选择的条件
      const type = this.calcType()
      this.$get(`/fulltext/metadata/${type}`).then(res => {
        if (res.code == 200) {
          let arr = res.data.list || []
          arr = arr.filter(item => item.show === '1')
          this.searchList = arr
          this.oldSearchList = arr
        } else {
          this.$message.error(res.msg || res.error)
        }
        this.keywordLoad = false
        this.renderSelectArr()
      })
      // todo 初始化已选择的参数
      // 普通表格页面
      if (!this.targetTab) {
        this.selectArr = this.$router.query ? this.$router.query.body : []
      }
      // 底部弹窗页面
      if (this.targetTab) {
        this.selectArr = this.$router.query ? this.$router.query.body : []
      }
      // this.emitSearch()
    },
    setHistoryArr () {
      this.historyArr.unshift(this.$lodash.cloneDeep(this.selectArr))
      if (this.historyArr.length > 20) {
        this.historyArr.pop()
      }
      localStorage.setItem('nz-history-' + this.where, JSON.stringify(this.historyArr))
    },
    initHistory () {
      if (this.position) {
        this.where = this.$route.path + this.position
      }
      const historyArr = localStorage.getItem('nz-history-' + this.where) ? JSON.parse(localStorage.getItem('nz-history-' + this.where)) : []
      historyArr.forEach(item => { // todo 后续还需要处理枚举类型的中英切换
        item.forEach((searchInfo) => {
          let str = ''
          const initialKey = searchInfo.i18n
          if (initialKey[0] === '-' && initialKey[1] === '*') {
            str = '-*'
          } else if (initialKey[0] === '-') {
            str = '-'
          } else if (initialKey[0] === '*') {
            str = '*'
          }
          searchInfo.i18n = str + this.$t(searchInfo.code)
        })
      })
      this.historyArr = historyArr
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
          case 'moduleAlertMessage':
          case 'endpointAlertMessage':
          case 'alertRuleAlertMessage':
            return 'alertmessage'
        }
      }
    },
    clickOutside () { // 点击页面其他地方触发
      this.visible = false
      this.$nextTick(() => {
        this.keyShow = false // key 的下拉
        this.symbolShow = false // symbol 的下拉
        this.valueShow = false // value 的下拉
        this.inputWidth = 400
        // this.searchStr = ''
        this.searchList = this.$lodash.cloneDeep(this.oldSearchList)
        this.symbolList = []
        this.valueList = []
        this.inputReadonly = false
      })
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
      switch (findItem.name) {
        case 'priority':
          return this.severity
        default:
          return []
      }
    },
    renderSelectArr () { // 将路由上方的 body参数回显
      let body = this.$route.query.body
      try {
        if (body) {
          body = JSON.parse(body)
          Object.keys(body).forEach(key => {
            let initialKey = key
            let str = ''
            if (initialKey[0] === '-' && initialKey[1] === '*') {
              initialKey = initialKey.substring(2)
              str = '-*'
            } else if (initialKey[0] === '-') {
              initialKey = initialKey.substring(1)
              str = '-'
            } else if (initialKey[0] === '*') {
              initialKey = initialKey.substring(1)
              str = '*'
            } else {
              initialKey = initialKey + ''
            }
            const findKeyItem = this.oldSearchList.find(item => item.name === initialKey)
            if (findKeyItem) {
              const realValue = this.$lodash.cloneDeep(body[key])
              let value = this.$lodash.cloneDeep(realValue)
              if (findKeyItem.type === 'enum') { // 枚举类型需要特殊处理
                value = this.enumRenderValue(findKeyItem, value)
              }
              this.selectArr.push({
                i18n: str + this.$t(findKeyItem.i18n),
                code: findKeyItem.i18n,
                name: key,
                realValue: realValue,
                value: value
              })
            }
          })
          // this.selectArr.forEach(item => {
          //   obj[item.name] = item.realValue
          // })
        }
      } catch (e) {

      }
    },
    enumRenderValue (searchInfo, realValue) { // 处理枚举类型的回显
      const arr = this.selectEnum(searchInfo)
      const value = realValue.map(item => {
        return arr.find(enumItem => enumItem.value === item).label
      })
      return value
    }
  },
  watch: {
    // selectIndex: {
    //   immediate: true,
    //   deep: true,
    //   handler (n, o) {
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
