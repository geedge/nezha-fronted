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
                <div v-for="(tag, tIndex) in item.value" :key="tIndex">
                  <span  class="search-box-tag" @click="editTag(item)">
                    {{item.key}} :
                    <span >{{tag}}</span>
                    <i class="nz-icon nz-icon-close" @click.stop="removeTagValue(tIndex, item.key)"/>
                  </span>
                </div>
              </div>
              <span slot="reference" :key="index" class="search-box-tag" @click.stop="editTag(item, index)">
                {{item.key}} :
                <span v-if="item.value.length === 1">{{item.value[0]}}</span>
                <span v-else>{{item.value.length}}项</span>
                <i class="nz-icon nz-icon-close" @click.stop="removeSelectArr(index)"/>
              </span>
            </el-popover>
          </div>
          <el-input size="mini" v-model="searchStr" @focus="searchInputFocus" @keydown.native="keydown" @keyup.native="keyup" ref="searchStr" @keypress="keypress" :readonly="inputReadonly" @input="changeSearchStr"></el-input>
        </div>
      </div>
      <div class="search-content">
        <div class="search-key" v-if="keyShow">
          <div v-for="(item, index) in searchList" @click="selectKey(item)" @mouseenter="selectIndex = index" :key="index" class="search-item" :class="{'search-item-select': index === selectIndex}">
            <span class="icon-k">K</span>  {{item.name}} <span style="margin-left: 30px" class="content-remark">{{item.type}}</span>
          </div>
        </div>
        <div class="search-symbol" v-if="symbolShow">
          <div v-for="(item, index) in symbolList" @click="selectSymbol(item)"  @mouseenter="selectIndex = index" :key="index" class="search-item" :class="{'search-item-select': index === selectIndex}">
            <span class="icon-s">:</span> {{item.label}}    <span style="margin-left: 30px" class="content-remark">{{item.remark}}</span>
          </div>
        </div>
        <div class="search-value" v-if="valueShow">
          <div v-for="(item, index) in valueList" @click="selectValue(item.label)"  @mouseenter="selectIndex = index" :key="index" class="search-item" :class="{'search-item-select': index === selectIndex}">
            <span class="icon-v">V</span> {{item.label}}    <span style="margin-left: 30px" class="content-remark">{{item.remark}}</span>
          </div>
        </div>
      </div>
    </el-popover>
    <el-dialog title="编辑筛选" :visible.sync="dialogShow" @close="dialogClose" :append-to-body="false" :modal-append-to-body="false" :destroy-on-close="true">
      <el-form ref="tagEdit" v-model="editDialogObj" v-if="dialogShow">
        <el-form-item prop="key" title="key">
          <el-autocomplete
            v-model="editDialogObj.key"
            :fetch-suggestions="querySearch"
            placeholder="请输入内容"
            @select="handleSelect"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item prop="symbol" title="symbol">
          <el-select v-model="editDialogObj.symbol">
            <el-option :value="1" label="属于"></el-option>
            <el-option :value="2" label="不属于"></el-option>
            <el-option :value="3" label="模糊匹配"></el-option>
            <el-option :value="4" label="反向模糊匹配"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="value">
          <el-select
            v-model="editDialogObj.value"
            multiple
            filterable
            allow-create
            default-first-option
          >
            <el-option
              v-for="item in dialogObjValueList"
              :key="item.label"
              :label="item.label"
              :value="item.label">
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
    searchMsg: {},
    from: {},
    inTransform: {}
  },
  data () {
    return {
      inputWidth: 400,
      visible: false, // 显示下拉框
      searchStr: '', // input 的内容
      oldSearchStr: '', // 上一次的内容
      searchList: [], // 搜索条件列表
      oldSearchList: [], // 所有搜索条件列表
      selectArr: [], // 已被选择的条件
      key: '', // 当前被选中的 key
      symbol: false, // 当前被选中的 symbol
      value: '', // 当前被选中的 value
      keyShow: false, // key 的下拉
      symbolShow: false, // symbol 的下拉 显示根据key的类型 自定义的不包含 大于小于
      valueShow: false, // value 的下拉
      inputReadonly: false,
      dialogObjValueList: [],
      selectIndex: 0,
      valueList: [],
      oldValueList: [],
      symbolList: [],
      editTagIndex: '',
      editTagObj: {},
      editDialogObj: {
        key: '',
        symbol: '',
        value: []
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
        },
        {
          label: 'exist',
          value: 'exist',
          remark: '存在'
        },
        {
          label: 'not exist',
          value: 'not exist',
          remark: '不存在'
        }
      ]
    }
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
      // console.log(e, 'keydown')
      if (e.keyCode == 8 && !this.searchStr && this.selectArr.length) {
        this.selectArr.pop()
      }
      // 5
      if (e.keyCode == 38) { // 向上
        if (this.selectIndex == 0) return
        this.selectIndex--
      }
      if (e.keyCode == 40 && (this.keyShow || this.valueShow || this.symbolShow)) { // 向下
        if (this.keyShow && this.selectIndex == this.searchList.length - 1) {
          return
        }
        if (this.symbolShow && this.selectIndex == this.symbolList.length - 1) {
          return
        }
        if (this.valueShow && this.selectIndex == this.valueList.length - 1) {
          return
        }
        this.selectIndex++
      }
      this.oldSearchStr = this.searchStr
    },
    keyup (e) {
      // console.log(e, 'keyup')
      // console.log(this.searchStr)
      // 6
      if (e.keyCode == 13 && (this.keyShow || this.valueShow || this.symbolShow)) {
        // 选择对应条件
        setTimeout(() => {
          if (this.keyShow) {
            this.selectKey(this.searchList[this.selectIndex])
          } else if (this.symbolShow) {
            this.selectSymbol(this.symbolList[this.selectIndex])
          } else if (this.valueShow) {
            this.selectValue(this.valueList[this.selectIndex].label)
          }
        }, 100)
        this.$refs.searchStr.focus()
        return
      }
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
      // 4
      if (e.keyCode == 13 && index !== -1 && this.symbol) {
        this.addSelectArr(this.searchStr)
        this.searchStr = ''
        this.contentShow('key')
        this.symbol = false
      }
    },
    selectKey (item) {
      this.key = item.name
      this.searchStr = item.name + ':'
      this.contentShow('symbol')
      this.$refs.searchStr.focus()
      this.setSymBolList()
    },
    searchInputFocus () { // 根据input的内容显示对应的下拉框
      const index = this.searchStr.indexOf(':')
      this.visible = true
      if (index === -1) {
        this.symbol = false
        this.contentShow('key')
      } else if (index === this.searchStr.length - 1 && !this.symbol) {
        this.contentShow('symbol')
      } else {
        this.symbol = true
        this.contentShow('value')
      }
    },
    selectSymbol (item) {
      this.symbol = true
      switch (item.value) {
        case '=' :
          this.$refs.searchStr.focus()
          break
        case '≠' :
          this.searchStr = '-' + this.searchStr
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
      this.setValueList('')
      this.contentShow('value')
    },
    selectValue (value) {
      this.searchStr = this.searchStr + value
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
      if (key) {
        this[key + 'Show'] = true
      }
      const keyStr = this.searchStr.split(':')[0]
      // console.log(keyStr, this.searchStr.split(':'))
      if (keyStr[0] === '-' && keyStr[1] === '*') {
        this.key = keyStr.substring(2)
      } else if (keyStr[0] === '-' || keyStr[0] === '*') {
        this.key = keyStr.substring(1)
      } else {
        this.key = keyStr
      }
      // console.log(this.key)
      if (key === 'value') { // 处理valueList
        const findItem = this.oldSearchList.find(item => item.name === this.key)
        if (findItem && findItem.type !== 'input') {
          // this.inputReadonly = true
          this.oldValueList = this[findItem.label]
        } else {
          this.oldValueList = []
          this[key + 'Show'] = false
        }
      }
    },
    changeSearchStr () {
      console.log(this.searchStr, 'changeSearchStr')
      const arr = this.searchStr.split(':')
      if (arr.length > 1) {
        this.setValueList(arr[1])
      } else {
        this.setSearchList(arr[0])
      }
    },
    setSearchList (str) {
      this.selectIndex = 0
      this.searchList = this.oldSearchList.filter(item => item.name.indexOf(str) !== -1)
    },
    setSymBolList (str) {
      const findItem = this.oldSearchList.find(item => item.name === this.key)
      this.selectIndex = 0
      this.symbolList = this.oldSymbolList
    },
    setValueList (str) {
      this.selectIndex = 0
      this.valueList = this.oldValueList.filter(item => item.label.indexOf(str) !== -1)
      if (!this.valueList.length) {
        this.valueShow = false
      } else {
        this.valueShow = true
      }
    },
    addSelectArr (str) {
      const key = str.split(':')[0]
      const value = str.split(':')[1]
      const findItem = this.selectArr.find(item => item.key === key)
      if (findItem) {
        if (findItem.value.indexOf(value) === -1) {
          findItem.value.push(value)
        }
      } else {
        this.selectArr.push({
          key,
          value: [value]
        })
      }
    },
    removeSelectArr (index) {
      this.selectArr.splice(index, 1)
    },
    removeTagValue (tIndex, key) {
      this.selectArr.find(item => item.key === key).splice(tIndex, 1)
    },
    editTag (tag, index) {
      this.editTagIndex = index
      this.editTagObj = this.$loadsh.cloneDeep(this.selectArr[index])
      this.dialogShow = true
      this.editDialogObj.value = this.editTagObj.value
      const keyStr = this.editTagObj.key
      // console.log(keyStr, this.searchStr.split(':'))
      if (keyStr[0] === '-' && keyStr[1] === '*') {
        this.editDialogObj.key = keyStr.substring(2)
        this.editDialogObj.symbol = 4
      } else if (keyStr[0] === '-') {
        this.editDialogObj.key = keyStr.substring(1)
        this.editDialogObj.symbol = 2
      } else if (keyStr[0] === '*') {
        this.editDialogObj.key = keyStr.substring(1)
        this.editDialogObj.symbol = 3
      } else {
        this.editDialogObj.key = keyStr
        this.editDialogObj.symbol = 1
      }
      const findItem = this.oldSearchList.find(item => item.name === this.editDialogObj.key)
      if (findItem && findItem.type !== 'input') {
        // this.inputReadonly = true
        this.dialogObjValueList = this[findItem.label]
      } else {
        this.dialogObjValueList = []
      }
    },
    dialogClose () {
      this.dialogShow = false
    },
    saveTag () {
      /*
      * 成功修改时 需要判断 成功修改的key 是否已存在 如果存在 需要合并 去重
      * */
      this.dialogShow = false
      this.dialogObjValueList = []
      switch (this.editDialogObj.symbol) {
        case 1:
          this.editTagObj.key = this.editDialogObj.key
          break
        case 2:
          this.editTagObj.key = '-' + this.editDialogObj.key
          break
        case 3:
          this.editTagObj.key = '*' + this.editDialogObj.key
          break
        case 4:
          this.editTagObj.key = '-*' + this.editDialogObj.key
          break
      }
      this.editTagObj.value = this.editDialogObj.value
      const findItem = this.selectArr.find(item => item.key === this.editTagObj.key)
      if (findItem) {
        this.selectArr.splice(this.editTagIndex, 1)
        console.log(findItem, this.editDialogObj.value)
        findItem.value = findItem.value.concat(this.editDialogObj.value)
        findItem.value = findItem.value.filter(function (item, index) {
          return findItem.value.indexOf(item) === index // 因为indexOf 只能查找到第一个
        })
        console.log(findItem.value)
      } else {
        this.selectArr[this.editTagIndex] = this.$loadsh.cloneDeep(this.editTagObj)
      }
    },
    querySearch (queryString, cb) {
      const restaurants = this.oldSearchList.map(item => { return { value: item.name } })
      console.log(restaurants)
      const results = queryString ? restaurants.filter(name => name.value.indexOf(queryString) !== -1) : restaurants
      console.log(results)
      cb(results)
    },
    handleSelect () {

    },
    clickOutside () { // 点击页面其他地方触发
      this.visible = false
      this.keyShow = false // key 的下拉
      this.symbolShow = false // symbol 的下拉
      this.valueShow = false // value 的下拉
      this.inputWidth = 400
    }
  },
  watch: {
    searchMsg: {
      immediate: true,
      deep: true,
      handler (n) {
        console.log(n)
        this.searchList = n.searchLabelList || []
        this.oldSearchList = n.searchLabelList || []
      }
    }
  }
}
</script>

