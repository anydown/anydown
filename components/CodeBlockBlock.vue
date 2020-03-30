<template>
    <svg ref="canv" height=400 width="600" tabindex="0" @focus="editorFocus" @blur="editorBlur" @keydown="globalKeydown">

        <g v-for="(item, idx) in items" :key="idx" @pointerdown="selectedIndex = idx">
            <g v-if="item.type === 'box'" :transform="`translate(${item.x}, ${item.y})`">
                <rect fill="white" stroke="black" x=0.5 y=0.5 :height="item.height" :width="item.width"></rect>
                <foreignObject :height="item.height" :width="item.width" x="0" y="0">
                    <div class="innerText" v-text="item.text"></div>
                </foreignObject>
                <rect @dblclick="changeBoxText(item)" @pointerdown="downHandle($event, item, 'x')" @pointerup="upHandle" @pointermove="moveHandle($event, item, 'x')"  fill="rgba(255,255,255,0)" x=0.5 y=0.5 :height="item.height" :width="item.width"></rect>

            </g>

            <g v-if="item.type === 'line'" @pointerdown="downHandle($event, item, '-')" @pointerup="upHandle" @pointermove="moveHandle($event, item, '-')">
                <line :x1="item.x1" :x2="item.x2" :y1="item.y1" :y2="item.y2" stroke="rgba(0,0,0,0)" stroke-width="10"></line>
                <line :x1="item.x1" :x2="item.x2" :y1="item.y1" :y2="item.y2" stroke="black"></line>
                <g style="pointer-events: none;" :transform="`translate(${item.x2}, ${item.y2})`" >
                  <g :transform="`rotate(${Math.atan2(item.y2 - item.y1, item.x2 - item.x1) / 2 / Math.PI * 360})`">
                    <polygon points="0,0 -20,-8 -18,0 -20,8" fill="black" />
                  </g>
                </g>
            </g>
        </g>

        <g v-if="selectedItem">
            <g v-if="selectedItem.type === 'box'" :transform="`translate(${selectedItem.x}, ${selectedItem.y})`">
                <rect fill="none" stroke="green" x=0.5 y=0.5 :height="selectedItem.height" :width="selectedItem.width"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'tl')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'tl')" x=-5 y=-5 height=10 width=10  fill="white" stroke="green"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'tl')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'tr')" :x="-5 + selectedItem.width" y=-5 height=10 width=10 fill="white" stroke="green"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'dr')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'dr')" :x="-5 + selectedItem.width" :y="-5 + selectedItem.height" height=10 width=10 fill="white" stroke="green"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'dl')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'dl')"  :x="-5" :y="-5 + selectedItem.height" height=10 width=10 fill="white" stroke="green"></rect>

                <circle @pointerdown="downArrow($event, selectedItem, 0, selectedItem.height / 2)" @pointerup="upArrow" @pointermove="moveArrow($event)" :cx="0" :cy="selectedItem.height / 2" r=6 fill="rgba(100,200,100, 0.5)"></circle>
                <circle @pointerdown="downArrow($event, selectedItem, selectedItem.width, selectedItem.height / 2)" @pointerup="upArrow" @pointermove="moveArrow($event)" :cx="selectedItem.width" :cy="selectedItem.height / 2" r=6 fill="rgba(100,200,100, 0.5)"></circle>
                <circle @pointerdown="downArrow($event, selectedItem, selectedItem.width / 2, 0)" @pointerup="upArrow" @pointermove="moveArrow($event)" :cx="selectedItem.width / 2" :cy="0" r=6 fill="rgba(100,200,100, 0.5)"></circle>
                <circle @pointerdown="downArrow($event, selectedItem, selectedItem.width / 2, selectedItem.height)" @pointerup="upArrow" @pointermove="moveArrow($event)" :cx="selectedItem.width / 2" :cy="selectedItem.height" r=6 fill="rgba(100,200,100, 0.5)"></circle>
            </g>

            <g v-if="selectedItem.type === 'line'">
                <line style="pointer-events: none;" :x1="selectedItem.x1" :x2="selectedItem.x2" :y1="selectedItem.y1" :y2="selectedItem.y2" stroke="green"></line>
                <rect @pointerdown="downHandle($event, selectedItem, 's')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 's')" :x="-5 + selectedItem.x1" :y="-5 + selectedItem.y1" height=10 width=10 fill="white" stroke="green"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'e')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'e')"  :x="-5 + selectedItem.x2" :y="-5 + selectedItem.y2" height=10 width=10 fill="white" stroke="green"></rect>
            </g>

            <g v-if="createArrow">
                <line :x1="createArrowPos.x1" :x2="createArrowPos.x2" :y1="createArrowPos.y1" :y2="createArrowPos.y2" stroke="green"></line>
            </g>
        </g>

      <!-- タスク追加 -->
      <g :transform="`translate(${600 - 24.5}, 5.5)`" @click="addBlock" style="cursor: pointer;">
        <rect fill="white" stroke="#999" x=0 y=0 width=20 height=20 rx=4 ry=4></rect>
        <line x1=10 x2=10 y1=5 y2=15 stroke="ForestGreen"></line>
        <line x1=5 x2=15 y1=10 y2=10 stroke="ForestGreen"></line>
      </g>

    </svg>
