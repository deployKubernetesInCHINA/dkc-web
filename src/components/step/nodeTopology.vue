<template>
  <div>
    <el-row>
      <h5>一. 登录信息: <small>(登录集群所有节点)</small></h5>

      <div style="margin: 15px">
        <el-form-item label="用户名" label-width="80px">
          <el-col :span="6">
            <el-input
              label="用户名"
              v-model="remote_machine_username"
            ></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="登录方式:" label-width="80px">
          <el-col :span="6">
            <el-radio-group v-model="login_type">
              <el-radio-button label="password">密码</el-radio-button>
              <el-radio-button label="sshkey">key</el-radio-button>
            </el-radio-group>
          </el-col>
        </el-form-item>
        <div class="content" v-if="login_type === 'password'">
          <el-form-item label="密码" label-width="80px">
            <el-col :span="6">
              <el-input v-model="remote_machine_password"></el-input>
            </el-col>
          </el-form-item>
        </div>
        <div class="content" v-else>
          <el-form-item
            label="sudo密码"
            label-width="80px"
            v-if="remote_machine_username !== 'root'"
          >
            <el-col :span="6">
              <el-input v-model="become_password"></el-input>
            </el-col>
          </el-form-item>
          <input type="file" id="file" ref="file" v-on:change="sshkeyUpload" />
          <el-input
            id="demoInput"
            type="textarea"
            :rows="20"
            v-model="remote_sshkey"
          ></el-input>
        </div>
      </div>
    </el-row>

    <h5>二. 集群规模:</h5>
    <div style="margin: 15px">
      <el-row>
        <el-form-item label="请设置hostname前缀" label-width="200px">
          <el-col :span="6">
            <el-input
              v-model="hostname_prefix"
              @input="(e) => hostname_input(e)"
            ></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="请选择master节点数量:" label-width="200px">
          <el-col :span="6">
            <el-radio-group v-model="master_count">
              <el-radio-button :label="1">单节点</el-radio-button>
              <el-radio-button :label="3">三节点</el-radio-button>
            </el-radio-group>
            (最低配置2核/4G)
          </el-col>
        </el-form-item>
      </el-row>
      <vxe-table
        border
        show-overflow
        keep-source
        ref="xTable"
        height="200"
        :data="master_hosts"
        :edit-config="{
          trigger: 'click',
          mode: 'cell',
          icon: 'fa fa-pencil',
          showStatus: true,
        }"
      >
        <vxe-table-column type="seq" width="60"></vxe-table-column>

        <vxe-table-column field="hostname" title="Hostname"></vxe-table-column>

        <vxe-table-column
          field="ip"
          title="IP"
          sortable
          :edit-render="{ name: 'input', defaultValue: '192.168.56.2' }"
        ></vxe-table-column>
      </vxe-table>

      <el-row>
        <el-form-item label="请设置worker节点数量" label-width="200px">
          <el-input-number
            size="mini"
            v-model="node_count"
            @change="changeNodeCount"
            :min="0"
          ></el-input-number>
        </el-form-item>
      </el-row>

      <vxe-table
        border
        show-overflow
        keep-source
        ref="xTable"
        max-height="400"
        :data="node_hosts"
        :edit-config="{
          trigger: 'click',
          mode: 'cell',
          icon: 'fa fa-pencil',
          showStatus: true,
        }"
      >
        <vxe-table-column type="seq" width="60"></vxe-table-column>
        <vxe-table-column field="hostname" title="Hostname"></vxe-table-column>
        <vxe-table-column
          field="ip"
          title="IP"
          sortable
          :edit-render="{ name: 'input', defaultValue: '192.168.56.3' }"
        ></vxe-table-column>
      </vxe-table>

      <el-row>
        <el-form-item label="请设置运维监控om节点数量" label-width="200px">
          <el-input-number
            size="mini"
            v-model="om_count"
            @change="changeOmCount"
            :min="0"
            :max="3"
          ></el-input-number>
          (建议配置4核/16G, 低于2核/8G可能会导致部署不成功)
        </el-form-item>
      </el-row>

      <vxe-table
        border
        show-overflow
        keep-source
        ref="xTable"
        max-height="400"
        :data="om_hosts"
        :edit-config="{
          trigger: 'click',
          mode: 'cell',
          icon: 'fa fa-pencil',
          showStatus: true,
        }"
      >
        <vxe-table-column type="seq" width="60"></vxe-table-column>
        <vxe-table-column field="hostname" title="Hostname"></vxe-table-column>
        <vxe-table-column
          field="ip"
          title="IP"
          sortable
          :edit-render="{ name: 'input', defaultValue: '192.168.56.3' }"
        ></vxe-table-column>
      </vxe-table>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapGetters, mapActions } from "vuex";

