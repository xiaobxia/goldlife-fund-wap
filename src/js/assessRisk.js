/**
 * Created by Garry King on 2016/9/23.
 */
//===============================
// 全局变量
//===============================
var questionVue = null, sectionVue = null;
var allQuestion = null, currQst = null;
var answerArray = [];
var lock = false;
var queryString = getQueryStringArgs();
// var token = token = {
//   userId: '4199',
//   channelCode: '9001',
//   'Auth-token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHQiOjE1MjIzNzczNjUyMjQsInVpZCI6IjQxOTkiLCJpYXQiOjE1MjEwODEzNjUyMjR9.H0anfRO9G6MKWDf9mwDBauK6xLA5Bl4sn9-1tkYsN2s'
// }
//===============================
// 页面load完，触发
//===============================
// 入口函数
// var token = getToken();
var token = getToken()

$(function () {
  initVueModule();
  loadQuestions();
  initEvent();
  // backurl();
});

//ajax请求加载问题
function loadQuestions() {
  var param = {answer_object: answer_object};
  //var param = {token: 'd76c298a_e7f2_4654_a9b3_c5ae1a2192ea', answer_object:'1'};//个人的answer_object为1
  // var token = getToken();
  $.ajax({
    url: '/codi-api/h5/mine/paper/questions',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: token,
    success: function (data) {
      allQuestion = data.result;
      currQst = 0;
      renderQuestion(data.result[0]);
      renderOption(data.result[0], false);
      $("#SECTION").show();
      $(".title_div_inner").show();
    }
  });
}

// 初始化vue
function initVueModule() {
  renderQuestion(null);
  renderOption(null);
}

//初始化事件
function initEvent() {
  initPreButton();
  initsubmit()
}

//===============================
//  业务逻辑处理方法
//===============================
// 初始化上一题按钮
function initPreButton() {
  $(".J_pre").click(function () {
    if (currQst <= 0) {
      currQst = 0;
      alert("别点我了，已经是第一题了..");
      return;
    } else {
      currQst--
    }
    renderQuestion(allQuestion[currQst]);
    renderOption(allQuestion[currQst], true);
    changeProcessBar();
    selectOneOption(1, answerArray[currQst]);
    $('#cp-cf-wp').slideUp()
  });

}

function initsubmit() {
  $('#confirm-check').on('click', function () {
    console.log(99)
    console.log($('#confirm-check'))
    console.log($('#confirm-check')[0].checked)
    if ($('#confirm-check')[0].checked) {
      $('#cf-cp-btn').removeClass('disabled')
      $('#cf-cp-btn').on('click', function () {
        submitAnswer();
      })
    } else {
      $('#cf-cp-btn').addClass('disabled')
      $('#cf-cp-btn').unbind()
    }
  })
  $('#QUESTION').on('click', function () {
    $('#cp-cf-wp').slideUp()
  })
}

//保存回答
function saveAnswer(option) {
  var answer = $(option).attr("data-option-no");
  console.log(answer)
  answerArray[currQst] = answer;
  selectOneOption(100, answer);
}

//上传回答
function submitAnswer() {
  $('#cf-cp-btn').unbind()

  var answers = "";
  for (var i = 0; i < answerArray.length; i++) {
    if (i == 0) {
      answers += allQuestion[i].question_no + ":" + answerArray[i];
    } else {
      answers += "|" + allQuestion[i].question_no + ":" + answerArray[i];
    }

  }
  var elig_type = getUrlParam("type");
  var param, commit_answer_url;
  // var token = getToken();
  var query = getQueryStringArgs()
  if (elig_type) {
    // 私募风险测评
    param = {elig_content: answers};
    commit_answer_url = '/codi-api/h5/mine/paper/commit_answer';
    $.ajax({
      url: commit_answer_url,
      data: param,
      dataType: 'json',
      type: 'POST',
      headers: token,
      success: function (data) {
        if (!(data.result.have_tested)) {
          $('#cf-cp-btn').on('click', function () {
            submitAnswer();
          })
          alert("网络开小差，提交评测结果失败...");

        } else {
          if (getQueryStringArgs().showbtn == 'false') {
            window.location = '/page/user/assessResult?showbtn=false&targetUrl=' + query.targetUrl
          }else{
            window.location = '/page/user/assessResult?targetUrl=' + query.targetUrl
          }

        }
      }
    });
  } else {
    // 公募风险测评
    param = {elig_content: answers};
    commit_answer_url = '/codi-api/h5/mine/paper/commit_answer';
    $.ajax({
      url: commit_answer_url,
      data: param,
      dataType: 'json',
      type: 'POST',
      headers: token,
      success: function (data) {
        if (!(data.result.have_tested)) {
          $('#cf-cp-btn').on('click', function () {
            submitAnswer();
          })
          alert("网络开小差，提交评测结果失败...");

        } else {
          if (getQueryStringArgs().showbtn == 'false') {
            window.location = '/page/user/assessResult?showbtn=false&targetUrl=' + query.targetUrl
          }else{
            window.location = '/page/user/assessResult?targetUrl=' + query.targetUrl
          }

        }
      }
    })
  }
}

