# 介绍

一开始写这个机器人是因为钉钉自带的机器人会有消息延迟，丢失。
因为 GitHub 在境外，这也情有可原，于是写了一个基于 CloudFlare Workers 的 GitHub 机器人。

基本工作原理就是接收 GitHub 的 webhooks 回调，然后将事件渲染成 markdown 再发送到钉钉群组里。

后期也做成了通用的服务，可以让集成方自己配置发送的群组，规则等。

同时，也做了钉钉群的机器人，接收钉钉的消息请求，然后进行处理。

后来 hono 这个框架的出现，在不同的平台间做了一层兼容层，支持了 Node.js/Bun/CloudFlare Workers/Deno 等等  
所以现在这个这个机器人可以跑在 Node.js 上了。

机器人就是一个 HTTP 服务器，接受请求，进行处理，返回响应。

## CloudFlare Workers

官方文档：<https://workers.cloudflare.com/>

你写的 JS 代码会被运行在 CloudFlare 全球的边缘节点上，实际上写起来跟 Node.js 没有什么区别。
可以用 crypto/fetch/asyncLocalStorage 等等。

部署在 CloudFlare Workers 上非常省心，不需要关心扩缩容，不需要启动 redis，不需要启动 kafka，不需要启动 postgres。

CloudFlare Workers 提供了它们的替代品：
- redis => KV
- kafka => Queue
- postgres => D3
- oss => r2

CloudFlare Workers 还有一个独有的特性，叫 Durable Objects，可以多个 Workers 共同使用一个 Durable Objects，操作它就像操作一个普通 JS Object 一样，对 Durable Object 的操作都会持久化的存储下来。

CloudFlare Workers 支持的功能非常的多，欢迎你尝试一下。
