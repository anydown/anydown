<template>
  <svg class="gantt" :width="svgWidth" :height="tasks.length * 32 + 48" @pointermove="onDrag" @pointerup="stopDrag">
    <!-- 全体を32px下げる（日付用余白） -->
    <g transform="translate(0, 48)">
      <!-- 背景 -->
      <rect class="background" x="0" y="0" :width="svgWidth" :height="tasks.length * 32"></rect>
      <g>
        <!-- 月 -->
        <text v-for="(line, index) in lines" :x="line.x" y="-28" text-anchor="start" font-weight="900" font-size="0.8rem" fill="#9C9" :key="index">{{line.labelMonth}}</text>
      </g>

      <!-- 本日 -->
      <rect :x="todayX" fill="#DDF" y=-23 width=20 height=20 rx=10 ry=10></rect>

      <g>
      <!-- 日付 -->
        <text v-for="(line, index) in lines" :x="line.x + 12" y="-8" text-anchor="middle" font-size="0.8rem" :fill="line.color" :key="index">{{line.label}}</text>
      </g>
      <g>
        <!-- 日付区切り線 -->
        <line v-for="(line, index) in lines" :x1="line.x" y1="0" :x2="line.x" :y2="tasks.length * 32" class="gridline" :key="index" />
      </g>
      <!-- タスク -->
      <g v-for="(task, index) in tasks" :transform="`translate(${scale(task.start)}, ${index * 32})`" :key="index" :class="{'dragging': index === selectedIndex}">
        <rect class="task" x="0" y="4" :width="scaleLength(task.end - task.start)" height="24" @pointerdown="startDrag($event, index)"></rect>
        <text class="taskname" x="-4" y="20" font-size="12" text-anchor="end" fill="black" line-height="32">{{task.name}}</text>
      </g>
      <rect v-if="dragoverIndex > -1 && dragoverIndex !== selectedIndex" class="dragover" x="0" :y="32 * dragoverIndex" :width="svgWidth" height="32"></rect>
    </g>

    <!-- 前へ -->
    <g :transform="`translate(${svgWidth - 24 * 3 - 0.5}, 0.5)`" @click="moveRange(-7)" style="cursor: pointer;">
      <rect fill="white" x=0 y=0 width=20 height=20 rx=4 ry=4></rect>
      <polyline points="15 5 5 10 15 15" stroke="#999" fill="none"/>
    </g>

    <!-- 次へ -->
    <g :transform="`translate(${svgWidth - 24 * 2 - 0.5}, 0.5)`" @click="moveRange(7)" style="cursor: pointer;">
      <rect fill="white" x=0 y=0 width=20 height=20 rx=4 ry=4></rect>
      <polyline points="5 5 15 10 5 15" stroke="#999" fill="none"/>
    </g>

    <!-- タスク追加 -->
    <g :transform="`translate(${svgWidth - 24.5}, 0.5)`" @click="addTask" style="cursor: pointer;">
      <rect fill="white" stroke="#999" x=0 y=0 width=20 height=20 rx=4 ry=4></rect>
      <line x1=10 x2=10 y1=5 y2=15 stroke="ForestGreen"></line>
      <line x1=5 x2=15 y1=10 y2=10 stroke="ForestGreen"></line>
    </g>    
  </svg>
</template>
<script>
import * as gantt from "./gantt-compiler";
import * as util from "./gantt-util.js";
import * as scale from "d3-scale";

