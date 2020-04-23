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


