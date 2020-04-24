# 3.microCMSを使ってコンテンツを管理する

## 概要

- 前章ではQiitaのAPIからコンテンツを取得し表示していました
- ですが、実際にJamstackなアプリを開発する場合はコンテンツも自前で用意することが多いでしょう
- この章ではコンテンツを管理しAPIとして公開できるHeadlessCMSを使ってみます
- HeadlessCMSと呼ばれるサービスは世の中に数多くありますが今回は[microCMS](https://microcms.io/)を使います

## ゴール

- microCMSを使ってコンテンツをAPI公開する
- JamstackなアプリでmicroCMSからデータを取得し表示する
- microCMSのデータ更新をトリガーに自動でビルド/デプロイを実行させてWebページを最新化する

![ゴール](/images/3-0.png)

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

## microCMSのデータ追加をトリガーに再デプロイする

- 前節でmicroCMS化対応は完了しました
- ですが、コンテンツのデータはビルド時に取得するためmicroCMS上でブログ記事を追加したら再ビルド/デプロイを実行する必要があります
- 毎回手動で叩くのは面倒なので自動化してしまいましょう

### GitHubにソースをアップロード

- ビルド/デプロイを自動化するためにはソースコードをネット上にあげておく必要があります
- GitHubにリポジトリを作成しアップロードしましょう
- 以下のURLから作成します
    - [https://github.com/new](https://github.com/new)

![リポジトリ作成](/images/3-20.png)
![コピーURL](/images/3-21.png)

- gitコマンドを使ってアップロードします

::: tip
gitコマンドが入っていない人は[公式サイト](https://git-scm.com/)からダウンロードしてください
:::

```sh
# URL部分はコピーしたものを貼り付け
git remote add origin https://github.com/xxxx/jamstack-sample.git
git add .
git commit -m "Jamstackハンズオン"
git push origin master
```

- 最後のコマンドでGitHub上にアップロードされます
    - ID/パスワードを求められたら適宜入力してください
- GitHubのページに戻りリロードするとアップロードできていることを確認できます

![リポジトリ](/images/3-22.png)

### nowとGitHubを連携する

- デプロイ先のnowと先程作成したGitHubのリポジトリを連動させます
- nowのダッシュボードにアクセスしてください
    - [https://vercel.com/dashboard](https://vercel.com/dashboard)
- これまでnowコマンドでデプロイしていたアプリが表示されています

![nowダッシュボード](/images/3-23.png)
![Settings](/images/3-24.png)
![リポジトリを保存](/images/3-25.png)

- 次の手順はこの画面からスタートするので閉じずにそのまま残しておいてください

### microCMSの更新をnowのトリガーに設定する

- 最後にmicroCMSのコンテンツが更新された時に自動でnowに再ビルド/デプロイされるようにします
- nowでビルド/デプロイを実行させるURLを発行します
    - [https://vercel.com/ozaki25/jamstack-sample/settings/git-integration?provider=github](https://vercel.com/ozaki25/jamstack-sample/settings/git-integration?provider=github)

![create hook](/images/3-26.png)
![copy url](/images/3-27.png)

- コピーしたURLをmicroCMSに登録します
    - [https://app.microcms.io/](https://app.microcms.io/)

![microcms](/images/3-28.png)
![microcms](/images/3-29.png)
![microcms](/images/3-30.png)

- これで設定が完了しました

## 動作確認

- microCMSで記事を追加してみましょう

![create item](/images/3-31.png)

- nowのダッシュボードに戻ってしばらくすると黄色いビルド中のステータスに変更されるはずです

![now](/images/3-32.png)

- ビルド/デプロイが完了すると緑のステータスに戻ります
- 完了したらWebページに再度アクセスしてみましょう

![now](/images/3-33.png)
![now](/images/3-34.png)

- コンテンツが最新化されていることを確認できました！

![app](/images/3-35.png)
![app](/images/3-36.png)


## まとめ

- microCMSを使ってコンテンツの管理しAPIとして公開する方法を学びました
- GitHub、now、microCMSを連動させてコンテンツを更新すると自動でビルドデプロイされる仕組みを構築しました
- 本番システムとしての使用例も多くある構成なのでJamstackなアプリを作りたくなったらこの構成を試してみてください