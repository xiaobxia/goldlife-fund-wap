$(function () {
  initpage()
  get_page_data_allocation();
  get_page_data_summary()
  get_page_data_divide()
});

//基金概况
function get_page_data_summary() {
  var param = {fundCode: getUrlParam('fundCode')};
  $.ajax({
    url: '/codi-api/h5/fund/overview',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: {},
    success: function (data) {
      data = data.result
      $("#fundName").html(data.fundName);
      $("#fundNameAbbr").html(data.fundNameAbbr);
      $("#fundCode").html(data.fundCode);
      $("#fundType").html(data.fundType);
      $("#riskLevelString").html(data.riskLevelString);
      $("#establishmentDate").html(data.establishmentDate);
      $("#foundedSize").html(data.foundedSize + data.foundedSizeUnit);
      $("#marketValue").html(data.marketValue + data.marketValueUnit);
      $("#fundCompany").html(data.fundCompany);
      $("#fundTrustee").html(data.fundTrustee);
      $("#fundManager").html(data.fundManager);
      $("#investTarget").html($.trim(data.investTarget));
      $("#investField").html($.trim(data.investField));
      $("#investOrientation").html($.trim(data.investOrientation));
    }
  });
}

// 分红拆分
function get_page_data_divide() {
  var param = {fundCode: getUrlParam('fundCode')};
  $.ajax({
    url: '/codi-api/h5/fund/dividendAndSharesSplit',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: {},
    success: function (data) {
      if (data.success) {
        var dividendList = data.dividendList;
        var tr1 = '<tr class = "fundManagerEx2">';
        var tr2 = '</tr>';
        var td1 = '<td class="invest_block_left  font7 ">';
        var td2 = '<td class="invest_block_middle  font7">'
        var td3 = '<td class="invest_block_right  font7">';
        var td4 = '</td>';
        var td5 = '<td class="invest_block_left2  font7 ">';
        var td6 = '<td class="invest_block_right2  font7 ">';
        var td7 = '<td class="invest_block  border_bottom font7">';
        var htmlData = '';

        $.each(dividendList, function (i, item) {
          htmlData += tr1;

          htmlData += td1;
          htmlData += item.reDate.substring(0, 10);
          htmlData += td4;

          htmlData += td2;
          htmlData += item.executeDate.substring(0, 10);
          htmlData += td4;

          htmlData += td3;
          htmlData += item.ratio;
          htmlData += td4;

          htmlData += tr2;
        });
        if (dividendList == "" || !dividendList) {
          htmlData += tr1;
          htmlData += td7;
          htmlData += '暂无数据';
          htmlData += td4;
          htmlData += tr2;
        }


        var sharesSplitList = data.sharesSplitList;

        var sharesSplitListData = '';

        $.each(sharesSplitList, function (i, item) {
          sharesSplitListData += tr1;

          sharesSplitListData += td5;
          sharesSplitListData += item.splitDay;
          sharesSplitListData += td4;

          sharesSplitListData += td6;
          sharesSplitListData += '1 : ';
          sharesSplitListData += item.splitRatio;
          sharesSplitListData += td4;
          sharesSplitListData += tr2;
        });
        if (!sharesSplitList) {
          if (sharesSplitList == "" || !sharesSplitList) {
            sharesSplitListData += tr1;
            sharesSplitListData += td7;
            sharesSplitListData += '暂无数据';
            sharesSplitListData += td4;
            sharesSplitListData += tr2;
          }
        }

        $("#dividend").html(htmlData);
        $("#resolution").html(sharesSplitListData);
      }
    }
  });
}

