/**
 * Created by Garry King on 2016/10/08.
 */
//===============================
// 页面load完，触发
//===============================
var theme_color = "#ffaa00";

$(function () {
  loadFundDetailData();
});

function loadFundDetailData() {
  $(".base_div").html(announcement.content);
  $($(".base_div").find("p")[0]).css("color", theme_color).css("font-size", "18px").css("font-weight", "bold");
}
