<template>
  <div class="app">
    <div class="modeSwitcher">
      <div
        class="modeSwitcher__item"
        :class="{'active': mode === 'editor'}"
        @click="toggleMode('editor')"
      >
        <svg
          class="modeSwitcher__item__icon"
          id="i-edit"
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="none"
          stroke="currentcolor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
        >
          <path d="M30 7 L25 2 5 22 3 29 10 27 Z M21 6 L26 11 Z M5 22 L10 27 Z"></path>
        </svg>
      </div>
      <div
        class="modeSwitcher__item"
        :class="{'active': mode === 'file'}"
        @click="toggleMode('file')"
      >
        <svg
          class="modeSwitcher__item__icon"
          id="i-folder"
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="none"
          stroke="currentcolor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.8"
        >
          <path d="M2 26 L30 26 30 7 14 7 10 4 2 4 Z M30 12 L2 12"></path>
        </svg>
      </div>
    </div>
    <vue-split-pane :min-percent="20" :default-percent="40" split="vertical">
      <template slot="paneL">
        <div class="paneL__wrapper" v-if="mode === 'editor'">
          <div class="paneL__editor">
            <codemirror ref="codemirror" id="input" v-model="input" :options="codeMirrorOption"></codemirror>
          </div>
          <div class="paneL__nav">
            <div class="paneL__insertMenu">
              <button class="insertButton" @click="insertExampleKanban">
                <span class="insertButton__plus">+</span> カンバン
              </button>
              <button class="insertButton" @click="insertExampleGantt">
                <span class="insertButton__plus">+</span> ガント
              </button>
              <button class="insertButton" @click="insertExampleCsv">
                <span class="insertButton__plus">+</span> CSV
              </button>
              <button class="insertButton" @click="insertExampleBlock">
                <span class="insertButton__plus">+</span> ブロック図
              </button>
              <!-- <button v-if="installPwaButtonVisible" class="installPwaButton" @click="installPwa">Install PWA</button> -->
            </div>
          </div>
        </div>
        <div class="paneL__wrapper" v-if="mode === 'file'">
          <div class="paneL__file">
            <div class="paneL__file__section">
              <div class="paneL__file__section__label">LOCAL STORAGE</div>
              <div class="paneL__file__section__action" @click="addLocalStorageItem">+</div>
              <div class="paneL__file__section__action" @click="removeLocalStorageItem(path)">-</div>
            </div>
            <div
              class="paneL__file__item"
              @dblclick="mode = 'editor'"
              @click="selectFile(f.key)"
              :class="{'active': path === f.key}"
              v-for="f in localStorageItems"
              :key="f.key"
              v-text="f.name"
            ></div>
          </div>
        </div>
      </template>
      <template slot="paneR">
        <div id="output">
          <div class="markdown-body">
            <div
              :is="block.type"
              :input="block.text"
              v-for="block in splited"
              :key="block.id"
              @change="updateBlock($event, block.id)"
            ></div>
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
import CodeBlockCsv from "./components/CodeBlockCsv.vue";
import CodeBlockBlock from "./components/CodeBlockBlock.vue";
import CodeBlockPre from "./components/CodeBlockPre.vue";
import { example } from "./util/example.js";
import { compile } from "./util/document-compiler";
import {
  kanbanExample,
  ganttExample,
  csvExample,
  blockExample
} from "./util/menu";
import * as db from "./util/local-db";

import { codemirror } from "vue-codemirror-lite";
import VueSplitPane from "vue-splitpane";

import "codemirror/mode/markdown/markdown";
import "codemirror/addon/edit/continuelist.js";
import "codemirror/theme/monokai.css";

const filters = [
  {
    name: "Documents",
    extensions: ["txt", "md"]
  }
];

let deferredPrompt;

const localDb = new db.LocalDb();

