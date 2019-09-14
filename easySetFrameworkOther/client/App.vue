<template>
  <div>
    <div>
      <div id="topTip" @click="topOption()"></div>
      <div id="pageSide" class="">
        <transition-group
          tag="ul"
          class="submenu"
          v-on:before-enter="beforeEnter"
          v-on:enter="enter"
          v-on:leave="leave"
          >

          <li
              v-for="(item, index) in computedList"
              v-bind:key="item.itemid"
              v-bind:data-index="index"
              
          ><a v-on:click="setSelect(item.father,item.name,item.url)">{{ item.name }}</a></li>
        </transition-group>
      </div>
      <div>
        <router-view></router-view>
      </div>
      <button v-on:click="goSendJson()">a</button>
    </div>
  </div>
  
</template>

<script>
import axios from "axios"
import  Velocity from 'velocity-animate'
import router from '../client/router'
import helloworld from '../client/components/HelloWorld'

export default {
  name: 'App',
  components: {
    
  },
  data(){
    return {
      topState:false,
      item:'',
      select:'',
      list:[
        {
        itemid:1,
        name:"1",
        father:"0",
        level:1,
        url:"setJson"
        },
        {
        itemid:2,
        name:"2",
        father:"0",
        level:1,
        url:"javascript:;"
        },
        {
        itemid:3,
        name:"3",
        father:"0",
        level:1,
        url:"javascript:;"
        },
        {
        itemid:4,
        name:"123",
        father:"1",
        level:1,
        url:"setJson"
        },
        {
        itemid:5,
        name:"456",
        father:"1",
        level:1,
        url:"javascript:;"
        },
        {
        itemid:6,
        name:"789",
        father:"2",
        level:1,
        url:"javascript:;"
        },
        {
        itemid:7,
        name:"跳转N页面",
        father:"3",
        level:1,
        url:"testShow"
        },
      ]
    }
  },
  mounted:function(){

  },
  computed:{
    getChange:function(){
      console.log(this.$refs.page.select)
      return this.$refs.page.select;
    },
    computedList:function(){
      // console.log(this.$store.commit('newNum',6))
      // console.log(this.$store.state.showFooter)
      // this.$store.dispatch('getNewNum',6)
      //  console.log(this.$store.state.changableNum)
      // console.log(this.$store.getters.isShow)
      
      var vm = this
      var revisedList = [];
      var fatherid=0;
      var fatherList = [];
        
      // console.log(document.styleSheets)

      if(this.list.length>0){
        for(var i=0;i<this.list.length;i++){
          if(this.list[i].father==0){
            fatherList[fatherid] = this.list[i];
            fatherid++;
          }
        }
      }

      for(var j=0;j<fatherList.length;j++){
        revisedList.push(fatherList[j])
        for(var i=0;i<this.list.length;i++){
          if(this.list[i].father==fatherList[j].name){
            revisedList.push(this.list[i])
          }
        }
      }

      this.list = revisedList;
        
      return this.list.filter(function(item){
        if(item.father==0||item.father==vm.select){
          return true;
        }else{
          return false;
        }
      })
    }
  },
  methods:{
    goSendJson(){
      var data ={};
      axios.post("test").then(function(response){
        console.log(response.data.data)
      })
    },
    topOption(){
      var topTip = document.getElementById("topTip")
      this.show(this.topState);
      if(this.topState){
        topTip.className="topTipClose"
        this.topState = false;
      }else{
        topTip.className="topTipOpen"
        this.topState = true;
      }
    },
    beforeEnter: function(el){
      el.style.opacity = 0
      el.style.height = '0px'
    },
    enter: function(el,done){
      var delay = el.dataset.index * 150
      setTimeout(function(){
        Velocity(
          el,
          {opacity:1,height:'43px',backgroundColor:'#ABABAB'},
          {complete:done}
        )
      },delay)
    },
    leave:function(el,done){
      var delay = el.dataset.index*150
      setTimeout(function(){
        Velocity(
          el,
          {opacity:0,height:0},
          {complete:done}
        )
      },delay)
    },
    setSelect:function(father,name,url){
    // router.push({path:'/sendJson'})
      if(father==0){
        if(name==this.select){
          this.select=''
        }else{
          this.select= name;
        }

        
      }
      if(father!=0){
        router.push({path:'/'+url});
      }
    },
    show(pageShow){
      var pageside = document.getElementById("pageSide")
      if(pageShow){
        pageside.className="pageClose"
      }else{
        pageside.className="pageOpen"
      }
    },
    getSelect:function(){
      return this.select
    }
  }
}

