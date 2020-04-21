# Jamstackとは

## Jamstackとは

![jamstack.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/d6518470-994b-2c9e-5081-ac1d95ac655f.png)

- [https://jamstack.org/](https://jamstack.org/)
- JamstackのJAMはJavaScript/APIs/Markupの頭文字です
- JavascriptでAPIをたたいてMarkupを配信することを意味しています
    - これだけ見るとSPAなど単なるWebアプリのようですね
- Jamstackの特徴として**パフォーマンスの高さ**と**セキュリティの高さ**がうたわれています
    - これらをどのようにして実現するのか見ていきます

## Jamstackの特徴

### 一般的なWebアプリとの比較

- Jamstackの特徴を語る上で一般的なWebアプリと比較して説明します
- よくあるWebアプリはこんな感じですね    
<img width="645" alt="スクリーンショット 2020-02-08 1.21.35.png" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/d4fcd7e2-bfea-1ae3-a0a7-72c59bd9b364.png">
- SPAだとこんな感じ    
<img width="653" alt="スクリーンショット 2020-02-08 1.21.50.png" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/68e91d9b-5b4f-e695-3e96-2dc5bffb29b3.png">
- Lambdaなど使ってサーバーレスの場合でもだいたい同じですね    
<img width="674" alt="スクリーンショット 2020-02-08 1.22.01.png" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/a3281b5c-737d-3476-87fb-39ce450911c4.png">
- 共通してることが何かというとユーザがAPIにアクセスしてDBからデータを取得して画面に表示するというところです
    - 当然ですがDBにアクセスする分処理に時間がかかったり、たとえサーバーレスでも運用面で考えなければならないことがでてきます
- Jamstackの場合はどうでしょう    
<img width="408" alt="スクリーンショット 2020-02-08 1.36.53.png" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/8864300e-dc91-0165-e9cd-8e4ddb2c5a2e.png">
- たったこれだけ、HTMLを取得して表示するだけです
- Jamstackは静的なコンテンツを配信するだけなので高速です
    - 静的なコンテンツだけなのでCDNから配信することで更に最適化を図れます
    - これが高パフォーマンスの理由です
- 更に静的なコンテンツの配信しかしないためサーバの管理なども不要となりセキュリティ面での考慮事項もぐっと軽減するわけです

### 動的なデータの取得

- 静的なコンテンツが速いのは当然でJamstackは動的なコンテンツは扱えないということでしょうか？そんなことはありません
    - ではどうのようにしてデータを取得するのでしょうか
- Jamstackではデータはビルド時に取得します    
<img width="746" alt="スクリーンショット 2020-02-08 2.05.02.png" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/8640b09c-ec32-5a39-ee29-240de41dbd80.png">
- 図にしたら思いのほかごちゃごちゃしてしまいましたが、要は**ビルドしてHTMLを生成する時にAPIからデータを取得して埋め込む**わけです
    - こうすることでDBに保存してある情報も表示できるわけですね
- これだけでは納得いかないと思います
- 当たり前ですがデータが更新されてもHTMLは古いままなので新しい情報にアクセスできません
- でも大丈夫です、**データが更新されたタイミングで都度ビルドデプロイを行う**ことで最新の状態を維持します

## 具体例

- Jamstackはブログの閲覧サービスやコーポレートサイトの作成に向いているとよく紹介されます
- ブログを例に見てみます
<img width="728" alt="スクリーンショット 2020-02-08 2.16.51.png" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/8200d7c0-1078-1a7b-3266-a90107bf2ba5.png">
- 以下のサイクルを回していく形になります
    - 記事が投稿されたらビルドデプロイを走らせます
    - ビルド時にAPIから最新の記事情報を取得しHTMLに含ませます
    - ユーザは常に最新のコンテンツにアクセスすることができます！
- 人によっては、毎回ビルドデプロイなんて・・・と思う人もいるかもしれませんがCI/CDが当たり前になってきた今の時代だからこそ出てくる発想なのではと思います

## Jamstackでよく使われるサービス

- 冒頭で紹介した記事ではGatsby, Contentful, Netlifyを使っています
- ここまでの説明を踏まえるとこれらが何故必要とされているかが分かってきます

### ヘッドレスCMS

![headlesscms.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/2666b676-f644-8ade-5ea4-3838201941ee.png)

- まずは、何かしらの手段で記事の投稿のようなデータの登録作業をして、そのデータをAPIで公開する必要があります
- 自前で投稿システムを構築してもいいのですが、ここでピッタリのサービスがヘッドレスCMSです
- ヘッドレスCMSはサービス上で自由に入力フォームを作成し、そのフォームからデータの登録ができます
    - ブログ記事であればタイトルと本文のフィールドを持ったフォームを作成するといった感じ
- そのフォームから登録したデータをAPIとして公開するところまでヘッドレスCMSはやってくれます
- 代表的なサービスとして[Contentful](https://www.contentful.com/)や[microCMS](https://microcms.io/)があります
    - microCMSはは日本で作られていることもあり日本語対応がされていたり、非エンジニアが投稿作業を行うような想定もして作られているので今後楽しみなサービスです

### 静的サイトジェネレーター

<img width="309" alt="スクリーンショット 2020-02-08 1.21.35.png" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/49388554-6738-81bf-f576-d1bcf9b1b9e1.png">

- 次は、HTMLを生成するライブラリが必要になってきます
- ここで重要なのがビルド時にAPIをたたいてそのデータを取り込める必要があります
- そういった機能を備えた静的サイトジェネレーターが必要になってくるわけですね
- 代表的なものとしてはReactベースの[Gatsby](https://www.gatsbyjs.org/)や[Next.js](https://nextjs.org/)、Vueベースの[Nuxt](https://ja.nuxtjs.org/guide/)や[Gridsome](https://gridsome.org/)などがあります

### ホスティングサービス

<img width="282" alt="スクリーンショット 2020-02-08 1.22.01.png" src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/175213/9539753f-84ff-29b4-f51e-73a13cdaf5fd.png">

- 最後に、生成した静的コンテンツを配信できるサービスが必要になります
- 代表的なサービスとしては[Netlify](https://www.netlify.com/)や[Now](http://now.sh/)、[Firebase Hosting](https://firebase.google.com/docs/hosting?hl=ja)といったところでしょうか
- これらのサービスのいいところは無料枠でもそれなりに使えるというところです

## Jamstackの適用場面

- 閲覧専用でユーザごとにコンテンツの出し分けがないようなアプリは一番はまります
- そうでない場合でも部分的な適用もありだと思います
    - ReactやVueベースのライブラリを使っていればJavaScriptによる処理もいつも通り書けるので
- 提供したいサービスの性質に応じて最適解を探していくといいと思います

## まとめ

- Jamstackの特徴にして強みであるところは静的コンテンツを配信するだけでよいというところです
    - ビルド時にデータを取得し埋め込むことで外部データを取り込み可能にし、データ更新の都度ビルドデプロイすることで最新の状態を保つことができます
- ユーザとの接点が静的コンテンツへのアクセスだけになるためパフォーマンスの高速化やセキュリティ面のリスク軽減につながるというわけです
- これらを実現するためのサービスやライブラリもラインナップが揃っていることもありJamstackが流行っているということですね











