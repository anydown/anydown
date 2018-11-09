<template>
  <div class="kanban">
    <div class="kanban__col" v-for="(col, colIndex) in compiled" :key="colIndex">
      <div class="kanban__col__add" @click="addTask(colIndex)">+</div>
      <div class="kanban__col-title" @dblclick="editTitle(colIndex)">{{col.name}}</div>
      <div class="kanban__wrapper">
        <draggable v-model="col.cards" :options="{group:'everykanban'}" class="draggable--max" @change="onEnd">
          <div class="kanban__row" v-for="(card, index) in col.cards" track-by="index" :key="index" @dblclick="startEditing(colIndex, index)">
            <div class="kanban__row__remove" @click="removeTask(colIndex, index)">×</div>
            <div class="kanban__row__label" v-if="!(editing && editingCol === colIndex && editingIndex === index)" v-text="card"></div>
            <form v-if="editing && editingCol === colIndex && editingIndex === index" @submit.prevent="endEditingAndNew(colIndex, index)" style="margin: 0;">
              <input class="kanban__row__input" v-model="editingText" @blur="endEditing(colIndex, index)" />
            </form>
          </div>
        </draggable>
      </div>
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import MarkdownIt from "markdown-it";
import * as compiler from "./kanban-compiler";
const md = new MarkdownIt();

export default {
  props: {
    input: String
  },
  data() {
    return {
      compiled: [],
      editingText: "",
      editing: false,
      editingCol: 0,
      editingIndex: 0
    };
  },
  watch: {
    input() {
      this.compiled = compiler.compileKanban(this.input);
    }
  },
  computed: {
    output() {
      this.compiled.join();
    }
  },
  components: {
    draggable
  },
  mounted() {
    this.compiled = compiler.compileKanban(this.input);
  },
  methods: {
    onEnd() {
      this.$emit("change", compiler.serializeKanban(this.compiled));
    },
    startEditing(col, row) {
      const oldData = this.compiled[col].cards[row];
      this.editingCol = col;
      this.editingIndex = row;
      this.editingText = oldData;
      this.editing = true;
      this.$nextTick(() => {
        const el = this.$el.querySelector(".kanban__row__input");
        if (el) {
          el.focus();
        }
      });
    },
    endEditing(col, row) {
      this.editing = false;
      if (this.editingText === "") {
        // this.$nextTick(()=>{
        this.removeTask(col, row);
        // })
      } else {
        this.$set(this.compiled[col].cards, row, this.editingText);
        this.$emit("change", compiler.serializeKanban(this.compiled));
      }
    },
    endEditingAndNew(col, row) {
      this.endEditing(col, row);
      this.$nextTick(() => {
        this.addTask(col);
      });
    },
    addTask(col) {
      this.compiled[col].cards.push("");
      this.startEditing(col, this.compiled[col].cards.length - 1);
    },
    removeTask(col, row) {
      const oldData = this.compiled[col].cards[row];
      this.$delete(this.compiled[col].cards, row);
      this.$emit("change", compiler.serializeKanban(this.compiled));
    },
    editTitle(col) {
      const listName = window.prompt("リスト名を変更", this.compiled[col].name);
      if (listName) {
        this.compiled[col].name = listName;
        this.$emit("change", compiler.serializeKanban(this.compiled));
      }
    }
  }
};
</script>
<style>
.draggable--max {
  flex: 1;
}

.kanban {
  display: flex;
  margin: 0 -0.5rem;
}

.kanban__col {
  flex: 1;
  margin: 0.5rem;
  padding: 0.5rem;
  background: #f5f5f5;
  text-align: center;
  position: relative;
}

.kanban__col-title {
  font-size: 0.8rem;
  font-weight: 900;
  color: #888888;
  cursor: pointer;
}

.kanban__row:hover > .kanban__row__remove {
  display: block;
}

.kanban__col__add {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 2px;
  color: #a5e487;
  cursor: pointer;
}

.kanban__row__remove {
  display: none;
  position: absolute;
  top: 8px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 2px;
  color: #888888;
  cursor: pointer;
  text-align: center;
  line-height: 20px;
}

.kanban__row {
  margin: 0.5rem 0;
  padding: 0.5rem;
  text-align: left;
  background: white;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
  cursor: pointer;
  border-radius: 2px;
  line-height: 1.6rem;
  word-break: break-all;
  position: relative;
}

.kanban__row__input {
  font-size: 1rem;
  font-family: inherit;
  width: 100%;
}

.kanban__row__label {
  min-height: 1.5rem;
}

.kanban__wrapper {
  min-height: 10rem;
  display: flex;
  flex-direction: column;
}
</style>