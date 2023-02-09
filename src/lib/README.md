# lib

## @octokit/app

只是 clone 下来让 esbuild 构建出 browser 层。

```
cd ./src/lib
rm -rf app.js
git clone https://github.com/octokit/app.js.git
rm -rf app.js/.git
```

## chatgpt

使用 browser 层的 gpt-3-encoder

```
rm -rf chatgpt-api
git clone https://github.com/transitive-bullshit/chatgpt-api.git
rm -rf chatgpt-api/.git
```
