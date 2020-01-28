var varson = '?v=0.0'

// 音频部分
// var bgmAudioAll = document.getElementById('bgmAudioAll');
// bgmAudioAll.autoplay = false;
// var isBgmPlay = false;
// document.addEventListener("WeixinJSBridgeReady", function () {
//     isBgmPlay ? bgmAudioAll.play() : '';
// }, false);
// function stopAndPlayAllAudio(){
//     if(isBgmPlay){
//         isBgmPlay = false;
//         document.getElementById('musicing').style.display="none";
//         removeClass(document.getElementById('audioBtn'),'rotate2d');
//         addClass(document.getElementById('audioBtn'),'audio-no');
//         bgmAudioAll.pause();
//     }else{
//         isBgmPlay = true;
//         document.getElementById('musicing').style.display="block";
//         addClass(document.getElementById('audioBtn'),'rotate2d');
//         removeClass(document.getElementById('audioBtn'),'audio-no');
//         bgmAudioAll.play();
//     }
// }

// 图片设置尺寸
var standardWidth = 1080;
var totalTop = document.body.scrollHeight;
var totalWidth = document.body.scrollWidth;
var scale = totalWidth / standardWidth;
var screenHeight = window.screen.availHeight;
var imgUrlList = [
    'images/face1.png',
    'images/tool1.png',
    'images/face2.png',
    'images/tool2.png',
    'images/face3.png',
    'images/tool3.png',
    'images/face4.png',
    'images/tool4.png',
    'images/face5.png',
    'images/tool5.png',
    'images/face6.png',
    'images/tool6.png'];
// var imgSizeList = [1024,745];
var imgDataList = [];
function initPageSize(){
    document.styleSheets[0].addRule('.box', 'height: 100px');
    document.styleSheets[0].insertRule('.box {height: 100px}', 0);
}
function initImg(imgList){
    imgDataList = [];
    var i = 0;
    var len = imgList.length;
    function loadAndInitImg(imgUrl){
        if(i>=len){
           setImageSizeStyle(imgDataList); 
       }else{
            var img_obj = new Image;
            img_obj.onload = function(){
                var imgData = {
                    url:imgUrl,
                    width:img_obj.width,
                    height:img_obj.height
                }
                imgDataList.push(imgData);
                loadAndInitImg(imgList[++i])
            }
            img_obj.src = imgUrl+varson;
       }
    }
    loadAndInitImg(imgList[i])
}
function getNewImageSize(image){
    return {
        width: image.width * scale,
        heitgh: image.height * scale,
    }
}
function setImageSizeStyle(imageList){
    var styleEle = document.createElement('style');
    var styleStr = '';
    for(var imgDataI = 0 ; imgDataI < imageList.length ; imgDataI++){
        styleStr = styleStr +
            '.'+imageList[imgDataI].url.split('.')[0].split('/').join('-') + '-bg {' +
            'background-size:' + getNewImageSize(imageList[imgDataI]).width + 'px' + '}' +
            '.'+imageList[imgDataI].url.split('.')[0].split('/').join('-') + '-img {' +
            'width:' + getNewImageSize(imageList[imgDataI]).width * scale + 'px' + '}'
    }
    styleEle.innerText = styleStr;
    document.head.appendChild(styleEle);
}
initImg(imgUrlList);


/**
轮流播放element中的类名为'js-page'的元素
参数：
    ele-需要遍历的父元素，里面包含的要遍历的元素要附上'js-page'类名
        data_show_time：从隐藏到出现的时间，默认为0
        data_show_type：从隐藏到出现的方式，show/fadeIn/slideDown，默认为show
        data_stay_time：从出现到消去的时间，当data_stay_type为show的时候，这个时间之后会消去，默认为0
        data_stay_type：从出现到消去的方式，show(不会在下一个出现的时候消失)/hide（在下一个出现的时候消失），默认为hide
        data_hide_time：从消去到消失的时间，默认为0
        data_hide_type：从消去到消失的方式，hide/fadeOut/slideUp，默认为hide
    callback-遍历结束之后要执行的方法
输出：无

*/
// function showPage(ele,callback){
//     var i = 0;
//     var parentEle = ele;
//     var eleList = parentEle.children('.js-page');
//     var defaultStayTime = 0;
//     var defaultShowTime = 0;
//     var defaultHideTime = 0;
//     var defaultShowType = 'show';
//     var defaultHideType = 'hide';
//     var defaultStyleType = 'hide';
//     return function(){
//         function showOne(){
//             if(i < eleList.length){
//                 var showTime = eleList.eq(i).attr('data_show_time') ? eleList.eq(i).attr('data_show_time') : defaultShowTime;
//                 var showType = eleList.eq(i).attr('data_show_type') ? eleList.eq(i).attr('data_show_type') : defaultShowType;
//                 var stayTime = eleList.eq(i).attr('data_stay_time') ? eleList.eq(i).attr('data_stay_time') : defaultStayTime;
//                 var stayType = eleList.eq(i).attr('data_stay_type') ? eleList.eq(i).attr('data_stay_type') : defaultStyleType;
//                 if(i > 0){
//                     var lastHideTime = eleList.eq(i-1).attr('data_hide_time') ? eleList.eq(i-1).attr('data_hide_time') : defaultHideTime;
//                     var lastHideType = eleList.eq(i-1).attr('data_hide_type') ? eleList.eq(i-1).attr('data_hide_type') : defaultHideType;
//                     var lastStayType = eleList.eq(i-1).attr('data_stay_type') ? eleList.eq(i-1).attr('data_stay_type') : defaultStyleType;
//                     var lastStayTime = eleList.eq(i-1).attr('data_stay_time') ? eleList.eq(i-1).attr('data_stay_time') : defaultStayTime;
//                     if(lastStayType == 'hide'){
//                         eleList.eq(i-1)[lastHideType](lastHideTime)
//                     }else{
//                         function hideAfter(){
//                             var lateEle = eleList.eq(i-1);
//                             return function (){
//                                 setTimeout(function(){
//                                     lateEle[lastHideType](lastHideTime);
//                                 },lastStayTime)
//                             }
//                         }
//                         hideAfter();
//                     }
//                     eleList.eq(i).delay(lastHideTime)[showType](showTime);
//                 }else{
//                     eleList.eq(i)[showType](showTime);
//                 }
//                 i++;
//                 if(stayType == 'hide'){
//                     setTimeout(showOne,stayTime);
//                 }else{
//                     showOne();
//                 }
                
//             }else{
//                 callback ? callback() : '';
//             }
//         }
//         showOne();
//     }()
// }