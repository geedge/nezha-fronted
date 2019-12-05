<template>
    <div>
        <div>
            <iframe src="http://192.168.40.247:3000/" class="dashboard"></iframe>
        </div>
    </div>
</template>

<script>
export default {
  name: "dashboard"
}
</script>

<style scoped>
.dashboard{
    height: calc(90vh);
    width: calc(100%);
}
</style>