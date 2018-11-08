<template>
    <svg height=400 width="600">
        <g v-for="(item, idx) in items" :key="idx" @click="selectedIndex = idx">
            <g v-if="item.type === 'box'" :transform="`translate(${item.x}, ${item.y})`">
                <rect fill="white" stroke="black" x=0.5 y=0.5 :height="item.height" :width="item.width"></rect>
                <foreignObject :height="item.height" :width="item.width" x="0" y="0">
                    <div class="innerText" v-text="item.text"></div>
                </foreignObject>
            </g>

            <g v-if="item.type === 'line'">
                <line :x1="item.x1" :x2="item.x2" :y1="item.y1" :y2="item.y2" stroke="rgba(0,0,0,0)" stroke-width="10"></line>

                <line :x1="item.x1" :x2="item.x2" :y1="item.y1" :y2="item.y2" stroke="black"></line>
            </g>
        </g>

        <g v-if="selectedItem">
            <g v-if="selectedItem.type === 'box'" :transform="`translate(${selectedItem.x}, ${selectedItem.y})`">
                <rect fill="none" stroke="green" x=0.5 y=0.5 :height="selectedItem.height" :width="selectedItem.width"></rect>
                <rect x=-5 y=-5 height=10 width=10  fill="white" stroke="green"></rect>
                <rect :x="-5 + selectedItem.width" y=-5 height=10 width=10 fill="white" stroke="green"></rect>
                <rect :x="-5 + selectedItem.width" :y="-5 + selectedItem.height" height=10 width=10 fill="white" stroke="green"></rect>
                <rect :x="-5" :y="-5 + selectedItem.height" height=10 width=10 fill="white" stroke="green"></rect>
            </g>

            <g v-if="selectedItem.type === 'line'">
                <line :x1="selectedItem.x1" :x2="selectedItem.x2" :y1="selectedItem.y1" :y2="selectedItem.y2" stroke="green"></line>
                <rect :x="-5 + selectedItem.x1" :y="-5 + selectedItem.y1" height=10 width=10 fill="white" stroke="green"></rect>
                <rect :x="-5 + selectedItem.x2" :y="-5 + selectedItem.y2" height=10 width=10 fill="white" stroke="green"></rect>
            </g>
        </g>
    </svg>
</template>

<script>
export default {
    computed: {
        selectedItem(){
            return this.items[this.selectedIndex]
        }
    },
    data(){
        return {
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
        }
    }

};
</script>

<style scoped>
svg {
  border: 1px solid #999;
}
.innerText {
  margin: 0.5rem;
}
</style>
