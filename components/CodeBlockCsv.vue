<template>
  <div class="grid" @pointerup="onMouseUpSvg()" @pointermove="headerResizeMove">
    <svg :width="positionLeft(data.length + 1) + 1" height=24>
      <g v-for="(col, ci) in headerObj" :key="ci" :transform="translateCol(ci)" @pointerdown="startColumnSelect(ci)" @pointermove="changeColumnSelect(ci)" @pointerup="endColumnSelect">
        <rect class="col-header" x=0 y=0 :width="widthAt(ci)" :height="rowHeight">
        </rect>
        <text class="col-header__text" text-anchor="middle" :x="widthAt(ci) / 2" y=12 :width="widthAt(ci)" :height="rowHeight">{{col.name}}</text>
        <rect class="col-header__resize" :class="{'active': ci === headerResizeAt}" :x="widthAt(ci) - 5" :y=0 :width="5" :height="rowHeight" @pointerdown.stop="headerResizeStart(ci)"></rect>
      </g>
    </svg>

    <div ref="wrapper" style="height: 400px; overflow: scroll; position:relative;" :style="{'height': (data.length + 1) * 24 }" touch-action="none">
      <svg :width="positionLeft(data.length + 1) + 1" :height="data.length * 24">
        <g v-for="(row, ri) in data" :key="ri" :transform="translateRow(ri)">
          <g v-for="(col, ci) in row" :key="ci" :transform="translateCol(ci)" @pointerdown="onMouseDownCell(ci, ri)" @pointermove="onMouseMoveCell(ci, ri)">
            <rect x=0 y=0 :width="widthAt(ci)" :height="rowHeight">
            </rect>
            <text x=2 y=12 :width="widthAt(ci)" :height="rowHeight">{{col}}</text>
          </g>
        </g>
        <rect :transform="selectionTransform" class="selection" x=0 y=0 :width="selectionSize.w" :height="selectionCount.h * rowHeight"></rect>
      </svg>
      <div class="editor__frame" :style="editorStyleObj">
        <input ref="hiddenInput"  @pointerdown="onMouseDownCell(selection.c, selection.r)" class="editor__textarea" v-model="editingText" @blur="onBlur" :class="{'editor--visible': editing}" autofocus />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "CodeBlockCsv",
  props: {
    header: Array,
    input: String
  },
  data() {
    return {
      selection: {
        c: 0,
        r: 0,
        sc: 0,
        sr: 0
      },
      editingText: "",
      editing: false,
      rowHeight: 24,
      selectionMode: false,
      selectionModeColumn: false,
      headerResizeAt: -1,
      data: [[]]
    };
  },
  watch: {
    input(input) {
      this.updateData(input);
    }
  },
  computed: {
    editorStyleObj() {
      return {
        left: this.positionLeft(this.selection.c) + "px",
        top: this.selection.r * 24 + "px",
        width: this.selectionSize.w + "px"
      };
    },
    selectionTransform() {
      return `translate(${this.positionLeft(this.selectionCount.c)},  ${this
        .selectionCount.r * 24})`;
    },
    selectionCount() {
      return {
        r:
          this.selection.r <= this.selection.sr
            ? this.selection.r
            : this.selection.sr,
        c:
          this.selection.c <= this.selection.sc
            ? this.selection.c
            : this.selection.sc,
        w: Math.abs(this.selection.sc - this.selection.c) + 1,
        h: Math.abs(this.selection.sr - this.selection.r) + 1
      };
    },
    selectionSize() {
      return {
        r: this.positionLeft(this.selectionCount.r),
        c: this.positionLeft(this.selectionCount.c),
        w:
          this.positionLeft(this.selectionCount.c + this.selectionCount.w) -
          this.positionLeft(this.selectionCount.c),
        h:
          this.positionLeft(this.selectionCount.c + this.selectionCount.h) -
          this.positionLeft(this.selectionCount.c)
      };
    },
    headerObj() {
      return this.header
        ? this.header
        : this.data[0].map((item, idx) => {
            return {
              name: String.fromCharCode(65 + idx),
              width: 80
            };
          });
    },
    stringData() {
      return `${this.data.map(i => i.join(",")).join("\n")}
`;
    }
  },
  methods: {
    updateData(input) {
      let data = this.input
        .split(/[\r|\n|\r\n]/)
        .filter(item => item.length > 0)
        .map(i => i.split(","))
        .filter(item => item.length > 0);
      //最初の一行を除去
      data.shift();

      let normalized = [];
      let max = 0;
      for (const col of data) {
        if (max < col.length) {
          max = col.length;
        }
      }
      for (const col of data) {
        let m = [];
        for (let i = 0; i < max; i++) {
          if (i < col.length) {
            m.push(col[i]);
          } else {
            m.push("");
          }
        }
        normalized.push(m);
      }

      this.data = normalized;
    },
    startColumnSelect(c) {
      this.selection.sr = this.data.length - 1;
      this.selection.r = 0;
      this.selection.sc = c;
      this.selection.c = c;
      this.selectionModeColumn = true;
    },
    changeColumnSelect(c) {
      if (this.selectionModeColumn) {
        this.selection.c = c;
      }
    },
    endColumnSelect() {
      this.selectionModeColumn = false;
    },
    headerResizeStart(c) {
      this.headerResizeAt = c;
    },
    headerResizeEnd() {
      this.headerResizeAt = -1;
    },
    headerResizeMove(e) {
      const headerRect = e.target.parentNode.parentNode.getBoundingClientRect();
      const headerMouseX = e.clientX - headerRect.left;
      if (this.headerResizeAt >= 0) {
        const updateWidth =
          headerMouseX - this.positionLeft(this.headerResizeAt);
        this.headerObj[this.headerResizeAt].width =
          updateWidth > 30 ? updateWidth : 30;
      }
    },
    widthAt(index) {
      return this.headerObj[index].width;
    },
    positionLeft(index) {
      return this.headerObj
        .slice(0, index)
        .map(it => it.width)
        .reduce((a, b) => a + b, 0);
    },
    setDataAt(c, r, value) {
      Vue.set(this.data[r], c, value);
      this.$emit("change", this.stringData);
    },
    getDataAt(c, r) {
      return this.data[r][c];
    },
    onBlur() {
      this.editing = false;
      this.setDataAt(this.selection.c, this.selection.r, this.editingText);
    },
    translateCol(ci) {
      return `translate(${this.positionLeft(ci)}, 0)`;
    },
    translateRow(ri) {
      return `translate(0, ${ri * 24})`;
    },
    onMouseDownCell(c, r) {
      if (this.editing) {
        this.onBlur();
      }
      if (
        this.selectionCount.c === c &&
        this.selectionCount.r === r &&
        this.selectionCount.w === 1 &&
        this.selectionCount.h === 1
      ) {
        this.editHere();
        return;
      }
      this.setSelectionStart(c, r);
      Vue.nextTick(() => {
        this.$refs["hiddenInput"].focus();
      });
    },
    setSelectionSingle(c, r) {
      this.selection.c = c;
      this.selection.r = r;
      this.selection.sc = c;
      this.selection.sr = r;
      this.setEditingText();
    },
    setSelectionStart(c, r) {
      this.setSelectionSingle(c, r);
      this.selectionMode = true;
    },
    onMouseMoveCell(c, r) {
      if (this.selectionMode) {
        this.setSelectionEnd(c, r);
      }
    },
    onMouseUpSvg() {
      this.endSelection();
      this.headerResizeEnd();
    },
    setSelectionEnd(c, r) {
      if (this.selectionMode) {
        this.selection.c = c;
        this.selection.r = r;
        this.setEditingText();
      }
    },
    endSelection() {
      this.selectionMode = false;
    },
    editCell(c, r) {
      this.editing = true;
      Vue.nextTick(() => {
        this.$refs.hiddenInput.focus();
      });
    },
    editHere() {
      this.editCell(this.selection.c, this.selection.r);
    },
    clearCell(c, r) {
      this.setDataAt(c, r, "");
    },
    clearSelection() {
      for (let i = 0; i < this.selectionCount.h; i++) {
        for (let j = 0; j < this.selectionCount.w; j++) {
          this.clearCell(this.selectionCount.c + j, this.selectionCount.r + i);
        }
      }
    },
    isInsideTable(c, r) {
      if (c < 0) {
        return false;
      }
      if (r < 0) {
        return false;
      }
      if (c > this.data[0].length - 1) {
        return false;
      }
      if (r > this.data.length - 1) {
        return false;
      }
      return true;
    },
    moveCursor(dc, dr) {
      if (!this.isInsideTable(this.selection.c + dc, this.selection.r + dr)) {
        return;
      }
      if (this.selectionMode) {
        this.setSelectionEnd(this.selection.c + dc, this.selection.r + dr);
        this.fixScroll();
        return;
      }
      if (this.editing) {
        this.onBlur();
      }
      this.setSelectionSingle(this.selection.c + dc, this.selection.r + dr);
      this.fixScroll();
    },
    moveInputCaretToEnd() {
      const el = this.$refs["hiddenInput"];
      el.setSelectionRange(this.editingText.length, this.editingText.length);
    },
    fixScroll() {
      const el = this.$refs["wrapper"];

      if (el.scrollTop > this.selection.r * 24) {
        el.scrollTop = this.selection.r * 24;
      }
      if (el.scrollTop < this.selection.r * 24 - el.clientHeight + 24) {
        el.scrollTop = this.selection.r * 24 - el.clientHeight + 24;
      }

      if (
        el.scrollLeft <
        this.positionLeft(this.selection.c) - el.clientWidth
      ) {
        el.scrollLeft = this.positionLeft(this.selection.c);
      }
    },
    setEditingText() {
      this.editingText = this.getDataAt(this.selection.c, this.selection.r);
    }
  },
  mounted() {
    this.updateData(this.input);

    this.editingText = this.getDataAt(0, 0);
    this.onBlur();

    const target = this.$el;

    target.onkeydown = e => {
      switch (e.keyCode) {
        case 8: //backspace
          if (!this.editing) {
            this.moveInputCaretToEnd();
            this.editHere();
          }
          break;
        case 37: //left
          this.moveCursor(-1, 0);
          e.preventDefault();
          break;
        case 38: //up
          this.moveCursor(0, -1);
          e.preventDefault();
          break;
        case 39: //right
          this.moveCursor(1, 0);
          e.preventDefault();
          break;
        case 40: //down
          this.moveCursor(0, 1);
          e.preventDefault();
          break;
        case 46: //delete
          this.clearSelection();
          break;
        case 13: //enter
          this.moveCursor(0, 1);
          break;
        case 16: //shift
          this.setSelectionStart(this.selection.c, this.selection.r);
          break;
        case 91: //ctrl
          break;
        case 113: //F2
          if (!this.editing) {
            this.moveInputCaretToEnd();
            this.editHere();
          }
          break;
        default:
          if (!this.editing) {
            this.editingText = "";
            this.editHere();
          }
          break;
      }
    };
    target.onkeyup = e => {
      switch (e.keyCode) {
        case 16: //shift
          this.endSelection();
          break;
      }
    };
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
rect {
  fill: white;
  stroke: #999;
  shape-rendering: crispEdges;
}
.selection {
  fill: none;
  stroke: rgb(158, 55, 255);
  stroke-width: 3px;
}
.col-header {
  fill: #eee;
}
.col-header__resize {
  cursor: col-resize;
  opacity: 0;
}
.col-header__resize:hover {
  cursor: col-resize;
  fill: rgb(158, 55, 255);
  opacity: 0.5;
}
.col-header__resize.active {
  fill: rgb(158, 55, 255);
  opacity: 0.5;
}

.grid {
  position: relative;
  background: #eee;
  width: 100%;
}
.editor__frame {
  position: absolute;
  overflow: hidden;
}

text {
  dominant-baseline: central;
  user-select: none;
}

input {
  border: none;
  box-sizing: border-box;
  outline: 0;
  margin-left: 2px;
  font-size: 1rem;
}

svg {
  display: block;
  touch-action: none;
}

.editor__textarea {
  opacity: 0;
  width: 100%;
}
.editor--visible {
  opacity: 1;
}
</style>
