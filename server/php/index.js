const Editor = {
  template: `
  <div>
    <textarea v-model="text" class="bbs__textarea"></textarea>
    <button @click="createPost">投稿</button>
    <div class="bbs__item">
      <p>{{ item.contents }}</p>
      <p class="bbs__item__id">No: {{ item.id }}</p>
      <p>{{ item.url }}</p>
      <p>{{ item.created_at }}</p>
    </div>
  </div>
  `,
  data() {
    return {
      message: "init",
      text: "",
      items: [],
      item: {},
      id: ""
    };
  },
  methods: {
    fetchPosts() {
      axios.get("./api.php/" + this.id).then(res => {
        this.item = res.data;
      });
    },
    createPost() {
      var params = new URLSearchParams();
      params.append("text", this.text);
      params.append("action", "post");

      axios
        .post("./api.php", params)
        .then(response => {
          this.text = "";
          this.fetchPosts();
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  mounted() {
    this.id = this.$route.params.id
    this.fetchPosts();
  }
};

const routes = [
  { path: '/:id', component: Editor }
]

// 3. ルーターインスタンスを作成して、ルートオプションを渡します
// 追加のオプションをここで指定できますが、
// この例ではシンプルにしましょう
const router = new VueRouter({
  routes // `routes: routes` の短縮表記
})

// 4. root となるインスタンスを作成してマウントします
// アプリケーション全体がルーターを認知できるように、
// ルーターをインジェクトすることを忘れないでください。
const app = new Vue({
  router
}).$mount('#main')