# 31号宇宙临时开放日 · UNIVERSE 31

一场为 Ashley 生日制作的短篇互动网页游戏。访客入境后可自由探索星图；探索三处后解锁宇宙中心，点亮蛋糕蜡烛，再为寿星和自己各留一个愿望。

**游玩地址：** https://universe-31-ashley.jenny2019ok.chatgpt.site

## 技术结构

- React / Next.js / Vinext 前端，适配桌面和手机。
- Cloudflare Worker API 与 D1 记录访客编号和愿望统计。
- 深空背景与蛋糕图像存放于 `public/art/`。

## 本地运行

需要 Node.js 22.13 或更新版本。

```sh
npm ci
npm run db:generate
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_chemical_marvel_apes.sql
npm run dev
```

GitHub Pages 只能提供静态文件，无法运行本项目的访客编号和愿望统计 API；完整游戏目前由上方公开地址提供。
