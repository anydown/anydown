<template>
  <div class="app">
    <vue-split-pane :min-percent='20' :default-percent='40' split="vertical">
      <template slot="paneL">
        <codemirror ref="codemirror" id="input" v-model="input" :options="codeMirrorOption"></codemirror>
      </template>
      <template slot="paneR">
        <div id="output">
          <div class="markdown-body">
            <div :is="block.type" :input="block.text" v-for="block in splited" :key="block.id" @change="updateBlock($event, block.id)"></div>
          </div>
        </div>
      </template>
    </vue-split-pane>
  </div>
</template>

<script>
import MarkdownBlock from "./components/MarkdownBlock.vue";
import CodeBlockKanban from "./components/CodeBlockKanban.vue";
import CodeBlockGantt from "./components/CodeBlockGantt.vue";
import { example } from "./util/example.js";
import { compile } from "./util/document-compiler";

import { codemirror } from "vue-codemirror-lite";
import VueSplitPane from "vue-splitpane";

import "codemirror/mode/markdown/markdown";
import "codemirror/addon/edit/continuelist.js";
import "codemirror/theme/monokai.css";

const LOCALSTORAGE_KEY = "anydown_data";
const LOCALSTORAGE_LAST_EDITED_FILE = "anydown_last_edited_file";

const filters = [
  {
    name: "Documents",
    extensions: ["txt", "md"]
  }
];

export default {
  name: "app",
  data() {
    return {
      input: "",
      originalInput: "",
      splited: [],
      path: "",
      codeMirrorOption: {
        mode: "markdown",
        extraKeys: { Enter: "newlineAndIndentContinueMarkdownList" },
        lineNumbers: true,
        theme: "monokai",
        lineWrapping: true,
        dragDrop: false //to prevent file drop insert
      }
    };
  },
  computed: {
    compiledMarkdown() {
      return md.render(this.input);
    },
    isDirty() {
      return this.input !== this.originalInput;
    },
    editor() {
      return this.$refs.codemirror.editor;
    }
  },
  watch: {
    input() {
      this.checkDirty();
      localStorage.setItem(LOCALSTORAGE_KEY, this.input);
      this.splited = compile(this.input);
    }
  },
  methods: {
    checkDirty() {
      const dirty = this.isDirty ? " *" : "";
      document.title = "anydown - " + this.path + dirty;
    },
    updateBlock(a, b) {
      this.splited[b].text = a;
      this.input = this.splited.map(i => i.text).join("```");
    },
    loadExample() {
      if (window.confirm("現在のノートを破棄しますが、よろしいですか？")) {
        this.input = example;
      }
    },
    resetDirtyFlag() {
      this.originalInput = this.input;
      this.checkDirty();
    }
  },
  mounted() {
    const storage = localStorage.getItem(LOCALSTORAGE_KEY);
    if (storage) {
      this.input = storage;
    } else {
      this.input = example;
    }
  },
  components: {
    MarkdownBlock,
    CodeBlockKanban,
    CodeBlockGantt,
    codemirror,
    VueSplitPane
  }
};
</script>

<style>
html,
body,
#editor {
  margin: 0;
  height: 100%;
  font-family: "Helvetica Neue", Arial, sans-serif;
  color: #333;
}

#editor {
  display: flex;
  overflow-y: hidden;
}

#input {
  flex: 1;
  height: 100%;
}

#output {
  height: 100%;
  display: flex;
  overflow-y: scroll;
}

.CodeMirror {
  height: 100% !important;
}

textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: none;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: "Monaco", courier, monospace;
  padding: 20px;
}
.output__header {
  height: 2.4rem;
  line-height: 2.4rem;
  background: #333;
  color: white;
  display: flex;
  justify-content: flex-end;
}
.output__preview {
  padding: 1rem;
}
.output__header__item {
  font-size: 0.8rem;
  padding: 0 1rem;
  cursor: pointer;
}
.output__header__item:hover {
  background: #111;
}

code {
  color: #f66;
}

.markdown-body {
  padding: 1rem;
  flex: 1;
}

@media print {
  #input {
    display: none;
  }
  #output {
    overflow-y: visible;
  }
  .output__header {
    display: none;
  }
  .CodeMirror {
    display: none;
  }
  .splitter-paneL {
    display: none;
  }
  .Resizer.vertical {
    display: none;
  }
  .splitter-paneR {
    width: 100% !important;
  }
}

.app {
  height: 100%;
}

.droppable {
  background: black;
  opacity: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  user-select: none;
  z-index: -100;
}
.droppable.dropover {
  opacity: 0.5;
  z-index: 1000;
}
</style>