export default {
  props: {
    input: String
  },
  data() {
    return {
      tasks: [],
      lines: [],
      displayRange: {
        start: -2,
        end: 24
      },
      svgWidth: 600,
      selectedIndex: -1,
      dragOffset: {
        x: 0,
        y: 0
      },
      dragging: "none",
      dragoverIndex: -1
    };
  },
  methods: {
    onDrag(e) {
      if (this.dragging === "move") {
        const len = this.selectedItem.end - this.selectedItem.start;
        //差分値を基点に反映
        this.selectedItem.start = this.invert(e.offsetX - this.dragOffset.x);
        this.selectedItem.end = this.selectedItem.start + len;

        this.dragoverIndex = Math.floor((e.offsetY - 48) / 32);
      }
      if (this.dragging === "resize-x") {
        this.selectedItem.end = this.invert(e.offsetX);
      }
    },
    startDrag(e, index) {
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);

      this.dragging = "move";
      this.selectedIndex = index;
      //ページ左上とオブジェクト左上の差分から、ドラッグ開始位置（オブジェクト相対座標）を取得
      this.dragOffset.x = e.offsetX - this.scale(this.selectedItem.start);
      this.dragOffset.y = e.offsetY - index * 32 - 48;

      const len = this.selectedItem.end - this.selectedItem.start;
      if (e.offsetX > this.scale(this.selectedItem.end) - 10) {
        this.dragging = "resize-x";
      }
    },
    stopDrag() {
      if (this.dragging !== "none") {
        this.selectedItem.start = util.roundHMSfromEpoc(
          this.selectedItem.start
        );
        this.selectedItem.end = util.roundHMSfromEpoc(this.selectedItem.end);
      }
      if (this.dragging === "move") {
        if (this.selectedIndex !== this.dragoverIndex) {
          const task = this.tasks.splice(this.selectedIndex, 1);
          this.tasks.splice(this.dragoverIndex, 0, task[0]);
        }
      }
      if (this.dragging !== "none") {
        this.$emit("change", gantt.serialize(this.tasks));
      }

      this.dragging = "none";
      this.selectedIndex = -1;
      this.dragoverIndex = -1;
    },
    scaleLength(epocdiff) {
      return (
        ((epocdiff / (24 * 60 * 60 * 1000)) * this.svgWidth) /
        this.displayRangeLength
      );
    },
    scale(epoc) {
      return scale
        .scaleLinear()
        .domain(this.timeRange)
        .range([0, this.svgWidth])(epoc);
    },
    invert(x) {
      return scale
        .scaleLinear()
        .domain(this.timeRange)
        .range([0, this.svgWidth])
        .invert(x);
    },
    generateLine() {
      const start = this.timeRange[0];
      const end = this.timeRange[1];
      this.lines = generateLineByRange(
        start,
        end,
        this.displayRange,
        this.svgWidth
      );
    },
    setTasks(input) {
      this.tasks = gantt.compile(input);
    },
    addTask() {
      const task = window.prompt("タスク名入力");
      if (task) {
        this.tasks.push({
          name: task,
          start: util.getRelativeDate(0).getTime(),
          end: util.getRelativeDate(1).getTime()
        });
      }
    },
    moveRange(offset) {
      this.displayRange.start += offset;
      this.displayRange.end += offset;
      this.generateLine();
    }
  },
  watch: {
    input() {
      this.setTasks(this.input);
    }
  },
  computed: {
    selectedItem() {
      return this.tasks[this.selectedIndex];
    },
    timeRange() {
      return [
        util.getRelativeDate(this.displayRange.start).getTime(),
        util.getRelativeDate(this.displayRange.end).getTime()
      ];
    },
    displayRangeLength() {
      return this.displayRange.end - this.displayRange.start;
    },
    todayX() {
      const start = this.timeRange[0];
      const end = this.timeRange[1];
      const len = end - start;

      const reldate = util.getRelativeDate(0);
      const t = ((reldate.getTime() - start) / len) * this.svgWidth;
      return Math.round(t);
    }
  },
  mounted() {
    this.generateLine();
    this.setTasks(this.input);
  }
};

function generateLineByRange(start, end, displayRange, svgWidth) {
  let lines = [];
  const len = end - start;
  let month = -1;
  const displayRangeLength = displayRange.end - displayRange.start;
  for (let i = 0; i < displayRangeLength; i++) {
    const reldate = util.getRelativeDate(displayRange.start + i);
    const t = ((reldate.getTime() - start) / len) * svgWidth;
    let color = "#888888";
    if (reldate.getDay() === 0) {
      color = "#FF8888";
    }
    if (reldate.getDay() === 6) {
      color = "#8888FF";
    }
    let monthStr = "";
    if (month != reldate.getMonth() + 1) {
      month = reldate.getMonth() + 1;
      monthStr = reldate.getMonth() + 1 + "月";
    }

    lines.push({
      x: Math.round(t),
      label: reldate.getDate(),
      color: color,
      labelMonth: monthStr
    });
  }
  return lines;
}
</script>
<style>

.task {
  fill: rgb(144, 144, 255);
  cursor: pointer;
}

.background {
  fill: #f5f5f5;
}

.gridline {
  stroke: rgb(253, 253, 253);
  stroke-width: 2;
}
svg.gantt {
  cursor: default;
  user-select: none;
  touch-action: none;
}
.taskname {
  cursor: default;
}
.dragging {
  opacity: 0.5;
}
.dragover {
  opacity: 0.1;
}
</style>