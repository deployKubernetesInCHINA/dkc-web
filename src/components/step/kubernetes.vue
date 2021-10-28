<template>
  <div>
    <div class="content">
      <h5>一. kubernetes 配置</h5>
      <div class="content">
        <el-form-item label="Kube Service Subnet" label-width="300px"
          ><span style="font-weight: normal">(注意不要和其它网段冲突)</span>
          <el-col :span="6">
            <el-input
              v-model="kube_service_addresses"
              placeholder="10.233.0.0/18"
            ></el-input>
          </el-col>
          <div class="net">
            <el-form-item label="掩码">
              {{ svc_netmask }}
            </el-form-item>
            <el-form-item label="IP大约(个)">
              {{ svc_count }}
            </el-form-item>
            <el-form-item label="IP范围">
              {{ svc_iplist }}
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="Kube Pod Subnet" label-width="300px"
          ><span style="font-weight: normal">(注意不要和其它网段冲突)</span>
          <el-col :span="6">
            <el-input
              v-model="kube_pods_subnet"
              placeholder="10.233.64.0/18"
            ></el-input>
          </el-col>
          <div class="net">
            <el-form-item label="掩码"> {{ pod_netmask }} </el-form-item>
            <el-form-item label="IP大约(个)">
              {{ pod_count }}
            </el-form-item>
            <el-form-item label="IP范围">
              {{ pod_iplist }}
            </el-form-item>
          </div>
        </el-form-item>
        <el-form-item label="Ingress域名" label-width="300px">
          <el-col :span="12">
            <el-input
              v-model="external_domain_name"
              placeholder="www.test.com"
              type="url"
              spellcheck="true"
            ></el-input>
          </el-col>
        </el-form-item>
      </div>
      <el-row>
        <h5>二. 存储插件</h5>
        <div class="content">
          <h6>local-path</h6>
          <div class="content">
            <el-form-item label="数据存储路径" label-width="300px"
              ><span style="font-weight: normal"
                >(注:有pv存储需求的应用,
                会在选择节点使用当前路径创建pv.请保证此路径存储容量足够大,可用于私有镜像库/elk/prometheus/对象存储)</span
              >
              <el-tooltip
                content="local_path_provisioner_claim_root"
                placement="top-start"
              >
                <el-col :span="6">
                  <el-input
                    v-model="local_path_provisioner_claim_root"
                    placeholder="/data"
                    disabled
                  ></el-input>
                </el-col>
              </el-tooltip>
            </el-form-item>
          </div>
          <el-form-item label="nas文件系统" label-width="300px">
            <el-radio-group v-model="nfs_type">
              <el-radio-button
                label="external"
                >已有NAS</el-radio-button
              >
              <el-radio-button
                label="internal"
                >安装新NAS</el-radio-button
              >
              <el-radio-button
                label="none"
                >无</el-radio-button
              > </el-radio-group
            ><span style="font-weight: normal"
              >(注:私有镜像库/prometheus优先使用nas存储)</span
            >
          </el-form-item>
          <div class="content">
            <div v-if="nfs_type === 'external'">
                <el-form-item label="地址" label-width="300px">
                  <el-col :span="12">
                    <el-input
                      v-model="csi_driver_nfs_server"
                      placeholder="ip:port 或者域名地址 nfs.local.com"
                    ></el-input>
                  </el-col>
                </el-form-item>
                <el-form-item
                  label="存储路径"
                  label-width="300px"
                >
                  <el-col :span="6">
                    <el-input
                      v-model="csi_driver_nfs_path"
                      placeholder="/subpath"
                    ></el-input>
                  </el-col>
                </el-form-item>
            </div>
            <div v-else-if="nfs_type === 'internal'">
                <el-form-item
                  label="存储路径"
                  label-width="300px"
                >
                  <el-col :span="6">
                    <el-input
                      value="/data/nas_data" disabled
                    ></el-input>
                  </el-col>
                </el-form-item>
              <el-form-item label="选择节点" label-width="300px">
                <el-radio
                  v-model="nfs"
                  v-for="(host, index) in hostsList()"
                  :label="host"
                  :key="index"
                >
                  {{ host }}
                </el-radio>
              </el-form-item>
            </div>
          </div>
        </div>
      </el-row>
      <el-row >
        <h5>三. 私有镜像库</h5>
        <div class="content">
          <el-form-item label="是否安装" label-width="300px">
            <el-col :span="6">
              <el-tooltip
                :content="registry_enabled ? '安装' : '不安装'"
                placement="top-start"
              >
                <el-switch
                  active-color="#13ce66"
                  v-model="registry_enabled"
                >
                </el-switch>
              </el-tooltip>
            </el-col>
          </el-form-item>
          <div class="content" v-if="registry_enabled">
            <el-form-item
              label="选择节点"
              v-if="!csi_driver_nfs_enabled"
              label-width="300px"
            >
              <el-radio
                v-model="registry"
                v-for="(host, index) in hostsList()"
                :label="host"
                :key="index"
              >
                {{ host }}
              </el-radio>
            </el-form-item>
            <el-form-item label="存储容量" label-width="300px">
              <el-col :span="3">
                <el-input v-model="registry_disk_size" type="number" min="1">
                  <template slot="append">Gi</template>
                </el-input>
              </el-col>
            </el-form-item>
          </div>
        </div>
      </el-row>
      <el-row >
        <h5>四. 对象存储</h5>
        <div class="content">
          <el-form-item label="是否安装" label-width="300px">
            <el-col :span="6">
              <el-tooltip
                :content="minio_enabled ? '安装' : '不安装'"
                placement="top-start"
              >
                <el-switch
                  active-color="#13ce66"
                  v-model="minio_enabled"
                  @change="clickitem($event, 'minio')"
                >
                </el-switch>
              </el-tooltip>
            </el-col>
          </el-form-item>
          <div class="content" v-if="minio_enabled">
            <el-form-item
              label="每个工作节点存储容量"
              size="min"
              label-width="300px"
            >
              <el-col :span="3">
                <el-input
                  v-model="minio_storage_Gi"
                  type="number"
                  min="1"
                  size="small"
                >
                  <template slot="append">Gi</template>
                </el-input>
              </el-col>
            </el-form-item>
            <el-form-item
              label="经计算最大可存储数据"
              size="min"
              label-width="300px"
            >
              <el-col :span="3">
                <el-input
                  v-model="minio_total_storage"
                  type="number"
                  min="1"
                  size="small"
                  disabled
                >
                  <template slot="append">Gi</template>
                </el-input>
              </el-col>
            </el-form-item>

            <el-form-item label="访问地址" label-width="300px">
              <el-col :span="12">
                <el-input :value="minio_url" disabled></el-input>
              </el-col>
            </el-form-item>
            <el-form-item label="access key" label-width="300px">
              <el-col :span="6">
                <el-input value="minio" disabled></el-input>
              </el-col>
            </el-form-item>
            <el-form-item label="access secret" label-width="300px">
              <el-col :span="6">
                <el-input value="minio123" disabled></el-input>
              </el-col>
            </el-form-item>
          </div>
        </div>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";

