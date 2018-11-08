<template>
    <pre v-text="text"></pre>
</template>

<script>
export default {
  props: {
    input: String
  },
  computed: {
    text() {
      return this.input.slice(1);
    }
  }
};
</script>

<style>
pre {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 3px;
  word-break: normal;
  white-space: pre;
}
</style>
