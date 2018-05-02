/**
 * Created by xiaobxia on 2017/9/17.
 */
const path = require('path');

const root = path.resolve(__dirname, '../');
function resolveRoot(dir) {
  return path.resolve(root, dir);
}
const javaUat = 'http://121.40.18.21:9001';
const javaPre = 'http://114.55.244.235:7080';
const javaProd = 'http://10.157.59.28:8080';

module.exports = {
  path: {
    dist: './dist',
    scss: './src/scss/*.scss',
    scssWatch: './src/scss',
    js: './src/js/*.js',
    jsWatch: './src/js',
    lib: './src/lib/*',
    libWatch: './src/lib/*',
    asset: './src/asset/**',
    assetWatch: './src/asset/**',
    mock: './mock/*.json',
    pug: path.join(__dirname, '../src/pug/**'),
    pugFile: path.join(__dirname, '../src/pug/**'),
    pugWatch: path.join(__dirname, '../src/pug'),
    fonts: path.join(__dirname, '../src/fonts/*'),
    fontsWatch: path.join(__dirname, '../src/fonts/*')
  },
  pxtorem: {
    rootValue: 20,
    unitPrecision: 5,
    propList: ['*'],
    selectorBlackList: [],
    replace: true,
    mediaQuery: false,
    //太小的不转换
    minPixelValue: 3
  },
  autoprefixer: {
    "browsers": [
      "> 1%",
      "last 2 versions"
    ]
  },
  dev: {
    useRedis: false,
    assetsSubDirectory: '/static',
    server: {
      port: 4002,
      baseDir: resolveRoot('dist'),
      proxyTable: {
        "/codi-api": {
          "target": javaPre,
          logs: true
        }
      }
    },
    javaAddress: javaPre + '/codi-api'
  },
  uat: {
    useRedis: false,
    assetsSubDirectory: '/static',
    assetsPublicPath: '',
    server: {
      port: 3002,
      baseDir: resolveRoot('dist'),
      proxyTable: {
        "/codi-api": {
          "target": javaUat,
          logs: true
        }
      }
    },
    javaAddress: javaUat + '/codi-api'
  },
  pre: {
    useRedis: false,
    assetsSubDirectory: '/static',
    assetsPublicPath: '',
    server: {
      port: 3003,
      baseDir: resolveRoot('dist'),
      proxyTable: {
        "/codi-api": {
          "target": javaPre,
          logs: true
        }
      }
    },
    javaAddress: javaPre + '/codi-api'
  },
  prod: {
    useRedis: false,
    assetsSubDirectory: '/static',
    assetsPublicPath: '',
    server: {
      port: 3002,
      baseDir: resolveRoot('dist'),
      proxyTable: {
        "/codi-api": {
          "target": javaProd,
          logs: true
        }
      }
    },
    javaAddress: javaProd + '/codi-api'
  },
  logger: {
    dir: resolveRoot('logs'),
    fileName: 'cheese.log',
    debugLogLevel: 'ALL',
    productLogLevel: 'info'
  }
};
