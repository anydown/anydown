<template>
  <div class="markdown-body">
    <div
      :is="block.type"
      :input="block.text"
      v-for="block in blocks"
      :key="block.id"
      @change="onChange($event, block)"
    ></div>
  </div>
</template>

<script>
import MarkdownBlock from "./MarkdownBlock.vue";
import CodeBlockKanban from "./CodeBlockKanban.vue";
import CodeBlockGantt from "./CodeBlockGantt.vue";
import CodeBlockCsv from "./CodeBlockCsv.vue";
import CodeBlockBlock from "./CodeBlockBlock.vue";
import CodeBlockPre from "./CodeBlockPre.vue";

export default {
  props: ["blocks"],
  methods: {
    onChange(ev, block) {
      this.$emit("change", {
        id: block.id,
        type: block.type,
        body: ev
      });
    }
  },
  components: {
    markdown: MarkdownBlock,
    kanban: CodeBlockKanban,
    gantt: CodeBlockGantt,
    csv: CodeBlockCsv,
    block: CodeBlockBlock,
    plain: CodeBlockPre
  }
};
</script>

<style>
</style>