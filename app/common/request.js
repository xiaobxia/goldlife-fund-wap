/**
 * Created by xiaobxia on 2018/1/5.
 */
const axios = require('axios');
const qs = require('qs');
const chalk = require('chalk');

// axios.interceptors.request.use(function (config) {
//   return config;
// }, function (error) {
//   return Promise.reject(error);
// });

axios.interceptors.response.use(function (response) {
  if (response.data.success === false) {
    return Promise.reject(response.data);
  }
  return response;
}, function (error) {
  // console.log(error);
  // if(error.response) {
  //   console.log(chalk.yellow(`status: ${error.response.status}`));
  //   console.log(chalk.yellow(`statusText: ${error.response.statusText}`));
  // } else {
  //   console.log(error)
  // }
  return Promise.reject(error);
});

module.exports = {
  get(url, query, config) {
    let queryString = '';
    if (query) {
      queryString = qs.stringify(query);
    }
    return axios.get(url + (queryString ? '?' + queryString : ''), config).then((res) => {
      return res.data;
    });
  },
  post(url, query, config) {
    return axios.post(url, query, config).then((res) => {
      return res.data;
    });
  }
};
