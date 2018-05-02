$(function () {
  initclick()
})

function initclick() {
  $('.zhizhao_btn').on('click',function () {
    $('.zhizhao').show()
    $("body").on("touchmove",function(event){
      event.preventDefault;
    }, false)
    $('.layout').fadeIn('normal')
  })
  $('.zhengshu_btn').on('click',function () {
    $('.zhengshu').show()
    $("body").on("touchmove",function(event){
      event.preventDefault;
    }, false)
    $('.layout').fadeIn('normal')
  })
  $('.close_btn').on('click',function () {
    $('.zhizhao').hide()
    $('.zhengshu').hide()
    $("body").off("touchmove")
    $('.layout').fadeOut('normal')
  })

}
