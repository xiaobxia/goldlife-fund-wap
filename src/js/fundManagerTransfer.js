
Date.prototype.Format = function(fmt, strTime)
{ //author: meizz
  var date = new Date(strTime);

  var o = {
    "M+" : date.getMonth()+1,                 //月份
    "d+" : date.getDate(),                    //日
    "h+" : date.getHours(),                   //小时
    "m+" : date.getMinutes(),                 //分
    "s+" : date.getSeconds(),                 //秒
    "q+" : Math.floor((date.getMonth()+3)/3), //季度
    "S"  : date.getMilliseconds()             //毫秒
  };

  if(/(y+)/.test(fmt))
    fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)
    if(new RegExp("("+ k +")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
  return fmt;
}

$(function () {
  get_page_data();
});

function getName(name) {
  var returnName = '';

  for (var i = 0; i < name.length; i++) {
    returnName += name.charAt(i);

    if (i != name.length) {
      returnName += ' ';
    }
  }

  return returnName;
}

function get_page_data() {
    var fundManagers = fundDetail.fundManagers;
    var div = '<div class="base_div line_block_div fund_space" style="background-color: #ebebeb;"></div>';
    var data1 = '<div class="managerIntro font1" id="managerIntro"onclick="'
    var data6 = 'loadURL(';
    var data7 = ');';
    var data5 = '"> <table class="dataintable"> <tbody> <tr class="fundManagerEx"> <td class="invest_block_left1 " rowspan="2"> <img src="/static/asset/fundManager.png" width="36px" height="34px"/> </td> <td class="font7 invest_block_middle1"> ';
    var data2 = '</td> <td class="invest_block_right1 font8"> ';
    var data3 = '</td> </tr> <tr class="fundManagerEx"> <td class="invest_block_middle2 font7"> ';
    var data4 = '</td> <td class="invest_block_right2 font7"> &nbsp;&nbsp;任期回报 </td> </tr> </tbody> </table> </div>';
    var data8 = '</td> <td class="invest_block_right1 font9"> ';
    var data10 = '</td> <td class="invest_block_right1 font10"> ';

    var htmlData = '';

    $.each(fundManagers, function(i, item){
      htmlData += div;
      htmlData += data1;
      htmlData += data6;
      var url = '\'/page/fund/fundManager?managerCode=' + item.code + '\'';

      htmlData += url;

      htmlData += data7;
      htmlData += data5;
      htmlData += getName(item.name);


      if (item.performance > 0) {
        htmlData += data2;
        htmlData += '+';
        htmlData += item.performance;
      } else if(item.performance == 0) {
        htmlData += data10;
        htmlData += item.performance;
      } else if("" == item.performance || item.performance === null) {
        htmlData += data10;
        htmlData += "----";
      } else if (item.performance < 0){
        htmlData += data8;
        htmlData += item.performance;
      }

      htmlData += data3;
      htmlData += item.accessionDate;
      htmlData += ' 至今';
      htmlData += data4;
    });

    $(".fundManagerTransfer").html(htmlData);


}
