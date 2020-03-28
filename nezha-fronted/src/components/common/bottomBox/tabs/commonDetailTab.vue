<template>
  <span>
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">
          <template v-if="from == 'dc'">{{$t("asset.createAssetTab.dcName")}}：{{obj.name}}</template>
          <template v-else-if="from == 'account'">{{$t("config.account.account")}}：{{obj.username}}</template>
          <template v-else-if="from == 'promServer'">ID：{{obj.id}}</template>
          <template v-else-if="from == 'alertRule'">{{$t("alert.alertName")}}：{{obj.alertName}}</template>
          <template v-else-if="from == 'asset'">{{$t("asset.tableTitle.host")}}：{{obj.host}}</template>
        </div><div class="sub-list-tab sub-list-tab-active">{{$t("overall.detail")}}</div><template v-if="from == 'dc'">
          <div class="sub-list-tab" @click="changeTab('cabinet')">{{$t("config.dc.cabinets")}}</div>
        </template><template v-if="from == 'alertRule' || from == 'asset'">
          <div class="sub-list-tab" @click="changeTab('alertMessage')">{{$t("alert.message")}}</div>
        </template>
      </div>
    </div>
    <div style="margin-top: 10px;">
      <template v-for="item in detail">
        <div style="width: 30%; display: inline-block; padding: 5px; color: #606266; word-break: break-all; vertical-align: top">
          <span>{{item.label}}: </span>
          <template v-if="item.type && item.type == 'status'">
            <div style="margin-top: 0" :class="{'active-icon green': item.value == '1', 'active-icon red': item.value == '0' || item.value == '-1' || item.value == '-2'}"></div>
            <span style="color: #999">{{item.msg}}</span>
          </template>
          <template v-else>{{item.value}}</template>
        </div>
      </template>
    </div>
  </span>
</template>

<script>
  export default {
    name: "commonDetailTab",
    props: {
      obj: Object,
      from: String,
      detail: Array
    },
    methods: {
      changeTab(tab) {
        this.$emit("changeTab", tab);
      }
    }
  }
</script>

<style scoped>

</style>
