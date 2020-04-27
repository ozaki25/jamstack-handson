# 2.Next.jsを使ってJamstackなアプリを作る

## 概要

- この章ではビルド時にAPIからデータを取得してページを生成する、というJamstackの特徴を持ったアプリを作成していきます
    - [Next.js](https://nextjs.org/)というWebページを作成するためのフレームワークを使います
    - この章ではAPIは自前で作成せずに[QiitaのAPI](https://qiita.com/api/v2/docs)を使ってデータを取得し、Qiitaの最新記事一覧を表示してみます
    - Next.jsを使うとビルド時にAPIからデータを取得してHTMLを生成することができるため、Jamstackの構成を実現することができます

## ゴール

- Next.jsを使ってWebアプリを作成できていること
- Next.jsの機能を使ってビルド時にAPIからデータを取得できていること
- 作成したWebアプリをnowにデプロイし公開できていること

![完成形](/images/2-0.png)

## 2-1.Next.jsの雛形を作成

- Next.jsを使ってアプリを作成していきます
- Next.jsの雛形生成ライブラリである`create-next-app`と、コマンドラインツールである`yarn`をインストールします

```sh
npm i -g create-next-app yarn
```

- `create-next-app`を使ってアプリを作成します
    - 途中で選択肢が出たら`Default starter app`を選択します

```sh
create-next-app jamstack-sample
```

- 作成できたらVSCodeでjamstack-sampleプロジェクトを開きましょう
    - [参考リンク](/page0.html#vscodeが入っていること)
- ログに表示される案内に従って起動できることを確認しましょう

```sh
cd jamstack-sample
yarn dev
```

::: tip
止めたいときは `Ctl + c` で停止できます
:::

- [http://localhost:3000](http://localhost:3000)にアクセスすると以下の画面が表示されるはずです

![create-next-app](/images/2-1.png)

::: tip
今後出てくるコマンドの実行は特別な案内がない限り`jamstack-sample`ディレクトリ内(=`yarn dev`を実行した場所)で実行してください
:::

## 2-2.記事一覧ページの作成

- Qiitaの新着記事一覧を表示するページを作成していきます

### 埋め込みデータで記事一覧ページの作成

- まずは新しいページを作成してHelloだけ表示させてみましょう
- `pages/items/index.js`というファイルを作成して以下の内容を記述してください

::: tip
`/pages`配下のディレクトリ構成がそのままURL構造に適用されます。`/pages/items/index.js`は`/items/index`にマッピングされます。一般的に`/index`は省略するので`/items`にマッピングされることになります。
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

```jsx{1-6,12-16}
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
`.map`を使うと配列の要素を順番にループ処理できます。上のコードでは記事の数だけliタグを生成しています
:::

![list](/images/2-3.png)

### QiitaのAPIから取得したデータを表示する

- QiitaのAPIをたたくので、通信処理を実行するためのライブラリをインストールします

```sh
yarn add node-fetch
```

- `pages/items/index.js`を修正してQiitaのAPIからデータを取得するようにします

```jsx{1-2,4-5,18-32}
// 通信ライブラリであるnode-fetchをimport
import fetch from 'node-fetch';

// getStaticPropsから渡されるitemsという変数を受け取る
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

// getStaticPropsという名前の関数はビルド時にフレームワークが実行してくれる
export async function getStaticProps() {
  // QiitaのAPIをコール
  const res = await fetch('https://qiita.com/api/v2/items', {
    // アクセストークンをセット
    headers: {
      Authorization: 'Bearer a8f7b4026700cd36eb8e3a75525d767d0115aabe',
    },
  });
  const data = await res.json();
  // APIから取得したデータを必要な項目(idとtitle)だけに絞り込む
  const items = data.map(item => ({ id: item.id, title: item.title }));
  // 取得したデータをpropsとしてreturnするとItems関数の引数に渡すことができる
  return { props: { items } };
}

export default Items;
```

::: tip
QiitaのAPIは[アクセス回数に制限がある](https://qiita.com/api/v2/docs#%E5%88%A9%E7%94%A8%E5%88%B6%E9%99%90)ためトークンを発行してセットしておいてください。Qiitaのアカウントがなかったりトークンの発行手順がわからない場合は上記サンプルに埋め込まれているトークンを使ってください。[マイページの「アプリケーション」](https://qiita.com/settings/applications)からトークンを発行できます。
:::

::: tip
Next.jsの機能として[getStaticProps](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation)という名前で関数を定義するとビルド時に処理が実行され結果をコンポーネントに渡すことができます。ここでAPIをたたく処理を行うことでビルド時にデータを取得しコンポーネントに渡しています。(コンポーネントとはHTMLをreturnしているfunctionのこと)
:::

- 修正後[http://localhost:3000/items](http://localhost:3000/items)にアクセスするとQiitaの最新記事が表示されているはずです
    - Qiitaの最新記事一覧は[こちらのページ](https://qiita.com/items)で確認できます

![qiita items](/images/2-4.png)


## 2-3.記事詳細ページの作成

- 一覧画面で記事を選択すると詳細ページが表示されるようにしてみましょう
- 詳細ページのURLは`/items/記事のID`となるようにします
    - ex. `http://localhost:3000/items/4075d03278d1fb51cc37`

### 記事一覧に記事詳細へのリンクを追加する

- 記事詳細ページはこの後作りますが、先に一覧から詳細へ遷移できるように修正しておきます
- `pages/items/index.js`に[Link](https://nextjs.org/docs/api-reference/next/link)を追加します

```jsx{1-2,12-15}
// ページ遷移をするためのLinkコンポーネントをimport
import Link from 'next/link';
import fetch from 'node-fetch';

function Items({ items }) {
  return (
    <div>
      <h1>Hello</h1>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {/* Linkを追加 */}
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
  const res = await fetch('https://qiita.com/api/v2/items', {
    // アクセストークンをセット
    headers: {
      Authorization: 'Bearer a8f7b4026700cd36eb8e3a75525d767d0115aabe',
    },
  });
  const data = await res.json();
  const items = data.map(item => ({ id: item.id, title: item.title }));
  return { props: { items } };
}

export default Items;
```

- 遷移先はエラーになりますが一覧がリンク化されました

![qiita items](/images/2-5.png)

### 詳細ページを作成する

- 一覧画面は`/items`にマッピングさせたいので`/pages/items/index.js`というファイルを作りましたが、今回作りたいページは`/items/記事のID`なのでURLが動的に変動します
- そういう場合は`[id].js`といったファイル名で作成することで対応できます
- `/pages/items/[id].js`を作成した以下の内容を記述してください

```js
import fetch from 'node-fetch';

// getStaticPropsからitemを受け取る
function Item({ item }) {
  return (
    <div>
      <h1>{item.title}</h1>
      <hr />
      <div dangerouslySetInnerHTML={{ __html: item.body }}></div>
    </div>
  );
}

// ビルド時に実行される関数で、returnした値をコンポーネントに渡すことができる
export async function getStaticProps({ params }) {
  // QiitaのAPIから記事の詳細情報を取得
  const res = await fetch(`https://qiita.com/api/v2/items/${params.id}`, {
    // アクセストークンをセット
    headers: {
      Authorization: 'Bearer a8f7b4026700cd36eb8e3a75525d767d0115aabe',
    },
  });
  const data = await res.json();
  // レスポンスから必要な項目だけを抽出
  const item = { id: data.id, title: data.title, body: data.rendered_body };
  // 抽出した値をreturn(コンポーネントに引数として渡される)
  return { props: { item } };
}

// ビルド時に実行される関数で、[id].jsのidに具体的にどんな値が入るのかをリストでreturnする
export async function getStaticPaths() {
  // QiitaのAPIから記事一覧の情報を取得
  const res = await fetch('https://qiita.com/api/v2/items', {
    // アクセストークンをセット
    headers: {
      Authorization: 'Bearer a8f7b4026700cd36eb8e3a75525d767d0115aabe',
    },
  });
  const data = await res.json();
  // レスポンスを元に詳細ページのURLのリストを作成
  const paths = data.map(item => `/items/${item.id}`);
  return { paths, fallback: false };
}

export default Item;
```

::: tip
Jamstackはビルド時に各ページのHTMLを生成するため、今回の記事詳細ページのような場合でも全てのページのHTMLを作成しておく必要があります。どのようなURLのページがあるかはAPIを叩いてみないとわからないので動的に指定する必要がありますが、[getStaticPaths](https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation)を使うとそれを実現することができます。
:::

- ここまでできたら一覧画面から詳細画面へ遷移してみましょう
- 以下のように記事の本文が表示されているはずです

![qiita item](/images/2-6.png)


### ビルドしてみる

- これまでは`yarn dev`コマンドで開発モードで起動していました
- 本番用にビルドして成果物を確認してみます

```sh
yarn build
```

- このようなログがでます

![build](/images/2-7.png)

- build後の成果物は`.next`ディレクトリに作成されます
- `.next`の内部はいろいろなファイルがあって複雑ですが、一覧画面と各詳細画面のhtmlファイルが生成されていることを確認できます

![tree](/images/2-8.png)

- 以下のコマンドでビルドしたアプリを起動することができます

```sh
yarn start
```

- `yarn dev`のときは都度ビルドが走るため最新記事が都度反映されていました
- `yarn start`の場合はビルド済みのアプリを起動するだけなので、再ビルドするまで記事一覧の内容は更新されません
    - APIをたたくのがビルド時のみで、実行時はAPIをたたかないのがJamstackの特徴でしたね

### リファクタリング

- 通信処理が何度も出てくるので専用のファイルに切り出しておきましょう
- `api/qiitaApi.js`を作成して以下の内容を記述してください

```js
import fetch from 'node-fetch';

const baseUrl = 'https://qiita.com/api/v2';

const headers = {
  Authorization: 'Bearer a8f7b4026700cd36eb8e3a75525d767d0115aabe',
};

// 記事一覧を取得する関数
export async function getItems() {
  const res = await fetch(`${baseUrl}/items`, { headers });
  return res.json();
}

// 記事詳細を取得する関数
export async function getItem({ id }) {
  const res = await fetch(`${baseUrl}/items/${id}`, { headers });
  return res.json();
}
```

- 作成したqiitaApiの内容を適用していきます
- `pages/items/index.js`を修正します

```jsx{2-3,23}
import Link from 'next/link';
// qiitaApiから一覧を取得するgetItemsをimport
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

- `pages/items/[id].js`を修正します

```jsx{1-2,15,21}
// qiitaApiから一覧を取得するgetItemsと詳細を取得するgetItemをimport
import { getItems, getItem } from '../../api/qiitaApi';

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

- `yarn dev`で起動して変わらずに動くことを確認しておいてください

## 2-4.アプリをnowにデプロイする

- これまでは端末のローカル環境で起動していたのでその端末からしかアクセスできませんでした
- ホスティングサービスにアプリをアップロードしてどこからでもアクセスできるように公開してみましょう
- 今回は[now](https://vercel.com/home)というホスティングサービスを使います

### アカウントの作成

- まずはGitHubのアカウントを作成します
- 以下のページからアカウントを作成してください
    - [https://github.com/](https://github.com/)
- 次にnowのアカウントを作成します
- GitHubアカウントを使ってnowのアカウントを作成できます
    - [https://vercel.com/signup](https://vercel.com/signup)

### コマンドラインツールのセットアップ

- nowのコマンドラインツールをインストールします

```sh
npm i -g now@latest
```

- インストールできたらコマンドラインでnowにログインします
    - メールアドレスの入力を求められるのでGitHub登録時のメールアドレスを入力してください
    - メールが飛ぶのでVerifyを押すとログインできます

```sh
now login
```

- 以下のようなメールが届くのでVerifyを押します

![verify](/images/2-9.png)

### デプロイする

- 以下のコマンドでデプロイします
    - いろいろ聞かれるので全てデフォルトのままエンターでOK
    - デプロイが実行されるので少し時間がかかります

```sh
now
```

- デプロイが完了するとURLが表示されます

![now deploy](/images/2-10.png)

- アクセスするとローカルで動かしていたのと同じアプリが表示されます！

![now](/images/2-11.png)


## 2-5.レイアウトを整える

- Jamstackとは直接関係ありませんがせっかくなのでレイアウトを整えておきます
- 今回は[ReactBootstrap](https://react-bootstrap.github.io/)というライブラリを使います

### ReactBootstrapのセットアップ

- 必要なライブラリをインストールします

```sh
yarn add react-bootstrap bootstrap
```

- 設定ファイルを作成します
- `pages/_app.js`を作成して以下の内容を記述してください

```jsx
import 'bootstrap/dist/css/bootstrap.css'
import App from 'next/app'

export default App
```

### ReactBootstrapのコンポーネントを適用する

- まずいは一覧画面から適用していきます
- `pages/items/index.js`を修正してください
    - ここでは[Container](https://react-bootstrap.netlify.app/layout/grid/#container)と[ListGroup](https://react-bootstrap.netlify.app/components/list-group/)を使います

```jsx{2-3,8,10,12-14,16-17}
import Link from 'next/link';
// react-bootstrapからコンポーネントをimport
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
  const items = data.map(item => ({ id: item.id, title: item.title }));
  return { props: { items } };
}

export default Items;
```

- 見た目の雰囲気が変わりました

![items bootstrap](/images/2-12.png)

- 記事詳細画面も修正します
- `pages/items/[id].js`を修正してください
    - ここでは[Container](https://react-bootstrap.netlify.app/layout/grid/#container)を使います

```jsx{1-2,7,11}
// react-bootstrapからコンポーネントをimport
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

- 詳細画面も見た目の雰囲気が変わりました

![item bootstrap](/images/2-13.png)

- 修正版をデプロイします
    - 二度目以降のデプロイはデフォルトだとdev環境へのデプロイになるので`--prod`をつける

```sh
now --prod
```

- デプロイが完了すると修正版が公開されているはずです

## まとめ

- `create-next-app`によるNext.jsを使ったアプリの作成のしかたを学びました
- `getStaticProps`などNext.jsの機能を使うことでビルド時にAPIからデータを取得しJamstackなアプリにすることができました
- nowにデプロイすることで作成したアプリを世の中に公開することができました
