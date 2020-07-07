# Serverless Coupon Example

## 環境

- Node.js v12.12.0
- yarn 1.22.4
- Docker 19.03.8
- docker-compose 1.25.5
- aws-cli 2.0.19 

## デプロイ手順
### ソースビルド

```bash
cd lambda-src
yarn
yarn build:all
```

### デプロイ

```bash
cd cdk
yarn
yarn cdk bootstrap
yarn cdk deploy
```

`STAGE=prod yarn cdk deploy` とすることでプロダクションデプロイとなります。

### 動作確認方法

`yarn cdk deploy` 完了後、

```
✅  serverless-coupon-example-dev

Outputs:
serverless-coupon-example-dev.xxxxxx = https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/
```

`https://` から始まるURLを控えておきます。

その後、簡易クライアントを使って動作確認ができます。

#### client.env設定

`lambda-src` 直下で下記のコマンドを実行し`client.env` を作成する。

```bash
cp client.env.example client.env
```

`client.env` に以下を追記。

```dotenv
# BASE_URLの値に先程控えたURLを入力
BASE_URL=https://xxxxx.execute-api.ap-northeast-1.amazonaws.com/dev/
```

#### 簡易クライアントによる動作確認

```bash
# クーポンのサンプルデータを投入
yarn start:client create

# クーポン取得
# 取得したいクーポンのIDを引数として渡す
yarn start:client findById 0000001

# キーワード検索
yarn start:client search
```

### 自動テスト

`lambda-src` 直下で以下を実行。

```bash
docker-compose up -d # localstackがreadyになるまで待つ
yarn test
```

## TODO

- アーキテクチャ説明
- APIドキュメント
- CORS対応
