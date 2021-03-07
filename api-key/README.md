# api-key

API キーにより API のアクセス制限をするサンプルです

デプロイすると API キーが生成されるので、AWS マネジメントコンソールから値を確認してください

API キーは HTTP リクエストヘッダ `X-API-KEY` に指定します

```bash
$ curl -X "X-API-KEY: ここにAPIキーを貼り付け" https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v1
{"message": "hello"}
```