export default {
  name: "Kubernetes",
  data() {
    return {};
  },
  computed: {
    svc_count: {
      get() {
        return this.ip_count(
          this.cidr(
            this.$store.state.jsonObj.all.children["k8s_cluster"].vars
              .kube_service_addresses
          )
        );
      },
    },
    svc_netmask: {
      get() {
        return this.netmask(
          this.cidr(
            this.$store.state.jsonObj.all.children["k8s_cluster"].vars
              .kube_service_addresses
          )
        );
      },
    },
    svc_iplist: {
      get() {
        return this.iplist(
          this.$store.state.jsonObj.all.children["k8s_cluster"].vars
            .kube_service_addresses
        );
      },
    },
    pod_count: {
      get() {
        return this.ip_count(
          this.cidr(
            this.$store.state.jsonObj.all.children["k8s_cluster"].vars
              .kube_pods_subnet
          )
        );
      },
    },
    pod_netmask: {
      get() {
        return this.netmask(
          this.cidr(
            this.$store.state.jsonObj.all.children["k8s_cluster"].vars
              .kube_pods_subnet
          )
        );
      },
    },
    pod_iplist: {
      get() {
        return this.iplist(
          this.$store.state.jsonObj.all.children["k8s_cluster"].vars
            .kube_pods_subnet
        );
      },
    },
    om_count: {
      get() {
        return this.$store.state.om_count;
      },
    },
    external_domain_name: {
      get() {
        return this.$store.state.jsonObj.all.vars.external_domain_name;
      },
      set(val) {
        return this.changeExternalDomainName(val);
      },
    },
    nfs_type: {
      get() {
        return this.$store.state.jsonObj.all.vars.nfs_type;
      },
      set(val) {
        return this.changeNfsType(val);
      },
    },
    csi_driver_nfs_enabled: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .csi_driver_nfs_enabled;
      },
      set(val) {
        return this.changeNFSEnabled(val);
      },
    },
    csi_driver_nfs_server: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .csi_driver_nfs_server;
      },
      set(val) {
        return this.changeNFSServer(val);
      },
    },
    csi_driver_nfs_path: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .csi_driver_nfs_path;
      },
      set(val) {
        return this.changeNFSPath(val);
      },
    },
    nfs: {
      get() {
        return this.$store.state.nfs_host;
      },
      set(val) {
        this.changeNfsHost(val);
      },
    },
    registry: {
      get() {
        return this.$store.state.registry;
      },
      set(val) {
        this.changeRegistry(val);
      },
    },
    registry_disk_size: {
      get() {
        return Number(
          this.$store.state.jsonObj.all.children[
            "k8s_cluster"
          ].vars.registry_disk_size.replace("Gi", "")
        );
      },
      set(val) {
        return this.changeRegistryDiskSize(String(val) + "Gi");
      },
    },
    registry_enabled: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .registry_enabled;
      },
      set(val) {
        return this.changeRegistryEnabled(val);
      },
    },
    prometheus_storage_Gi: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .prometheus_storage_Gi;
      },
      set(val) {
        return this.changePrometheusStorage(val);
      },
    },
    alertmanager_storage_Gi: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .alertmanager_storage_Gi;
      },
      set(val) {
        return this.changeAlertmanagerStorage(val);
      },
    },
    grafana_storage_Gi: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .grafana_storage_Gi;
      },
      set(val) {
        return this.changeGrafanaStorage(val);
      },
    },
    elastic_storage_Gi: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .elastic_storage_Gi;
      },
      set(val) {
        return this.changeElasticStorage(val);
      },
    },
    logstash_storage_Gi: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .logstash_storage_Gi;
      },
      set(val) {
        return this.changeLogstashStorage(val);
      },
    },
    kibana_url: {
      get() {
        return "https://" + this.external_domain_name + "/kibana";
      },
    },
    prometheus_url: {
      get() {
        return "https://" + this.external_domain_name + "/prometheus";
      },
    },
    alertmanager_url: {
      get() {
        return "https://" + this.external_domain_name + "/alertmanager";
      },
    },
    grafana_url: {
      get() {
        return "https://" + this.external_domain_name + "/grafana";
      },
    },
    minio_url: {
      get() {
        return (
          "https://" +
          this.external_domain_name +
          "/storage/{bucket_name}/{filepath}"
        );
      },
    },
    elk_enabled: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .elk_enabled;
      },
      set(val) {
        return this.changeElkEnabled(val);
      },
    },
    kube_service_addresses: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .kube_service_addresses;
      },
      set(val) {
        this.changeKubeServiceAddress(val);
      },
    },
    kube_pods_subnet: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .kube_pods_subnet;
      },
      set(val) {
        return this.changeKubePodSubnet(val);
      },
    },
    prometheus_stack_enabled: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .prometheus_stack_enabled;
      },
      set(val) {
        return this.changePrometheusStackEnabled(val);
      },
    },
    local_path_provisioner_claim_root: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .local_path_provisioner_claim_root;
      },
      set(val) {
        return this.changeLocalPathProvisioner(val);
      },
    },

    minio_enabled: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .minio_enabled;
      },
      set(val) {
        return this.changeMinioEnabled(val);
      },
    },
    minio_storage_Gi: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .minio_storage_per_server;
      },
      set(val) {
        return this.changeMinioStorage(val);
      },
    },
    minio_total_storage: {
      get() {
        let nodes = this.nodeList();
        // if (nodes.length === 1){
        //   return this.minio_storage_Gi
        // }
        return (nodes.length * this.minio_storage_Gi) / 2;
      },
    },
  },
  methods: {
    ...mapActions([]),
    ...mapGetters(["hostsList", "nodeList"]),
    ...mapMutations([
      "changeExternalDomainName",
      "changeRegistryDiskSize",
      "changePrometheusStackEnabled",
      "changePrometheusStorage",
      "changeAlertmanagerStorage",
      "changeGrafanaStorage",
      "changeLocalPathProvisioner",
      "changeElkEnabled",
      "changeElasticStorage",
      "changeLogstashStorage",
      "changeKubeServiceAddress",
      "changeKubePodSubnet",
      "changeOpsDomainName",
      "changeOpsNamespace",
      "changeMinioEnabled",
      "changeRegistry",
      "changeSgs",
      "changeLogging",
      "changeMonitoring",
      "cleanLogging",
      "changeMinioStorage",
      "changeNfsHost",
      "changeNfsType",
      "changeNFSEnabled",
      "changeNFSServer",
      "changeNFSPath",
      "changeRegistryEnabled",
    ]),
    clickitem(event, item) {
      if (item === "m" && event === false) {
        // this.cleanMonitoring()
      }
      if (item === "l" && event === false) {
        // this.cleanLogging()
      }
      if (item === "mongo" && event === false) {
        // this.cleanMongo()
      } else if (item === "mongo" && event === true) {
        this.initMongo();
      }
    },
    iplist(netaddr) {
      var cidr = this.cidr(netaddr);
      var netips = [];
      netips[0] = Number(netaddr.split("/")[0].split(".")[0]);
      netips[1] = Number(netaddr.split("/")[0].split(".")[1]);
      netips[2] = Number(netaddr.split("/")[0].split(".")[2]);
      netips[3] = Number(netaddr.split("/")[0].split(".")[3]);

      var netmasks = [];
      netmasks[0] = Number(this.netmask(cidr).split(".")[0]);
      netmasks[1] = Number(this.netmask(cidr).split(".")[1]);
      netmasks[2] = Number(this.netmask(cidr).split(".")[2]);
      netmasks[3] = Number(this.netmask(cidr).split(".")[3]);

      var min_ip =
        String(netips[0] & netmasks[0]) +
        "." +
        String(netips[1] & netmasks[1]) +
        "." +
        String(netips[2] & netmasks[2]) +
        "." +
        String(netips[3] & netmasks[3]);

      var max_ip = "";
      if (~netmasks[0] & (255 > 0)) {
        max_ip = String(~netmasks[0] & 255) + ".255.255.254";
      } else if (~netmasks[1] & (255 > 0)) {
        max_ip =
          String(netips[0] & netmasks[0]) +
          "." +
          String(~netmasks[1] & 255) +
          ".255.254";
      } else if (~netmasks[2] & (255 > 0)) {
        max_ip =
          String(netips[0] & netmasks[0]) +
          "." +
          String(netips[1] & netmasks[1]) +
          "." +
          String((~netmasks[2] & 255) | netips[2]) +
          ".254";
      } else if (~netmasks[3] & (255 > 0)) {
        max_ip =
          String(netips[0] & netmasks[0]) +
          "." +
          String(netips[1] & netmasks[1]) +
          "." +
          String(netips[2] & netmasks[2]) +
          "." +
          String((~netmasks[3] & 255) | netips[3]);
      }
      return min_ip + " - " + max_ip;
    },
    ip_count(cidr) {
      return 2 ** (32 - cidr);
    },
    cidr(netaddr) {
      var nets = netaddr.split("/");
      if (nets.length < 2) {
        return 0;
      }
      return Number(netaddr.split("/")[1]);
    },
    netmask(cidr) {
      var factor = parseInt(cidr / 8);
      var remainder = cidr % 8;
      var mi = 8 - remainder;
      var last_mask = 0;
      var return_netmask = "0.0.0.0";
      while (mi <= 7) {
        last_mask = 2 ** mi + last_mask;
        mi = mi + 1;
      }
      if (factor === 1 && last_mask == 0) {
        return_netmask = "255.0..0.0";
      } else if (factor == 1 && last_mask != 0) {
        return_netmask = "255." + String(last_mask) + ".0.0";
      } else if (factor == 2 && last_mask == 0) {
        return_netmask = "255.255.0.0";
      } else if (factor == 3 && last_mask == 0) {
        return_netmask = "255.255.255.0";
      } else if (factor == 3 && last_mask != 0) {
        return_netmask = "255.255.255." + String(last_mask);
      } else if (factor == 2 && last_mask != 0) {
        return_netmask = "255.255." + String(last_mask) + ".0";
      } else if (factor == 4) {
        return_netmask = "255.255.255.255";
      } else if (factor == 0) {
        return_netmask = String(last_mask) + ".0.0.0";
      }

      return return_netmask;
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
  },
};
</script>

<style scoped>
.net .el-form-item {
  margin: 1px;
  font-size: 0.3em;
  font-weight: normal;
}
.span {
  font-size: 0.3em;
  font-weight: normal;
}
</style>