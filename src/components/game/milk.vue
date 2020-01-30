<template>
  <div id="milk" class="route">
    <div v-if="!isStart" class="loading-page"  v-bind:style="{'background-image':'url('+require('../../assets/img/loading_bg.jpg')+')'}">
      <p></p>
      <div class="progress" style="display: none" v-bind:style="{'display':isReady === 'allReady'?'none':'block'}">
        <div class="progress-bar" style="background:#f2c21d;" v-bind:style="{'width':(preLoadIndex/preLoadLen*100)+'%'}">
          <span>{{parseInt(preLoadIndex/preLoadLen*100)}}%
            <i class="icon">&#xe60d</i>
          </span>
        </div>
      </div>
      <button v-if="isReady === 'allReady'"  @click="toStart" class="toStart-btn">定制全家福</button>
    </div>
    <canvas v-if="isStart" class="top" @touchstart="start" @touchmove.prevent="move" @touchend="end"></canvas>
    <img v-if="isSaved && isStart" :src="imgSrc">
    <div v-if="isStart && !isSaved" class="bottom" v-bind:class="{'down-bottom':!isShowSel}">
      <!-- 这是上面横排的列表：背景、任务、道具、文字、下拉框 -->
      <ul class="type">
        <li class="viticaly-center" v-for="item in typeList" :key="item.id" v-bind:class="{'show-type':item.id === showType}" @click="changeType(item.id)">
          <span class="img-type viticaly-center-block" style="line-height: 100%;font-weight: 900;" v-bind:style="{'background-image':'url('+item.url+')' , 'background-position':item.bgSize}"></span>
        </li>
        <li class="viticaly-center" @click="isShowSel = !isShowSel;">
          <span class="img-type viticaly-center-block" v-bind:style="{'background-image':'url('+require('../../assets/img/icons.png')+')' , 'background-position':'0% '+(isShowSel?'33%':'39%')}"></span>
        </li>
      </ul>
      <ul class="selList clearfix">
        <!-- 背景和男女选择元素 -->
        <li v-if="!showDecorate && showType !== 3 && showType !== 2" v-for="item in activeList" class="viticaly-center" v-bind:class="{'zhujue-decorate':showType === 1}"><img class="viticaly-center-block" :src="item" @click="setImg"></li>
        <!-- 装饰元素 -->
        <li v-if="showType === 2" class="character">
          <!-- 物品分类（家具、宠物、家人） -->
          <ul class="character-type">
            <li class="viticaly-center" v-for="thingsType in thingsTypeList" v-bind:class="{'show-type':thingsType.id === showThingsType}" v-bind:style="{'height':100/thingsTypeList.length + '%'}" @click="changeThingsType(thingsType.id)">
              <span class="img-type viticaly-center-block" v-bind:style="{'background-image':'url('+thingsType.url+')' , 'background-position':thingsType.bgSize}"></span>
            </li>
          </ul>
          <!-- 家具、宠物、家人分类后的元素 -->
          <ul class="character-list">
            <li v-for="decorate in thingsList" class="viticaly-center">
              <img class="viticaly-center-block" :src="decorate" @click="setImg">
            </li>
          </ul>
        </li>
        <!-- 主角装饰元素 -->
        <li v-if="showDecorate" class="character">
          <ul class="character-type">
            <li class="viticaly-center" v-for="decorateType in characterTypeList" v-bind:class="{'show-type':decorateType.id === showCharacterType}" v-bind:style="{'height':100/characterTypeList.length + '%'}" @click="changeCharacterType(decorateType.id,active.perType)">
              <span class="img-type viticaly-center-block" v-bind:style="{'background-image':'url('+decorateType.url+')' , 'background-position':decorateType.bgSize}"></span>
            </li>
          </ul>
          <ul class="character-list">
            <li v-for="(decorate,index) in characterDecorateList" class="viticaly-center" v-bind:class="{'head-decorate':!isBodyDecorate(decorate),'body-decorate':isBodyDecorate(decorate),'none-img':index === 0 && (characterTypeList[showCharacterType].name == 'hear' || characterTypeList[showCharacterType].name == 'glasses' || characterTypeList[showCharacterType].name == 'mustache')}" v-bind:style="{'background-image':index === 0 && (characterTypeList[showCharacterType].name == 'hear' || characterTypeList[showCharacterType].name == 'glasses' || characterTypeList[showCharacterType].name == 'mustache')?'url('+require('../../assets/img/none_zi.png')+')':''}">
              <img class="viticaly-center-block" :src="decorate" @click="setCharacterImg">
            </li>
          </ul>
        </li>
        <!-- 文字选择 -->
        <li v-if="showType === 3" v-for="item in textList" class="viticaly-center test-list" @click="setImg">
          <i class="iconfont" v-html="item"></i>
        </li>
      </ul>
    </div>
    <button class="clear-btn" v-if="!isSaved" @click="isClearCanvas"><img :src="require('../../assets/img/clear_icon.png')"/></button>
    <button class="back-btn" v-if="isSaved" @click="backToEdit">返回</button>
    <div class="bottom-back" v-if="!isSaved">
      <button class="save-btn" v-bind:style="{'background-image':'url('+require('../../assets/img/icons.png')+')'}" @click="saveCanvas"></button>
    </div>
  </div>
