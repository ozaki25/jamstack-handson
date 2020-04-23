# Next.jsを使ってJamstackなアプリを作ってみる

## Topic1

## Topic2

## Topic3

## コマンドメモ

### アプリ作成

```sh
npm i -g yarn create-next-app
create-next-app jamstack-sample
# Default starter appを選択
cd jamstack-sample
yarn dev
```

![create-next-app](/images/2-1.png)

```jsx
// pages/items/index.js

function Items() {
  return (
    <div>
      <h1>Hello</h1>
    </div>
  );
}

export default Items;
```

![hello](/images/2-2.png)

```jsx
// pages/items/index.js

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

![list](/images/2-3.png)

```sh
yarn add node-fetch
```

```jsx
// pages/items/index.js

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

- https://qiita.com/items

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
