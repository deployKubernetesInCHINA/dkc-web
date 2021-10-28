<template>
  <div>
    <el-steps :active="active" finish-status="success" process-status="process">
      <el-step title="集群拓扑配置"></el-step>
      <el-step title="基本参数配置"></el-step>
      <el-step title="Kubernetes App配置"></el-step>
      <el-step title="运维监控"></el-step>

      <el-step title="完成"></el-step>
    </el-steps>

    <el-row style="margin: auto;text-align: center">
      <el-button style="margin-top: 12px;" size="small" @click="prev" :disabled="active===0">上一步
      </el-button>
      <el-button style="margin-top: 12px; " size="small" @click="next" :disabled="active===4">下一步
      </el-button>
    </el-row>

    <el-form ref="form" label-width="120px" label-position="left" size="mini">
      <el-row v-if="active===0">
        <NodeTopology></NodeTopology>
      </el-row>
      <!--<Hosts></Hosts>-->
      <div v-if="active===1">
        <BaseSetup></BaseSetup>
      </div>
      <div v-if="active===2">
        <Kubernetes></Kubernetes>
      </div>
      <div v-if="active===3">
        <om></om>
      </div>
      <div v-if="active===4">
        <Finish></Finish>
      </div>
    </el-form>
  </div>
</template>

