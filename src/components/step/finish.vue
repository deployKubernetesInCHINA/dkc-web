<template>
  <div>
    <el-row>
      <el-button
        style="margin-top: 12px; text-align: center"
        type="primary"
        @click="download()"
        >下载hosts.yaml
      </el-button>
    </el-row>
    <h5>一. 集群拓扑:</h5>
    <div class="comment">
      <ol>
        <li>
          运维监控节点一定是独占的, 此节点不会被调度没有容忍om.dkc=true:NoExecute的pod
        </li>
      </ol>
    </div>
    <el-table
      :data="form"
      :span-method="arraySpanMethod"
      border
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column prop="hostname" label="Hostname"> </el-table-column>
      <el-table-column prop="ip" label="Ip"> </el-table-column>
      <el-table-column
        prop="master"
        label="Kube-Master"
        :formatter="formatBoolean"
      >
      </el-table-column>

      <el-table-column label="Kube-Node">
        <el-table-column prop="nas" :label="nas" :formatter="formatBoolean">
        </el-table-column>
        <el-table-column
          prop="registry"
          :label="registry_name"
          :formatter="formatBoolean"
        >
        </el-table-column>
        <el-table-column
          prop="minio"
          label="对象存储"
          :formatter="formatBoolean"
        >
        </el-table-column>
        <el-table-column prop="om" label="运维监控"> </el-table-column>
      </el-table-column>
      <el-table-column label="预计使用存储容量(单位Gi)">
        <el-table-column prop="localpath_storage" label="local-path(/data)">
        </el-table-column>
        <el-table-column
          prop="nfs_storage"
          label="nas文件系统"
          v-if="nfs_enabled"
        >
        </el-table-column>
      </el-table-column>
    </el-table>
    <h5>二. 预览:</h5>
    <el-button
      class="btn"
      type="info"
      size="mini"
      style="float: left"
      icon="el-icon-document-copy"
      data-clipboard-target="#demoInput"
      @click="copyLink"
    ></el-button>
    <el-input
      id="demoInput"
      type="textarea"
      :value="this.jsonObjStr"
      autosize
    ></el-input>
  </div>
</template>

<script>
import jsYaml from "js-yaml";
import * as deepcopy from "deepcopy";
import { mapGetters } from "vuex";

