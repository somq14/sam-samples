# session-authorizer

APIGateway に Lambda オーソライザを設定するサンプルです

API の呼び出し前にオーソライザ(認証用の Lambda) を実行することで、認証を行います

```bash
$ curl -H "Authorization: yyyy" https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v1
{"message": "hello"}

$ curl -H "Authorization: zzzz" https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v1 # 403
{"Message":"User is not authorized to access this resource with an explicit deny"}

$ curl https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/v1 # 401
{"message":"Unauthorized"}
```
