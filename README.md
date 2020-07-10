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

### アーキテクチャ
#### 全体像

![AWSアーキテクチャ](https://raw.githubusercontent.com/dyoshikawa/serverless-coupon-example/master/serverless-coupon-example.png)

- クーポンデータの取得
  - 文字列データはDynamoDB、画像データはS3に保存します。
  - エンドユーザが取得する際はCloudfrontを経由させることで高速化を狙いました。
- キーワード検索を行える
  - [DynamoDBを用いた転置インデックス](https://dev.classmethod.jp/articles/dynamodb-inverted-index/)の手法を採用しました。
  - Comprehend APIを使って日本語文章からの単語取得を行い、転置インデックス用テーブルに保存します。

#### ソースコード

![ソースアーキテクチャ](https://github.com/dyoshikawa/serverless-coupon-example/blob/master/source-code-architecture.png?raw=true)

- レイヤー分けを強く意識
  - 自動テスト容易性を確保
  - 本物のAWSサービスに依存せずにテストができる

#### その他工夫

- RepositoryやStorageのクラスは本物に近いテストをしたい
  - [localstack](https://github.com/localstack/localstack) エミュレータを使用
  - できるだけモック化やエミュレータで完結した自動テストを行う→ローカルやCI上でのテスト環境整備が容易になる
- 一方でどうしても本物のAWS環境のテストも必要とは思いました

### APIドキュメント

#### /coupons/:couponId

単一のクーポンを取得する。

##### Response

```json
{
  "id": "8163186",
  "title": "【秋葉原店】全商品 10% OFF!",
  "description": "ご利用一回限り。他のクーポンとの併用はできません。クーポンをご利用いただいた場合、ポイントはつきません。",
  "imageUrl": "https://example.com/a3391cd8-66dc-4f1d-a825-7e471eece692.png",
  "qrCodeUrl": "https://example.com/22fcbebe-5030-45c3-ac50-456ef0fc03ff.jpg",
  "savedAt": "2020-07-08T04:37:56.859Z"
}
```

#### GET /coupons/search

クーポンのキーワード検索を行う。  
URLクエリパラメータに文字列を設定する。

##### Request

| クエリパラメータ | 値 | 例 | 備考 | 必須 |
|:---|:---|:---|:---|:---|
| keyword | キーワード文字列 (要URLエンコード) | "秋葉原店" (をURLエンコードした文字列) | | ✅ |
| startKeyKey | 続けて取得する結果の先頭のクーポンID (要URLエンコード) | "秋葉原店" (をURLエンコードした文字列) | 検索結果が2ページ以上の場合に使用 | |
| startKeyCouponId | 続けて取得する結果の先頭のクーポンID | "0000001" | 検索結果が2ページ以上の場合に使用 | |

##### Response

###### Header

| 名前 | 値 | 例 |
|:---|:---|:---|
| x-coupon-start-key-key |  続けて取得する結果の先頭のクーポンID (URLエンコード済) | "商品" (をURLエンコードした文字列) |
| x-coupon-start-key-coupon-id | 続けて取得する結果の先頭のクーポンID | "0000001" |

###### Body

クーポンの配列を返す。

```json
[
  {
    "id": "8163186",
    "title": "【秋葉原店】全商品 10% OFF!",
    "description": "ご利用一回限り。他のクーポンとの併用はできません。クーポンをご利用いただいた場合、ポイントはつきません。",
    "imageUrl": "https://example.com/a3391cd8-66dc-4f1d-a825-7e471eece692.png",
    "qrCodeUrl": "https://example.com/22fcbebe-5030-45c3-ac50-456ef0fc03ff.jpg",
    "savedAt": "2020-07-08T04:37:56.859Z"
  }
]
```

#### POST /coupons

**テスト用のためプロダクション環境では使用不可。**  
クーポンを作成する。

##### Request

`image` と `qrCode` には画像データをBase64エンコードした文字列を渡す。

```json
{
  "id": "8163186",
  "title": "【秋葉原店】全商品 10% OFF!",
  "description": "ご利用一回限り。他のクーポンとの併用はできません。クーポンをご利用いただいた場合、ポイントはつきません。",
  "image": "IMAGE_BASE64_DATA",
  "qrCode": "QR_CODE_BASE64_DATA"
}
```

##### Response

作成したクーポンデータを返す。

```json
{
  "id": "8163186",
  "title": "【秋葉原店】全商品 10% OFF!",
  "description": "ご利用一回限り。他のクーポンとの併用はできません。クーポンをご利用いただいた場合、ポイントはつきません。",
  "imageUrl": "https://example.com/a3391cd8-66dc-4f1d-a825-7e471eece692.png",
  "qrCodeUrl": "https://example.com/22fcbebe-5030-45c3-ac50-456ef0fc03ff.jpg",
  "savedAt": "2020-07-08T04:37:56.859Z"
}
```

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
