function backToLastUrl() {
  window.location='/page/assets'
}
$(function () {
  console.log(bankcardList)
  if (bankcardList.banks.length == 0) {
    $('.nobank').show()
  }

  $('.mui-icon-left-nav').off('tap');
  $('.mui-icon-left-nav').on('tap',backToLastUrl)
})
