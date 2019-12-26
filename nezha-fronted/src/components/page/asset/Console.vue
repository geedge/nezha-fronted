<template>
    <div>
        <div class="console" id="terminal"></div>
    </div>
</template>


<script>
import Terminal from '../../common/js/Xterm'
export default {
  name: 'Console',
  props:['terminal','token'],
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
    token: {
      immediate:true,
      handler(val){
        if(val){
          this.create()
        }
      }
    },
  },
  methods: {
    create(){
      let terminalContainer = document.getElementById('terminal')
      this.term = new Terminal()
      this.term.open(terminalContainer)
      this.terminalSocket = new WebSocket("ws://192.168.40.247:8080/nz-admin/terminal.ws?width=1&height=1&cols=225&rows=200&token="+this.token);
      // this.terminalSocket = new WebSocket("ws://192.168.41.101:8088/nz-admin/terminal.ws?width=1600&height=1005&cols=225&rows=58&token="+this.token);
      this.term.attach(this.terminalSocket)
      this.term._initialized = true
    },
  },
  mounted () {

  },
  beforeDestroy () {
    this.terminalSocket.close()
    this.term.destroy()
  }
}
</script>
<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 60px;
    font-size: 22px;
    background-color: #ffffff;
    z-index: 510;
    box-shadow: 0px 20px 13px -19px #5E5E5E;
}
</style>