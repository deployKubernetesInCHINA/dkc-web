<template>
  <div>
    <div v-if="num==='1'" :key="1">
      <Edit v-bind:master_count_base=1 v-bind:node_count_base=0></Edit>
    </div>
    <div v-else-if="num==='2'" :key="2">
      <Edit v-bind:master_count_base=1 v-bind:node_count_base=1></Edit>
    </div>
    <div v-else-if="num==='3'" :key="3">
      <Edit v-bind:master_count_base=1 v-bind:node_count_base=2></Edit>
    </div>
    <div v-else-if="num==='4'" :key="4">
      <Edit v-bind:master_count_base=1 v-bind:node_count_base=3></Edit>
    </div>
    <div v-else-if="num==='5'" :key="5">
      <Edit v-bind:master_count_base=3 v-bind:node_count_base=2></Edit>
    </div>
    <div v-else-if="num==='6'" :key="6">
      <Edit v-bind:master_count_base=3 v-bind:node_count_base=3></Edit>
    </div>
    <div v-else-if="num==='7'" :key="7">
      <Edit v-bind:master_count_base=3 v-bind:node_count_base=4></Edit>
    </div>
    <div v-else-if="num==='8'" :key="8">
      <Edit v-bind:master_count_base=3 v-bind:node_count_base=5></Edit>
    </div>
    <div v-else :key="9">
      <Edit v-bind:master_count_base=1 v-bind:node_count_base=1></Edit>
    </div>
  </div>
</template>

<script>

  import Edit from "../components/Edit";

  export default {
    name: "EditView",
    components: {Edit},
    props: {num: String},
    mounted() {
      console.log(this.num)
    },
    watch: {},
    methods: {},
    data() {
      return {
        master_hosts1: [{hostname: 'dkc-master-1', ip: '192.168.57.2', master: true}],
        master_hosts3: [{hostname: 'dkc-master-1', ip: '192.168.57.2', master: true}, {
          hostname: 'dkc-master-2',
          ip: '192.168.57.3',
          master: true
        }, {hostname: 'dkc-master-3', ip: '192.168.57.4', master: true}],
        node_hosts2: [{hostname: 'dkc-worker-1', ip: '192.168.57.2', master: false}, {
          hostname: 'dkc-worker-2',
          ip: '192.168.57.3',
          master: false
        }],
        node_hosts3: [{hostname: 'dkc-worker-1', ip: '192.168.57.2', master: false}, {
          hostname: 'dkc-worker-2',
          ip: '192.168.57.3',
          master: false
        }],
        node_hosts5: [{hostname: 'dkc-worker-1', ip: '192.168.57.2', master: false}, {
          hostname: 'dkc-worker-2',
          ip: '192.168.57.3',
          master: false
        }],
      }
    }
  }
</script>

<style scoped>
  .el-form {
    text-align: left;
  }
</style>