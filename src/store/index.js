import Vue from 'vue'
import Vuex from 'vuex'
import deepcopy from "deepcopy";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    aliyunVisable: false,
    offlineVisable: false,
    activeIndex: "/",
    enable_custom_ntp: false,
    ntp_servers: ['ntp.aliyun.com'],
    hostname_prefix: "dkc",
    master_hosts: [{
      hostname: "dkc-master-1",
      ip: "192.168.57.2",
      master: true
    }],
    master_counts: [{
      value: 1,
      label: "1"
    }, {
      value: 3,
      label: "3"
    }],
    master_count: 1,
    node_hosts: [{
      hostname: "dkc-worker-1",
      ip: "192.168.57.5",
      master: false
    }],
    node_count: 1,
    om_hosts: [],
    om_count: 0,
    masters: [],
    sgs: [],
    primary: "",
    secondary: "",
    arbiter: "",
    registry: "",
    tracking: "",
    nfs_host: "",
    loading: true,
    form: {
      hosts: []
    },
    value: 'yes',
    active: 0,
    jsonObj: {
      all: {
        vars: {
          version: 3,
          login_type: "password", //sshkey
          external_domain_name: "www.dkc.com",
          docker_daemon_graph: "/var/lib/docker",
          nfs_type: "external", //internal(deploy),none
          ansible_user: "nonroot",
          ansible_password: "",
          ansible_sshkey: "",
          ansible_become: false,
          ansible_become_password: ""
        },
        hosts: {

        },
        children: {
          "k8s_cluster": {
            vars: {
              minio_enabled: true,
              minio_storage_per_server: 10,
              registry_disk_size: "30Gi",
              prometheus_stack_enabled: true,
              grafana_storage_Gi: 10,
              alertmanager_storage_Gi: 10,
              prometheus_storage_Gi: 30,
              elk_enabled: true,
              elastic_storage_Gi: 50,
              logstash_storage_Gi: 10,
              local_path_provisioner_claim_root: "/data",
              kube_service_addresses: "10.233.0.0/18",
              kube_pods_subnet: "10.233.64.0/18",
              csi_driver_nfs_enabled: false,
              csi_driver_nfs_server: "xxxxxxxxxx.cn-zhangjiakou.nas.aliyuncs.com",
              csi_driver_nfs_path: "/",
              prometheus_storage_class_name: "local-path",
              minio_storage_class_name: "local-path",
              elastic_master_storage_class_name: "local-path",
              registry_enabled: true,
              registry_storage_class: "local-path",
              registry_nodeSelector: {
                nodeType_registry: "true"
              },
              prometheus_stack_nodeselector: {
                nodeType_monitoring: "true"
              },
              minio_nodeSelector: {
                nodeType_minio: "true"
              },
            },
            children: {
              "kube_control_plane": {},
              "kube_node": {}
            },
          },
          "kube_control_plane": {
            vars: {
            },
            hosts: {}
          },
          etcd: {
            children: {
              "kube_control_plane": {}
            }
          },
          "kube_node": {
            children: {
              om: {}
            },
            hosts: {}
          },
          om: {
            vars: {},
            hosts: {}
          },
          nfs: {
            vars: {},
            hosts: {}
          }
        }
      }
    }

  },
  mutations: {
    changeJsonObj(state, value) {
      //all.vars
      Object.assign(state.jsonObj.all.vars, value.all.vars)

      //all.hosts
      state.jsonObj.all.hosts = value.all.hosts

      //k8s_cluster
      state.jsonObj.all.children.sg1 = value.all.children.sg1
      Object.assign(state.jsonObj.all.children["k8s_cluster"].vars, value.all.children["k8s_cluster"].vars)
      Object.assign(state.jsonObj.all.children["kube_control_plane"].vars, value.all.children["kube_control_plane"].vars)
      // master_hosts
      state.master_hosts = []
      state.jsonObj.all.children["kube_control_plane"].hosts = value.all.children["kube_control_plane"].hosts
      var master_keys = Object.keys(state.jsonObj.all.children["kube_control_plane"].hosts)
      var node_keys = Object.keys(value.all.children["kube_node"].hosts)
      var om_keys = Object.keys(value.all.children["om"].hosts)

      for (var i = 0; i < master_keys.length; i++) {
        state.master_hosts.push({
          "hostname": master_keys[i],
          "ip": state.jsonObj.all.hosts[master_keys[i]].ansible_host,
          "master": true
        }, )
        //hostname_prefix
        state.hostname_prefix = master_keys[i].split("-master-")[0]
      }
      state.master_count = master_keys.length
      // node_hosts
      state.node_hosts = []
      state.jsonObj.all.children["kube_node"].hosts = value.all.children["kube_node"].hosts
      state.node_count = 0
      for (i = 0; i < node_keys.length; i++) {
        node = node_keys[i]
        //排除master节点
        if (master_keys.includes(node) === false && om_keys.includes(node) === false) {
          state.node_hosts.push({
              "hostname": node_keys[i],
              "ip": state.jsonObj.all.hosts[node_keys[i]].ansible_host
            }, )
            ++state.node_count
        }
      }
      // om hosts
      state.om_hosts = []
      state.jsonObj.all.children["om"].hosts = value.all.children["om"].hosts
      state.om_count = 0
      for (i = 0; i < om_keys.length; i++) {
        node = om_keys[i]
        //排除master节点
        if (master_keys.includes(node) === false && node_keys.includes(node) === false) {
          state.om_hosts.push({
              "hostname": om_keys[i],
              "ip": state.jsonObj.all.hosts[om_keys[i]].ansible_host
            }, )
            ++state.om_count
        }
      }
      //ntp
      if (Object.keys(value.all.vars).includes("ntp_servers") === false) {
        state.enable_custom_ntp = false
      } else {
        state.enable_custom_ntp = true
        state.ntp_servers = state.jsonObj.all.vars.ntp_servers
      }
      //login_type
      if (Object.keys(value.all.vars).includes("login_type") === false) {
        state.jsonObj.all.vars.login_type = "password"
      }
      //nfs_type
      if (Object.keys(value.all.vars).includes("nfs_type") === false) {
        if (value.all.children.k8s_cluster.vars.csi_driver_nfs_enabled) {
          state.jsonObj.all.vars.nfs_type = 'external'
        } else {
          state.jsonObj.all.vars.nfs_type = 'none'
        }
      } else if (value.all.vars.nfs_type === 'internal') {
        state.nfs_host = value.all.children.k8s_cluster.vars.csi_driver_nfs_server
      }

      //label
      state.registry = ""
    
      var hosts_keys = Object.keys(state.jsonObj.all.hosts)
      for (i = 0; i < hosts_keys.length; i++) {
        var node = hosts_keys[i]
        if (Object.keys(state.jsonObj.all.hosts[node]).includes("node_labels")) {
          if (Object.keys(state.jsonObj.all.hosts[node].node_labels).includes("nodeType_registry")) {
            state.registry = node
          }
        }
      }

    },
    changeHostnamePrefix(state, value) {
      state.hostname_prefix = value
      let _this = state
      var suffix
      var update_map = {}
      for (var i = 0; i < _this.master_hosts.length; i++) {
        suffix = _this.master_hosts[i].hostname.split("-master-")
        update_map[_this.master_hosts[i].hostname] = _this.hostname_prefix + "-master-" + suffix[1]
        _this.master_hosts[i].hostname = _this.hostname_prefix + "-master-" + suffix[1]
      }
      for (i = 0; i < _this.node_hosts.length; i++) {
        suffix = _this.node_hosts[i].hostname.split("-worker-")
        update_map[_this.node_hosts[i].hostname] = _this.hostname_prefix + "-worker-" + suffix[1]
        _this.node_hosts[i].hostname = _this.hostname_prefix + "-worker-" + suffix[1]
      }
      for (i = 0; i < _this.om_hosts.length; i++) {
        suffix = _this.om_hosts[i].hostname.split("-om-")
        update_map[_this.om_hosts[i].hostname] = _this.hostname_prefix + "-om-" + suffix[1]
        _this.om_hosts[i].hostname = _this.hostname_prefix + "-om-" + suffix[1]
      }
      if (Object.keys(update_map).includes(_this.primary)) {
        _this.primary = update_map[_this.primary]
      }
      if (Object.keys(update_map).includes(_this.secondary)) {
        _this.secondary = update_map[_this.secondary]
      }
      if (Object.keys(update_map).includes(_this.arbiter)) {
        _this.arbiter = update_map[_this.arbiter]
      }

  
      if (Object.keys(update_map).includes(_this.registry)) {
        _this.registry = update_map[_this.registry]
      }
      if (Object.keys(update_map).includes(_this.monitoring)) {
        _this.monitoring = update_map[_this.monitoring]
      }

    },
    changeLoginType(state, value) {
      state.jsonObj.all.vars.login_type = value
    },
    changeRemoteSSHkey(state, value) {
      state.jsonObj.all.vars.ansible_sshkey = value
    },
    changeExternalDomainName(state, value) {
      state.jsonObj.all.vars.external_domain_name = value
    },
    changeDockerDaemonGraph(state, value) {
      state.jsonObj.all.vars.docker_daemon_graph = value
    },
    changeRegistryDiskSize(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.registry_disk_size = value
    },
    changeRegistryEnabled(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.registry_enabled = value
    },
    changePrometheusStackEnabled(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.prometheus_stack_enabled = value
    },
    changePrometheusStorage(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.prometheus_storage_Gi = value
    },
    changePrometheusStorageClass(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.prometheus_storage_class_name = value
    },
    changeAlertmanagerStorage(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.alertmanager_storage_Gi = value
    },
    changeGrafanaStorage(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.grafana_storage_Gi = value
    },
    changeElkEnabled(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.elk_enabled = value
    },

    changeNFSEnabled(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_enabled = value
    },
    changeNFSServer(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_server = value
    },
    changeNFSPath(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_path = value
    },
    changeElasticStorage(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.elastic_storage_Gi = value
    },
    changeLogstashStorage(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.logstash_storage_Gi = value
    },
    changeMinioStorage(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.minio_storage_per_server = value
    },
    changeMinioStorageClass(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.minio_storage_per_server = value
    },
    changeLocalPathProvisioner(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.local_path_provisioner_claim_root = value
    },
    changeKubeServiceAddress(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.kube_service_addresses = value
    },
    changeKubePodSubnet(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.kube_pods_subnet = value
    },

    changeMinioEnabled(state, value) {
      state.jsonObj.all.children["k8s_cluster"].vars.minio_enabled = value
    },
    changeNfsType(state, value) {
      state.jsonObj.all.vars.nfs_type = value
      state.jsonObj.all.children["k8s_cluster"].vars.csi_driver_nfs_enabled = value !== 'none'
    },

    changeRemoteMachineUsername(state, value) {
      state.jsonObj.all.vars.ansible_user = value
    },
    changeRemoteMachinePassword(state, value) {
      state.jsonObj.all.vars.ansible_password = value
    },
    changeAnsibleBecomePassword(state, value) {
      state.jsonObj.all.vars.ansible_become_password = value
    },
    changeMasterCount(state, value) {
      let _this = state
      var length = _this.master_hosts.length
      var ip = parseInt(_this.master_hosts[0].ip.split(".")[3])
      var sub = _this.master_hosts[0].ip.substr(0, _this.master_hosts[0].ip.lastIndexOf('.') + 1)
      if (value > length) {
        for (var i = 0; i < value - length; i++) {
          _this.master_hosts.push({
            hostname: _this.hostname_prefix + "-master-" + (_this.master_hosts.length + 1),
            ip: sub + (ip + i + 1),
            master: true
          })
        }
      } else if (value < length) {
        _this.master_hosts.splice(value, length - value)
      }
      _this.master_count = value
    },
    changeNodeCount(state, value) {
      let _this = state
      var length = _this.node_hosts.length
      if (length > 0) {
        var ip = parseInt(_this.node_hosts[0].ip.split(".")[3])
        var sub = _this.node_hosts[0].ip.substr(0, _this.node_hosts[0].ip.lastIndexOf('.') + 1)
      } else {
        ip = 5
        sub = "192.168.57."
      }

      if (value > length) {
        for (var i = 0; i < value - length; i++) {
          _this.node_hosts.push({
            hostname: _this.hostname_prefix + "-worker-" + (_this.node_hosts.length + 1),
            ip: sub + (ip + _this.node_hosts.length)
          })
        }
      } else if (value < length) {
        _this.node_hosts.splice(value, length - value)
      }
      _this.node_count = value
    },
    changeOmCount(state, value) {
      let _this = state
      var length = _this.om_hosts.length
      if (length > 0) {
        var ip = parseInt(_this.om_hosts[0].ip.split(".")[3])
        var sub = _this.om_hosts[0].ip.substr(0, _this.om_hosts[0].ip.lastIndexOf('.') + 1)
      } else {
        ip = 15
        sub = "192.168.57."
      }

      if (value > length) {
        for (var i = 0; i < value - length; i++) {
          _this.om_hosts.push({
            hostname: _this.hostname_prefix + "-om-" + (_this.om_hosts.length + 1),
            ip: sub + (ip + _this.om_hosts.length)
          })
        }
      } else if (value < length) {
        _this.om_hosts.splice(value, length - value)
      }
      _this.om_count = value
    },
    changeMasterHosts(state, val) {
      state.master_hosts = val
    },
    changeNodeHosts(state, val) {
      state.node_hosts = val
    },
    changeOmHosts(state, val) {
      state.om_hosts = val
    },
    changeRegistry(state, val) {
      state.registry = val
    },
    changeNfsHost(state, val) {
      state.nfs_host = val
    },

    initState(state) {
      state.sgs = []


      state.tracking = ""
      if (state.node_count > 0) {
        state.registry = state.node_hosts[0].hostname
      } else {
        state.registry = state.master_hosts[0].hostname
      }
    },
    changeNtpServers(state, val) {
      state.ntp_servers = val
    },
    changeEnableCustomNtp(state, val) {
      state.enable_custom_ntp = val
    },
  },
  actions: {},
  modules: {},
  getters: {
    hostsList(state) {
      let _this = state
      var hosts = []
      if (_this.node_hosts.length === 0) {
        for (var i = 0; i < _this.master_hosts.length; i++) {
          hosts.push(_this.master_hosts[i].hostname)
        }
      }

      for (i = 0; i < _this.node_hosts.length; i++) {
        if (hosts.indexOf(_this.node_hosts[i].hostname) === -1) {
          hosts.push(_this.node_hosts[i].hostname)
        }
      }
      return hosts;
    },
    nodeHostsList(state) {
      let _this = state
      var hosts = []
      for (var i = 0; i < _this.node_hosts.length; i++) {
        if (hosts.indexOf(_this.node_hosts[i].hostname) === -1) {
          hosts.push(_this.node_hosts[i].hostname)
        }
      }
      return hosts;
    },
    nodeList(state) {
      // var hosts = {}
      let _this = state
      var nodes = []

      nodes = deepcopy(_this.sgs)

      // if (_this.registry !== "") {
      //   if (nodes.includes(_this.registry) === false) {
      //     nodes.push(_this.registry)
      //   }
      // }
      if (_this.node_hosts.length === 0) {
        for (var i = 0; i < _this.master_hosts.length; i++) {
          nodes.push(_this.master_hosts[i].hostname)
        }
      }
      for (i = 0; i < _this.node_hosts.length; i++) {
        // if (_this.primary !== _this.node_hosts[i].hostname && _this.secondary !== _this.node_hosts[i].hostname && _this.arbiter !== _this.node_hosts[i].hostname) {
        if (nodes.includes(_this.node_hosts[i].hostname) === false) {
          nodes.push(_this.node_hosts[i].hostname)
        }
        // }
      }
      console.log(nodes)
      return nodes
    },

  }
})