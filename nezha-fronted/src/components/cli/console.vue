<style scoped>
  .console{
    height:270px;
    padding:5px 5px;
    background-color: black;
    position: relative;
  }
</style>
<template>
    <div :id="'ternimalContainer'+idIndex" class="console">
        <div :id="'terminal'+idIndex" ></div>
    </div>
</template>
<script>
import Terminal from '../common/js/Xterm'
export default {
  name: 'console',
  props:{
    terminal:{  },
    idIndex:{
      type: Number,
      default: 0,
    },
    isFullScreen:{
      type: Boolean,
      default: false,
    },
    fontSize:{}
  },
  data () {
    return {
      term: null,
      terminalSocket: null,
      termimalRows:15,
      termimalHeight:270,
      topMenuHeight:30,
      dragHeigh:8,
      minRow:1,
      fontSpaceHeight:2,//一行高度=fontSize+fontSpaceHeight
      obj:{
        id:2
      },
      successBackContent:'Connecting to',
      failBackContent:'Sorry',
      connectFailContent:'Connection failed',
      welcomeBackContent:'Welcome',
      psdCont:'password: ',
      conFinish:false,
      conSuccessNum:0,
      inputSecret:false,
    }
  },
  watch:{
  },
  methods: {
    prompt(term) {
      term.write('\r\n ');//term.write('\r\n~$ ');
    },
    resize(consoleHeigt,consoleWidth){
      this.resizeConsole(consoleHeigt,consoleWidth);
      this.resizeServiceConsole(consoleHeigt);
    },
    resizeConsole(consoleHeigt,consoleWidth){
      //调整终端容器高度
      const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
      consoleBox.style.height = `${consoleHeigt-55}px`;
      //调整终端高度
      let cols = this.term.cols;
      if(consoleWidth){//需要调整宽度???
        cols = consoleWidth/11;//目前字体，一个字母宽11
      }
      //调整终端可视区域高度
      document.getElementsByClassName('xterm-screen')[this.idIndex].style.height=`${consoleHeigt-10}px`;
      // this.term.resize(parseInt(cols),(parseInt(rows)-this.minRow));
      this.$nextTick(()=>{// 解决进入全屏和退出全屏是底部隐藏
        this.setFontSize(this.fontSize);
      })
    },
    resizeServiceConsole(height){
      let width = document.body.clientWidth;//可视宽度
      const winStyle={
        width:width,
        height:height-100,
        cols:this.term.cols,//cols和rows在resizeConsole方法已经设置
        rows:this.term.rows,
      };
      //alert(JSON.stringify(winStyle));
      this.$post('terminal/resize',winStyle).then(response => {
        if (response.code === 200) {
          this.term.fit();
          //this.term.scrollToBottom();
        } else {
          this.$message.error(response.msg);
        }
      });
    },
    fullScreenConsole(isFullScreen, resizeHeight){
      if (resizeHeight) {
        this.termimalHeight = resizeHeight;
      }
      // this.isFullScreen = isFullScreen;
      //this.term.toggleFullScreen(isFullScreen);//全屏后无法显示顶部菜单和tab
      let height = document.body.clientHeight-this.topMenuHeight;//可视高度
      let width = document.body.clientWidth;//可视宽度
      let rows = height/(this.fontSize+this.fontSpaceHeight);
      rows = parseInt(rows);
      if(isFullScreen){
        //容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        consoleBox.style.height = `${height-25}px`;//减去菜单的高度
      }else {
        //rows = this.termimalRows-this.minRow;
        height = this.termimalHeight;
        //容器高度设置
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        consoleBox.style.height = `${this.termimalHeight+this.topMenuHeight-55}px`;
        rows = (height-10)/(this.fontSize+this.fontSpaceHeight);//padding  5*2
        rows = parseInt(rows);
      }

      this.term.resize(this.term.cols,rows);//this.term.setOption('rows', rows);
      const winStyl={
        width:width,
        height:height-50,
        cols:this.term.cols,
        rows:parseInt(rows),
      };
      this.$post('terminal/resize',winStyl).then(response => {
        if (response.code === 200) {
          //this.term.fit();
          //this.term.scrollToBottom();
        } else {
          this.$message.error(response.msg);
        }
      });
      this.$nextTick(()=>{// 解决进入全屏和退出全屏是底部隐藏
        this.setFontSize(this.fontSize);
      })

      /*
      window.addEventListener('resize',this.windowChange)

      windowChange(){
        this.term.fit();
        this.term.scrollToBottom();
      }

// 关闭时,取消监听
      websocket.onclose = function(evt) {
        console.log("close", evt);
        window.removeEventListener('resize',this.windowChange)
      }; */
    },
    focusConsole(){
      this.term.focus();
    },
    create(){
      let that = this;
      let rows = this.termimalRows;
      if(this.isFullScreen){
        //容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        let height = document.body.clientHeight;//高度
        consoleBox.style.height = `${height-55}px`;
        rows = (height-this.topMenuHeight)/(this.fontSize+this.fontSpaceHeight);
        rows = parseInt(rows);
      }else{
        //容器高度设置100%
        const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
        let height = this.terminal.height;//可视高度
        consoleBox.style.height = `${height}px`;
        rows = (height-this.topMenuHeight-this.dragHeigh)/(this.fontSize+this.fontSpaceHeight);//menu 30 ,drag  8
        rows = parseInt(rows);
      }
      let terminalContainer = document.getElementById('terminal'+this.idIndex);
      this.term = new Terminal({
        rows:rows,//15行大概300px高，无法设置heigh，只能设置rows
        //cursorBlink:true,//光标闪烁
        cursorStyle:'block', // 光标样式  null | 'block' | 'underline' | 'bar'
        //bellStyle:'sound',
        disableStdin:false,//是否应禁用输入
        fontSize:this.fontSize,
        //lineHeight:1,
        //fontFamily: 'NotoSans',
        //scrollback: 800, //回滚
        //tabStopWidth: 8, //制表宽度
        //screenKeys: true//
        /*
        theme:{
          foreground:'yellow',//字体
          background:'#060101',//背景色
          cursor:'help',//鼠标
        }*/
      });
      this.term.open(terminalContainer);
      this.term.focus();
      let token = sessionStorage.getItem('nz-token');
      let baseUrl = this.$axios.defaults.baseURL;
      if (baseUrl.startsWith("/")) {
        baseUrl = "ws://" + window.location.host + baseUrl;
      } else {
        baseUrl = baseUrl.replace("http://", "ws://").replace("https://", "ws://");
      }
      let url = baseUrl+"/terminal.ws?width="+this.terminal.width+"&height="+this.terminal.height+"&cols="+this.terminal.cols+"&rows="+this.terminal.rows+"&token="+token+"&assetId="+this.terminal.assetId+"&accountId="+this.terminal.accountId+"&uuid="+this.terminal.uuid;
      console.info(baseUrl, url);
      this.terminalSocket = new WebSocket(url);
      //连接成功
      this.terminalSocket.onopen = () =>{
      };
      //登录后，你输入的内容从后台服务返回
      this.term.on("data", function(data) {
        /*
        let code = data.charCodeAt(0);
        if(code==13){
        }else {
          //that.term.write(data);
        }*/
      });
      //返回
      this.terminalSocket.onmessage = function(evt) {
        let backContent = evt.data;
        /*
        if(that.inputSecret){//当前为密码输入状态
        }
        if(backContent.length>1){
          let pwdInput = backContent.endsWith(that.psdCont);
          if(pwdInput){//输入密码
            that.inputSecret = true;
          }
        }*/

        let welComIndex = backContent.indexOf(that.welcomeBackContent);
        if(welComIndex>-1){//无服务器信息（只与nezha进行了连接）
          const connectResult = {
            title:'',
            color:1,
          };
          that.$emit("refreshConsoleTitle",connectResult);//1:grey 2 green 3 red
        }else {
            let successContentIndex = backContent.indexOf(that.successBackContent);
            if(successContentIndex>-1 ){
              //that.conFinish = true;
              let startIndex = successContentIndex+that.successBackContent.length+1;
              backContent = backContent.substring(startIndex);
              let endIndex = backContent.indexOf('\r\n');
              let title = backContent.substring(0,endIndex);
              const connectResult = {
                title:title,
                color:2,
              };
              that.$emit("refreshConsoleTitle",connectResult);//1:grey 2 green 3 red
            }else {//失败
              let failContentIndex = backContent.indexOf(that.failBackContent);
              let connectFailIndex = backContent.indexOf(that.connectFailContent);
              if(failContentIndex>-1 ){
                //that.conFinish = true;
                const connectResult = {
                  title:'',
                  color:3,
                };
                that.$emit("refreshConsoleTitle",connectResult);//1:grey 2 green 3 red
              }else if(connectFailIndex>-1){
                let startIndex = successContentIndex+that.successBackContent.length+1;
                backContent = backContent.substring(startIndex);
                let endIndex = backContent.indexOf('\r\n');
                let title = backContent.substring(0,endIndex);
                const connectResult = {
                  title:'',
                  color:3,
                };
                that.$emit("refreshConsoleTitle",connectResult);//1:grey 2 green 3 red
              }
            }
        }
      };
      //关闭
      this.terminalSocket.onclose = () =>{
        //报错sorry的，还没来得及看信息就关闭
        // this.$emit("closeConsole",this.terminal.name);//
        this.term.setOption('disableStdin',true);
      };


      //错误
      this.terminalSocket.onerror = (e) =>{};
      //选中 复制
      this.term.on("selection", function() {});
      this.term.attachCustomKeyEventHandler(function(ev) {  });

      this.term.attach(this.terminalSocket);
      this.term._initialized = true;
      this.term.fit();//自适应大小(使终端的尺寸和几何尺寸适合于终端容器的尺寸) 只是width
      this.$nextTick(()=>{// 解决进入全屏和退出全屏是底部隐藏
        this.setFontSize(this.fontSize);
      })
    },

    closeSocket(){
      if(this.terminalSocket){
        this.terminalSocket.close();
      }
      if(this.term) {
        this.term.destroy();
      }
      //初始化console的高度
      const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
      if(consoleBox){
        consoleBox.style.height = `${this.termimalHeight}px`;
      }
      this.conFinish = false;
    },
    setFontSize(fontSize){
      this.term.setOption('fontSize',fontSize);
      const consoleBox = document.getElementById('ternimalContainer'+this.idIndex);
      let width = document.body.clientWidth;//可视宽度
      let height = parseInt(consoleBox.style.height);
      if(height==null||!height){height=this.termimalHeight;}
      const winStyle={
        width:width,
        height:height,
        cols:this.term.cols,//cols和rows在resizeConsole方法已经设置
        rows:this.term.rows,
      };
      //调整终端可视区域高度
      document.getElementsByClassName('xterm-screen')[this.idIndex].style.height=height+'px'
      this.$nextTick(()=>{
        this.term.resize(this.term.cols,this.term.rows);
        this.$post('terminal/resize',winStyle).then(response => {
          if (response.code === 200) {
            this.term.fit();
            //this.term.scrollToBottom();
          } else {
            this.$message.error(response.msg);
          }
        });
      });
      // alert(JSON.stringify(winStyle));


      // console.log(winStyle)
    }
  },
  mounted () {
    this.create();
  },
  created(){

  },
  beforeCreate(){

  },
  beforeDestroy () {
    this.closeSocket();
    this.term.off("selection");
    this.term.off("data")

  }
}
</script>
