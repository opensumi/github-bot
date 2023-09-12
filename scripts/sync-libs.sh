#!/usr/bin/env bash

# @octokit/app
# 只是 clone 下来让 esbuild 构建出 browser 层。

cd ./libs
rm -rf app.js
git clone https://github.com/octokit/app.js.git
rm -rf app.js/.git
