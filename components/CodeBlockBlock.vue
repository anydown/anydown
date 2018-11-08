<template>
    <svg height=400 width="600">
        <g v-for="(item, idx) in items" :key="idx" @pointerdown="selectedIndex = idx">
            <g v-if="item.type === 'box'" :transform="`translate(${item.x}, ${item.y})`">
                <rect fill="white" stroke="black" x=0.5 y=0.5 :height="item.height" :width="item.width"></rect>
                <foreignObject :height="item.height" :width="item.width" x="0" y="0">
                    <div class="innerText" v-text="item.text"></div>
                </foreignObject>
                <rect @pointerdown="downHandle($event, item, 'x')" @pointerup="upHandle" @pointermove="moveHandle($event, item, 'x')"  fill="rgba(255,255,255,0)" x=0.5 y=0.5 :height="item.height" :width="item.width"></rect>

            </g>

            <g v-if="item.type === 'line'" @pointerdown="downHandle($event, item, '-')" @pointerup="upHandle" @pointermove="moveHandle($event, item, '-')">
                <line :x1="item.x1" :x2="item.x2" :y1="item.y1" :y2="item.y2" stroke="rgba(0,0,0,0)" stroke-width="10"></line>
                <line :x1="item.x1" :x2="item.x2" :y1="item.y1" :y2="item.y2" stroke="black"></line>
            </g>
        </g>

        <g v-if="selectedItem">
            <g v-if="selectedItem.type === 'box'" :transform="`translate(${selectedItem.x}, ${selectedItem.y})`">
                <rect fill="none" stroke="green" x=0.5 y=0.5 :height="selectedItem.height" :width="selectedItem.width"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'tl')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'tl')" x=-5 y=-5 height=10 width=10  fill="white" stroke="green"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'tl')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'tr')" :x="-5 + selectedItem.width" y=-5 height=10 width=10 fill="white" stroke="green"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'dr')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'dr')" :x="-5 + selectedItem.width" :y="-5 + selectedItem.height" height=10 width=10 fill="white" stroke="green"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'dl')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'dl')"  :x="-5" :y="-5 + selectedItem.height" height=10 width=10 fill="white" stroke="green"></rect>
            </g>

            <g v-if="selectedItem.type === 'line'">
                <line style="pointer-events: none;" :x1="selectedItem.x1" :x2="selectedItem.x2" :y1="selectedItem.y1" :y2="selectedItem.y2" stroke="green"></line>
                <rect @pointerdown="downHandle($event, selectedItem, 's')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 's')" :x="-5 + selectedItem.x1" :y="-5 + selectedItem.y1" height=10 width=10 fill="white" stroke="green"></rect>
                <rect @pointerdown="downHandle($event, selectedItem, 'e')" @pointerup="upHandle" @pointermove="moveHandle($event, selectedItem, 'e')"  :x="-5 + selectedItem.x2" :y="-5 + selectedItem.y2" height=10 width=10 fill="white" stroke="green"></rect>
            </g>
        </g>
    </svg>
</template>

<script>
export default {
  methods: {
    moveHandle(ev, item, type) {
      if (this.dragging) {
        var target_rect = ev.currentTarget.getBoundingClientRect();
        var x = ev.clientX - target_rect.left;
        var y = ev.clientY - target_rect.top;

        if (type === "x") {
          item.x = ev.offsetX - this.dragOffset.x;
          item.y = ev.offsetY - this.dragOffset.y;
        }
        if (type === "-") {
          const dx = item.x2 - item.x1;
          const dy = item.y2 - item.y1;

          if (dx > 0) {
            item.x1 = ev.offsetX - this.dragOffset.x;
          } else {
            item.x1 = ev.offsetX - this.dragOffset.x - dx;
          }
          if (dy > 0) {
            item.y1 = ev.offsetY - this.dragOffset.y;
          } else {
            item.y1 = ev.offsetY - this.dragOffset.y - dy;
          }
          item.x2 = item.x1 + dx;
          item.y2 = item.y1 + dy;
        }
        if (type === "s") {
          item.x1 = ev.offsetX - this.dragOffset.x;
          item.y1 = ev.offsetY - this.dragOffset.y;
        }
        if (type === "e") {
          item.x2 = ev.offsetX - this.dragOffset.x;
          item.y2 = ev.offsetY - this.dragOffset.y;
        }

        if (type.indexOf("l") >= 0) {
          const dx = ev.offsetX - this.dragOffset.x + 5;
          const px = item.x - dx;
          item.x = dx;
          item.width += px;
        }
        if (type.indexOf("t") >= 0) {
          const dy = ev.offsetY - this.dragOffset.y + 5;
          const py = item.y - dy;
          item.y = dy;
          item.height += py;
        }
        if (type.indexOf("d") >= 0) {
          const my = ev.offsetY - this.dragOffset.y + 5;
          item.height = my - item.y;
        }
        if (type.indexOf("r") >= 0) {
          const mx = ev.offsetX - this.dragOffset.x + 5;
          item.width = mx - item.x;
        }
      }
    },
    upHandle(ev) {
      this.dragging = false;
    },
    downHandle(ev, item, type) {
      var target_rect = ev.currentTarget.getBoundingClientRect();
      var x = ev.clientX - target_rect.left;
      var y = ev.clientY - target_rect.top;

      var el = ev.currentTarget;
      el.setPointerCapture(ev.pointerId);
      this.dragOffset.x = x;
      this.dragOffset.y = y;
      this.dragging = true;
      console.log(ev, item, type);
    }
  },
  computed: {
    selectedItem() {
      return this.items[this.selectedIndex];
    }
  },
  data() {
    return {
      dragging: false,
      dragOffset: {
        x: 0,
        y: 0
      },
      selectedIndex: 0,
      items: [
        {
          type: "box",
          x: 20,
          y: 30,
          width: 300,
          height: 100,
          text: "test"
        },
        {
          type: "line",
          x1: 10,
          y1: 10,
          x2: 100,
          y2: 100
        }
      ]
    };
  }
};
</script>

<style scoped>
svg {
  border: 1px solid #999;
  user-select: none;
}
.innerText {
  margin: 0.5rem;
}
</style>