</template>

<script>
const handleSize = 10 / 2;

function isHit(box, x, y) {
  return (
    box.x <= x &&
    x <= box.x + box.width &&
    box.y <= y &&
    y <= box.y + box.height
  );
}

function round(v) {
  return Math.round(v / 10) * 10;
}

export default {
  props: {
    input: String
  },
  methods: {
    downArrow(ev, item, x, y) {
      this.createArrowPos = {
        x1: item.x + x,
        y1: item.y + y,
        x2: item.x + x,
        y2: item.y + y
      };

      const el = ev.currentTarget;
      el.setPointerCapture(ev.pointerId);
      this.createArrow = true;
    },
    moveArrow(ev) {
      const target_rect = this.$el.getBoundingClientRect();
      const x = ev.clientX - target_rect.left;
      const y = ev.clientY - target_rect.top;

      this.createArrowPos.x2 = x;
      this.createArrowPos.y2 = y;
    },
    upArrow(ev) {
      this.items.push({
        type: "line",
        x1: round(this.createArrowPos.x1),
        x2: round(this.createArrowPos.x2),
        y1: round(this.createArrowPos.y1),
        y2: round(this.createArrowPos.y2)
      });
      this.$emit("change", this.stringData);

      this.createArrow = false;
    },
    moveAffectedLines(affected, dx, dy, isStart) {
      if (isStart) {
        affected.forEach(i => {
          i.x1 += dx;
          i.y1 += dy;
        });
      } else {
        affected.forEach(i => {
          i.x2 += dx;
          i.y2 += dy;
        });
      }
    },
    getSvgOffset(e) {
      const svg = this.$refs.canv;
      const pt = svg.createSVGPoint();
      //スクリーン座標を取得
      pt.x = e.clientX;
      pt.y = e.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    },
    moveHandle(ev, item, type) {
      if (this.dragging) {
        const target_rect = ev.currentTarget.getBoundingClientRect();
        const x = ev.clientX - target_rect.left;
        const y = ev.clientY - target_rect.top;

        const svgOffset = this.getSvgOffset(ev);

        if (type === "x") {
          const nx = round(svgOffset.x - this.dragOffset.x);
          const ny = round(svgOffset.y - this.dragOffset.y);

          //Arrow Start
          const affectedStart = this.items
            .filter(i => i.type === "line")
            .filter(i => {
              return isHit(item, i.x1, i.y1);
            });
          this.moveAffectedLines(affectedStart, nx - item.x, ny - item.y, true);
          //Arrow End
          const affectedEnd = this.items
            .filter(i => i.type === "line")
            .filter(i => {
              return isHit(item, i.x2, i.y2);
            });
          this.moveAffectedLines(affectedEnd, nx - item.x, ny - item.y, false);

          item.x = round(nx);
          item.y = round(ny);
        }
        if (type === "-") {
          const dx = item.x2 - item.x1;
          const dy = item.y2 - item.y1;

          if (dx > 0) {
            item.x1 = round(svgOffset.x - this.dragOffset.x);
          } else {
            item.x1 = round(svgOffset.x - this.dragOffset.x - dx);
          }
          if (dy > 0) {
            item.y1 = round(svgOffset.y - this.dragOffset.y);
          } else {
            item.y1 = round(svgOffset.y - this.dragOffset.y - dy);
          }
          item.x2 = round(item.x1 + dx);
          item.y2 = round(item.y1 + dy);
        }
        if (type === "s") {
          item.x1 = round(svgOffset.x - this.dragOffset.x);
          item.y1 = round(svgOffset.y - this.dragOffset.y);
        }
        if (type === "e") {
          item.x2 = round(svgOffset.x - this.dragOffset.x);
          item.y2 = round(svgOffset.y - this.dragOffset.y);
        }

        if (type.indexOf("l") >= 0) {
          const dx = svgOffset.x - this.dragOffset.x + handleSize;
          const px = item.x - dx;
          item.x = round(dx);
          item.width = round(item.width + px);
        }
        if (type.indexOf("t") >= 0) {
          const dy = svgOffset.y - this.dragOffset.y + handleSize;
          const py = item.y - dy;
          item.y = round(dy);
          item.height = round(item.height + py);
        }
        if (type.indexOf("d") >= 0) {
          const my = svgOffset.y - this.dragOffset.y + handleSize;
          item.height = round(my - item.y);
        }
        if (type.indexOf("r") >= 0) {
          const mx = svgOffset.x - this.dragOffset.x + handleSize;
          item.width = round(mx - item.x);
        }
      }
    },
    upHandle(ev) {
      this.dragging = false;
      this.$emit("change", this.stringData);
    },
    downHandle(ev, item, type) {
      const target_rect = ev.currentTarget.getBoundingClientRect();
      const x = ev.clientX - target_rect.left;
      const y = ev.clientY - target_rect.top;

      const el = ev.currentTarget;
      el.setPointerCapture(ev.pointerId);
      this.dragOffset.x = x;
      this.dragOffset.y = y;
      this.dragging = true;
    },
    addBlock() {
      let px = 10;
      let py = 10;
      const boxes = this.items.filter(i => i.type === "box");
      if (boxes.length > 0) {
        const pitem = boxes[boxes.length - 1];
        px = pitem.x;
        py = pitem.y + pitem.height;
      }
      this.items.push({
        type: "box",
        x: px,
        y: py,
        width: 200,
        height: 100,
        text: "item"
      });
      this.selectedIndex = this.items.length - 1;
      this.$emit("change", this.stringData);
    },
    changeBoxText(item) {
      const text = window.prompt("テキスト入力", item.text);
      if (text) {
        item.text = text;
      }
      this.$emit("change", this.stringData);
    },
    updateData(input) {
      let data = this.input
        .split(/[\r|\n|\r\n]/)
        .filter(item => item.length > 0)
        .map(i => {
          const m = i.split(" ");
          if (m[0] === "-") {
            return {
              type: "box",
              text: m[1],
              x: +m[2],
              y: +m[3],
              width: +m[4],
              height: +m[5]
            };
          }
          if (m[0] === ">") {
            return {
              type: "line",
              text: m[1],
              x1: +m[2],
              y1: +m[3],
              x2: +m[4],
              y2: +m[5]
            };
          }
          // const m = i.match(/- (.+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+)/);
          // if (m) {
          //   return {
          //     type: "box",
          //     text: m[1],
          //     x: +m[2],
          //     y: +m[3],
          //     width: +m[4],
          //     height: +m[5]
          //   };
          // }
          // const arrow = i.match(/> (.+) ([0-9]+) ([0-9]+) ([0-9]+) ([0-9]+)/);
          // if (arrow) {
          //   return {
          //     type: "line",
          //     text: arrow[1],
          //     x1: +arrow[2],
          //     y1: +arrow[3],
          //     x2: +arrow[4],
          //     y2: +arrow[5]
          //   };
          // }
        })
        .filter(item => item);

      this.items = data;
    },
    editorFocus() {},
    editorBlur() {
      this.selectedIndex = -1;
    },
    removeItem(index) {
      this.items.splice(this.selectedIndex, 1);
      this.selectedIndex = -1;
      this.$emit("change", this.stringData);
    },
    globalKeydown(ev) {
      if (ev.key === "Delete" && this.selectedItem) {
        this.removeItem(this.selectedIndex);
      }
    }
  },
  computed: {
    selectedItem() {
      return this.items[this.selectedIndex];
    },
    stringData() {
      return `${this.items
        .map(i => {
          if (i.type === "box") {
            return "- " + [i.text, i.x, i.y, i.width, i.height].join(" ");
          }
          if (i.type === "line") {
            return "> " + [i.text, i.x1, i.y1, i.x2, i.y2].join(" ");
          }
          return "";
        })
        .join("\n")}
`;
    }
  },
  data() {
    return {
      createArrow: false,
      createArrowPos: {
        x: 0,
        y: 0
      },
      dragging: false,
      dragOffset: {
        x: 0,
        y: 0
      },
      selectedIndex: -1,
      items: []
    };
  },
  mounted() {
    this.updateData(this.input);
  },
  watch: {
    input(input) {
      this.updateData(input);
    }
  }
};
</script>

<style scoped>
svg {
  border: 1px solid #999;
  user-select: none;
  background: #f0f0f0;
  touch-action: none;
}
.innerText {
  margin: 0.5rem;
  pointer-events: none;
}
</style>
