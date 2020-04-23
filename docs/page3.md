# microCMSを使ってコンテンツを管理する

## 概要

- 前章ではQiitaのAPIからコンテンツを取得し表示していました
- ですが、実際にJamstackなアプリを開発する場合はコンテンツも自前で用意することが多いでしょう
- この章ではコンテンツを管理しAPIとして公開できるHeadlessCMSを使ってみます
- HeadlessCMSと呼ばれるサービスは世の中に数多くありますが今回は[microCMS](https://microcms.io/)を使います

## ゴール

- microCMSを使ってコンテンツをAPI公開する
- JamstackなアプリでmicroCMSからデータを取得し表示する
- microCMSのデータ更新をトリガーに自動でビルド/デプロイを実行させてWebページを最新化する

## microCMSのセットアップ

### アカウント作成

- まずはmicroCMSのアカウント登録をします
    - 以下のページにアクセスしてアカウントを作成してください
    - [https://microcms.io/](https://microcms.io/)

![手順1](/images/3-1.png)
![手順2](/images/3-2.png)
![手順3](/images/3-3.png)
![手順4](/images/3-4.png)
![手順5](/images/3-5.png)
![手順6](/images/3-6.png)

### ブログサービスを作成

- タイトルと本文の項目を持ったブログサービスを作ります

![手順7](/images/3-7.png)
![手順8](/images/3-8.png)
![手順9](/images/3-9.png)
![手順10](/images/3-10.png)

### ブログサービスにデータを追加

- サンプルのブログ記事を作成しておきます

![手順11](/images/3-11.png)
![手順12](/images/3-12.png)
![手順13](/images/3-13.png)


### ブログサービスのAPI情報を確認

- ブログサービスのAPI情報を確認しレスポンスの構造を確認します

![手順14](/images/3-14.png)
![手順15](/images/3-15.png)
![手順16](/images/3-16.png)
![手順17](/images/3-17.png)

## microCMSからデータを取得する

- 前章のNext.jsで作成したアプリを改修していきます
- 通信先を変更するため`api/qiitaApi.js`を修正します
    - アクセス先がQiitaじゃなくなるためファイル名が不適切ですが気にせず進めます

```js
import fetch from 'node-fetch';

// microCMSで作成した自身のAPIのURLに変更
const baseUrl = 'https://xxxxxxxxxxx.microcms.io/api/v1';

const headers = {
  // APIキーを設定
  'X-API-KEY': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
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

- QiitaのAPIとmicroCMSのAPIではレスポンスのデータ構造が異なるのでmicroCMS仕様に修正します
- `pages/items/index.js`の`getStaticProps`内を修正

```jsx
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
            <ListGroup.Item action>{item.title}</ListGroup.Item>
          </Link>
        ))}
      </ListGroup>
    </Container>
  );
}


export async function getStaticProps() {
  const data = await getItems();
  // data.map を data.contents.map に修正
  const items = data.contents.map(item => ({ id: item.id, title: item.title }));
  return { props: { items } };
}

export default Items;
```

- `pages/items/[id].js`の`getStaticProps`と`getStaticPaths`を修正

```jsx
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
  // rendered_body を body に修正
  const item = { id: data.id, title: data.title, body: data.body };
  return { props: { item } };
}

export async function getStaticPaths() {
  const data = await getItems();
  // data.map を data.contents.map に修正
  const paths = data.contents.map(item => `/items/${item.id}`);
  return { paths, fallback: false };
}

export default Item;
```

- アプリにアクセスして確認してみましょう
    - アプリを停止してしまった人は`yarn dev`で起動しましょう
- うまくいっていればmicroCMSに登録した記事が表示されているはずです

![一覧](/images/3-18.png)
![詳細](/images/3-19.png)

- 最新版をnowにデプロイしましょう

```sh
now --prod
```

- これでローカルで表示していたページを公開することができました

