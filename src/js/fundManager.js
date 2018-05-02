/**
 * Created by zhenhaowang on 2016/10/27.
 */

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

function get_page_data() {

    var performanceData = manager.performance;
    var tr1 = '<tr class = "fundManagerEx2">';
    var tr2 = '</tr>';
    var td1 = '<td class="table_block_left border_right border_bottom font4">';
    var td2 = '<td class="table_block_middle border_right border_bottom font4">'
    var td3 = '<td class="table_block_right border_bottom font3">';
    var td5 = '<td class="table_block_right border_bottom font5">';
    var td6 = '<td class="table_block_right border_bottom font4">';
    var td7 = '<td class="table_block border_bottom font4">';
    var td4 = '</td>';

    var htmlData = '';

    if (performanceData == "" || performanceData.length == 0) {
      htmlData += tr1;
      htmlData += td7;
      htmlData += '暂无数据';
      htmlData += td4;
      htmlData += tr2;
    }

    $.each(performanceData, function(i, item){
      htmlData += tr1;

      htmlData += td1;
      htmlData += item.fundNameAbbr;
      htmlData += td4;

      htmlData += td2;
      htmlData += new Date().Format("yy-M-d",item.accessionDate);
      htmlData += ' 至 ';

      if (item.dimissionDate == ""||!item.dimissionDate) {
        htmlData += '至今';
      } else {
        htmlData += new Date().Format("yy-M-d",item.dimissionDate);
      }

      htmlData += td4;

      var performance = item.performance;

      if (performance == "") {
        htmlData += td6;
        htmlData += '----';
        htmlData += td4;
      }else{
        if (performance < 0) {
          htmlData += td5;
        } else{
          htmlData += td3;
        }

        htmlData += performance;
        htmlData += '%';
        htmlData += td4;
      }

      htmlData += tr2;
    });


    $("#managerIntro").html(manager.background);
    $("#performance").html(htmlData);

}