export default {
  name: "app",
  data() {
    return {
      mode: "editor",
      localStorageItems: {},
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
      },
      installPwaButtonVisible: true
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
    },
    selected() {
      return this.localStorageItems.find(i => i.key === this.path);
    }
  },
  watch: {
    input(val) {
      this.checkDirty();
      localDb.update(this.path, this.selected.name, val);
      localDb.save();
      localDb.load();
      this.localStorageItems = localDb.cache;
      this.splited = compile(val);
    },
    path(val) {
      this.lastEdited = val;
      localStorage.setItem(db.LOCALSTORAGE_LAST_EDITED_FILE, this.lastEdited);
      document.title = "anydown - " + this.path;
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
    resetDirtyFlag() {
      this.originalInput = this.input;
      this.checkDirty();
    },
    insertExampleGantt() {
      this.insertText(ganttExample);
    },
    insertExampleKanban() {
      this.insertText(kanbanExample);
    },
    insertExampleCsv() {
      this.insertText(csvExample);
    },
    insertExampleBlock() {
      this.insertText(blockExample);
    },
    insertText(text) {
      const doc = this.editor.getDoc();
      const cursor = doc.getCursor();
      doc.replaceRange(text, cursor);
    },
    installPwa() {
      this.installPwaButtonVisible = false;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choiceResult => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the A2HS prompt");
        } else {
          console.log("User dismissed the A2HS prompt");
        }
        deferredPrompt = null;
      });
    },
    toggleMode(mode) {
      // comment out because vue-split-pane doesn't support collapse for now
      // should we rewrite split pane?
      // if(this.mode === mode){
      //   this.mode = ""
      // }else{
      //   this.mode = mode;
      // }
      this.mode = mode;
    },
    addLocalStorageItem() {
      const text = window.prompt("新規メモのタイトル");
      if (text) {
        const key = localDb.insert(text, `# ${text}`);
        this.path = key;
        localDb.save();
        localDb.load();
        this.localStorageItems = localDb.cache;
        this.input = localDb.read(key).contents;
      }
    },
    removeLocalStorageItem(f) {
      if (window.confirm("選択中のメモを削除してもよろしいですか？")) {
        localDb.delete(this.path);
        localDb.save();
        localDb.load();
        this.localStorageItems = localDb.cache;
        this.path = this.localStorageItems[0].key;
        this.input = this.localStorageItems[0].contents;
      }
    },
    selectFile(path) {
      this.path = path;
      this.input = this.localStorageItems.find(i => i.key === path).contents;
    }
  },
  mounted() {
    localDb.load();
    this.localStorageItems = localDb.cache;
    this.path = localDb.cache[0].key;
    this.input = localDb.cache[0].contents;

    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault();
      deferredPrompt = e;
      this.installPwaButtonVisible = true;
    });
  },
  components: {
    MarkdownBlock,
    CodeBlockKanban,
    CodeBlockGantt,
    CodeBlockCsv,
    CodeBlockBlock,
    CodeBlockPre,
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

.insertButton {
  background: white;
  border: 0px solid #999;
  padding: 0.25rem 0.75rem;
  font-weight: 600;
}

.insertButton:hover {
  background: #eee;
}

.installPwaButton {
  background: #c8ffc1;
  border: 1px solid #999;
  padding: 0.25rem 0.75rem;
}

.paneL__insertMenu {
  flex: 1;
}

.paneL__wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.paneL__nav {
  display: flex;
}

.paneL__mode {
  font-size: 0.5rem;
  line-height: 1.6rem;
  font-weight: 600;
  padding-right: 1rem;
  color: gray;
}
.insertButton__plus {
  color: #8acc6b;
}

.paneL__file {
  background: #252525;
  flex: 1;
  font-size: 0.8rem;
  color: #eee;
}
.paneL__file__section {
  line-height: 1.6rem;
  background: #333;
  font-size: 0.7rem;
  font-weight: 700;
  color: #999;
  padding: 0 0.5rem;
  display: flex;
}
.paneL__file__section__label {
  flex: 1;
}
.paneL__file__section__action {
  width: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  background: #444;
  cursor: pointer;
}

.paneL__file__item {
  line-height: 1.6rem;
  font-size: 0.8rem;
  color: #eee;
  padding: 0 1rem;
  cursor: pointer;
}

.paneL__file__item:hover {
  background: #333;
}

.paneL__file__item.active {
  background: rgb(103, 71, 134);
}

.paneL__editor {
  flex: 1;
  position: relative;
}
#input {
  position: absolute;
  height: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
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
  display: flex;
}
.vue-splitter-container {
  flex: 1;
}

.modeSwitcher {
  background: #333;
  display: flex;
  flex-direction: column;
}

.modeSwitcher__item {
  color: #999;
}
.modeSwitcher__item.active {
  color: #fff;
}

.modeSwitcher__item__icon {
  margin: 0.5rem;
  display: inline-block;
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
