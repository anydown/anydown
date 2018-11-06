import Vue from "vue";
import Catalog from "./Catalog";

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: h => h(Catalog)
});
