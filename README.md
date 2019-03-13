# anydown

Markdownによる軽量予定管理ツールです。

2ペインのシンプルなMarkdownエディタに、カンバンやガントなどのコンポーネントがついています。  
それぞれのコンポーネントは **双方向編集** に対応しています。  
保存先はローカルストレージです。

# 安定版

https://anydown-next-example.netlify.com/

# 開発版

https://anydown-canary.netlify.com/

※容赦なくデータが吹っ飛びますのでご注意ください

# カンバン機能

![anydown-kanban2](https://user-images.githubusercontent.com/3132889/53783359-8f91a380-3f54-11e9-944b-df1ac1b4488d.gif)

# ガントチャート機能

![anydown-gantt](https://user-images.githubusercontent.com/3132889/53783356-8dc7e000-3f54-11e9-86ad-c4d702f7d133.gif)

# ブロック図機能

![anydown-block](https://user-images.githubusercontent.com/3132889/53783351-8a345900-3f54-11e9-83ca-98119c75f80d.gif)


# 利用方法

最新のChromeブラウザで利用してください。

基本的には[DEMO](https://anydown-next-example.netlify.com/)をそのまま使ってください。ブラウザ内部のローカルストレージに保存されるため外部のサーバなどに送信されません。

現在のところ、サーバへのアップロード機能や共有機能などはありません。

# PWAでの利用方法

デスクトップPWAに対応しているため、ChromeでDEMOをデスクトップPWAとしてインストールすると、ネイティブアプリ風に使うことができます。

インストール手順は下記の記事を参考にしてください。

https://press.monaca.io/atsushi/3685


# ビルド方法

ローカルサーバで動かしたい方向けです。ただし、保存先はDEMOをそのまま使う場合と変わりなく、ローカルストレージに保存されます。

Node.js version 10.x で動作確認をしています。

```bash
npm install
npm run dev
# 開発用サーバが起動するので、ブラウザでhttp://localhost:1234を開く
```

あるいは

```bash
npm install
npm run build
cd dist
# HTTPサーバを立てる
# python -m SimpleHTTPServer などでもOK
npm install -g serve
serve .
```
