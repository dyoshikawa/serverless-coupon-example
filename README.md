# Serverless Coupon Example

## 環境

- Node.js v12.12.0
- yarn 1.22.4

## デプロイ手順
### ソースビルド

```
cd lambda-src
yarn
yarn build:all
```

### デプロイ

```
cd cdk
yarn
yarn cdk bootstrap
yarn cdk deploy
```

`STAGE=prod yarn cdk deploy` とすることでプロダクションデプロイとなります。

## TODO

- 動作確認方法
- アーキテクチャ説明
- APIドキュメント
- CORS対応
