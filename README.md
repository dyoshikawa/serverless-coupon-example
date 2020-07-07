# Serverless Coupon Example

## 環境

- Node.js v12.12.0
- yarn 1.22.4

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

### 自動テスト

```bash
cd lambda-src
docker-compose up -d # localstackがreadyになるまで待つ
yarn test
```

## TODO

- 動作確認方法
- アーキテクチャ説明
- APIドキュメント
- CORS対応