</template>

<script>
import weui from "weui.js";
import util from "../../assets/js/util";
import helper from "../../assets/js/helper";
import constant from "../../assets/js/constant";
import hidpi from "../../assets/js/hidpi-canvas.min";
export default {
  name: "milk",
  data() {
    return {
      // 元素类别列表：背景、人物、物品、文字
      typeList: [
        { name: "背景", id: 0 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 0%'}, 
        { name: "主角", id: 1 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 6.6%'},
        { name: "物品", id: 2 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 13%'},
        { name: "字体", id: 3 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 19.5%'},
      ],
      characterTypeList: [],
      // 主角配饰类别列表（男）
      characterManTypeList: [
        { name: "hear", id: 0 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 68%'}, 
        { name: "mustache", id: 1 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 54%'},
        { name: "glasses", id: 2 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 74%'},
        { name: "body", id: 3 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 60.9%'},
      ],
      // 主角配饰类别列表（女）
      characterWomanTypeList: [
        { name: "hear", id: 0 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 68%'}, 
        { name: "glasses", id: 1 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 74%'},
        { name: "body", id: 2 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 60.9%'},
      ],
      // 装饰元素类别
      thingsTypeList: [
        { name: "other", id: 3 ,url:require('../../assets/img/icons2.png') ,bgSize:'0% 0%'},
        { name: "fur", id: 1 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 89%'},
        { name: "pet", id: 2 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 26%'},
        { name: "per", id: 0 ,url:require('../../assets/img/icons.png') ,bgSize:'0% 81%'}, 
      ],
      // 元素来源
      materialList: [
        // 背景
        [
          require("../../assets/img/bg1.jpg"),
          require("../../assets/img/bg5.jpg"),
          require("../../assets/img/bg22.jpg"),
          // require("../../assets/img/bg3.jpg"),
          // require("../../assets/img/bg4.jpg"),
        ],
        // 人物
        [
          require("../../assets/img/man.png"),
          require("../../assets/img/woman.png"),
        ],
        // 家人
        [
          require("../../assets/img/per1.png"),
          // require("../../assets/img/per2.png"),
          // require("../../assets/img/per3.png"),
          // require("../../assets/img/per4.png"),
        ],
        // 家具
        [
          require("../../assets/img/fur1.png"),
          require("../../assets/img/fur2.png"),
          require("../../assets/img/fur3.png"),
          require("../../assets/img/fur20.png"),
          require("../../assets/img/fur4.png"),
          require("../../assets/img/fur23.png"),
          require("../../assets/img/fur8.png"),
          require("../../assets/img/fur9.png"),
          require("../../assets/img/fur10.png"),
          require("../../assets/img/fur11.png"),
          require("../../assets/img/fur12.png"),
          require("../../assets/img/fur13.png"),
          require("../../assets/img/fur14.png"),
          require("../../assets/img/fur15.png"),
          require("../../assets/img/fur16.png"),
          require("../../assets/img/fur17.png"),
          require("../../assets/img/fur18.png"),
          require("../../assets/img/fur21.png"),
          require("../../assets/img/fur22.png"),
          require("../../assets/img/fur24.png"),
          require("../../assets/img/fur5.png"),
          require("../../assets/img/fur6.png"),
          require("../../assets/img/fur7.png"),
        ],
        // 宠物
        [
          require("../../assets/img/pet1.png"),
          require("../../assets/img/cat1.png"),
          require("../../assets/img/cat2.png"),
          require("../../assets/img/cat3.png"),
          require("../../assets/img/cat4.png"),
          require("../../assets/img/cat5.png"),
          require("../../assets/img/cat6.png"),
          require("../../assets/img/dog1.png"),
          require("../../assets/img/dog2.png"),
          require("../../assets/img/dog3.png"),
          require("../../assets/img/dog4.png"),
          require("../../assets/img/dog5.png"),
          require("../../assets/img/dog6.png"),
        ],
        // 其他
        [
          require("../../assets/img/other1.png"),
        ],
         //头发(男)
        [
          require("../../assets/img/none.png"),
          require("../../assets/img/man_hear_1.png"),
          require("../../assets/img/man_hear_2.png"),
          require("../../assets/img/man_hear_3.png"),
          require("../../assets/img/man_hear_4.png"),
          require("../../assets/img/man_hear_5.png"),
          require("../../assets/img/man_hear_6.png"),
          require("../../assets/img/man_hear_7.png"),
          require("../../assets/img/man_hear_8.png"),
          require("../../assets/img/man_hear_9.png"),
          require("../../assets/img/man_hear_10.png"),
          require("../../assets/img/man_hear_11.png"),
          require("../../assets/img/man_hear_12.png"),
          require("../../assets/img/man_hear_13.png"),
          require("../../assets/img/man_hear_14.png"),
          require("../../assets/img/man_hear_15.png"),
          require("../../assets/img/man_hear_16.png"),
          require("../../assets/img/man_hear_17.png"),
          require("../../assets/img/man_hear_18.png"),
          require("../../assets/img/man_hear_19.png"),
        ],
         //胡子(男)
        [
          require("../../assets/img/none.png"),
          require("../../assets/img/man_mus_1.png"),
          require("../../assets/img/man_mus_2.png"),
          require("../../assets/img/man_mus_3.png"),
          require("../../assets/img/man_mus_4.png"),
          require("../../assets/img/man_mus_5.png"),
          require("../../assets/img/man_mus_6.png"),
          require("../../assets/img/man_mus_7.png"),
          require("../../assets/img/man_mus_8.png"),
          require("../../assets/img/man_mus_9.png"),
        ],
         //眼镜(男)
        [
          require("../../assets/img/none.png"),
          require("../../assets/img/man_glasses_1.png"),
          require("../../assets/img/man_glasses_2.png"),
          require("../../assets/img/man_glasses_3.png"),
          require("../../assets/img/man_glasses_4.png"),
          require("../../assets/img/man_glasses_5.png"),
          require("../../assets/img/man_glasses_6.png"),
          require("../../assets/img/man_glasses_7.png"),
          require("../../assets/img/man_glasses_8.png"),
        ],
         //人(男)
        [
          require("../../assets/img/man_body_1.png"),
          require("../../assets/img/man_body_2.png"),
          require("../../assets/img/man_body_3.png"),
          require("../../assets/img/man_body_4.png"),
          require("../../assets/img/man_body_5.png"),
          require("../../assets/img/man_body_6.png"),
          require("../../assets/img/man_body_7.png"),
          require("../../assets/img/man_body_8.png"),
        ],
         //头发(女)
        [
          require("../../assets/img/none.png"),
          require("../../assets/img/woman_hear_1.png"),
          require("../../assets/img/woman_hear_2.png"),
          require("../../assets/img/woman_hear_3.png"),
          require("../../assets/img/woman_hear_4.png"),
          require("../../assets/img/woman_hear_5.png"),
          require("../../assets/img/woman_hear_6.png"),
          require("../../assets/img/woman_hear_7.png"),
          require("../../assets/img/woman_hear_8.png"),
          require("../../assets/img/woman_hear_9.png"),
          require("../../assets/img/woman_hear_10.png"),
          require("../../assets/img/woman_hear_11.png"),
          require("../../assets/img/woman_hear_12.png"),
          require("../../assets/img/woman_hear_13.png"),
          require("../../assets/img/woman_hear_14.png"),
          require("../../assets/img/woman_hear_15.png"),
          require("../../assets/img/woman_hear_16.png"),
          require("../../assets/img/woman_hear_17.png"),
        ],
         //眼镜(女)
        [
          require("../../assets/img/none.png"),
          require("../../assets/img/woman_glasses_1.png"),
          require("../../assets/img/woman_glasses_2.png"),
          require("../../assets/img/woman_glasses_3.png"),
          require("../../assets/img/woman_glasses_4.png"),
          require("../../assets/img/woman_glasses_5.png"),
          require("../../assets/img/woman_glasses_6.png"),
          require("../../assets/img/woman_glasses_7.png"),
          require("../../assets/img/woman_glasses_8.png"),
        ],
         //人(女)
        [
          require("../../assets/img/woman_body_1.png"),
          require("../../assets/img/woman_body_2.png"),
          require("../../assets/img/woman_body_3.png"),
          require("../../assets/img/woman_body_4.png"),
          require("../../assets/img/woman_body_5.png"),
          require("../../assets/img/woman_body_6.png"),
          require("../../assets/img/woman_body_7.png"),
          require("../../assets/img/woman_body_8.png"),
          require("../../assets/img/woman_body_9.png"),
        ],
        // 人物
        [
          require("../../assets/img/man_head.png"),
          require("../../assets/img/woman_head.png"),
        ],
        // 其他元素
        [require("../../assets/img/save.jpg"),require("../../assets/img/icons.png"), require("../../assets/img/delet_icon.png"), require("../../assets/img/resize_icon.png")]
      ],
      // 文字列表，用Unicode编码
      textList: [
        '&#xe65e;',
        '&#xe65d;',
        '&#xe65c;',
        '&#xe65b;',
        '&#xe65a;',
        '&#xe659;',
        '&#xe658;',
        '&#xe657;',
        '&#xe656;',
        '&#xe655;',
        '&#xe654;',
        '&#xe653;',
        '&#xe652;',
        '&#xe651;',
        '&#xe650;',
        '&#xe64f;',
        '&#xe64e;',
        '&#xe64d;',

      ],
      // 文字可选的颜色
      textColorList: [
        '#ffffff',
        '#000000',
        '#502708',
        '#ffde00',
        '#df3f1a',
      ],
      activeList: [],//显示的可选元素（在这个里面是背景与角色选择）
      characterDecorateList: [],//显示的可选的主角装饰
      // 保存图片路径
      imgList: [],
      // 保存图片实例
      imgListArr: [],
      // 保存图片信息
      imgListDetailArr: [],

      //背景canvas元素
      bgImg: null,
      // 保存canvas元素
      canElList: [],
      // 保存主角canvas元素
      canCharacterElList: [],
      // 活动的canvas元素
      active: {},
      // 删除元素
      delEl: {},
      // 修改元素
      resetEl: {},
      setCol: [],
      isReseting: false,

      // 正在显示的图片
      showType:0,
      showCharacterType:0,
      showThingsType:1,
      thingsList:[],
      //是否显示图片列表
      isShowSel: true,
      //是否保存图片
      isSaved: false,
      //图片是否准备好
      isReady:false,
      isStart:false,
      //图片的比例
      ratio:1,
      // 是否显示主角装饰列表
      showDecorate: false,
      // 是否显示文字
      // showText: false,
      // 预加载图片的数量
      preLoadIndex:0,
      preLoadLen:100,

      canvas: null,
      ctx: null,
      imgSrc: "",
      // rem
      baseFontSize : Number(window.getComputedStyle(document.documentElement)["fontSize"].split('px')[0]),

    };
  },
  beforeCreate() {
    util.setTitle("全家福");
    util.gaSendPageView("milk");
  },
  created() {
    const that = this;
    that.preLoadImg();
  },
  methods: {
    toStart(){
      const that = this;
      that.isStart = true;
      that.checkEl();
      that.changeType();
    },
    getCharacterElI(activeI){
      for(let i = 0 ,len = this.canCharacterElList.length ; i < len ; i++){
        if(this.canCharacterElList[i].i == activeI){return i}
      }
      return -1;
    },
    convertSrc(src){
      let basePath = window.location.href;
      if(!src){
          return '';
      }
      return basePath.indexOf('8081')>=0 ? (src.split('8081')[src.split('8081').length-1]) : ((src.split('/dist').length>1?'.':'') + src.split('/dist')[src.split('/dist').length-1]);
    },
    setImg(ev) {
      // 如果选中的是字体
      if(this.typeList[this.showType].name === '字体'){
        let text = ev.target.textContent;
        this.canElList.push({ e: text, x: 100, y: 100, s: 70, w:70, h:90, color:'#000' });
        this.active = this.canElList[this.canElList.length - 1];
        this.active.i = this.canElList.length - 1;
        this.setCanvas(true);
        return;
      }
      let index = this.imgListArr.indexOf(this.convertSrc(ev.target.src));
      let oImg = this.imgList[index];
      let oImgDetail = this.imgListDetailArr[index];
      // 如果是设置背景的
      if(this.typeList[this.showType].name === '背景'){
        this.bgImg = oImg;
        this.setCanvas(true);
        return;
      }
      this.canElList.push({ e: oImg, x: 100, y: 100, w: oImgDetail.width, h: oImgDetail.height });
      this.active = this.canElList[this.canElList.length - 1];
      this.active.i = this.canElList.length - 1;
      // 如果选中的是主角
      let src = this.convertSrc(oImg.src);
      if(index >= this.materialList[0].length && index < this.materialList[0].length + this.materialList[1].length){
        
        // 如果选中的是男的(默认第一个是男的)
        if(index == this.materialList[0].length){
          this.canElList[this.canElList.length - 1].perType = 'man';
          this.active.perType = 'man';
          // 替换图片中的头部
          let newIndex = this.imgListArr.indexOf(this.convertSrc(this.materialList[this.materialList.length-2][0]));
          let newOImg = this.imgList[newIndex];
          this.canElList[this.canElList.length-1].e = newOImg;
          this.active.e = newOImg;
          // 设置默认头发
          this.changeCharacterType(0,'man');
          this.setCharacterImg({target:{src: this.materialList[this.typeList.length + this.thingsTypeList.length - 2][8] }})
          // 设置默认衣服
          this.changeCharacterType(3,'man');
          this.setCharacterImg({target:{src: this.materialList[this.typeList.length + this.thingsTypeList.length - 2 + 3][1] }})
          this.changeCharacterType(0,'man');
        }
        // 如果选中的是女的(假设第二个是女的)
        if(index == this.materialList[0].length + 1 ){
          this.canElList[this.canElList.length - 1].perType = 'woman';
          this.active.perType = 'woman';
          // 替换图片中的头部
          let newIndex = this.imgListArr.indexOf(this.convertSrc(this.materialList[this.materialList.length-2][1]));
          let newOImg = this.imgList[newIndex];
          this.canElList[this.canElList.length-1].e = newOImg;
          this.active.e = newOImg;
          // 设置默认头发
          this.changeCharacterType(0,'woman');
          this.setCharacterImg({target:{src: this.materialList[this.typeList.length + this.thingsTypeList.length + this.characterManTypeList.length - 2][4] }})
          // 设置默认衣服
          this.changeCharacterType(2,'woman');
          this.setCharacterImg({target:{src: this.materialList[this.typeList.length + this.thingsTypeList.length + this.characterManTypeList.length - 2 + 2][1] }})
          this.changeCharacterType(0,'woman');
        }
      }
      this.setCanvas(true);
    },
    setCharacterImg(ev){
      let index = this.imgListArr.indexOf(this.convertSrc(ev.target.src));
      let oImg = this.imgList[index];
      let oImgDetail = this.imgListDetailArr[index];
      let characterElI = this.getCharacterElI(this.active.i);
      if(characterElI === -1){
        this.canCharacterElList.push({i:this.active.i})
        characterElI = this.canCharacterElList.length - 1 ;
      }
      let width = this.canElList[this.active.i].w;
      let height = width / oImgDetail.width * oImgDetail.height;
      this.canCharacterElList[characterElI][ this.characterTypeList[this.showCharacterType].name ] = { 
        e: oImg, x: this.active.x, y: this.active.y, w: width, h: height }
      this.setCanvas(true);
    },
    start(ev) {
      var x = ev.changedTouches[0].clientX;
      var y = ev.changedTouches[0].clientY;
      this.showDecorate = false;//消去人物装饰选择
      // 循环，寻找符合的元素
      // 删除按钮
      let t = this.delEl;
      if(t.x && x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h){
        this.canElList.splice(t.i, 1);
        let characterElI = this.getCharacterElI(this.active.i);
        if(characterElI > -1){
          this.canCharacterElList.splice(characterElI, 1);
        }
        this.active = {};
        this.setCanvas();
        return;
      }
      this.active = {};
      // 设置大小按钮
      let s = this.resetEl;
      if(s.x && x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h){
        this.isReseting = true;
        this.active = this.canElList[s.i];
        this.active.i = s.i;
        // 如果设置大小的是主角
        let imgListIndex = this.imgListArr.indexOf(this.convertSrc(this.canElList[s.i].e.src));
        if(imgListIndex >= this.materialList[0].length && imgListIndex < this.materialList[0].length + this.materialList[1].length){
          this.showDecorate = true;
        }
        return;
      }else{
        this.isReseting = false;
      }
      // 设置颜色
      for(let i = 0 ; i<this.setCol.length;i++){
        let c = this.setCol[i];
        if(c.x && x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h){
          this.canElList[c.i].color = c.color;
          this.active = this.canElList[c.i];
          this.active.i = c.i;
          this.setCanvas();
          return;
        }
      }
      // 图片中心
      for(let i = this.canElList.length - 1 , len = this.canElList.length ; i >= 0 ; i--){
        let temp = this.canElList[i];
        if(x < temp.x || x > temp.x + temp.w || y < temp.y || y > temp.y + temp.h){ continue; }
        // 如果选中的是主角
        if(this.canElList[i].e.src && this.canElList[i].perType){
          this.changeType(1,false);
          this.changeCharacterType(0,this.canElList[i].perType);
        }
        //装饰序号对应修改
        for(let chaI = 0 ,chaLen = this.canCharacterElList.length ; chaI < chaLen ; chaI++){
          if(this.canCharacterElList[chaI].i == i){
            this.canCharacterElList[chaI].i = this.canElList.length - 1;
          }else if(this.canCharacterElList[chaI].i > i){
            this.canCharacterElList[chaI].i -- ;
          }
        }
        // 如果选中的是文字
        if(temp.color){
          this.active = { i: this.canElList.length - 1, x, y, e: temp.e, color:'#000', w:temp.w ,h:temp.h };
        }else{
          this.active = { i: this.canElList.length - 1, x, y, e: temp.e };
        }
        //canElList放到最后
        let _temp = this.canElList.splice(i, 1);
        this.canElList.push(_temp[0]);
        this.canElList[this.canElList.length-1].perType? this.active.perType = this.canElList[this.canElList.length-1].perType : '';
        return;
      }
      this.setCanvas();
    },
    move(ev) {
      if(this.isReseting){
        this.setSizse(ev);
        return;
      }
      let a = this.active;
      if(!a.e){ return; }
      let x = ev.changedTouches[0].clientX;
      let y = ev.changedTouches[0].clientY;
      let now = this.canElList[a.i];
      let dX = now.x + (a.x - x) * -1;
      // console.log('now.x='+now.x+', a.x='+a.x+', x='+x+', dx='+dX)
      let dY = now.y + (a.y - y) * -1;
      this.canElList[a.i] = Object.assign({}, now, { x: dX, y: dY });
      //装饰移动
      let characterElI = this.getCharacterElI(a.i);
      if(characterElI > -1){
        for(let i = 0,len = this.characterTypeList.length; i<len; i++){
          let nowCha = this.canCharacterElList[characterElI][ this.characterTypeList[i].name ];
          if(nowCha){
            let cdX = nowCha.x + (a.x - x) * -1;
            let cdY = nowCha.y + (a.y - y) * -1;
            this.canCharacterElList[characterElI][ this.characterTypeList[i].name ] = Object.assign({}, nowCha, { x: cdX, y: cdY });
          }
        }
      }
      this.active.x = x;
      this.active.y = y;
      this.setCanvas(true);
    },
    setSizse(ev){
      let a = this.active;
      if(!a.e){ return; }
      let x = ev.changedTouches[0].clientX;
      let y = ev.changedTouches[0].clientY;
      let now = this.canElList[a.i];
      let dw = (x - now.x)>50?(x - now.x):50;
      let dh = dw/now.w * now.h;
      this.canElList[a.i] = Object.assign({}, now, { w: dw, h: dh });
      // 文字设置大小
      if(a.color){
        let now = this.canElList[a.i];
        this.canElList[a.i] = Object.assign({}, now, { s:dw });
        this.active.s = dw/2;
      }
      // 装饰设置大小
      let characterElI = this.getCharacterElI(a.i);
      if(characterElI > -1){
        for(let i = 0,len = this.characterTypeList.length; i<len; i++){
          let nowCha = this.canCharacterElList[characterElI][ this.characterTypeList[i].name ];
          if(nowCha){
            let cdw = dw/now.w * nowCha.w;
            let cdh = dw/now.w * nowCha.h;
            this.canCharacterElList[characterElI][ this.characterTypeList[i].name ] = Object.assign({}, nowCha, { w: cdw, h: cdh });
          }
        }
      }
      this.active.w = x;
      this.active.h = y;
      this.setCanvas(true);
    },
    end(ev) {
      let a = this.active;
      if(!a.e){ return; }
      // 如果是设置了大小
      if(this.isReseting){
        this.setSizse(ev);
        // this.active = {};
        return;
      }
      // 如果是这是颜色
      if(a.color){
        this.setCanvas(true);
        return;
      }
      let x = ev.changedTouches[0].clientX;
      let y = ev.changedTouches[0].clientY;
      let now = this.canElList[a.i];
      let dX = now.x + (a.x - x) * -1;
      // console.log('now.x='+now.x+', a.x='+a.x+', x='+x+', dx='+dX)
      let dY = now.y + (a.y - y)*-1;
      this.canElList[a.i] = Object.assign({}, now, { x: dX, y: dY });
      //装饰移动
      let characterElI = this.getCharacterElI(a.i);
      if(characterElI > -1){
        for(let i = 0,len = this.characterTypeList.length; i<len; i++){
          let nowCha = this.canCharacterElList[characterElI][ this.characterTypeList[i].name ];
          if(nowCha){
            let cdX = nowCha.x + (a.x - x)*-1;
            let cdY = nowCha.y + (a.y - y)*-1;
            this.canCharacterElList[characterElI][ this.characterTypeList[i].name ] = Object.assign({}, nowCha, { x: cdX, y: cdY });
          }
        }
      }
      this.active.x = dX;
      this.active.y = dY;
      this.setCanvas(true);
      // this.active = {};
      
      // this.setCanvas();
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      // this.ctx.drawImage(this.bgImg, 0, 0 , this.canvas.width, this.canvas.height-100*this.ratio);
      let index = this.imgListArr.indexOf(this.convertSrc(this.bgImg.src));
      let oImgDetail = this.imgListDetailArr[index];
      let width = this.canvas.width;
      let height = width/oImgDetail.width * oImgDetail.height;
      let x = 0;
      let y = (this.canvas.height-100/16*this.baseFontSize*this.ratio - height)/2;
      if(y>2){
        height = this.canvas.height-100/16*this.baseFontSize*this.ratio;
        width = height/oImgDetail.height * oImgDetail.width;
        x = (this.canvas.width - width)/2;
        y = 0;
      }
      this.ctx.drawImage(this.bgImg, x, y , width, height);
    },
    saveCanvas() {
      this.setCanvas();
      let imgSrc = this.canvas.toDataURL("image/jpeg", 1);
      this.imgSrc = imgSrc;
      weui.toast("长按保存", 1000);
      this.isSaved = true;
    },
    backToEdit(){
      this.isSaved = false;
    },
    setCanvas(flag) {
      this.clearCanvas();
      let a = this.active;
      let arr = this.canElList;
      for(let i = 0 , len = arr.length ; i < len ; i++){
        let temp = arr[i];
        if(temp.color){
          // 文字
          this.ctx.fillStyle = temp.color;
          this.ctx.font = temp.s + 'px' + ' iconfont';
          this.ctx.fillText(temp.e,temp.x,temp.y + temp.s);
        }else{
          // 图片
          let lastTemp = temp;
          this.ctx.drawImage(lastTemp.e, lastTemp.x * this.ratio, lastTemp.y * this.ratio, lastTemp.w * this.ratio, lastTemp.h * this.ratio);
          for(let chaI = 0,chaLen = this.canCharacterElList.length ; chaI < chaLen ; chaI++){
            if(this.canCharacterElList[chaI].i !== i){continue;}
            let tempBody = this.canCharacterElList[chaI].body;
            let tempHear = this.canCharacterElList[chaI].hear;
            let tempMustache = this.canCharacterElList[chaI].mustache;
            let tempGlasses = this.canCharacterElList[chaI].glasses;
            temp = tempBody;
            temp ? this.ctx.drawImage(temp.e, temp.x * this.ratio, temp.y * this.ratio, temp.w * this.ratio, temp.h * this.ratio) :'';
            this.ctx.drawImage(lastTemp.e, lastTemp.x * this.ratio, lastTemp.y * this.ratio, lastTemp.w * this.ratio, lastTemp.h * this.ratio);
            temp = tempMustache;
            temp ? this.ctx.drawImage(temp.e, temp.x * this.ratio, temp.y * this.ratio, temp.w * this.ratio, temp.h * this.ratio):'';
            let temp = tempHear;
            temp ? this.ctx.drawImage(temp.e, temp.x * this.ratio, temp.y * this.ratio, temp.w * this.ratio, temp.h * this.ratio) :'';
            temp = tempGlasses;
            temp ? this.ctx.drawImage(temp.e, temp.x * this.ratio, temp.y * this.ratio, temp.w * this.ratio, temp.h * this.ratio) :'';
          }
        }
      }
      if(flag && a && a.e){
        let el = this.canElList[a.i];
        // 删除的按钮
        let t = this.delEl = {
          t: this.imgList[this.imgList.length - 2],
          i: a.i,
          x: el.x - 15,
          y: el.y + el.h -5,
          w: 20,
          h: 20
        };
        // 修改大小的按钮
        let s = this.resetEl = {
          t: this.imgList[this.imgList.length - 1],
          i: a.i,
          x: el.x + el.w - 5,
          y: el.y -15,
          w: 20,
          h: 20
        };
        // 设置颜色按钮
        this.setCol = [];
        if(a.color){
          for(let colI = 0,colLen = this.textColorList.length; colI < colLen; colI++){
            let c = {
              color: this.textColorList[colI],
              i: a.i,
              x: el.x + el.w + 10,
              y: el.y + 5 + colI*24,
              w: 20,
              h: 20
            }
            this.setCol.push(c);
          }
        }
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = "#fff";
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(el.x - 5, el.y - 5, el.w + 10, el.h + 10);
        this.ctx.drawImage(t.t, t.x * this.ratio, t.y * this.ratio, t.w * this.ratio, t.h * this.ratio);
        this.ctx.drawImage(s.t, s.x * this.ratio, s.y * this.ratio, s.w * this.ratio, s.h * this.ratio);
        if(a.color){
          for(let i=0;i<this.setCol.length;i++){
            this.ctx.fillStyle = this.setCol[i].color;
            this.ctx.fillRect(this.setCol[i].x, this.setCol[i].y, this.setCol[i].w, this.setCol[i].h);
            this.ctx.strokeRect(this.setCol[i].x, this.setCol[i].y, this.setCol[i].w + 1, this.setCol[i].h + 1);
          }
        }
      }
      // 画底部的二维码
      let bottomTemp = this.imgList[this.imgList.length - 4];
      let bottomX = 0;
      let bottomY = this.canvas.height - 100/16*this.baseFontSize*this.ratio;
      let bottomW = this.canvas.width;
      let bottomH = 100/16*this.baseFontSize*this.ratio;
      this.ctx.drawImage(bottomTemp, bottomX, bottomY, bottomW, bottomH);
    },
    getCanvas() {
      const that = this;
      let _context = that.canvas = document.querySelector("canvas");
      _context.width = _context.clientWidth;
      _context.height = _context.clientHeight;
      let _ctx = that.ctx = _context.getContext("2d");
      // polyfill 提供了这个方法用来获取设备的 pixel ratio
      let getPixelRatio = function(context) {
        let backingStore = context.backingStorePixelRatio ||
          context.webkitBackingStorePixelRatio ||
          context.mozBackingStorePixelRatio ||
          context.msBackingStorePixelRatio ||
          context.oBackingStorePixelRatio ||
          context.backingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStore;
      };
      this.ratio = getPixelRatio(that.ctx);
      that.ctx.save();
    },
    changeType(id = 0,isSetShowSel = true) {
      this.activeList = this.materialList[id];
      this.showType = id;
      isSetShowSel ? this.isShowSel = true : '';
      this.showDecorate = false;
      if(id == 2){
        this.changeThingsType();
      }
    },
    changeCharacterType(id = 0,type){
      // 如果是男的
      if(type === 'man'){
        this.characterTypeList = this.characterManTypeList;
        this.characterDecorateList = this.materialList[this.typeList.length + this.thingsTypeList.length - 1  + id - 1];
      }else if(type === 'woman'){
        this.characterTypeList = this.characterWomanTypeList;
        this.characterDecorateList = this.materialList[this.typeList.length + this.thingsTypeList.length  + this.characterManTypeList.length + id - 2];
      }
      this.showCharacterType = id;
      this.showDecorate = true;
    },
    changeThingsType(id=1){
      this.thingsList = this.materialList[2 + id];
      this.showThingsType = id;
    },
    // 预加载图片
    preLoadImg() {
      var standardWidth = 1080;
      var totalWidth = document.body.scrollWidth;
      var scale = totalWidth / standardWidth;
      let arr = this.materialList;
      let _arr = [];
      let __arr = [];
      let materialListDetail = [];
      let index = 0;
      let length = 0;
      for(let i = 0 , len = arr.length ; i < len ; i++){
        let temp = arr[i];
        for(let j = 0 , _len = temp.length ; j < _len ; j++){
          length++;
          __arr.push(temp[j]);
          materialListDetail.push({
            url: temp[j]
          })
          let newImage = new Image();
          newImage.crossOrigin = "anonymous";
          newImage.onload = () => { 
            index++; 
            for(let q = 0 ,detailLen = materialListDetail.length ; q < detailLen ; q++){
              if(materialListDetail[q].url === newImage.dataSrc){
                materialListDetail[q].width = Number((newImage.width * scale).toFixed(0));
                materialListDetail[q].height = Number((newImage.height * scale).toFixed(0));
              }
            }
          }
          newImage.onerror = () => { 
            index++; 
          }
          newImage.src = temp[j];
          newImage.dataSrc = temp[j];
          _arr.push(newImage);
        }
      }
      this.imgList = _arr;
      this.imgListArr = __arr;
      this.imgListDetailArr = materialListDetail;
      this.preLoadLen = length;
      let time = setInterval(() => {
        this.preLoadIndex = index;
        if(index == length){
          clearInterval(time);
          this.isReady = 'allReady';
          console.log("ok");
          this.bgImg = this.imgList[0];
          return;
        }
      }, 50);
    },
    checkEl() {
      console.log('checkEl-star');
      const that = this;
      let time = setInterval(() => {
        let el = document.querySelector("#milk");
        if(el && this.isReady === 'allReady'){
          console.log('checkEl-end');
          that.getCanvas();
          that.setCanvas();
          clearInterval(time);
        }
      }, 100);
    },
    isClearCanvas(){
      let that = this;
      weui.confirm('您确认要清空所有搭配？',function(){
        //点击确认
          that.clearAllCanvas();
      })
    },
    clearAllCanvas() {
      this.clearCanvas();
      this.canElList = [];
      this.canCharacterElList = [];
    },
    isBodyDecorate(decorate){
      return decorate.indexOf('body')>-1 ? true : false;
    }
  }
};
</script>

<style>
  #app, #app > .route{ background: none; }
</style>