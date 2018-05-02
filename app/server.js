/**
 * Created by xiaobxia on 2018/1/4.
 */
const fs = require('fs-extra');
const Koa = require('koa');
const path = require('path');
const error = require('koa-error')
const bluebird = require('bluebird');
const favicon = require('koa-favicon');
const staticCache = require('koa-static-cache');
const proxy = require('koa-proxies');
const sysRoutes = require('./routes');
const config = require('../config/index');
const log = require('./common/logger');


global.Promise = bluebird;
const serverInfo = `koa/${require('koa/package.json').version} `;
const env = process.env.NODE_ENV;
const isDev = env === 'dev';

const baseDir = config[env].server.baseDir;
const port = config[env].server.port || 4000;
const assetsSubDirectory = config[env].assetsSubDirectory || '';
const join = file => path.join(baseDir, file);

const app = new Koa();

const serve = (prefix, path, cache) => staticCache(join(path), {
  prefix: prefix,
  gzip: true,
  dynamic: true,
  maxAge: cache && !isDev ? 1000 * 60 * 60 * 24 * 7 : 0
});

const proxyTable = config[env].server.proxyTable;
if (proxyTable) {
  Object.keys(proxyTable).forEach(context => {
    let options = proxyTable[context];
    if (typeof options === 'string') {
      options = {
        target: options,
        changeOrigin: true,
        logs: true
      }
    }
    app.use(proxy(context, options))
  })
}

app.use(favicon('favicon.png'));
app.use(serve(assetsSubDirectory, assetsSubDirectory, true));

app.use(async (ctx, next) => {
  log.info(`客户端发起请求"${ctx.originalUrl}"`);
  const start = Date.now();
  ctx.set("Content-Type", "text/html");
  ctx.set("Server", serverInfo);
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
  log.info(`请求"${ctx.originalUrl}"的累计用时: ${ms}ms`);
});

app.use(error({
  engine: 'pug',
  template: join('/pug/error.pug')
}));

app.use(sysRoutes.routes());

app.on('error', (err, ctx) => {
  console.error(`渲染发生错误 : ${ctx.originalUrl}`);
  log.error(err);
});

app.listen(port, () => {
  console.log(`server started at localhost:${port}`);
  console.log(`当前环境是:${env || 'dev'}`)
});
