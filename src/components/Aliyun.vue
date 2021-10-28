<template>
  <div>
<!--    <input type="file" id="file" ref="file" v-on:change="handleFileUpload"/>-->
    <Edit v-bind:master_count_base=3 v-bind:node_count_base=4 deploy_type="aliyun" style="margin-top: 50px"></Edit>
  </div>
</template>

<script>
  import Edit from "./Edit";

  export default {
    name: "Aliyun",
    data() {
      return {
        show: false
      }
    },
    mounted() {
    },
    components: {Edit},
    methods: {
    },

  }
</script>

<style scoped>

</style>