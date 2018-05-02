$(function () {
  console.log(warehouseHistory)
  initpage()
})


function initclick() {
  $(".profit_list_t .list_icon").click(function () {
    console.log($(this).parent().parent().next())
    if ($(this).hasClass("rotate")) { //点击箭头旋转180度
      console.log(1)
      $(this).removeClass("rotate");
      $(this).addClass("rotate1");
      $(this).parent().parent().next().slideToggle()
    } else {
      console.log(2)
      $(this).removeClass("rotate1"); //再次点击箭头回来
      $(this).addClass("rotate");
      $(this).parent().parent().next().slideToggle()
    }
  })
}

function initpage() {
    var wareHousedatalist = warehouseHistory
    var htmlstring = ''
    for (var i = 0; i < wareHousedatalist.length; i++) {
      htmlstring += "<div class='profit_list clearfix'>" +
        "    <div class='profit_list_t'>" +
        "      <div>" +
        "        " + wareHousedatalist[i].beginDate.substring(0, 10) + "&nbsp;调仓记录" +
        "        <p class='list_icon'></p>" +
        "      </div>" +
        "    </div>" +
        "    <div style='display: none'>" +
        "      <div class='profit_reason'>" +
        "        <div class='profit_reason_title'>" +
        "          调仓原因" +
        "        </div>" +
        "        <div class='profit_reason_con'>" + wareHousedatalist[i].transferReason + "</div>" +
        "      </div>"
      var listdata = wareHousedatalist[i].mappings
      htmlstring+="<div class='profit_list_b'>" +
        "        <div class='profit_list_b_title'>" +
        "          <div>基金名称</div>" +
        "          <div>原配比</div>" +
        "          <div>调仓配比</div>" +
        "        </div>" +
        "        <div class='list_data clearfix'>" +
        "<ul>"
      for (var j = 0; j < listdata.length; j++) {
        htmlstring += "<li onclick=\"loadToDetail('/page/fund/fundDetail?fundCode=" + listdata[j].fundCode + "&fundName=" + listdata[j].fundName + "')\">" +
          "              <p class='name'>" + listdata[j].fundName + "</p>" +
          "              <span class='type_num'>" + listdata[j].fundCode + listdata[j].fundType + "</span>" +
          "              <p class='proportion_old'>" + listdata[j].percentBefore + "%</p>" +
          "              <p class='proportion'>" + listdata[j].percentNow + "%</p>" +
          "              <p class='list_icon'></p>" +
          "            </li>"
      }
      htmlstring +="</ul>" +
        "        </div>" +
        "      </div>" +
        "    </div>" +
        "  </div>"
    }
    $('.main').html(htmlstring)
    initclick()
}

function loadToDetail(url) {
  localStorage.setItem('sourceToFundDetail', window.location.pathname + window.location.search)
  window.location = url;
}
