<template>
  <div v-html="compiledMarkdown"></div>
</template>
<script>
import MarkdownIt from "markdown-it";
const md = new MarkdownIt();
import * as emoji from "markdown-it-emoji";
md.use(emoji.default);

export default {
  props: {
    input: String
  },
  computed: {
    compiledMarkdown: function() {
      return md.render(this.input);
    }
  }
};
</script>
<style>
</style>