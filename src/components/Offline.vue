<template>
  <div>
    <Edit v-bind:master_count_base=3 v-bind:node_count_base=4 deploy_type="offline" style="margin-top: 50px"></Edit>
  </div>
</template>

<script>
  import Edit from "./Edit";

  export default {
    name: "Offline",
    data() {
      return {
        show: false
      }
    },
    components: {Edit},
    methods: {
    },

  }
</script>

<style scoped>

</style>