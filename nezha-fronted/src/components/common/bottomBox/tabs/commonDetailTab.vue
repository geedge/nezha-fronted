<template>
  <span>
    <div class="sub-top-tools">
      <div class="sub-list-tabs">
        <div class="sub-list-tab-title">
          <template v-if="from == 'dc'">{{$t("asset.createAssetTab.dcName")}}：{{obj.name}}</template>
          <template v-else-if="from == 'account'">{{$t("config.account.account")}}：{{obj.username}}</template>
          <template v-else-if="from == 'promServer'">ID：{{obj.id}}</template>
        </div><div class="sub-list-tab sub-list-tab-active">{{$t("overall.detail")}}</div><template v-if="from == 'dc'">
          <div class="sub-list-tab" @click="changeTab('cabinet')">{{$t("config.dc.cabinets")}}</div>
        </template>
      </div>
    </div>
    <div style="margin-top: 10px;">
      <div style="padding: 5px; color: #606266;" v-for="item in detail">
        {{item.label}}: {{item.value}}
      </div>
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
