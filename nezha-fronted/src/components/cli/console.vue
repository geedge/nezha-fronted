<style scoped>
  .console{
    height:405px;
    background-color: black;
  }
</style>
<template>
    <div class="console" >
        <div  :id="'terminal'+idIndex"></div>
    </div>
</template>
<script>
import Terminal from '../common/js/Xterm'
export default {
  name: 'console',
  props:{
    terminal:{/*
      cols: 400,
      rows: 400,
      width:'',
      height:'',
      assetId:0,
      accountId:0,
      uuid:'aaadwdwd',*/
    },

    idIndex:{
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      term: null,
      terminalSocket: null,
      obj:{
        id:2
      },
    }
  },
  watch:{
    /*
    token: {
      immediate:true,
      handler(val){
        if(val){
          this.create()
        }
      }
    },
    */
  },
  methods: {
    create(){
      let terminalContainer = document.getElementById('terminal'+this.idIndex);
      //alert('id='+'terminal'+this.idIndex);
      //alert('==='+JSON.stringify(terminalContainer));
      this.term = new Terminal(
        /*{
        width:500,
        height:400,
        cols:225,
        rows:200
      }*/);
      this.term.open(terminalContainer);
      //this.term.write("**************"+this.terminal.assetId);
      //this.term.focus();
      let token = sessionStorage.getItem('nz-token');
      let url = "ws://192.168.40.247:8080/nz-admin/terminal.ws?width="+this.terminal.width+"&height="+this.terminal.height+"&cols="+this.terminal.cols+"&rows="+this.terminal.rows+"&token="+token+"&assetId="+this.terminal.assetId+"&accountId="+this.terminal.accountId+"&uuid="+this.terminal.uuid;
      //alert(url);
      this.terminalSocket = new WebSocket(url);
      // this.terminalSocket = new WebSocket("ws://192.168.41.101:8088/nz-admin/terminal.ws?width=1600&height=1005&cols=225&rows=58&token="+this.token);

      this.terminalSocket.onopen = () =>{
        //alert('open');
      };
      this.terminalSocket.onclose = () =>{
        //alert('closeSocket');
      };
      this.terminalSocket.ondata = (data) =>{
        //alert('data:'+data);
      };
      this.terminalSocket.onerror = (e) =>{
        //alert('error'+e);
      };

      this.term.attach(this.terminalSocket);
      this.term._initialized = true;
      this.term.fit();
    },

    closeSocket(){
      if(this.terminalSocket){
        this.terminalSocket.close();
      }
      if(this.term) {
        this.term.destroy();
      }
    },
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
    //this.terminalSocket.close()
    //this.term.destroy()
  }
}
</script>
