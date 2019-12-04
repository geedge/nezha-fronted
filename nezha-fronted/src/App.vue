<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body,html{
    /* font-family: "AlibabaPuHuiTiR"; */
}
.ly-table1 table{
    /* table-layout: unset; */
}
::-webkit-scrollbar{
    width: 10px;
    height: 10px;
}
::-webkit-scrollbar-thumb{
    border-radius: 1em;
    background-color: rgba(50,50,50,.3);
}
::-webkit-scrollbar-track{
    border-radius: 1em;
}
</style>
