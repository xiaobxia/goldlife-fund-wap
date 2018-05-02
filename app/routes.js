/**
 * Created by xiaobxia on 2018/1/5.
 */
const Router = require('koa-router');
const merge = require('merge');
const pug = require('pug');
const path = require('path');
const log = require('./common/logger');
const Parameter = require('./common/validate');
const config = require('../config/index');
const getAsyncData = require('./getAsyncData');
const qs = require('qs');
const p = new Parameter();
const router = new Router({
  prefix: ''
});
const env = process.env.NODE_ENV;
const isDev = env === 'dev';
// 给移动端测试时开启
const isTest = true;
const baseDir = config[env].server.baseDir;
const javaAddress = config[env].javaAddress;
const pugOptions = {
  // debug: isDev,
  compileDebug: isDev
};

/**
 * 验证参数
 * @param rule
 * @param data
 * @returns {{}}
 */
function validateData(rule, data) {
  let fake = {};
  for (let key in rule) {
    if (rule.hasOwnProperty(key)) {
      if (!rule[key].type) {
        rule[key].type = 'string';
      }
      fake[key] = data[key];
    }
  }
  let msgList = p.validate(rule, fake);
  if (msgList !== undefined) {
    let msg = msgList[0];
    throw new Error(msg.field + ' ' + msg.message);
  } else {
    return fake;
  }
}

function getViewFile(fileName) {
  return path.resolve(baseDir + '/pug', fileName);
}

/**
 * 获取并验证token
 * @param ctx
 * @returns {{}}
 */
function getToken(ctx) {
  return {
    userid: ctx.cookies.get('userid'),
    'Auth-Token': ctx.cookies.get('Auth-Token'),
    channelCode: ctx.cookies.get('channelCode')
  }
}

/**
 * 保存去首页的token
 * @param ctx
 * @returns {{}}
 */
function setToIndexToken(ctx, data) {
  ctx.cookies.set('toIndexChannelCode', data.channelCode, {
    httpOnly: false
  })
  ctx.cookies.set('toIndexPhone', data.phone, {
    httpOnly: false
  })
  ctx.cookies.set('toIndexToken', data.token, {
    httpOnly: false
  })
  ctx.cookies.set('toIndexUserId', data.userId, {
    httpOnly: false
  })
  ctx.cookies.set('toIndexRedirectType', data.redirectType, {
    httpOnly: false
  })
}

/**
 * 保存token
 * @param ctx
 * @returns {{}}
 */
function setToken(ctx, userid, authToken, channelCode) {
  ctx.cookies.set('userid', userid, {
    httpOnly: false
  })
  ctx.cookies.set('Auth-Token', authToken, {
    httpOnly: false
  })
  ctx.cookies.set('channelCode', channelCode, {
    httpOnly: false
  })
}

/**
 * 路由部分
 */
