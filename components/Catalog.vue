<template>
  <div>
    <!-- <CodeBlockKanban :input="Hello"></CodeBlockKanban> -->
    <code-block-block :input="exampleBlock"></code-block-block>
    <code-block-gantt :input="exampleGantt"></code-block-gantt>
    <code-block-kanban :input="exampleKanban"></code-block-kanban>
    <code-block-csv :input="exampleSpreadSheet" />
  </div>
</template>
<script>
import CodeBlockKanban from "./CodeBlockKanban.vue";
import CodeBlockGantt from "./CodeBlockGantt.vue";
import CodeBlockCsv from "./CodeBlockCsv.vue";
import CodeBlockBlock from "./CodeBlockBlock.vue";

const exampleGantt = `
タスクA 2018-11-01 2018-11-02
タスクB 2018-11-03 2018-11-05
`;

const exampleKanban = `
# TODO
* ダブルクリックで編集できるよ
* Trelloみたいにドラッグ＆ドロップできるよ
# DONE
* タスク１
* タスク２
`;

const exampleSpreadSheet = `"Yamada Taro","12","M"
1,2,3
4,5,6`;

const exampleBlock = `
- テスト1 100 100 150 50
- テスト2 200 200 150 50
> arrow 0 0 100 100
`;

export default {
  components: {
    CodeBlockKanban,
    CodeBlockGantt,
    CodeBlockCsv,
    CodeBlockBlock
  },
  data() {
    return {
      exampleGantt: exampleGantt,
      exampleKanban: exampleKanban,
      exampleSpreadSheet: exampleSpreadSheet,
      exampleBlock: exampleBlock
    };
  }
};
</script>
