# Next.jsを使ってJamstackなアプリを作る

## 概要

- [Next.js](https://nextjs.org/)というWebページを作成するためのフレームワークを使います
- この章ではAPIは自前で作成せずに[QiitaのAPI](https://qiita.com/api/v2/docs)を使ってデータを取得し、Qiitaの最新記事一覧を表示するWebアプリを作成します
- Next.jsを使うとビルド時にAPIからデータを取得してHTMLを生成することができるため、Jamstackの構成を実現することができます

## ゴール

- Next.jsを使ってWebアプリを作成する
- Next.jsの機能を使ってビルド時にAPIからデータを取得する
- 作成したWebアプリをnowにデプロイし公開する

![完成形](/images/2-0.png)

## Next.jsでWebアプリを作成する

- Next.jsを使ってアプリを作成していきます

### 雛形の生成

- Next.jsの雛形を生成ライブラリである`create-next-app`をインストールします

```sh
npm i -g yarn create-next-app
```

- `create-next-app`を使ってアプリを作成します
    - 途中選択肢が出たら`Default starter app`を選択します

```sh
create-next-app jamstack-sample
```

- 作成できたら起動できることを確認しましょう

```sh
cd jamstack-sample
yarn dev
```

- [http://localhost:3000](http://localhost:3000)にアクセスすると以下の画面がでるはずです

![create-next-app](/images/2-1.png)

## 記事一覧ページの作成

- Qiitaの新着記事一覧を表示するページを作成していきます

### 埋め込みデータで記事一覧ページの作成

- `pages/items/index.js`というファイルを作成して以下の内容を記述してください

::: tip
`/pages`フォルダ配下のディレクトリ構成がそのままURL構造に適用されます。`/pages/items/index.js`は`/items/index`にマッピングされますが、一般的に`/index`は省略するので`/items`にアクセスしてみましょう
:::

```jsx
function Items() {
  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}

export default Items;
```

- [http://localhost:3000/items](http://localhost:3000/items)にアクセスしてHelloが表示されることを確認しましょう

![hello](/images/2-2.png)

- 表示が確認できたらダミーの記事一覧を表示するように修正してみます

```jsx
// ダミーの記事一覧を格納した配列を定義
const items = [
  { id: 1, title: '記事のタイトル1' },
  { id: 2, title: '記事のタイトル2' },
  { id: 3, title: '記事のタイトル3' },
];

function Items() {
  return (
    <div>
      <h1>Hello</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default Items;
```

::: tip
`.map`を使うと配列に対してループ処理を実行できます。上のコードでは記事の数だけliタグを生成しています
:::

![list](/images/2-3.png)

### QiitaのAPIから取得したデータを表示する

- QiitaのAPIをたたくために通信処理を実行するためのライブラリをインストールします

```sh
yarn add node-fetch
```

- `pages/items/index.js`を修正してQiitaのAPIからデータを取得するよにします

```jsx
// 通信ライブラリであるnode-fetchをimport
import fetch from 'node-fetch';

// itemsという引数で記事一覧を受け取る
function Items({ items }) {
  return (
    <div>
      <h1>Hello</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

// getStaticPropsという名前の関数はビルド時に実行される
export async function getStaticProps() {
  // QiitaのAPIをコール
  const res = await fetch('https://qiita.com/api/v2/items');
  const data = await res.json();
  // APIから取得したデータを必要な項目だけに絞り込む
  const items = data.map(item => ({ id: item.id, title: item.title }));
  // 取得したデータをpropsとしてreturnするとItems関数の引数に渡すことができる
  return { props: { items } };
}

export default Items;
```

::: tip
Next.jsの機能として[getStaticProps](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation)という名前で関数を定義するとビルド時に処理が実行され結果をコンポーネントに渡すことができます。ここでAPIをたたく処理を行うことでビルド時にデータを取得しコンポーネントに渡しています。
:::

- 修正語[http://localhost:3000/items](http://localhost:3000/items)にアクセスするとQiitaの最新記事が表示されているはずです
    - Qiitaの最新記事一覧は[こちらのページ](https://qiita.com/items)で確認できます

![qiita items](/images/2-4.png)



```jsx
// pages/items/index.js

import Link from 'next/link';
import fetch from 'node-fetch';

function Items({ items }) {
  return (
    <div>
      <h1>Hello</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const res = await fetch('https://qiita.com/api/v2/items');
  const data = await res.json();
  const items = data.map(item => ({ id: item.id, title: item.title }));
  return { props: { items } };
}

export default Items;
```

```js
// pages/items/[id].js

import fetch from 'node-fetch';

function Item({ item }) {
  return (
    <div>
      <h1>{item.title}</h1>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: item.body }}></div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const res = await fetch(`https://qiita.com/api/v2/items/${params.id}`);
  const data = await res.json();
  const item = { id: data.id, title: data.title, body: data.rendered_body };
  return { props: { item } };
}

export async function getStaticPaths() {f
  const res = await fetch('https://qiita.com/api/v2/items');
  const data = await res.json();
  const paths = data.map(item => `/items/${item.id}`);
  return { paths, fallback: false };
}

export default Item;
```

![qiita items](/images/2-5.png)
![qiita item](/images/2-6.png)

```sh
yarn build
```

![build](/images/2-7.png)
![tree](/images/2-8.png)

- build後の成果物は`.next`フォルダに作成される
- 各ページのhtmlファイル(idの値.html)が生成されていることを確認できる

### リファクタ

- 通信処理が何度も出てくるので専用のファイルに切り出す

```js
// api/qiitaApi.json

import fetch from 'node-fetch';

const baseUrl = 'https://qiita.com/api/v2';

const headers = {
  Authorization: 'Bearer 6e7aeb00e0f5cf1cd964c25b703b2c4b85d06fd6',
};

export async function getItems() {
  const res = await fetch(`${baseUrl}/items`, { headers });
  return res.json();
}

export async function getItem({ id }) {
  const res = await fetch(`${baseUrl}/items/${id}`, { headers });
  return res.json();
}
```

```jsx
// pages/items/index.js

import Link from 'next/link';
import { getItems } from '../../api/qiitaApi';

function Items({ items }) {
  return (
    <div>
      <h1>Hello</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <Link href="/items/[id]" as={`/items/${item.id}`}>
              <a>{item.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  const data = await getItems();
  const items = data.map(item => ({ id: item.id, title: item.title }));
  return { props: { items } };
}

export default Items;
```

```jsx
// pages/items/[id].js

import { getItem, getItems } from '../../api/qiitaApi';

function Item({ item }) {
  return (
    <div>
      <h1>{item.title}</h1>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: item.body }}></div>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const data = await getItem({ id: params.id });
  const item = { id: data.id, title: data.title, body: data.rendered_body };
  return { props: { item } };
}

export async function getStaticPaths() {
  const data = await getItems();
  const paths = data.map(item => `/items/${item.id}`);
  return { paths, fallback: false };
}

export default Item;
```

### デプロイ

- GitHubのアカウントを作成する
    - https://github.com/
- nowのアカウントを作成する
    - GitHubアカウントを使ってnowのアカウントを作成できます
    - https://vercel.com/
- nowのコマンドラインツールをインストール

```sh
npm i -g now@latest
```

- コマンドラインでnowにログイン
    - メールアドレスの入力を求められるのでGitHub登録時のメールアドレスを入力
    - メールが飛ぶのでVerifyを押すとログインできる

```sh
now login
```

![verify](/images/2-9.png)

- デプロイする
    - いろいろ聞かれるので全てデフォルトのままエンターでOK
    - デプロイが実行されるので少し時間がかかる

```sh
now
```

- デプロイが完了するとURLが表示される

![now deploy](/images/2-10.png)

- アクセスするとローカルで動かしていたのと同じアプリが表示されることを確認できる

![now](/images/2-11.png)


### レイアウト

- https://react-bootstrap.github.io/

```sh
yarn add react-bootstrap bootstrap
```

```jsx
// pages/_app.js

import 'bootstrap/dist/css/bootstrap.css'
import App from 'next/app'

export default App
```

```jsx
// pages/items/index.js

import Link from 'next/link';
import { Container, ListGroup } from 'react-bootstrap';
import { getItems } from '../../api/qiitaApi';

function Items({ items }) {
  return (
    <Container>
      <h1>Hello</h1>
      <ListGroup>
        {items.map(item => (
          <Link key={item.id} href="/items/[id]" as={`/items/${item.id}`}>
            <ListGroup.Item actiona>{item.title}</ListGroup.Item>
          </Link>
        ))}
      </ListGroup>
    </Container>
  );
}

export async function getStaticProps() {
  const data = await getItems();
  const items = data.map(item => ({ id: item.id, title: item.title }));
  return { props: { items } };
}

export default Items;
```

- 見た目の雰囲気が変わりました

![items bootstrap](/images/2-12.png)

- 記事詳細画面も修正します

```jsx
// pages/items/[id].js

import { Container } from 'react-bootstrap';
import { getItem, getItems } from '../../api/qiitaApi';

function Item({ item }) {
  return (
    <Container>
      <h1>{item.title}</h1>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: item.body }}></div>
    </Container>
  );
}

export async function getStaticProps({ params }) {
  const data = await getItem({ id: params.id });
  const item = { id: data.id, title: data.title, body: data.rendered_body };
  return { props: { item } };
}

export async function getStaticPaths() {
  const data = await getItems();
  const paths = data.map(item => `/items/${item.id}`);
  return { paths, fallback: false };
}

export default Item;
```

- 見た目の雰囲気が変わりました

![item bootstrap](/images/2-13.png)

- 修正版をデプロイします

```sh
now --prod
```