<script>
  import om from "./step/om"
  import BaseSetup from "./step/baseSetup";
  import NodeTopology from "./step/nodeTopology";
  import Finish from "./step/finish";
  import Kubernetes from "./step/kubernetes"
  import {mapMutations, mapActions, mapGetters} from "vuex";

  export default {
    name: "Edit",
    components: {Finish, NodeTopology, BaseSetup, Kubernetes, om},
    props: {master_count_base: Number, node_count_base: Number, deploy_type: String},
    mounted() {
      if (this.master_count_base !== 0) {
        this.initcount()
        this.initState()
      }
    },
    computed: {
      hostname: {
        get(){
          return this.$store.state.hostname_prefix
        }
      },
      login_type:{
        get(){
          return this.$store.state.jsonObj.all.vars.login_type
        }
      },
      remote_sshkey: {
        get() {
          return this.$store.state.jsonObj.all.vars.ansible_sshkey
        }
      },
      remote_machine_username: {
        get() {
          return this.$store.state.jsonObj.all.vars.ansible_user
        }
      },
      remote_machine_password: {
        get() {
          return this.$store.state.jsonObj.all.vars.ansible_password
        }
      },
      master_hosts: {
        get() {
          return this.$store.state.master_hosts
        }
      },
      node_hosts: {
        get() {
          return this.$store.state.node_hosts
        }
      },
      om_hosts: {
        get() {
          return this.$store.state.om_hosts
        }
      },
      registry: {
        get() {
          return this.$store.state.registry
        }
      },
    },
    methods: {
      ...mapMutations([
        'changeMasterCount',
        'changeNodeCount',
        'initState',
      ]),
      ...mapActions([]),
      ...mapGetters(['hostsList']),
      initcount() {
        this.changeMasterCount(this.master_count_base)
        this.changeNodeCount(this.node_count_base)
      },
      validateTopologyNull() {
        if (this.hostname === ""){
          return "hostname前缀不能为空 "
        }
        if(this.login_type === "password"){
          if (this.remote_machine_password === ""){
            return "密码 不能为空"
          }
        }else{
          if (this.isValidSSHkey(this.remote_sshkey) !== ""){
            return this.isValidSSHkey(this.remote_sshkey)
          }
        }
        var ips = []
        var nodes = [].concat(this.master_hosts, this.node_hosts, this.om_hosts)
        for (var i = 0; i < nodes.length; i++) {
          var ip = nodes[i].ip
          if (ips.includes(ip) === false) {
            ips.push(ip)
          } else {
            return "重复ip: " + ip
          }
        }
        return ""
      },
      validateBaseSetupNull() {
        if (this.isValidAbspath(this.$store.state.jsonObj.all.vars.docker_daemon_graph) !== "") {
          return "docker daemon存储路径 " + this.isValidAbspath(this.$store.state.jsonObj.all.vars.docker_daemon_graph)
        }
        if (this.$store.state.enable_custom_ntp) {
          var f = false
          for (var i = 0; i < this.$store.state.ntp_servers.length; i++) {
            if (this.$store.state.ntp_servers[i] !== "") {
              if (this.isValidDomain(this.$store.state.ntp_servers[i]) !== "") {
                return "ntp server" + i + this.isValidDomain(this.$store.state.ntp_servers[i])
              } else {
                f = true
              }
            }
          }
          if (f === false) {
            return "ntp servers 不能为空"
          }
        }
        return ""
      },
      validateKubernetesNull() {
        if (this.isValidIP(this.$store.state.jsonObj.all.children['k8s_cluster'].vars.kube_service_addresses) !== "") {
          return "Kube Service Address " + this.isValidIP(this.$store.state.jsonObj.all.children['k8s_cluster'].vars.kube_service_addresses)
        }
        if (this.isValidIP(this.$store.state.jsonObj.all.children['k8s_cluster'].vars.kube_pods_subnet) !== "") {
          return "Kube Pod Subnet " + this.isValidIP(this.$store.state.jsonObj.all.children['k8s_cluster'].vars.kube_pods_subnet)
        }
        if (this.isValidDomain(this.$store.state.jsonObj.all.vars.external_domain_name) !== "") {
          return "Ingress 域名" + this.isValidDomain(this.$store.state.jsonObj.all.vars.external_domain_name)
        }
        if (this.isValidAbspath(this.$store.state.jsonObj.all.children['k8s_cluster'].vars.local_path_provisioner_claim_root) !== "") {
          return "local_path_provisioner存储路径 " + this.isValidAbspath(this.$store.state.jsonObj.all.children['k8s_cluster'].vars.local_path_provisioner_claim_root)
        }
        if (this.$store.state.jsonObj.all.vars.nfs_type === "internal") {
          if (this.$store.state.nfs_host === "") {
            return "请选择nfs节点"
          }
        }
        if (!this.$store.state.jsonObj.all.children['k8s_cluster'].vars.csi_driver_nfs_enabled) {
          if (this.$store.state.jsonObj.all.children['k8s_cluster'].vars.registry_enabled && this.$store.state.registry === "") {
            return "请选择镜像库节点"
          }
        }
        return ""
      },
      validateOmNull() {
        if (this.$store.state.jsonObj.all.children["k8s_cluster"].vars.elk_enabled) {
          if (this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.logstash_storage_Gi) !== "") {
            return "Logstash.storage" + this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.logstash_storage_Gi)
          }
          if (this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.elastic_storage_Gi) !== "") {
            return "Elastic.storage " + this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.elastic_storage_Gi)
          }
        }
        if (this.$store.state.jsonObj.all.children["k8s_cluster"].vars.prometheus_stack_enabled) {
          if (this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.alertmanager_storage_Gi) !== "") {
            return "AlertManager.storage" + this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.alertmanager_storage_Gi)
          }
          if (this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.prometheus_storage_Gi) !== "") {
            return "Prometheus.storage " + this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.prometheus_storage_Gi)
          }
          if (this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.grafana_storage_Gi) !== "") {
            return "Grafana.storage " + this.isValidNumber(this.$store.state.jsonObj.all.children["k8s_cluster"].vars.grafana_storage_Gi)
          }
        }
        return ""
      },
      next() {
        if (this.active === 0) {
          if (this.validateTopologyNull() !== "") {
            this.$message.error(this.validateTopologyNull())
            return
          }
        }else if(this.active === 1) {
          if (this.validateBaseSetupNull() !== "") {
            this.$message.error(this.validateBaseSetupNull())
            return
          }
        }
        else if (this.active === 2) {
          if (this.validateKubernetesNull() !== "") {
            this.$message.error(this.validateKubernetesNull())
            return;
          }
        } else if (this.active === 3) {
          if (this.validateOmNull() !== "") {
            this.$message.error(this.validateOmNull())
            return;
          }
        }
        if (this.active++ > 3) this.active = 0;

      },
      prev() {
        if (this.active-- < 0) this.active = 0;
      },
      isValidSSHkey(sshkey){
        if (sshkey.search("-----BEGIN RSA PRIVATE KEY-----") === -1 && sshkey.search("-----BEGIN OPENSSH PRIVATE KEY-----") === -1){
          return "必须为ssh key 私钥格式, 以-----BEGIN RSA PRIVATE KEY-----或者-----BEGIN OPENSSH PRIVATE KEY-----开头"
        }
        if (sshkey.search("-----END RSA PRIVATE KEY-----") === -1 && sshkey.search("-----END OPENSSH PRIVATE KEY-----") === -1){
          return "必须为ssh key 私钥格式, 以-----END RSA PRIVATE KEY-----或者-----END OPENSSH PRIVATE KEY-----结尾"
        }
        return ""
      },
      isValidIP(ip) {
        var reg = /^(0|[1-9][0-9]{0,1}|1\d\d|2[0-4]\d|25[0-5])\.(0|[1-9][0-9]{0,1}|1\d\d|2[0-4]\d|25[0-5])\.(0|[1-9][0-9]{0,1}|1\d\d|2[0-4]\d|25[0-5])\.(0|[1-9][0-9]{0,1}|1\d\d|2[0-4]\d|25[0-5])\/([1-9]{1}|1\d|2\d|3[0-3])$/
        if (reg.test(ip) === false) {
          return "必须为xxx.xxx.xxx.xxx/xx 格式"
        }
        return ""
      },
      isValidDomain(domain) {
        var reg = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.?)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/
        if (reg.test(domain) === false) {
          return "必须为正确的域名格式, abc xxx.abc xxx.abc.xxx"
        }
        return ""
      },
      isValidAbspath(path) {
        var reg = /^\/((([a-zA-Z0-9_./-]+))+)$/
        if (reg.test(path) === false) {
          return "必须为绝对路径, 允许a-z A-Z 0-9 _ . / -"
        }
        return ""
      },
      isValidNumber(num) {
        var reg = /^[1-9]([0-9]){0,4}$/
        if (reg.test(num) === false) {
          return "必须是1-5位数的正整数"
        }
        return ""
      },
      isValidK8sNamespace(word) {
        var reg = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?([a-z0-9]*)$/
        if (reg.test(word) === false) {
          return "必须是普通字符 a-z 0-9 - , regex: ^[a-z0-9]([-a-z0-9]*[a-z0-9])?([a-z0-9]*)"
        }
        return ""
      }
    }
    ,
    data() {
      return {
        loading: true,
        form: {
          hosts: []
        },
        active: 0,
      }
    }
  }
</script>

<style>
  h5 {
    font-size: 1.2em;
    font-weight: 500
  }

  .el-form {
    text-align: left;
    margin-top: 30px;
    /*font-size: 1.2em;*/
    font-weight: bold;
  }

  .el-collapse-item__header {
    font-size: 1.2em;
  }

  .el-form-item__label {
    font-size: 0.8em;
  }

  .span {
    font-size: 1.2em;
  }

  /*.el-form-item__content{*/
  /*  font-size: 1.2em;*/
  /*}*/
  .el-input {
    font-size: 1.2em;
    font-weight: bold;
  }

  .el-input__inner {
    font-family: Monaco, monospace;
  }

  .el-row {
    margin-top: 10px;
  }

  .label {
    font-size: 3em;
  }

  .content {
    margin: 10px;
    font-size: 1em;
  }
</style>