export default {
  name: "Finish",
  data() {
    return {};
  },
  computed: {
    form: {
      get() {
        return this.emback();
      },
    },
    registry_name: {
      get() {
        if (this.$store.state.jsonObj.all.vars.nfs_type != "none") {
          return "镜像库(nas存储)";
        }
        return "镜像库";
      },
    },
    nas: {
      get() {
        if (this.$store.state.jsonObj.all.vars.nfs_type === "internal") {
          return "nas(内部)";
        } else if (this.$store.state.jsonObj.all.vars.nfs_type === "external") {
          return "nas(外部)";
        } else {
          return "nas(无)";
        }
      },
    },
    master_hosts: {
      get() {
        return this.$store.state.master_hosts;
      },
    },
    node_hosts: {
      get() {
        return this.$store.state.node_hosts;
      },
    },
    om_hosts: {
      get() {
        return this.$store.state.om_hosts;
      },
    },

    minio_enabled: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .minio_enabled;
      },
    },
    registry: {
      get() {
        return this.$store.state.registry;
      },
    },
    registry_enabled: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .registry_enabled;
      },
    },
    nfs_enabled: {
      get() {
        return this.$store.state.jsonObj.all.children["k8s_cluster"].vars
          .csi_driver_nfs_enabled;
      },
    },
    nfs_internal: {
      get() {
        return this.$store.state.jsonObj.all.vars.nfs_type === "internal";
      },
    },
    nfs_host: {
      get() {
        return this.$store.state.nfs_host;
      },
    },
    jsonObj: {
      get() {
        let jsonObj = deepcopy(this.$store.state.jsonObj);
        var allhosts = [].concat(this.master_hosts, this.node_hosts);

        jsonObj.all.children["kube_node"].hosts = {};
        jsonObj.all.children["kube_control_plane"].hosts = {};

        for (var key in jsonObj.all.hosts) {
          if (key !== "localhost") {
            delete jsonObj.all.hosts[key];
          }
        }
        //ntp
        if (this.$store.state.enable_custom_ntp) {
          jsonObj.all.vars.ntp_servers = this.$store.state.ntp_servers;
        } else {
          delete jsonObj.all.vars.ntp_servers;
        }

        // login type
        if (this.$store.state.jsonObj.all.vars.login_type === "password") {
          delete jsonObj.all.vars.ansible_sshkey;
          jsonObj.all.vars.ansible_become_password =
            this.$store.state.jsonObj.all.vars.ansible_password;
        } else {
          delete jsonObj.all.vars.ansible_password;
        }
        if (this.$store.state.jsonObj.all.vars.ansible_user !== "root") {
          jsonObj.all.vars.ansible_become = true;
        } else {
          jsonObj.all.vars.ansible_become = false;
          delete jsonObj.all.vars.ansible_become_password;
        }

        // om setup
        jsonObj.all.children["k8s_cluster"].vars.elk_enabled =
          this.om_hosts.length > 0;
        jsonObj.all.children["k8s_cluster"].vars.prometheus_stack_enabled =
          this.om_hosts.length > 0;
        jsonObj.all.children["k8s_cluster"].vars.elastic_storage_Gi = Number(
          jsonObj.all.children["k8s_cluster"].vars.elastic_storage_Gi
        );
        jsonObj.all.children["k8s_cluster"].vars.logstash_storage_Gi = Number(
          jsonObj.all.children["k8s_cluster"].vars.logstash_storage_Gi
        );
        jsonObj.all.children["k8s_cluster"].vars.prometheus_storage_Gi = Number(
          jsonObj.all.children["k8s_cluster"].vars.prometheus_storage_Gi
        );
        jsonObj.all.children["k8s_cluster"].vars.alertmanager_storage_Gi =
          Number(
            jsonObj.all.children["k8s_cluster"].vars.alertmanager_storage_Gi
          );
        jsonObj.all.children["k8s_cluster"].vars.grafana_storage_Gi = Number(
          jsonObj.all.children["k8s_cluster"].vars.grafana_storage_Gi
        );
        if (this.om_hosts.length > 0) {
          jsonObj.all.children["k8s_cluster"].vars.logging_data_count =
            this.om_hosts.length;
          if (this.om_hosts.length > 2) {
            jsonObj.all.children["k8s_cluster"].vars.logging_master_count = 3;
          } else {
            jsonObj.all.children["k8s_cluster"].vars.logging_master_count = 1;
          }
        } else {
          jsonObj.all.children["k8s_cluster"].vars.logging_data_count = 0;
          jsonObj.all.children["k8s_cluster"].vars.logging_master_count = 0;
        }
        // nfs setup
        if (jsonObj.all.vars.nfs_type === "internal") {
          jsonObj.all.children[
            "k8s_cluster"
          ].vars.csi_driver_nfs_enabled = true;
          // nfs ip
          for (var j = 0; j < this.$store.state.node_hosts.length; j++) {
            if (
              this.$store.state.node_hosts[j].hostname ===
              this.$store.state.nfs_host
            ) {
              jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_server =
                this.$store.state.node_hosts[j].ip;
            }
          }
          jsonObj.all.children.nfs.hosts[this.$store.state.nfs_host] = {};
        }
        //minio setup
        jsonObj.all.children["k8s_cluster"].vars.minio_enabled = Boolean(
          jsonObj.all.children["k8s_cluster"].vars.minio_enabled
        );
        jsonObj.all.children["k8s_cluster"].vars.minio_storage_per_server =
          Number(
            jsonObj.all.children["k8s_cluster"].vars.minio_storage_per_server
          );
        jsonObj.all.children["k8s_cluster"].vars.minio_servers_count =
          this.nodeList().length;

        jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_enabled =
          Boolean(
            jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_enabled
          );
        if (jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_enabled) {
          jsonObj.all.children[
            "k8s_cluster"
          ].vars.prometheus_storage_class_name = "nfs-csi";
          jsonObj.all.children[
            "k8s_cluster"
          ].vars.prometheus_storage_class_name = "nfs-csi";
          jsonObj.all.children[
            "k8s_cluster"
          ].vars.elastic_master_storage_class_name = "nfs-csi";
          jsonObj.all.children["k8s_cluster"].vars.registry_storage_class =
            "nfs-csi";

          //禁止prometheus/registry 漂移
          jsonObj.all.children["k8s_cluster"].vars.registry_nodeSelector = {};
          // jsonObj.all.children["k8s_cluster"].vars.prometheus_stack_nodeselector = {}
        }

        // set logging monitoring

        for (var i = 0; i < allhosts.length; i++) {
          jsonObj.all.hosts[allhosts[i].hostname] = {};
          jsonObj.all.hosts[allhosts[i].hostname]["ansible_host"] =
            allhosts[i].ip;
          jsonObj.all.hosts[allhosts[i].hostname].ansible_port = 22;
          jsonObj.all.hosts[allhosts[i].hostname]["node_labels"] = {};
          if (allhosts[i].master) {
            jsonObj.all.children["kube_control_plane"].hosts[
              allhosts[i].hostname
            ] = {};
            if (this.node_hosts.length === 0) {
              jsonObj.all.children["kube_node"].hosts[allhosts[i].hostname] =
                {};
            }
          } else {
            jsonObj.all.children["kube_node"].hosts[allhosts[i].hostname] = {};
            jsonObj.all.hosts[allhosts[i].hostname].node_labels[
              "node-role.kubernetes.io/worker"
            ] = ""; // add role: worker
          }
          if (
            !jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_enabled
          ) {
            if (this.registry === allhosts[i].hostname) {
              jsonObj.all.hosts[allhosts[i].hostname].node_labels[
                "nodeType_registry"
              ] = "true";
              jsonObj.all.children["kube_node"].hosts[allhosts[i].hostname] =
                {};
            }
          }
          //minio 部署在所有worker节点
          if (
            jsonObj.all.children["k8s_cluster"].vars.minio_enabled &&
            this.nodeList().includes(allhosts[i].hostname)
          ) {
            // jsonObj.all.hosts[allhosts[i].hostname].node_labels["nodeType_minio"] = "true"
            jsonObj.all.children.k8s_cluster.vars.minio_nodeSelector = {};
          }

        }

        // om group setup
        for (i = 0; i < this.om_hosts.length; i++) {
          let node = this.om_hosts[i];
          jsonObj.all.hosts[node.hostname] = {};
          jsonObj.all.hosts[node.hostname]["ansible_host"] = node.ip;
          jsonObj.all.hosts[node.hostname].ansible_port = 22;
          jsonObj.all.children["om"].hosts[node.hostname] = {};
          jsonObj.all.hosts[node.hostname]["node_labels"] = {};
          jsonObj.all.hosts[node.hostname].node_labels[
            "nodeType_logging_data"
          ] = "true";
          jsonObj.all.hosts[node.hostname].node_labels[
            "nodeType_logging_master"
          ] = "true";
          jsonObj.all.hosts[node.hostname].node_labels["nodeType_monitoring"] =
            "true";
          jsonObj.all.hosts[node.hostname].node_labels[
            "node-role.kubernetes.io/om"
          ] = ""; // add role: om
          jsonObj.all.hosts[node.hostname].node_taints = [
            "om.dkc=true:NoExecute",
          ];
        }
        //根据工作节点个数设置elastic master
        return jsonObj;
      },
    },
    jsonObjStr: {
      get() {
        return jsYaml.dump(this.jsonObj);
      },
    },
  },
  methods: {
    ...mapGetters(["nodeList"]),
    formatBoolean: function (row, column, cellValue) {
      var ret = ""; //你想在页面展示的值
      if (cellValue) {
        ret = "是"; //根据自己的需求设定
      } else {
        ret = "";
      }
      return ret;
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      console.log(row, column, rowIndex);
      if (columnIndex === 8) {
        return {
          rowspan:
            this.master_hosts.length +
            this.node_hosts.length +
            this.om_hosts.length,
          colspan: 1,
        };
      }
    },
    emback() {
      let _this = this;
      let form = [];
      // for (var i = 0; i < _this.master_hosts.length; i++) {
      //   form.push(_this.master_hosts[i])
      // }
      // for (i = 0; i < _this.node_hosts.length; i++) {
      //   form.push(_this.node_hosts[i])
      // }
      form = [].concat(_this.master_hosts, _this.node_hosts);

      for (var j = 0; j < form.length; j++) {
        form[j].om = "";
        form[j].localpath_storage = 0;
        form[j].nfs_storage = 0;

        if (_this.minio_enabled) {
          form[j].minio = _this.nodeList().includes(form[j].hostname);
        } else {
          form[j].minio = false;
        }
        //nas
        if (_this.nfs_internal) {
          form[j].nas = _this.nfs_host === form[j].hostname;
        } else {
          form[j].nas = false;
        }
      }

      //设置logging master node
      // if (_this.elk_enabled) {
      //   logMasterlist = _this.getLoggingMasterList()
      // }
      for (j = 0; j < _this.om_hosts.length; j++) {
        let node = this.om_hosts[j];
        node.om = "独占";
        node.mongo = "";
        node.registry = false;
        node.minio = false;
        form.push(node);
      }
      for (j = 0; j < form.length; j++) {
        var host = form[j];
        // host.logging_master = (_this.elk_enabled && logMasterlist.includes(host.hostname))
        host.localpath_storage = 0;
        host.nfs_storage = 0;
        if (!_this.nfs_enabled) {
          if (host.om) {
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .logstash_storage_Gi
            );
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .elastic_storage_Gi
            );

            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .prometheus_storage_Gi
            );
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .alertmanager_storage_Gi
            );
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .grafana_storage_Gi
            );
          }
          if (host.registry) {
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children[
                "k8s_cluster"
              ].vars.registry_disk_size.replace("Gi", "")
            );
          }
          if (host.minio) {
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .minio_storage_per_server
            );
          }
        } else {
          if (host.om) {
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .logstash_storage_Gi
            );
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .elastic_storage_Gi
            );
          }

          if (host.minio) {
            host.localpath_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .minio_storage_per_server
            );
          }
        }

        //registry,  offline部署在选择节点; nfs部署在dkc节点
        if (!_this.nfs_enabled) {
          host.registry =
            _this.registry_enabled && _this.registry === host.hostname;
        }

        //registry,  offline部署在选择节点; nfs部署在dkc节点
        if (_this.nfs_enabled) {
          host.registry = _this.registry_enabled && host.sg;
          // form[j].registry = false
        }
        //统计nfs存储容量
        if (_this.nfs_enabled) {
          if (_this.om_hosts.length > 0) {
            host.nfs_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .prometheus_storage_Gi
            );
            host.nfs_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .alertmanager_storage_Gi
            );
            host.nfs_storage += Number(
              _this.$store.state.jsonObj.all.children["k8s_cluster"].vars
                .grafana_storage_Gi
            );
          }
          if (_this.registry_enabled) {
            host.nfs_storage += Number(
              _this.$store.state.jsonObj.all.children[
                "k8s_cluster"
              ].vars.registry_disk_size.replace("Gi", "")
            );
          }
        }
      }

      return form;
    },
    download() {
      const yaml = require("js-yaml");
      this.createAndDownloadFile("hosts.yaml", yaml.dump(this.jsonObj));
    },
    createAndDownloadFile(fileName, content) {
      var aTag = document.createElement("a");
      var blob = new Blob([content]);
      aTag.download = fileName;
      aTag.href = URL.createObjectURL(blob);
      aTag.click();
      URL.revokeObjectURL(blob);
    },
    copyLink() {
      let _this = this;
      let clipboard = new this.clipboard(".btn");
      clipboard.on("success", function () {
        _this.$message("复制成功");
        clipboard.destroy();
      });
      clipboard.on("error", function () {
        _this.$message("复制失败");
        clipboard.destroy();
      });
    },
  },
};
</script>

<style scoped>
.tb-edit .el-input {
  display: none;
}

.tb-edit .current-row .el-input {
  display: block;
}

.tb-edit .current-row .el-input + span {
  display: none;
}

.comment {
  color: #999999;
  font-weight: normal;
}
</style>