//location.href = "assessResult.html?token=" + getUrlParam("token") + "&App-Device=" + getUrlParam("App-Device");
//token: 'c85f2c5a_4132_4b57_b7e8_556bf2cddee5'
//{"App-Device": 864551032797695}
//下一题或上传回答
function toNextOrSubmit() {
  if (currQst < allQuestion.length - 1) {
    currQst++;
    renderQuestion(allQuestion[currQst]);
    renderOption(allQuestion[currQst], false);
  } else {
    $('#cp-cf-wp').slideDown()


    //submitAnswer();
  }
}

//改变进度条
function changeProcessBar() {
  var percent = ((currQst + 1) / allQuestion.length * 100) + "%";
  if (currQst <= 0) {
    percent = "1%";
  }
  $(".progress-bar").width(percent);
}

// 获取单个问题
function selectOneOption(speed, optionNo) {
  var options = $(".section_div");
  var allImg = $(options.find("img"));
  var img = $($(options[optionNo - 1]).find("img"));
  allImg.attr("src", "/static/asset/option.png");
  allImg.width("14px");
  img.fadeOut(speed, function () {
    img.attr("src", "/static/asset/hook.png");
    img.width("28px");
    img.fadeIn(speed);
  });
}

//===============================
// VUE 类型数据的 DOM渲染方法
//===============================
//提供问题
function renderQuestion(data) {
  if (questionVue == null)
    questionVue = new Vue({
      el: "#QUESTION",
      data: {
        question: data
      }
    });
  else
    questionVue.question = data;
}

//提供选项
function renderOption(data, isPrev) {
  var newData = data == null ? data : data.sections;

  if (newData != null && newData.length >= currQst) {
    for (var i = 0; i < newData.length; i++) {
      newData[i].width = "14px";
      newData[i].img = "/static/asset/option.png";
    }
    if (isPrev) {
      var selected = newData[answerArray[currQst] - 1];
      selected.width = "28px";
      selected.img = "/static/asset/hook.png";
    }
  }
  if (sectionVue == null)
    sectionVue = new Vue({
      el: "#SECTION",
      data: {
        sections: newData
      },
      methods: {
        J_next: function (event) {
          if (lock == true) {
            return;
          }
          lock = true;
          saveAnswer(event.currentTarget);
          //等待动画加载完成，再执行到下一个题目
          setTimeout(function () {
            toNextOrSubmit();
            changeProcessBar();
            lock = false;
          }, 500);
        }
      }
    });
  else
    sectionVue.sections = newData;
}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}


function backToLastUrl() {
  //如果是从banner进来，调用app关闭窗口
  if (queryString.banner === 'true') {
    window.location = addqueryarg('/page/user/manageIndex', getToIndexToken());
    return;
  }
  var sourceToAssessRisk = localStorage.getItem('sourceToAssessRisk');
  if (sourceToAssessRisk) {
    localStorage.removeItem('sourceToAssessRisk')
    window.location = sourceToAssessRisk;
  } else {
    window.history.go(-1);
  }
}

$('.mui-icon-left-nav').off('tap')
$('.mui-icon-left-nav').on('tap', backToLastUrl)
