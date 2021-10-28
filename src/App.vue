<template>
  <div id="app">
    <el-header>
      <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" router
               background-color="#545c64"
               text-color="#fff"
               active-text-color="#ffd04b">
        <el-menu-item index="/">说明</el-menu-item>
        <el-submenu index="/editarea">
          <template slot="title">编辑拓扑文件</template>
          <el-submenu index="/unlimit">
            <template slot="title">自由模板</template>
            <el-menu-item index="/edit/1">单节点</el-menu-item>
            <el-menu-item index="/edit/2">1+1节点</el-menu-item>
            <el-menu-item index="/edit/3">1+2节点</el-menu-item>
            <el-menu-item index="/edit/4">1+3节点</el-menu-item>
            <el-menu-item index="/edit/5">3+2节点</el-menu-item>
            <el-menu-item index="/edit/6">3+3节点</el-menu-item>
            <el-menu-item index="/edit/7">3+4节点</el-menu-item>
            <el-menu-item index="/edit/8">3+5节点</el-menu-item>
            <el-menu-item index="/loadfromyaml">加载hosts.yaml文件</el-menu-item>
          </el-submenu>
        </el-submenu>
      </el-menu>
    </el-header>
    <el-main>
      <router-view/>
    </el-main>
    <el-footer>

    </el-footer>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        activeIndex: "/",
      }
    },
    watch: {
      $route(to) {
        this.activeIndex = to.path;
      }
    },
    mounted: function () {
      this.activeIndex = this.$route.path;
    },
  }
</script>
<style scoped>
  #app {
    font-family: Monaco,monospace;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /*text-align: center;*/
    color: #2c3e50;
  }

  #nav {
    padding: 30px;
  }

  #nav a {
    font-weight: bold;
    color: #2c3e50;
  }

  #nav a.router-link-exact-active {
    color: #42b983;
  }
</style>
