<template>
  <div>
    <div class="markdown-body">
      <HelpMarkdown></HelpMarkdown>
    </div>

  </div>
</template>

<script>
  import HelpMarkdown from '../components/README.md';

  export default {
    components: {
      HelpMarkdown
    },
  }
</script>
<style>
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }

  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>