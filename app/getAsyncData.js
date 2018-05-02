/**
 * Created by xiaobxia on 2018/1/12.
 */
const bluebird = require('bluebird');
const fs = require('fs-extra');
const request = require('./common/request');
const log = require('./common/logger');
const config = require('../config/index');


const env = process.env.NODE_ENV;
const isDev = env === 'dev';

function logData(fileData) {
  if (isDev) {
    const fileName = './mock/last.json';
    fs.ensureFile(fileName).then(() => {
      fs.writeJson(fileName, {
        data: fileData
      }, {spaces: 2})
    });
  }
}

module.exports = async function (method, apiUrl, apiQuery, config, result) {
  let data = null;
  const s = Date.now();
  // try {
    log.info('向JAVA发起请求:' + JSON.stringify({
        method,
        apiUrl,
        apiQuery,
        config
      }));
    data = await request[method](apiUrl, apiQuery, config);
    log.info(`JAVA用时: ${Date.now() - s}ms`);
    if (env === 'uat') {
      log.info(`${apiUrl}返回的数据: ${JSON.stringify(data)}`);
    }
    logData(data);
    if (result) {
      return data.result;
    }
    return data;
  // } catch (err) {
  //   log.error(`JAVA发生错误，JAVA用时: ${Date.now() - s}ms`);
  //   log.error(err);
  //   logData(err);
  // }
};