// 资产分配
function get_page_data_allocation() {
  var param = {fundCode: getUrlParam('fundCode')};
  $.ajax({
    url: '/codi-api/h5/fund/assetAllocation',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: {},
    success: function (data) {
      var assetAllocations = data.assetAllocations;
      var length = assetAllocations.length;
      var labelNames = [];
      var marketValues = [];
      var i = 0;
      var fillData = [];

      $.each(assetAllocations, function (i, item) {
        // labelNames[i] = item.assetType;
        var value = item.marketValue / 100000000;
        marketValues[i] = value.toFixed(4);
        fillData[i] = {};
        fillData[i].value = marketValues[i];
        fillData[i].name = item.assetType;
        //  labelNames[i] = item.assetType;
        i++;
      });
      fillData.sort(function (a, b) {
        return b.value - a.value;
      });
      for (var k = 0; k < fillData.length; k++) {
        labelNames[k] = fillData[k].name;
      }

      var ctx = echarts.init(document.getElementById('myChart'));

      if (labelNames.length == 0) {
        labelNames = ['暂无数据'];
        fillData = [
          {value: 1, name: '暂无数据', selected: true}];
      }

      var option = {
        title: {
          //text: '某站点用户访问来源',
          //subtext: '纯属虚构',
          x: 'center'
        },
        //提示框组件
        tooltip: {
          //item是指明数据项图形触发，多用于饼图
          trigger: 'item',
          borderWidth: 2,
          borderColor: '#ffc552',
          backgroundColor: 'rgba(225,225,225,0.3)',
          textStyle: {
            color: '#000'
          },
          //字符串模板
          //  formatter: "{a} <br/>{b} : {c} ({d}%)"
          formatter: "{b} : ({d}%)"
        },
        //图例组件

        legend: {
          //图例列表布局朝向
          orient: 'vertical',
          //偏移左侧的距离
          right: '10%',
          top: '20%',
          itemGap: 20,
          align: 'left',
          textStyle:{
            fontSize:50
          },
          //数组，["其他资产","股票","银行存款"]
          data: labelNames
        },

        series: [
          {
            name: '',
            //type:pie是指饼图
            type: 'pie',
            //半径，第一项是内半径，第二项是外半径，这里是内外都是55%
            /// radius : '55%',
            radius: ['25%', '85%'],
            //图的中心在哪
            center: ['30%', '50%'],
            label: {
              normal: {
                //不显示label
                show: false
              }
            },
            //[{},{}],对象例子name:"银行贷款"，value:"3.6421"
            data: fillData,
            //   color:['#0075ff','#e0eeff', '#b3d6ff', '#76b5ff', '#459aff','#ff9a23','#ffbf24', '#ffdd89','#ffedc3', '#0075ff'],
            color: ['#ffaa00', '#ffc44c', '#ffdd99', '#ebebeb', '#76b5ff', '#459aff', '#ff9a23', '#ffbf24', '#ffdd89', '#ffedc3'],
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      ctx.setOption(option);

      var tr1 = '<tr class = "fundManagerEx2">';
      var tr2 = '</tr>';
      var td1 = '<td class="invest_block_left border_right border_top font2 ">';
      var td2 = '<td class="invest_block_right border_top font2">';
      var td4 = '<td class="invest_block_middle border_right border_top font2 ">';
      var td3 = '</td>';
      var td5 = '<td class="invest_block_left2 border_right border_top font2 ">';
      var td6 = ['<td class="invest_block_right2 border_right border_top font2 "', '>'];
      var td7 = '<td class="invest_block  border_right border_top font2 ">';
      var htmlData = '';
      var portifoliosData = '';
      var assetAllocationsData = '';
      //资产分布

      var typedata = [];
      $.each(assetAllocations, function (i, item) {
        var value = item.marketValue / 100000000;
        marketValues[i] = value.toFixed(4);
        typedata[i] = {};
        typedata[i].value = marketValues[i];
        typedata[i].name = item.assetType;
        typedata[i].ratioInNV = item.ratioInNV;
      });

      typedata.sort(function (a, b) {
        return b.value - a.value;
      });

      //  $.each(assetAllocations, function(i, item){
      $.each(typedata, function (i, item) {
        assetAllocationsData += tr1;

        assetAllocationsData += td1;
        assetAllocationsData += item.name;
        assetAllocationsData += td3;

        //var marketValue = item.marketValue / 100000000;
        assetAllocationsData += td4;
        assetAllocationsData += item.value;
        assetAllocationsData += td3;

        assetAllocationsData += td2;

        if (item.ratioInNV == "") {
          assetAllocationsData += '----';
        } else {
          assetAllocationsData += item.ratioInNV + '%';
        }

        assetAllocationsData += td3;

        assetAllocationsData += tr2;
      });

      if (assetAllocations == "") {
        assetAllocationsData += tr1;

        assetAllocationsData += td7;
        assetAllocationsData += '暂无数据';
        assetAllocationsData += td3;

        assetAllocationsData += tr2;
      }

      //十大重仓
      var portifolios = data.portifolios;

      $.each(portifolios, function (i, item) {
        portifoliosData += tr1;

        portifoliosData += td5;
        portifoliosData += item.fundNameAbbr;
        portifoliosData += td3;

        portifoliosData += td6[0];
        if (item.ratioInNV == "") {
          portifoliosData += td6[1];
          portifoliosData += '----';
          //为负数
        } else if (item.ratioInNV.indexOf("-") !== -1) {
          portifoliosData += "style='color: green'";
          portifoliosData += td6[1];
          portifoliosData += item.ratioInNV + '%';
        } else {
          portifoliosData += "style='color: #929091'";
          portifoliosData += td6[1];
          portifoliosData += item.ratioInNV + '%';
        }
        portifoliosData += td3;

        portifoliosData += tr2;
      });

      if (portifolios.length == 0) {
        portifoliosData += tr1;

        portifoliosData += td7;
        portifoliosData += '暂无数据';
        portifoliosData += td3;

        portifoliosData += tr2;
      }

      //行业分布
      var industrys = data.industrys;
      $.each(industrys, function (i, item) {
        htmlData += tr1;

        htmlData += td5;
        htmlData += item.industryName;
        htmlData += td3;

        htmlData += td6[0];
        if (item.ratioInNV == "") {
          htmlData += td6[1];
          htmlData += '----';
          //为负数
        } else if (item.ratioInNV.indexOf("-") !== -1) {
          htmlData += "style='color: green'";
          htmlData += td6[1];
          htmlData += item.ratioInNV + '%';
        } else {
          htmlData += "style='color: #929091'";
          htmlData += td6[1];
          htmlData += item.ratioInNV + '%';
        }
        htmlData += td3;

        htmlData += tr2;
      });

      if (industrys.length == 0) {
        htmlData += tr1;

        htmlData += td7;
        htmlData += '暂无数据';
        htmlData += td3;

        htmlData += tr2;
      }

      $("#dividend_zc").html(assetAllocationsData);
      $("#large_data").html(portifoliosData);
      $("#industry_distribution").html(htmlData);
    }
  });


}

function initEvent() {
  $(".J_doc").click(function () {
    removeSelectAndHide($(this).parent().find("div"));
    $("#FUND_L").show();
    selectTab(this);
  });
  $(".J_notice").click(function () {
    removeSelectAndHide($(this).parent().find("div"));
    $("#FUND_M").show();
    selectTab(this);
  });
  $(".J_know").click(function () {
    removeSelectAndHide($(this).parent().find("div"));
    $("#FUND_R").show();
    selectTab(this);
  });
}

function initpage() {
  var param = {fundCode: getUrlParam("fundCode")};
  $.ajax({
    url: '/codi-api/h5/fund/detail',
    data: param,
    dataType: 'json',
    type: 'get',
    headers: {},
    success: function (data) {
      var ifCurrency = isCurrencyFund(data.fundTypeCode)
      var fund_info_string = ''
      if (ifCurrency) {
        fund_info_string += '<div class="span2 selected J_doc">基金概况</div>\n' +
          '    <div class="span2 J_notice">资产配置</div>'
      } else {
        fund_info_string += '<div class="span3 selected J_doc" style="padding-left: 40px;text-align: left;">基金概况</div>\n' +
          '    <div class="span3 J_notice">资产配置</div>' +
          '    <div class="span3 J_know">分红拆分</div>'
      }
      $('.fund_info').html(fund_info_string)
      initEvent()
    }
  });

}

function selectTab(target) {
  $(target).addClass("selected")
}

function removeSelectAndHide(target) {
  $("#FUND_L").hide();
  $("#FUND_M").hide();
  $("#FUND_R").hide();
  for (var i = 0; i <= target.length - 1; i++) {
    $(target[i]).removeClass("selected")
  }
}

function isCurrencyFund(fundTypeCode) {
  return fundTypeCode == "1109" || fundTypeCode == "900000";
}

function getUrlParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg);  //匹配目标参数

  // 解码返回
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}