var topState = false;
var topTip = document.getElementById('topTip');
</script>

<style>
#topTip{
  position:absolute;
  width: 150px;
  height: 100px;
  margin: auto;
  top:-67px;
  background-color: black;
  box-shadow: 0px 0px 10px #888888;
  transform:translate(200px,0px) rotate(45deg);
  -moz-transform:translate(200px,0px) rotate(45deg);
  -webkit-transform:translate(200px,0px) rotate(45deg);
  z-index: 1;
}

.topTipOpen{
  animation:openToptip 1s;
  animation-fill-mode : forwards;
}
.topTipClose{
  animation:closeToptip 1s;
  animation-fill-mode : forwards;
}

@keyframes openToptip {
  from { 
      transform: translate(200px,0px) rotate(45deg) ;
      -moz-transform: translate(200px,0px) rotate(45deg) ;
      -webkit-transform: translate(200px,0px) rotate(45deg) ;
  }
  to {
      transform: translate(200px,15px) rotate(35deg); 
      -moz-transform: translate(200px,15px) rotate(35deg);
      -webkit-transform: translate(200px,15px) rotate(35deg);
  }
}

@keyframes closeToptip {
  from { 
      transform: translate(200px,15px) rotate(35deg); 
      -moz-transform: translate(200px,15px) rotate(35deg);
      -webkit-transform: translate(200px,15px) rotate(35deg);
  }
  to {
      transform: translate(200px,0px) rotate(45deg) ;
      -moz-transform: translate(200px,0px) rotate(45deg) ;
      -webkit-transform: translate(200px,0px) rotate(45deg) ;
  }
}

.pageHeader{
    z-index: 1000;
    height: 60px;
    background-color: #23262E;
}
#pageSide{
    position: fixed;
    left: 0;
    top: 0px;
    bottom: 0;
    width: 300px;
    box-shadow: 0px 0px 20px #888888;
    overflow-x: hidden;
    background-color: #BABABA;
    transform:translate(0px,-1000px);
    -moz-transform:translate(0px,-1000px);
    -webkit-transform: translate(0px,-1000px);
}
.pageFooter{
    position: fixed;
    left: 200px;
    right: 0;
    bottom: 0;
    height: 44px;
    line-height: 44px;
    padding: 0 15px;
    background-color: #eee;
}
.submenu {   
    position: fixed;
    background: #838383;
    top:60px;
    width:300px;
    left: -40px;
    font-size: 15px;
}

.submenu li {
    border-bottom: 1px solid #BABABA;
    list-style: none;
}

.submenu a {
    display: block;
    text-decoration: none;
    color: #d9d9d9;
    padding: 12px;
    padding-left: 42px;
    -webkit-transition: all 0.25s ease;
    -o-transition: all 0.25s ease;
    transition: all 0.25s ease;
}

.submenu a:hover {
    background: #575757;
    color: #FFF;
}

.pageOpen{
    animation:openPage 1s;
    animation-fill-mode : forwards;
}

.pageClose{
    animation:closePage 1s;
    animation-fill-mode : forwards;
}

@keyframes openPage{
    from {
        transform:translate(0px,-1000px);
        -moz-transform:translate(0px,-1000px);
        -webkit-transform: translate(0px,-1000px);
    }
    to {
        transform:translate(0px,0px);
        -moz-transform:translate(0px,0px);
        -webkit-transform: translate(0px,0px);
    }
}

@keyframes closePage{
    from {
        transform:translate(0px,0px);
        -moz-transform:translate(0px,0px);
        -webkit-transform: translate(0px,0px);
        
    }
    to {
        transform:translate(0px,-1000px);
        -moz-transform:translate(0px,-1000px);
        -webkit-transform: translate(0px,-1000px);
    }
}
</style>
