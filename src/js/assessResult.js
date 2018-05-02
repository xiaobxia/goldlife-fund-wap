/**
 * Created by Garry King on 2016/9/23.
 */
//===============================
// 全局变量
//===============================

//===============================
// 页面load完，触发
//===============================
var query = getQueryStringArgs()
$(function () {
  loadTestResult();
  console.log(query)
  $('#assessagain').on('click',function () {
    window.location='/page/user/assessRisk?answer_object=1'
  })
  if (query.showbtn == 'false'){
    $('.codi_button').hide()
    $('.codi_button_inner').hide()
    $('#assessagain').on('click',function () {
      window.location='/page/user/assessRisk?answer_object=1&showbtn=false'
    })
  }
});

function backToLastUrl() {
  if(query.showbtn == 'false'){
    window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
  }else{
    var sourceToAssessRisk = localStorage.getItem('sourceToAssessRisk');
    if (sourceToAssessRisk) {
      localStorage.removeItem('sourceToAssessRisk')
      window.location = sourceToAssessRisk;
    } else {
      window.history.go(-1);
    }
  }
}

$('.codi_button').on('tap', backToLastUrl)
$('.mui-icon-left-nav').off('tap');
$('.mui-icon-left-nav').on('tap', backToLastUrl)


function loadTestResult() {
  var type = getUrlParam("type");
  var commit_result_url;
  var token = getToken();
  // var token = {
  //   userId: '4199',
  //   channelCode: '9001',
  //   'Auth-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHQiOjE1MjIzNzczNjUyMjQsInVpZCI6IjQxOTkiLCJpYXQiOjE1MjEwODEzNjUyMjR9.H0anfRO9G6MKWDf9mwDBauK6xLA5Bl4sn9-1tkYsN2s'
  // }
  if (type) {
    // 私募风险测评结果
    commit_result_url = '/codi-api/h5/mine/paper/test_result';
  } else {
    // 公募风险测评结果
    commit_result_url = '/codi-api/h5/mine/paper/test_result';
  }
  $.ajax({
    url: commit_result_url,
    data: {},
    dataType: 'json',
    type: 'get',
    headers: token,
    success: function (data) {
      var data = data.result
      if (data && data.success) {
        if (data['expire_date']) {
          //loadURL("codi://fundRiskEvaluationDone/?expireDate="+data['expire_date']+"&investRiskTolerance="+data['invest_risk_tolerance']);
        }
        if (!data.have_tested) {
          alert("您尚未评测风险...");
          //进入页面loadUrl，设置times为1，app不会关闭页面
          if (type) {
            $(".codi_button").attr('onclick', "loadURL('codi://privateFundRiskEvaluation/?tested=" + false + "');");
          }

        } else {
          var divs = $(".inner");
          $(divs[1]).html(data.invest_risk_tolerance_desc);
          $(divs[2]).html(data.invest_risk_tolerance_detail);
          if (data['expire_date']) {
            $('#expire-date').html('有效期：' + data['expire_date'])
          } else {
            $('#expire-date').html('')
          }
          if (type) {
            //$(".codi_button").attr('onclick', "loadURL('codi://privateFundRiskEvaluation/?expireDate="+data['expire_date']+"&tested=" + data.have_tested + "');");
            $(".codi_button").attr('onclick', "loadURL('codi://privateFundRiskEvaluation/?tested=" + data.have_tested + "');");
          }
        }
      } else {
        if (data && !data.success) {
          console.log(data.errorCode, data.errorType, data.errorMessage);
          alert(data.errorMessage);
        } else {
          console.log("执行 " + url + " 出错了...");
          alert("系统异常");
        }
      }
    }
  });

}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}
