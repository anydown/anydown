<template>
    <div>
        <!-- <CodeBlockKanban :input="Hello"></CodeBlockKanban> -->
        <code-block-gantt :input="exampleGantt"></code-block-gantt>
        <code-block-kanban :input="exampleKanban"></code-block-kanban>
    </div>
</template>
<script>
import CodeBlockKanban from "./CodeBlockKanban.vue";
import CodeBlockGantt from "./CodeBlockGantt.vue";

const exampleGantt = `
gantt
タスクA 2018-11-01 2018-11-02
タスクB 2018-11-03 2018-11-05
`;

const exampleKanban = `
kanban
# TODO
* ダブルクリックで編集できるよ
* Trelloみたいにドラッグ＆ドロップできるよ
# DONE
* タスク１
* タスク２
`;

export default {
  components: {
    CodeBlockKanban,
    CodeBlockGantt
  },
  data() {
    return {
      exampleGantt: exampleGantt,
      exampleKanban: exampleKanban
    };
  }
};
</script>
