<template>
  <div class="content">
    <h5 v-if="om_count>0">一. 日志</h5>
    <h5 v-else>无运维监控节点</h5>
    <div class="content" v-if="om_count>0">
        <h6>elasticsearch</h6>
        <div class="content">
          <el-form-item label="存储容量" label-width="200px">
            <el-col :span="3">
              <el-input v-model="elastic_storage_Gi" type="number" min="1">
                <template slot="append">Gi</template>
              </el-input>
            </el-col>
          </el-form-item>
        </div>
        <h6>logstash</h6>
        <div class="content">
          <el-form-item label="存储容量" label-width="200px">
            <el-col :span="3">
              <el-input v-model="logstash_storage_Gi" type="number" min="1">
                <template slot="append">Gi</template>
              </el-input>
            </el-col>
          </el-form-item>
        </div>
        <h6>kibana</h6>
        <div class="content">
          <el-form-item label="访问地址" label-width="200px">
            <el-col :span="12">
              <el-input :value="kibana_url"
                        disabled></el-input>
            </el-col>
          </el-form-item>
        </div>
    </div>
    <h5 v-if="om_count>0">二. 监控</h5>
    <div class="content" v-if="om_count>0">
        <h6>prometheus</h6>
        <div class="content">
          <el-form-item label="访问地址" label-width="200px">
            <el-col :span="12">
              <el-input :value="prometheus_url"
                        disabled></el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="存储容量" label-width="200px">
            <el-col :span="3">
              <el-input v-model="prometheus_storage_Gi" type="number" min="1">
                <template slot="append">Gi</template>
              </el-input>
            </el-col>
          </el-form-item>
        </div>
        <h6>alertmanager</h6>
        <div class="content">
          <el-form-item label="访问地址" label-width="200px">
            <el-col :span="12">
              <el-input :value="alertmanager_url"
                        disabled></el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="存储容量" label-width="200px">
            <el-col :span="3">
              <el-input v-model="alertmanager_storage_Gi" type="number" min="1">
                <template slot="append">Gi</template>
              </el-input>
            </el-col>
          </el-form-item>
        </div>
        <h6>grafana</h6>
        <div class="content">
          <el-form-item label="访问地址" label-width="200px">
            <el-col :span="12">
              <el-input :value="grafana_url"
                        disabled></el-input>
            </el-col>
          </el-form-item>
          <el-form-item label="存储容量" label-width="200px">
            <el-col :span="3">
              <el-input v-model="grafana_storage_Gi" type="number" min=1>
                <template slot="append">Gi</template>
              </el-input>
            </el-col>
          </el-form-item>
        </div>
    </div>

  </div>
</template>

<script>
  import {mapActions, mapMutations, mapGetters} from 'vuex'

  export default {
    name: "om",
    data() {
      return {}
    },
    computed: {

      external_domain_name: {
        get() {
          return this.$store.state.jsonObj.all.vars.external_domain_name
        },
      },
      csi_driver_nfs_enabled: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_enabled
        },
      },
      csi_driver_nfs_server: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_server
        },
      },
      prometheus_storage_Gi: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.prometheus_storage_Gi
        },
        set(val) {
          return this.changePrometheusStorage(val)
        }
      },
      alertmanager_storage_Gi: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.alertmanager_storage_Gi
        },
        set(val) {
          return this.changeAlertmanagerStorage(val)
        }
      },
      grafana_storage_Gi: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.grafana_storage_Gi
        },
        set(val) {
          return this.changeGrafanaStorage(val)
        }
      },
      elastic_storage_Gi: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.elastic_storage_Gi
        },
        set(val) {
          return this.changeElasticStorage(val)
        }
      },
      logstash_storage_Gi: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.logstash_storage_Gi
        },
        set(val) {
          return this.changeLogstashStorage(val)
        }
      },
      kibana_url: {
        get() {
          return "https://" + this.external_domain_name + '/kibana'
        }
      },
      prometheus_url: {
        get() {
          return "https://" + this.external_domain_name + '/prometheus'
        }
      },
      alertmanager_url: {
        get() {
          return "https://" + this.external_domain_name + '/alertmanager'
        }
      },
      grafana_url: {
        get() {
          return "https://" + this.external_domain_name + '/grafana'
        }
      },
      om_count: {
        get() {
          return this.$store.state.om_count
        }
      },
      prometheus_stack_enabled: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.prometheus_stack_enabled
        },
        set(val) {
          return this.changePrometheusStackEnabled(val)
        }
      },
      local_path_provisioner_claim_root: {
        get() {
          return this.$store.state.jsonObj.all.children["k8s_cluster"].vars.local_path_provisioner_claim_root
        },
        set(val) {
          return this.changeLocalPathProvisioner(val)
        }
      },
      aliyunVisable: {
        get() {
          return this.$store.state.aliyunVisable
        }
      },
      offlineVisable: {
        get() {
          return this.$store.state.offlineVisable
        }
      }
    },
    methods: {
      ...mapActions([]),
      ...mapGetters(['hostsList', 'nodeList', 'nodeHostsList']),
      ...mapMutations([
        'changeExternalDomainName',
        'changeRegistryDiskSize',
        'changePrometheusStackEnabled',
        'changePrometheusStorage',
        'changeAlertmanagerStorage',
        'changeGrafanaStorage',
        'changeLocalPathProvisioner',
        'changeElkEnabled',
        'changeOpsEnabled',
        'changeOpsHosts',
        'changeElasticStorage',
        'changeLogstashStorage',
        'changeKubeServiceAddress',
        'changeKubePodSubnet',
        'changeOpsDomainName',
        'changeOpsNamespace',
        'changeMinioEnabled',
        'changeRegistry',
        'changeSgs',
        'changeMinioStorage',
        'changeNFSEnabled',
        'changeNFSServer',
        'changeNFSPath',
        'changeRegistryEnabled',

      ]),
      clickitem(event, item) {
        if (item === 'm' && event === false) {
          // this.cleanMonitoring()
        }
        if (item === 'l' && event === false) {
          // this.cleanLogging()
        }
        if (item === 'mongo' && event === false) {
          // this.cleanMongo()
        } else if (item === 'mongo' && event === true) {
          this.initMongo()
        }
      },
      // hostsList() {
      //   let _this = this.$store.state
      //   var hosts = []
      //   for (var i = 0; i < _this.master_hosts.length; i++) {
      //     hosts.push(_this.master_hosts[i].hostname)
      //   }
      //   for (i = 0; i < _this.node_hosts.length; i++) {
      //     if (hosts.indexOf(_this.node_hosts[i].hostname) === -1) {
      //       hosts.push(_this.node_hosts[i].hostname)
      //     }
      //   }
      //   return hosts;
      // },
    }
  }
</script>

<style scoped>

</style>