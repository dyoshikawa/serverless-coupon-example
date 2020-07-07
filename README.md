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

`yarn cdk deploy` に `-c stage=prod` オプションを付けることでプロダクションデプロイとなります。