router.get('/', async (ctx) => {
  log.trace('请求进入: /');
  try {
    const data = {
      dataList: [1, 2, 3, 4],
      dataMap: {a: 1, b: 2},
      dataStr: 'abc'
    };
    ctx.body = pug.renderFile(getViewFile('index.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});
router.get('/test1', async (ctx) => {
  log.trace('请求进入: /test1');
  try {
    ctx.body = pug.renderFile(getViewFile('test1.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});
/**
 * xiaobxia
 */

router.get('/temp1', async (ctx) => {
  log.trace('请求进入: /temp1');
  try {
    ctx.body = pug.renderFile(getViewFile('temp1.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

router.get('/fund/getComponent', async (ctx) => {
  log.trace('请求进入: /fund/getComponent');
  try {
    ctx.body = pug.renderFile(getViewFile('component.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});
// 搜索
router.get('/page/public/search', async (ctx) => {
  log.trace('请求进入: /page/public/search');
  try {
    ctx.body = pug.renderFile(getViewFile('public/search/index.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 限额说明
router.get('/page/public/quotas', async (ctx) => {
  log.trace('请求进入: /page/public/quotas');
  try {
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/pub/quotas';
    let data = await getAsyncData('get', apiUrl, {}, {
      headers: token
    }, true);
    data.forEach(function (item) {
      item.dayLimit = item.dayLimit === -1 ? '单日不限额' : `单日${item.dayLimit}元`;
      item.monthLimit = item.monthLimit === -1 ? '单月不限额' : `单月${item.monthLimit}元`;
      item.singleLimit = item.singleLimit === -1 ? '单笔不限额' : `单笔${item.singleLimit}元`;
    });
    ctx.body = pug.renderFile(getViewFile('public/quotas/index.pug'), merge(pugOptions, {
      quotasList: data
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 选择支行
router.get('/page/public/selectSubBranch', async (ctx) => {
  log.trace('请求进入: /page/public/selectSubBranch');
  try {
    const token = getToken(ctx);
    const query = validateData({
      province: {required: false},
      city: {required: false},
      bankName: {required: false}
    }, ctx.request.query);
    let data = {};
    // 展示省
    if (!query.province) {
      const apiUrl = javaAddress + '/h5/bank/province';
      let result = await getAsyncData('get', apiUrl, {}, {
        headers: token
      }, true);
      let listTemp = [];
      result.forEach(function (item) {
        listTemp.push({
          text: item,
          url: qs.stringify({province: item, bankName: query.bankName})
        });
      });
      data.listData = listTemp;
      data.listType = 'nav';
      data.position = '您也可以逐级选择找到开户支行'
      // 展示省下面的城市
    } else if (query.province && !query.city) {
      const apiUrl = javaAddress + '/h5/bank/city';
      let result = await getAsyncData('get', apiUrl, {provinceName: query.province}, {
        headers: token
      }, true);
      let listTemp = [];
      result.forEach(function (item) {
        listTemp.push({
          text: item,
          url: qs.stringify({province: query.province, city: item, bankName: query.bankName})
        });
      });
      data.listData = listTemp;
      data.listType = 'nav';
      data.position = `当前：${query.province}`
      //展示城市下面的支行
    } else if (query.province && query.city) {
      const apiUrl = javaAddress + '/h5/bank/cityBank';
      let result = await getAsyncData('get', apiUrl, {cityName: query.city, bankName: query.bankName}, {
        headers: token
      }, true);
      data.listData = result;
      data.listType = 'result';
      data.listType = 'result';
      data.position = `当前：${query.province}${query.city}`
    }
    ctx.body = pug.renderFile(getViewFile('public/selectSubBranch/index.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 实名认证&绑卡
router.get('/page/public/openAccount', async (ctx) => {
  log.trace('请求进入: /page/public/openAccount');
  try {
    ctx.body = pug.renderFile(getViewFile('public/openAccount/index.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

router.get('/page/public/openAccount/autoPayProtocol', async (ctx) => {
  log.trace('请求进入: /page/public/openAccount/autoPayProtocol');
  try {
    ctx.body = pug.renderFile(getViewFile('public/openAccount/autoPayProtocol.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

router.get('/page/public/openAccount/openAccountStep2', async (ctx) => {
  log.trace('请求进入: /page/public/openAccount/openAccountStep2');
  try {
    ctx.body = pug.renderFile(getViewFile('public/openAccount/openAccountStep2.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

router.get('/page/public/openAccount/openAccountStep3', async (ctx) => {
  log.trace('请求进入: /page/public/openAccount/openAccountStep3');
  try {
    ctx.body = pug.renderFile(getViewFile('public/openAccount/openAccountStep3.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

router.get('/page/public/openAccount/getAddr', async (ctx) => {
  log.trace('请求进入: /page/public/openAccount/getAddr');
  try {
    ctx.body = pug.renderFile(getViewFile('public/openAccount/getAddr.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

//开户结果
router.get('/page/public/openAccount/openResult', async (ctx) => {
  log.trace('请求进入: /page/public/openAccount/openResult');
  try {
    ctx.body = pug.renderFile(getViewFile('public/openAccount/openResult.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产
router.get('/page/assets', async (ctx) => {
  log.trace('请求进入: /page/assets');
  try {
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/index/assets';
    const riskapi = javaAddress + '/h5/mine/paper/test_result';
    let Plist = Promise.all([
      getAsyncData('get', riskapi, {}, {
        headers: token
      }, true),
      getAsyncData('get', apiUrl, {}, {
        headers: token
      })
    ]);
    const res = await Plist;
    let risk = res[0];
    let data = res[1];
    data.risk = risk;
    ctx.body = pug.renderFile(getViewFile('assets/index.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-组合资产
router.get('/page/assets/portfolio', async (ctx) => {
  log.trace('请求进入: /page/assets/portfolio');
  try {
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/assets/portfolio';
    console.log(token)
    let data = await getAsyncData('get', apiUrl, {}, {
      headers: token
    });
    ctx.body = pug.renderFile(getViewFile('assets/portfolio/index.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-组合资产-交易记录
router.get('/page/assets/portfolio/records', async (ctx) => {
  log.trace('请求进入: /page/assets/portfolio/records');
  try {
    ctx.body = pug.renderFile(getViewFile('assets/portfolio/records.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});
// 资产-组合资产-交易详情
router.get('/page/assets/portfolio/recordDetail', async (ctx) => {
  log.trace('请求进入: /page/assets/portfolio/recordDetail');
  try {
    let data = ctx.request.query.data;
    data = JSON.parse(data);
    data.type = ctx.request.query.type;
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('assets/portfolio/recordDetail.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-组合资产-调仓
router.get('/page/assets/portfolio/stocks', async (ctx) => {
  log.trace('请求进入: /page/assets/portfolio/stocks');
  try {
    const token = getToken(ctx);
    const query = validateData({
      transferId: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/assets/portfolio/goTransfer';
    let data = await getAsyncData('get', apiUrl, {
      transferId: query.transferId
    }, {
      headers: token
    });
    ctx.body = pug.renderFile(getViewFile('assets/portfolio/stocks.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-组合资产-持仓明细
router.get('/page/assets/portfolio/position', async (ctx) => {
  log.trace('请求进入: /page/assets/portfolio/position');
  try {
    const token = getToken(ctx);
    const query = validateData({
      portfolioCode: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/assets/portfolio/detail';
    console.log(token)
    let data = await getAsyncData('get', apiUrl, {
      portfolioCode: query.portfolioCode
    }, {
      headers: token
    });
    ctx.body = pug.renderFile(getViewFile('assets/portfolio/position.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-组合资产-赎回
router.get('/page/assets/portfolio/redeem', async (ctx) => {
  log.trace('请求进入: /page/assets/portfolio/redeem');
  try {
    const portfolioTrade = ctx.request.query.portfolioTrade;
    let data = {
      ...ctx.request.query,
    };
    delete data.portfolioTrade;
    ctx.body = pug.renderFile(getViewFile('assets/portfolio/redeem.pug'), merge(pugOptions, {
      ...data,
      ...JSON.parse(portfolioTrade)
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-组合资产-赎回-结果
router.get('/page/assets/portfolio/redeemResult', async (ctx) => {
  log.trace('请求进入: /page/assets/portfolio/redeemResult');
  try {
    const portfolioTrade = ctx.request.query.portfolioTrade;
    const data = JSON.parse(portfolioTrade);
    data.redeemRate = ctx.request.query.redeemRate;
    ctx.body = pug.renderFile(getViewFile('assets/portfolio/redeemResult.pug'), merge(pugOptions,data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-瑞富宝资产
router.get('/page/assets/ruifubao', async (ctx) => {
  log.trace('请求进入: /page/assets/ruifubao');
  try {
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/assets/ruifubao';
    let data = await getAsyncData('get', apiUrl, {}, {
      headers: token
    });
    console.log(data);
    ctx.body = pug.renderFile(getViewFile('assets/ruifubao/index.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-瑞富宝资产-交易记录
router.get('/page/assets/ruifubao/records', async (ctx) => {
  log.trace('请求进入: /page/assets/ruifubao/records');
  try {
    ctx.body = pug.renderFile(getViewFile('assets/ruifubao/records.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});
// 资产-瑞富宝资产-交易详情
router.get('/page/assets/ruifubao/recordDetail', async (ctx) => {
  log.trace('请求进入: /page/assets/ruifubao/recordDetail');
  try {
    ctx.body = pug.renderFile(getViewFile('assets/ruifubao/recordDetail.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-基金资产
router.get('/page/assets/fund', async (ctx) => {
  log.trace('请求进入: /page/assets/fund');
  try {
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/assets/fund';
    console.log(token)
    let data = await getAsyncData('get', apiUrl, {
      sortDirection: 1,
      beginNum: 1,
      // 第一次查询时重新统计
      queryFlag: 1,
      requestNum: 10
    }, {
      headers: token
    });
    ctx.body = pug.renderFile(getViewFile('assets/fund/index.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-基金资产-资产详情
router.get('/page/assets/fund/assetDetail', async (ctx) => {
  log.trace('请求进入: /page/assets/fund/assetDetail');
  try {
    console.log(ctx.request.query)
    ctx.body = pug.renderFile(getViewFile('assets/fund/assetDetail.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-基金资产-分红方式修改
router.get('/page/assets/fund/selectDividend', async (ctx) => {
  log.trace('请求进入: /page/assets/fund/selectDividend');
  try {
    ctx.body = pug.renderFile(getViewFile('assets/fund/selectDividend.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-基金资产-分红方式修改-结果
router.get('/page/assets/fund/selectDividendResult', async (ctx) => {
  log.trace('请求进入: /page/assets/fund/selectDividendResult');
  try {
    ctx.body = pug.renderFile(getViewFile('assets/fund/selectDividendResult.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-基金资产-交易记录
router.get('/page/assets/fund/records', async (ctx) => {
  log.trace('请求进入: /page/assets/fund/records');
  try {
    ctx.body = pug.renderFile(getViewFile('assets/fund/records.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-基金资产-交易详情
router.get('/page/assets/fund/recordDetail', async (ctx) => {
  log.trace('请求进入: /page/assets/fund/recordDetail');
  try {
    ctx.body = pug.renderFile(getViewFile('assets/fund/recordDetail.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-基金资产-赎回
router.get('/page/assets/fund/redeem', async (ctx) => {
  log.trace('请求进入: /page/assets/fund/redeem');
  try {
    const token = getToken(ctx);
    const query = validateData({
      fundCode: {required: true},
      fundName: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/assets/fund/withdraw';
    let result = await getAsyncData('get', apiUrl, {
      fundCode: query.fundCode
    }, {
      headers: token
    });
    const data = result.limits[0] || {};
    ctx.body = pug.renderFile(getViewFile('assets/fund/redeem.pug'), merge(pugOptions, {
      ...query,
      ...ctx.request.query,
      limits: data
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 资产-基金资产-赎回-结果
router.get('/page/assets/fund/redeemResult', async (ctx) => {
  log.trace('请求进入: /page/assets/fund/redeemResult');
  try {
    ctx.body = pug.renderFile(getViewFile('assets/fund/redeemResult.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 瑞富宝-买入
router.get('/page/ruifu/ruifuBuy', async (ctx) => {
  log.trace('请求进入: /page/ruifu/ruifuBuy');
  try {
    const query = validateData({
      fundCode: {required: true},
      fundName: {required: true}
    }, ctx.request.query);
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/ruifubao/goBuy';
    let data = await getAsyncData('get', apiUrl, {
      fundCode: query.fundCode
    }, {
      headers: token
    }, true);
    //取第一个银行
    let recommendIndex = 0;
    data.payWay.forEach((item,index)=>{
      if (item.payType === 'BANK' && recommendIndex === 0 && item.canUse) {
        recommendIndex = index;
      }
    });
    ctx.body = pug.renderFile(getViewFile('ruifu/ruifuBuy.pug'), merge(pugOptions, {
      ...data,
      ...query,
      recommendIndex
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 瑞富宝-买入-结果
router.get('/page/ruifu/ruifuBuyResult', async (ctx) => {
  log.trace('请求进入: /page/ruifu/ruifuBuyResult');
  try {
    ctx.body = pug.renderFile(getViewFile('ruifu/ruifuBuyResult.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 瑞富宝-提现
router.get('/page/ruifu/withdraw', async (ctx) => {
  log.trace('请求进入: /page/ruifu/withdraw');
  try {
    const token = getToken(ctx);
    const query = validateData({
      fundCode: {required: true},
      fundName: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/ruifubao/withdraw';
    let result = await getAsyncData('get', apiUrl, {
      fundCode: query.fundCode
    }, {
      headers: token
    });
    let data = {
      ...ctx.request.query
    };
    data.result = result.cashChangeResults[0];
    ctx.body = pug.renderFile(getViewFile('ruifu/withdraw.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 瑞富宝-提现-结果
router.get('/page/ruifu/withdrawResult', async (ctx) => {
  log.trace('请求进入: /page/ruifu/withdrawResult');
  try {
    ctx.body = pug.renderFile(getViewFile('ruifu/withdrawResult.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});
//快速取现协议
router.get('/page/ruifu/presentagreement', async (ctx) => {
  log.trace('请求进入: /page/ruifu/presentagreement');
  try {
    ctx.body = pug.renderFile(getViewFile('ruifu/presentagreement.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金-买入
router.get('/page/fund/fundBuy', async (ctx) => {
  log.trace('请求进入: /page/fund/fundBuy');
  try {
    const query = validateData({
      fundCode: {required: true},
      fundName: {required: true}
    }, ctx.request.query);
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/fund/goBuy';
    let data = await getAsyncData('get', apiUrl, {
      fundCode: query.fundCode
    }, {
      headers: token
    }, true);
    //取第一个银行
    let recommendIndex = 0;
    data.payWay.forEach((item,index)=>{
      if (item.payType === 'BANK' && recommendIndex === 0 && item.canUse) {
        recommendIndex = index;
      }
    });
    ctx.body = pug.renderFile(getViewFile('fund/fundBuy.pug'), merge(pugOptions, {
      ...data,
      ...query,
      recommendIndex
    }));

  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金-买入-结果
router.get('/page/fund/fundBuyResult', async (ctx) => {
  log.trace('请求进入: /page/fund/fundBuyResult');
  try {
    ctx.body = pug.renderFile(getViewFile('fund/fundBuyResult.pug'), merge(pugOptions, ctx.request.query));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});


/**
 * yaowei
 */
router.get('/yaowei', async (ctx) => {
  log.trace('请求进入: /yaowei');
  try {
    ctx.body = pug.renderFile(getViewFile('yaowei.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 软件许可和服务协议(完成)
router.get('/page/login/softLicenseAndServiceAgreement', async (ctx) => {
  log.trace('请求进入: /fund/softLicenseAndServiceAgreement');
  try {
    ctx.body = pug.renderFile(getViewFile('login/softLicenseAndServiceAgreement.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

//登录界面一
router.get('/page/login/login_step1', async (ctx) => {
  log.trace('请求进入: /page/login/login_step1');
  try {
    ctx.body = pug.renderFile(getViewFile('login/login_step1.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

//登录界面二
router.get('/page/login/login_step2', async (ctx) => {
  log.trace('请求进入: /page/login/login_step2');
  try {
    ctx.body = pug.renderFile(getViewFile('login/login_step2.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

//登录界面三
router.get('/page/login/login_step3', async (ctx) => {
  log.trace('请求进入: /page/login/login_step3');
  try {
    ctx.body = pug.renderFile(getViewFile('login/login_step3.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

//找回密码
router.get('/page/login/retrievePassword', async (ctx) => {
  log.trace('请求进入: /page/login/retrievePassword');
  try {
    ctx.body = pug.renderFile(getViewFile('login/retrievePassword.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 瑞富宝列表(完成)
router.get('/page/ruifu/ruifuList', async (ctx) => {
  log.trace('请求进入: /page/ruifu/ruifuList');
  try {
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/index/ruifubaoList';
    let data = await getAsyncData('get', apiUrl, {}, {
      headers: token
    });
    console.log(data)
    for (var i = 0; i < data.result.length; i++) {
      if (data.result[i].limits && data.result[i].limits.length > 0) {
        for (var j = 0; j < data.result[i].limits.length; j++) {
          if (data.result[i].limits[j].fundBusinCode == '022') {
            data.result[i].minvalue = data.result[i].limits[j].minValue
          }
        }
      }
    }
    data = {
      ruifuList: data.result,
    };
    ctx.body = pug.renderFile(getViewFile('ruifu/ruifuList.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

//货币基金详情(完成)
router.get('/page/ruifu/monetaryDetail', async (ctx) => {
  log.trace('请求进入: /page/ruifu/monetaryDetail');
  try {
    const token = getToken(ctx);
    const query = validateData({
      fundCode: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/ruifubao/detail';
    const apiQuery = {
      fundCode: query.fundCode
    };
    console.log(token)
    let data = await getAsyncData('get', apiUrl, apiQuery, {
      headers: token
    });
    data = {
      monetaryDetail: data
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('ruifu/monetaryDetail.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金组合列表(完成)
router.get('/page/combination/combinationList', async (ctx) => {
  log.trace('请求进入: /page/combination/combinationList');
  try {
    const token = getToken(ctx)
    const apiUrl = javaAddress + '/h5/portfolio/portfolioList';
    let data = await getAsyncData('get', apiUrl,{},{
      headers: token
    });
    data = {
      portfolioList: data.result
    }
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('combination/combinationList.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金组合服务协议(完成)
router.get('/page/combination/combinationProtocol', async (ctx) => {
  log.trace('请求进入: /page/combination/combinationProtocol');
  try {
    ctx.body = pug.renderFile(getViewFile('combination/combinationProtocol.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金组合买入(完成待测试)
router.get('/page/combination/combinationBuy', async (ctx) => {
  log.trace('请求进入: /page/combination/combinationBuy');
  try {
    const query = validateData({
      fundCodesStr: {required: true},
      portfolioCode: {required: true},
      combinationName: {required: true},
      fundNamelist: {required: true},
      fundCodelist: {required: true},
      persent: {required: true}
    }, ctx.request.query);
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/portfolio/goBuy';
    let data = await getAsyncData('get', apiUrl, {
      portfolioCode: query.portfolioCode
    }, {
      headers: token
    }, true);

    ctx.body = pug.renderFile(getViewFile('combination/combinationBuy.pug'), merge(pugOptions, {
      ...data,
      ...query,
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 组合申购结果(文案部分为完成)
router.get('/page/combination/combinationResult', async (ctx) => {
  log.trace('请求进入: /page/combination/combinationResult');
  try {
    ctx.body = pug.renderFile(getViewFile('combination/combinationResult.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金组合详情(折线图待测试)
router.get('/page/combination/combinationDetail', async (ctx) => {
  log.trace('请求进入: /page/combination/combinationDetail');
  try {
    //const token = getToken()
    const query = validateData({
      combinationCode: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/portfolio/detail';
    const apiQuery = {
      combinationCode: query.combinationCode
    };
    let data = await getAsyncData('get', apiUrl, apiQuery, {
      headers: ''
    });
    data = {
      combinationDetail: data.result
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('combination/combinationDetail.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金排名列表(完成)
router.get('/page/fund/fundList', async (ctx) => {
  log.trace('请求进入: /page/fund/fundList');
  const token = getToken(ctx)
  let data = {
    headers: token
  };
  try {
    ctx.body = pug.renderFile(getViewFile('fund/fundList.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金详情(完成)
router.get('/page/fund/fundDetail', async (ctx) => {
  log.trace('请求进入: /page/fund/fundDetail');
  try {
    // const token = getToken(ctx);
    // const query = validateData({
    //   fundCode: {required: true}
    // }, ctx.request.query);
    // const apiUrl = javaAddress + '/h5/fund/detail';
    // const apiQuery = {
    //   fundCode: query.fundCode
    // };
    // let data = await getAsyncData('get', apiUrl, apiQuery, {
    //   headers: token
    // });
    // data = {
    //   fundDetail: data,
    //   headers: token
    // };
    // console.log(data)
    ctx.body = pug.renderFile(getViewFile('fund/fundDetail.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金历史记录(完成)
router.get('/page/fund/fundHistory', async (ctx) => {
  log.trace('请求进入: /page/fund/fundHistory');
  try {
    ctx.body = pug.renderFile(getViewFile('fund/fundHistory.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金经理(完成)
router.get('/page/fund/fundManager', async (ctx) => {
  log.trace('请求进入: /page/fund/fundManager');
  try {
    const query = validateData({
      managerCode: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/fund/manager';
    const apiQuery = {
      managerCode: query.managerCode
    };
    let data = await getAsyncData('get', apiUrl, apiQuery);
    data = {
      manager: data
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('fund/fundManager.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金经理列表(完成)
router.get('/page/fund/fundManagerTransfer', async (ctx) => {
  log.trace('请求进入: /page/fund/fundManagerTransfer');
  try {
    // const token = getToken(ctx);
    const token = getToken()
    const query = validateData({
      fundCode: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/fund/detail';
    const apiQuery = {
      fundCode: query.fundCode
    };
    let data = await getAsyncData('get', apiUrl, apiQuery, {
      headers: token
    });
    data = {
      fundDetail: data,
      headers: token
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('fund/fundManagerTransfer.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金公告(完成)
router.get('/page/fund/fundNotice', async (ctx) => {
  log.trace('请求进入:/page/fund/fundNotice');
  try {
    ctx.body = pug.renderFile(getViewFile('fund/fundNotice.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 单只基金公告(完成)
router.get('/page/fund/announcement', async (ctx) => {
  log.trace('请求进入:/page/fund/announcement');
  try {
    const query = validateData({
      resId: {required: true},
      resType: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/fund/announcement';
    const apiQuery = {
      resId: query.resId,
      resType: query.resType
    };
    let data = await getAsyncData('get', apiUrl, apiQuery);
    data = {
      announcement: data
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('fund/announcement.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金管理人(完成)
router.get('/page/fund/fundAdministrators', async (ctx) => {
  log.trace('请求进入:/page/fund/fundAdministrators');

  try {
    const query = validateData({
      investAdvisorCode: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/fund/investAdvisor';
    const apiQuery = {
      investAdvisorCode: query.investAdvisorCode
    };
    let data = await getAsyncData('get', apiUrl, apiQuery);
    data = {
      fundAdministrators: data
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('fund/fundAdministrators.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金档案(完成)
router.get('/page/fund/fundArchives', async (ctx) => {
  log.trace('请求进入:/page/fund/fundArchives');
  try {
    const query = validateData({
      fundCode: {required: true}
    }, ctx.request.query);
    ctx.body = pug.renderFile(getViewFile('fund/fundArchives.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 基金定投(完成待测试)
router.get('/page/fund/fundCastsurely', async (ctx) => {
  log.trace('请求进入:/page/user/fundCastsurely');
  try {
    const query = validateData({
      fundCode: {required: true},
      fundName: {required: true}
    }, ctx.request.query);
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/fund/goCircleBuy';
    let data = await getAsyncData('get', apiUrl, {
      fundCode: query.fundCode
    }, {
      headers: token
    }, true);
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('fund/fundCastsurely.pug'), merge(pugOptions, {
      ...data,
      ...query
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 购买须知(完成)
router.get('/page/fund/purchaseNotice', async (ctx) => {
  log.trace('请求进入:/page/fund/purchaseNotice');
  try {
    // const token = getToken(ctx);
    // const token = getToken(ctx)
    // const query = validateData({
    //   fundCode: {required: true}
    // }, ctx.request.query);
   // const apiUrl = javaAddress + '/h5/fund/purchaseNotice';
   //  const apiQuery = {
   //    fundCode: query.fundCode
   //  };
    // let data = await getAsyncData('get', apiUrl, apiQuery, {
    //   headers: token
    // });
    // data = {
    //   purchaseNotice: data
    // };
    //console.log(data)
    ctx.body = pug.renderFile(getViewFile('fund/purchaseNotice.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 调仓历史(待测试)
router.get('/page/fund/warehouseHistory', async (ctx) => {
  log.trace('请求进入:/page/fund/warehouseHistory');
  try {
    const query = validateData({
      combinationCode: {required: true}
    }, ctx.request.query);
    const apiUrl = javaAddress + '/h5/portfolio/query_transfers';
    const apiQuery = {
      combinationCode: query.combinationCode
    };
    let data = await getAsyncData('get', apiUrl, apiQuery);
    data = {
      warehouseHistory: data.result
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('combination/warehouseHistory.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 我的(资产部分跳转未完成)
router.get('/page/user/mine', async (ctx) => {
  log.trace('请求进入:/page/user/mine');
  try {
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/index/assets';
    const riskapi = javaAddress + '/h5/mine/paper/test_result';
    let data = await getAsyncData('get', apiUrl, {}, {
      headers: token
    });
    let risk = await getAsyncData('get', riskapi, {}, {
      headers: token
    });
    data = {
      mine: data,
      risk: risk
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('user/mine.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 定投管理(完成待测试)
router.get('/page/user/castSurely', async (ctx) => {
  log.trace('请求进入:/page/user/castSurely');
  try {
    ctx.body = pug.renderFile(getViewFile('user/castSurely.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 定投修改(完成待测试)
router.get('/page/user/editCastsurely', async (ctx) => {
  log.trace('请求进入:/page/user/editCastsurely');
  try {
    const query = validateData({
      fundCode: {required: true},
      fundName: {required: true}
    }, ctx.request.query);
    const token = getToken(ctx);
    const apiUrl = javaAddress + '/h5/fund/goCircleBuy';

    let data = await getAsyncData('get', apiUrl, {
      fundCode: query.fundCode
    }, {
      headers: token
    }, true);
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('user/editCastsurely.pug'), merge(pugOptions, {
      ...data,
      ...query
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 风险评测(完成)
router.get('/page/user/assessRisk', async (ctx) => {
  log.trace('请求进入:/page/user/assessRisk');
  try {
    const query = validateData({
      answer_object: {required: true},
    }, ctx.request.query);
    ctx.body = pug.renderFile(getViewFile('user/assessRisk.pug'), merge(pugOptions, {
      ...query
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 风险评测结果(跳转链接)
router.get('/page/user/assessResult', async (ctx) => {
  log.trace('请求进入:/page/user/assessResult');
  try {
    ctx.body = pug.renderFile(getViewFile('user/assessResult.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 我的银行卡(完成)
router.get('/page/user/bankcardList', async (ctx) => {
  log.trace('请求进入:/page/user/bankcardList');
  const token = getToken(ctx)
  try {
    const apiUrl = javaAddress + '/h5/mine/get_bank';
    let data = await getAsyncData('get', apiUrl, {}, {
      headers: token
    });
    data = {
      bankcardList: data
    };
    console.log(data)
    ctx.body = pug.renderFile(getViewFile('user/bankcardList.pug'), merge(pugOptions, data));

  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 修改银行卡信息(完成待测试)
router.get('/page/user/editBankcard', async (ctx) => {
  log.trace('请求进入:/page/user/editBankcard');
  try {
    const query = validateData({
      bankName: {required: true},
      userBankNo: {required: true},
      bankCode: {required: true},
      branchBankName:{required: true}
    }, ctx.request.query);
    ctx.body = pug.renderFile(getViewFile('user/editBankcard.pug'), merge(pugOptions, {
      ...query
    }));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 账户设置(完成)
router.get('/page/user/userEdit', async (ctx) => {
  log.trace('请求进入:/page/user/userEdit');
  try {
    ctx.body = pug.renderFile(getViewFile('user/userEdit.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 修改交易密码第一步(完成待测试)
router.get('/page/user/transactionEdit_step1', async (ctx) => {
  log.trace('请求进入:/page/user/transactionEdit_step1');
  try {
    ctx.body = pug.renderFile(getViewFile('user/transactionEdit_step1.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 修改交易密码第二步(完成待测试)
router.get('/page/user/transactionEdit_step2', async (ctx) => {
  log.trace('请求进入:/page/user/transactionEdit_step2');
  try {
    const query = validateData({
      id_card: {required: true},
      mobile: {required: true},
      verification_code: {required: true}
    }, ctx.request.query);
    var data = {
      ...query
    }
    ctx.body = pug.renderFile(getViewFile('user/transactionEdit_step2.pug'), merge(pugOptions, data));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 账户信息修改(待测试)
router.get('/page/user/messageEdit', async (ctx) => {
  log.trace('请求进入:/page/user/messageEdit');
  try {
    ctx.body = pug.renderFile(getViewFile('user/messageEdit.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, err.errorMessage || '渲染出错');
  }
});

// 理财首页(banner接口待完善)
router.get('/page/user/manageIndex', async (ctx) => {
    log.trace('请求进入:/page/user/manageIndex');
    try {
      const query = validateData({
        channelCode: {required: true},
        phone: {required: true},
        token: {required: true},
        userId: {required: true},
        redirectType: {required: true},
      }, ctx.request.query);
      const apiUrl = javaAddress + '/h5/index';
      let data = await getAsyncData('post', apiUrl, qs.stringify(query), {}, true);
      console.log(data)
      setToIndexToken(ctx, query);
      setToken(ctx, data.userId, data.token, data.channelCode)
      // settokentest(ctx)
      console.log(data)
      if (data.redirectType == 'ruifubao') {
        ctx.redirect('/page/ruifu/ruifuList?banner=true')
      } else if (data.redirectType == 'portfolio') {
        ctx.redirect('/page/combination/combinationList?banner=true')
      } else if (data.redirectType == 'risk') {
        ctx.redirect('/page/user/assessResult?banner=true&showbtn=false')
      } else if(data.redirectType == 'assets'){
        ctx.redirect('/page/assets?banner=true')
      }
      data = {
        index: data
      };
      ctx.body = pug.renderFile(getViewFile('user/manageIndex.pug'), merge(pugOptions, data));
    } catch (err) {
      console.error(err);
      ctx.throw(500, err.errorMessage || '渲染出错');
    }
  }
);

// banner银行限额
router.get('/page/banner/bankQuota', async (ctx) => {
  log.trace('请求进入:/page/banner/bankQuota');
  try {
    ctx.body = pug.renderFile(getViewFile('banner/bankQuota.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, '渲染出错');
  }
});


//公司简介页面
router.get('/page/banner/companyProfile', async (ctx) => {
  log.trace('请求进入:/page/banner/companyProfile');
  try {
    ctx.body = pug.renderFile(getViewFile('banner/companyProfile.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, '渲染出错');
  }
});

//基金组合践行者
router.get('/page/banner/fundCombination', async (ctx) => {
  log.trace('请求进入:/page/banner/fundCombination');
  try {
    ctx.body = pug.renderFile(getViewFile('banner/fundCombination.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, '渲染出错');
  }
});

//科地视点
router.get('/page/banner/fundCombination_new', async (ctx) => {
  log.trace('请求进入:/page/banner/fundCombination_new');
  try {
    ctx.body = pug.renderFile(getViewFile('banner/fundCombination_new.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, '渲染出错');
  }
});

//积分兑好礼
router.get('/page/banner/intrgralPrize', async (ctx) => {
  log.trace('请求进入:/page/banner/intrgralPrize');
  try {
    ctx.body = pug.renderFile(getViewFile('banner/intrgralPrize.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, '渲染出错');
  }
});

//瑞富宝banner
router.get('/page/banner/whatIsRuifubao', async (ctx) => {
  log.trace('请求进入:/page/banner/whatIsRuifubao');
  try {
    ctx.body = pug.renderFile(getViewFile('banner/whatIsRuifubao.pug'), merge(pugOptions, {}));
  } catch (err) {
    console.error(err);
    ctx.throw(500, '渲染出错');
  }
});

module.exports = router;