<style lang="scss">
#nz-search-box{
  .search-box-input {
    border: 1px solid #E7EAED;
    white-space: nowrap;
    width: 400px;
    overflow: hidden;
    display: flex;
    align-items: center;
    .search-box-input-content{
      width: calc(100% - 30px);
      white-space: nowrap;
      overflow-y: auto;
      display: flex;
      align-items: center;
      .el-input__inner{
        border: none;
      }
      .search-box-tag{
        display: inline-flex;
        font-size: 12px;
        border: 1px solid #e1e4e8;
        background: #eaecef;
        height: 20px;
        padding: 0 8px 0 8px;
        border-radius: 2px;
        margin: 2px 4px 2px 4px;
        align-items: center;
      }
      .el-input--mini {
        display: inline-block;
        min-width: 100px;
        width: auto;
        max-width: 170px;
        flex: 1;
      }
    }
    .nz-icon-search{
      display: inline-block;
      height: 100%;
      line-height: 1;
      margin-left: 5px;
    }
  }
  .search-box-tag{
    display: flex;
  }
  .search-item{
    border-bottom: 1px solid #e1e4e8;
    font-size: 12px;
    position: relative;
  }
  .search-item.search-item-select {
    background: #1da1f2;
    color: #333;
    .content-remark{
      color: #fff;
    }
  }
  .icon-k,.icon-s, .icon-v{
    display: inline-block;
    width: 26px;
    height: 100%;
    line-height: 27px;
    text-align: center;
    margin-right: 5px;
  }
  .icon-k{
    color: #ff8f44;
    background: #fff4ec;
  }
  .icon-s{
    color: #4276e5;
    background: #eaf1ff;
  }
  .icon-v{
    color: #a884f3;
    background: #f7f3ff;
  }
  .el-popper{
    padding: 0;
  }
  .tag-box{
    padding: 5px 0px;
    min-width: 75px;
    .tag-box-content{
      display: flex;
      flex-direction: column;
    }
    .search-box-tag{
      display: inline !important;
      margin-bottom: 5px !important;
    }
  }
  .content-remark{
    position: absolute;
    left: 300px;
    top: 5px;
    color: #999;
  }
}
</style>