export default {
  name: "NodeTopology",
  data() {
    return {
      master_counts: [
        { value: 1, label: "1" },
        { value: 3, label: "3" },
      ],
    };
  },
  computed: {
    login_type: {
      get() {
        return this.$store.state.jsonObj.all.vars.login_type;
      },
      set(val) {
        this.changeLoginType(val);
      },
    },
    remote_sshkey: {
      get() {
        return this.$store.state.jsonObj.all.vars.ansible_sshkey;
      },
      set() {
        this.$message.info("不允许编辑sshkey");
        // this.changeRemoteSSHkey(val)
      },
    },
    hostname_prefix: {
      get() {
        return this.$store.state.hostname_prefix;
      },
      set(val) {
        this.changeHostnamePrefix(val);
      },
    },
    master_count: {
      get() {
        return this.$store.state.master_count;
      },
      set(val) {
        this.changeMasterCount(val);
      },
    },
    master_hosts: {
      get() {
        return this.$store.state.master_hosts;
      },
      set(val) {
        this.changeMasterHosts(val);
      },
    },
    remote_machine_username: {
      get() {
        return this.$store.state.jsonObj.all.vars.ansible_user;
      },
      set(val) {
        this.changeRemoteMachineUsername(val);
      },
    },
    remote_machine_password: {
      get() {
        return this.$store.state.jsonObj.all.vars.ansible_password;
      },
      set(val) {
        this.changeRemoteMachinePassword(val);
      },
    },
    become_password: {
      get() {
        return this.$store.state.jsonObj.all.vars.ansible_become_password;
      },
      set(val) {
        this.changeAnsibleBecomePassword(val);
      },
    },
    node_count: {
      get() {
        return this.$store.state.node_count;
      },
      set(val) {
        this.changeNodeCount(val);
      },
    },
    node_hosts: {
      get() {
        return this.$store.state.node_hosts;
      },
      set(val) {
        this.changeNodeHosts(val);
      },
    },
    om_count: {
      get() {
        return this.$store.state.om_count;
      },
      set(val) {
        this.changeOmCount(val);
      },
    },
    om_hosts: {
      get() {
        return this.$store.state.om_hosts;
      },
      set(val) {
        this.changeOmHosts(val);
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
 
  },
  methods: {
    ...mapMutations([
      "changeLoginType",
      "changeRemoteSSHkey",
      "changeHostnamePrefix",
      "changeRemoteMachineUsername",
      "changeRemoteMachinePassword",
      "changeAnsibleBecomePassword",
      "changeMasterCount",
      "changeMasterHosts",
      "changeNodeCount",
      "changeNodeHosts",
      "changeOmCount",
      "changeOmHosts",
      "changeRegistry",
    ]),
    ...mapGetters(["hostsList"]),
    ...mapActions([""]),
    resetIfNodeNotExist() {

    },
    sshkeyUpload(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;

      const fr = new FileReader();
      fr.onload = (e) => {
        if (
          e.target.result.search("-----BEGIN RSA PRIVATE KEY-----") === -1 &&
          e.target.result.search("-----BEGIN OPENSSH PRIVATE KEY-----") === -1
        ) {
          this.$message.error(
            "必须为ssh key 私钥格式, 以-----BEGIN RSA PRIVATE KEY-----或者-----BEGIN OPENSSH PRIVATE KEY-----开头"
          );
        }
        if (
          e.target.result.search("-----END RSA PRIVATE KEY-----") === -1 &&
          e.target.result.search("-----END OPENSSH PRIVATE KEY-----") === -1
        ) {
          this.$message.error(
            "必须为ssh key 私钥格式, 以-----END RSA PRIVATE KEY-----或者-----END OPENSSH PRIVATE KEY-----结尾"
          );
        }
        this.changeRemoteSSHkey(e.target.result);
      };
      fr.readAsText(files.item(0));
      this.show = true;
    },
    // 只能输入汉字、英文、数字
    hostname_input(value) {
      value = value
        .replace(
          /[`～*~!@#$%^&*()+=<>?:"{}|,./;'\\[\]·~！@#￥%……&*（）——+={}|《》？：“”【】、；‘’，。、]/g,
          ""
        )
        .replace(/\s/g, "");
      // var pattern = new RegExp("[`~!@#$^&%*()=|{}':;',\\[\\].<>/?~！@#￥……*（）&;—|{}【】‘；：”“'。，、？]")
      // var rs = "";
      // for (var i = 0; i < value.length; i++) {
      //   rs = rs + value.substr(i, 1).replace(pattern, '');
      // }
      // if (value.length >= number) {
      //   this.$message({
      //     type: "warning",
      //     message: `输入内容不能超过${number}个字符`
      //   });
      // }
      this.hostname_prefix = value;
      return value;
    },
  },
  watch: {
    master_count: function () {
      this.resetIfNodeNotExist();
    },
    node_count: function () {
      this.resetIfNodeNotExist();
    },
    hostname_prefix: function () {
      this.resetIfNodeNotExist();
    },
  },
};
</script>

<style scoped>
.el-collapse-item__header {
  font-size: 1em;
}

.span {
  font-weight: 500;
}
</style>