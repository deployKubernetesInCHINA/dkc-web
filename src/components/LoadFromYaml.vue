<template>
  <div>
    <input type="file" id="file" ref="file" v-on:change="handleFileUpload"/>
    <Edit v-bind:master_count_base=0 v-bind:node_count_base=0 style="margin-top: 50px"></Edit>
  </div>
</template>

<script>
  import {mapMutations} from 'vuex'
  import Edit from "./Edit";

  export default {
    name: "LoadFromYaml",
    data() {
      return {
        show: false
      }
    },
    components: {Edit},
    methods: {
      ...mapMutations(["changeJsonObj"]),
      handleFileUpload(e) {
        const yaml = require('js-yaml');
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length) return;

        const fr = new FileReader();
        fr.onload = e => {
          yaml.load(e.target.result)
          this.changeJsonObj(yaml.load(e.target.result))
        }
        fr.readAsText(files.item(0));
        this.show = true
      },
    },

  }
</script>

<style scoped>

</style>