<template>
  <div>
        <div class="content">

          <el-form-item label="Ntp Servers" label-width="300px">
            <el-radio-group v-model="enable_custom_ntp">
              <el-radio-button  :label="false">默认(master1)</el-radio-button>
              <el-radio-button :label="true">自定义(阿里云ntp)</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <div class="content">
            <el-row>
              <el-col :span="12">
                <div v-if="enable_custom_ntp">
                  <el-input placeholder="ntp.aliyun.com" v-model="ntp_servers[0]" size="small">
                    <template slot="prepend">server 1</template>
                  </el-input>
                  <el-input placeholder="ntp.aliyun.com" v-model="ntp_servers[1]" size="small">
                    <template slot="prepend">server 2</template>
                  </el-input>
                  <el-input placeholder="ntp.aliyun.com" v-model="ntp_servers[2]" size="small">
                    <template slot="prepend">server 3</template>
                  </el-input>
                </div>
              </el-col>
            </el-row>
          </div>
          <el-form-item label="Docker Daemon 存储路径" label-width="300px">
            <el-tooltip content="docker_daemon_graph"
                        placement="top-start">
              <el-col :span="6">
                <el-input
                  v-model="docker_daemon_graph"
                  placeholder="/var/lib/docker"></el-input>
              </el-col>
            </el-tooltip>
          </el-form-item>
        </div>

  </div>

</template>

<script>
  import {mapActions, mapMutations} from 'vuex'

  export default {
    name: "BaseSetup",
    data() {
      return {}
    },
    computed: {
      docker_daemon_graph: {
        get() {
          return this.$store.state.jsonObj.all.vars.docker_daemon_graph
        },
        set(val) {
          return this.changeDockerDaemonGraph(val)
        }
      },

      enable_custom_ntp: {
        get() {
          return this.$store.state.enable_custom_ntp
        },
        set(val) {
          this.changeEnableCustomNtp(val)
        }
      },
      ntp_servers: {
        get() {
          return this.$store.state.ntp_servers
        },
        set(val) {
          this.changeNtpServers(val)
        }
      },
    },
    methods: {
      ...mapActions([]),
      ...mapMutations([
        'changeExternalDomainName',
        'changeDockerDaemonGraph',
        'changeNtpServers',
        'changeEnableCustomNtp'
      ]),


    }
  }
</script>

<style scoped>

</style>