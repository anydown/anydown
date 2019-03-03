import * as db from "./util/local-db";

let localDb = new db.LocalDb();

//デフォルト
localDb.load();
console.log(localDb);

//作成
let id = localDb.insert("Hello", "helloworld");
console.log(id);
console.assert(localDb.read(id));

//更新
localDb.update(id, "Hello2", "bar");
console.assert(localDb.read(id).name === "Hello2");
console.assert(localDb.read(id).contents === "bar");

//削除
localDb.delete(id);
console.assert(localDb.read(id) === undefined);

console.log(localDb.cache);
