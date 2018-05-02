$(function () {
  mui.init();
  var mySwiper = new Swiper('.swiper-container', {
    loop : true,
    autoplay: {
      stopOnLastSlide: false,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
    }
  })
  initbtn()
})

function openzh(combinationId) {
  console.log(combinationId);
  localStorage.setItem('sourceToPortfolioDetail', window.location.pathname + window.location.search)
  window.location ='/page/combination/combinationDetail?combinationCode='+combinationId
}


function initbtn() {
  $('#myPropertybtn').on('click',function () {
    if (index.status === 1) {
      mui.confirm(`请您先进行开户`, '', ['取消', '去开户'], function (e) {
        console.log(e.index)
        if (e.index === 1) {
          localStorage.setItem('sourceToOpenAccount',window.location.pathname+window.location.search);
          window.location= '/page/public/openAccount'
        }
      });
    } else {
      window.location='/page/assets'
    }
  })
  $('.rfb').on('click',function () {
    window.location='/page/ruifu/ruifuList'
  })
  $('.jjzh').on('click',function () {
    window.location='/page/combination/combinationList'
  })
  $('.rxjj').on('click',function () {
    window.location='/page/fund/fundList'
  })
  $('.btn').on('click',function () {
    localStorage.setItem('sourceToMonetaryDetail',window.location.pathname+window.location.search);
    window.location='/page/ruifu/monetaryDetail?fundCode='+index.T0Recommend.fundCode
  })

  var eyeopen = true
  $('#eyebtn').on('click',function () {
    if (eyeopen == true){
      $('#eyebtn').removeClass('openeye')
      $('#eyebtn').addClass('closeeye')
      $('.myProperty_l_b').html('*****')
      eyeopen = !eyeopen
    }else if(eyeopen == false){
      $('#eyebtn').removeClass('closeeye')
      $('#eyebtn').addClass('openeye')
      $('.myProperty_l_b').html(index.totalAsset)
      eyeopen = !eyeopen
    }
  })
}
