<template>
    <div>
        <div id="testd3" @mousedown="dMouseDown($event)" @mouseup="dMouseUp($event)">
            <svg id="svg"></svg>
        </div>
        <input type="hidden" id="pointX"/>
        <input type="hidden" id="pointY"/>
        <input type="text" id="pointName"/>
        <button v-on:click="updatePoint()">修改</button>
        <form id="lineProperty">
            <label>连线框</label>
            <input type="hidden" id="linex1"/>
            <input type="hidden" id="linex2"/>
            <input type="hidden" id="liney1"/>
            <input type="hidden" id="liney2"/>
            <input type="hidden" id="beforeLineName"/>
            <input type="text" id="lineName"/>
            
        </form>
        <button v-on:click="updateLineName()">修改</button>
        <button v-on:click="deleteLine()">删除该线段</button>
        <button v-on:click="getPoint()">获取点测试</button>
        <button v-on:click="getPositinoInfo()">测试按钮</button>
    </div>
</template>

<script>
import * as d3 from 'd3';
import axios from "axios"

export default {
    name:'testd3',
    data(){
        return{
            max_x:900,
            max_y:900,
            jsonPoint:[{"x":100,"y":100,name:"1","lineslist":"A,D"},
                {"x":200,"y":400,name:"2","lineslist":"F"},
                {"x":400,"y":200,name:"3","lineslist":"B,D,F"},
                {"x":500,"y":100,name:"4","lineslist":"C"},
                {"x":900,"y":600,name:"5","lineslist":"A,B,C"}],
            startPoint:null,
            firstExist:null,
            firstPoint:null,
            jsonline:[],
            previousPoint:null,
            previousLine:null,
            trajectory:[]
        }
    },
    mounted(){
        
        this.svgContainer()
        this.createLine();
        this.reDraw();
    },
    methods:{
        svgContainer:function(){
            var svg = d3.select("#testd3").select("#svg")
                                          .attr("width",this.max_x)
                                          .attr("height",this.max_y)
            return svg
        },
        setPoint:function(x,y){
            var newPoint = this.svgContainer()
            .append("circle")
                        .attr("cx",x)
                        .attr("cy",y)
                        .attr("r",5)
                        .style("fill","black")
                        .on("mouseover", function(d) {
                            d3.select(this).style("stroke", "orange");
                        })
                        .on("mouseout", function(d) {
                            d3.select(this).style("stroke", "#CCC");
                        })
                        .on("click",function(d){
                            document.getElementById("pointX").value = d.x;
                            document.getElementById("pointY").value = d.y;
                            document.getElementById("pointName").value = d.name;
                        })
                
            return newPoint;
        },
        createLine(){
            //通过点和点上的随机数标记来做连线
            for (var i = 0;i<this.jsonPoint.length;i++){
                for(var j=0;j<this.jsonPoint.length;j++){
                    if(i!=j){
                        var first = this.jsonPoint[i].lineslist.split(",");
                        var second = this.jsonPoint[j].lineslist.split(",");
                        var allow = 0;
                        for(var one = 0;one<first.length;one++){
                            for(var two = 0;two<second.length;two++){
                                if(first[one]==second[two]){
                                    allow=1;
                                }
                            }
                        }
                        if(allow!=0&&this.jsonPoint[i].x<this.jsonPoint[j].x){
                            var name = null;
                            var namelist1 = this.jsonPoint[i].lineslist.split(",");
                            var namelist2 = this.jsonPoint[j].lineslist.split(",");
                            for(var n = 0;n<namelist1.length;n++){
                                for(var m=0;m<namelist2.length;m++){
                                    if(namelist1[n]==namelist2[m]){
                                        name = namelist1[n];
                                    }
                                }
                            }
                            
                            this.jsonline.push({"x1":this.jsonPoint[i].x,"y1":this.jsonPoint[i].y,"x2":this.jsonPoint[j].x,"y2":this.jsonPoint[j].y,linename:name})
                        }
                    }
                }
            }
        },
        //绘制直线
        line:function(){
            var _this = this;
            
            for(var i=0;i<_this.jsonline.length;i++){
                var line = _this.svgContainer().append("line")
                                .attr("x1",_this.jsonline[i].x1)
                                .attr("y1",_this.jsonline[i].y1)
                                .attr("x2",_this.jsonline[i].x2)
                                .attr("y2",_this.jsonline[i].y2)
                                .attr("stroke","black")
                                .attr("stroke-width",2)
                                .on("mouseover", function(d) {
                                    d3.select(this).style("stroke-width", 5);
                                })
                                .on("mouseout", function(d) {
                                    d3.select(this).style("stroke-width", 2);
                                })
            }

        },
        setPointText(){
            var edges_text = this.svgContainer().selectAll("text")
                                        .data(this.jsonPoint)
                                        .enter()
                                        .append("text")
                                        .attr("x",function(d){return d.x;})
                                        .attr("y",function(d){return d.y;})
                                        .attr("dx",0)
                                        .attr("dy",-5)
                                        .style("-webkit-user-select","none")
                                        .style("-moz-user-select","none")
                                        .style("-ms-user-select","none")
                                        .style("user-select","none")
                                        .text(function(d){return d.name})

            var point = this.svgContainer().selectAll("circle")
                                .data(this.jsonPoint)
                                .enter()
                                .append("circle");

            var pointAttributes =   point.attr("cx",function(d){return d.x})
                                        .attr("cy",function(d){return d.y})
                                        .attr("r",5)
                                        .style("fill","black")
                                        .on("mouseover", function(d) {
                                            d3.select(this).style("stroke", "orange");
                                        })
                                        .on("mouseout", function(d) {
                                            d3.select(this).style("stroke", "#CCC");
                                        })
                                        .on("click",function(d){
                                            document.getElementById("pointX").value = d.x;
                                            document.getElementById("pointY").value = d.y;
                                            document.getElementById("pointName").value = d.name;
                                        })
        },
         //判断直线中间的线
        checkInLine:function(lx,ly){
            var thisline = null;

            // 旧版距离公式
            // for(var i=0;i<jsonline.length;i++){
            //     var y = -(jsonline[i].x2-jsonline[i].x1)/(jsonline[i].y2-jsonline[i].y1);
            //     var x = 1;
            //     var c = -1*(jsonline[i].x1+y*jsonline[i].y1)
            //     var distance = (lx+ly*y+c)/Math.sqrt(1+y*y);

            //     if(distance<0){
            //         distance = -distance;
            //     }

            //     if(distance<4){
            //         thisline = jsonline[i];
            //     }
            // }

            for(var i=0;i<this.jsonline.length;i++){
                var l = 0;

                var cross = (this.jsonline[i].x2-this.jsonline[i].x1)*(lx-this.jsonline[i].x1)+(this.jsonline[i].y2-this.jsonline[i].y1)*(ly-this.jsonline[i].y1)
                
                var d2 = (this.jsonline[i].x2-this.jsonline[i].x1)*(this.jsonline[i].x2-this.jsonline[i].x1)+(this.jsonline[i].y2-this.jsonline[i].y1)*(this.jsonline[i].y2-this.jsonline[i].y1)
                

                var r = cross/d2;
                var px = this.jsonline[i].x1 + (this.jsonline[i].x2-this.jsonline[i].x1) * r
                var py = this.jsonline[i].y1 + (this.jsonline[i].y2-this.jsonline[i].y1) * r
                
                if(cross <= 0){
                    l=Math.sqrt(cross)
                } 
                else if(cross >= d2){
                    l=Math.sqrt(d2)
                } 
                else {
                    l=Math.sqrt((lx-px)*(lx-px)+(py-ly)*(py-ly))
                }
                

                if(l<4){
                    thisline = this.jsonline[i];
                }
            }
            return thisline;
        },
        //获得中间点的数据
        getInLine:function(lx,ly){
            var linepoint = null;

            // 旧版距离公式
            // for(var i=0;i<jsonline.length;i++){
            //     var y = -(jsonline[i].x2-jsonline[i].x1)/(jsonline[i].y2-jsonline[i].y1);
            //     var x = 1;
            //     var c = -1*(jsonline[i].x1+y*jsonline[i].y1)
            //     var distance = (lx+ly*y+c)/Math.sqrt(1+y*y);

            //     if(distance<0){
            //         distance = -distance;
            //     }
            //     if(distance<4){
            //         linepoint = {"x":lx,"y":(lx+c)/(-y)};
            //     }       
            // }

            for(var i=0;i<this.jsonline.length;i++){
                var l = 0;
                
                var y = -(this.jsonline[i].x2-this.jsonline[i].x1)/(this.jsonline[i].y2-this.jsonline[i].y1);
                var x = 1;
                var c = -1*(this.jsonline[i].x1+y*this.jsonline[i].y1)

                var cross = (this.jsonline[i].x2-this.jsonline[i].x1)*(lx-this.jsonline[i].x1)+(this.jsonline[i].y2-this.jsonline[i].y1)*(ly-this.jsonline[i].y1)
                
                var d2 = (this.jsonline[i].x2-this.jsonline[i].x1)*(this.jsonline[i].x2-this.jsonline[i].x1)+(this.jsonline[i].y2-this.jsonline[i].y1)*(this.jsonline[i].y2-this.jsonline[i].y1)

                var r = cross/d2;
                var px = this.jsonline[i].x1 + (this.jsonline[i].x2-this.jsonline[i].x1) * r
                var py = this.jsonline[i].y1 + (this.jsonline[i].y2-this.jsonline[i].y1) * r
                

                if(cross <= 0){
                    l=Math.sqrt(cross)
                } 
                else if(cross >= d2){
                    l=Math.sqrt(d2)
                } 
                else {
                    l=Math.sqrt((lx-px)*(lx-px)+(py-ly)*(py-ly))
                }

                if(l<4){
                    linepoint = {"x":lx,"y":(lx+c)/(-y)};
                }
            }

            return linepoint; 
        },
        
        //随机数生成
        rollNumber:function(){
            return Math.random().toString(36).substr(2);
        },
        //重新绘制连线方法1
        reDraw:function(){
            document.querySelector('svg').innerHTML = ''

            this.setPointText();
            this.line();
        },
        //更新点信息
        updatePoint:function(){
            console.log(document.getElementById("pointX"))
            var newX=document.getElementById("pointX").value;
            var newY=document.getElementById("pointY").value;
            var newName=document.getElementById("pointName").value;
            for(var i=0;i<this.jsonPoint.length;i++){
                if(this.jsonPoint[i].name==newName){
                    alert("修改名称存在重名");
                    return false;
                }
            }
            for(var i=0;i<this.jsonPoint.length;i++){
                if(this.jsonPoint[i].x==newX&&this.jsonPoint[i].y==newY){
                    this.jsonPoint[i].name=newName;
                }
            }

            this.reDraw();
        },
        //更新线的名称
        updateLineName:function(){
            var beforeLineName = document.getElementById("beforeLineName").value;
            var lineName = document.getElementById("lineName").value;
            for(var i=0;i<this.jsonline.length;i++){
                if(lineName==this.jsonline[i].linename){
                    alert("修改名称存在重名");
                    return false;
                }
            }
            for(var i=0;i<this.jsonline.length;i++){
                if(beforeLineName==this.jsonline[i].linename){
                    this.jsonline[i].linename=lineName;
                }
            }

            this.reDraw();
        },
        //删除连线(存在问题，如果点还有其他连线点依旧被删除了，如果是中断点的线段被删除之后，线段中间点消失，线段依旧处于分成两段的情况)
        delLine:function(lx1,ly1,lx2,ly2){
            var lineName ="";
            for(var i=0;i<this.jsonline.length;i++){
                if((this.jsonline[i].x1==lx1&&this.jsonline[i].x2==lx2&&this.jsonline[i].y1==ly1&&this.jsonline[i].y2==ly2)||(this.jsonline[i].x1==lx2&&this.jsonline[i].x2==lx1&&this.jsonline[i].y1==ly2&&this.jsonline[i].y2==ly1)){
                    lineName = this.jsonline[i].linename;
                    this.jsonline.splice(i,1);
                    
                }
            }

            var pointDelLine = [];
            for(var i=0;i<this.jsonPoint.length;i++){
                var namelist = this.jsonPoint[i].lineslist.split(",");
                var newlist = "";
                for(var j=0;j<namelist.length;j++){
                    if(namelist[j]!=lineName){
                        if(newlist!=""){
                            newlist=newlist+","
                        }
                        newlist=newlist+namelist[j];
                    }
                }
                
                this.jsonPoint[i].lineslist = newlist;
                if(newlist==""){
                    pointDelLine.push(i);
                }
            }

            pointDelLine.sort(function (m, n){
                                if (m < n) return 1
                                else if (m > n) return -1
                                else return 0
                                });

            for(var i=0;i<pointDelLine.length;i++){
                this.jsonPoint.splice(pointDelLine[i],1)
            }
            


            //删除全部连线并重新连线
            this.reDraw();
        },
        deleteLine:function(){
            var linex1 = document.getElementById("linex1").value;
            var linex2 = document.getElementById("linex2").value;
            var liney1 = document.getElementById("liney1").value;
            var liney2 = document.getElementById("liney2").value;
            this.delLine(linex1,liney1,linex2,liney2);
            document.getElementById("lineProperty").reset();
            
        },
        dMouseDown:function(event){
            var _this = this;
            var event = event||window.event;
            var _target = event.target;
            var startX = event.clientX;
            var startY = event.clientY;
            var sb_bkx = event.target.offsetLeft;
            var sb_bky = event.target.offsetTop;
            var ww = document.documentElement.clientWidth;
            var wh = window.innerHeight;
            if(event.preventDefault){
                event.preventDefault();
            }else{
                event.returnValue = false;
            }
            document.onmousedown=function(ev) {
                var event = ev||window.event;
                var scrolltop=document.documentElement.scrollTop||document.body.scrollTop;
                if (event.clientY < 0 || event.clientX < 0 || event.clientY > wh || event.clientX > ww) {
                    return false;
                };
                var exist = false;
                _this.startPoint = {"x":event.clientX-5,"y":event.clientY-5};
                var countstar = 0;
                var lastPoint = 0;
                for(var i=0;i<_this.jsonPoint.length;i++){
                    if(_this.jsonPoint[i].x-_this.startPoint.x<20&&_this.jsonPoint[i].x-_this.startPoint.x>-20&&_this.jsonPoint[i].y-_this.startPoint.y<20&&_this.jsonPoint[i].y-_this.startPoint.y>-20){
                        countstar++;
                        lastPoint = i;
                    }
                }
                if(countstar>0){
                    exist = true;
                    _this.firstExist = true;
                    _this.startPoint = _this.jsonPoint[lastPoint];
                    
                }
                if(!exist){
                    _this.firstPoint = _this.setPoint(_this.startPoint.x,_this.startPoint.y)
                }

                    //确认点是否在线上
            }
        },
        dMouseUp:function(event){
            var _this = this;
            var event = event||window.event;
            var _target = event.target;
            var startX = event.clientX;
            var startY = event.clientY;
            var sb_bkx = event.target.offsetLeft;
            var sb_bky = event.target.offsetTop;
            var ww = document.documentElement.clientWidth;
            var wh = window.innerHeight;
            if(event.preventDefault){
                event.preventDefault();
            }else{
                event.returnValue = false;
            }
            document.onmouseup=function(ev) {
                var oEvent = ev||event;
                if(oEvent.button==0){
                    if(_this.startPoint!=null&&oEvent.clientX<_this.max_x&&oEvent.clientY<_this.max_y){
                        var exist = false;
                        var endPoint = {"x":oEvent.clientX-5,"y":oEvent.clientY-5};
                        var coutend = 0;
                        var lastPoint = 0;
                        var randomNumber = null;
                        if(_this.startPoint.x-endPoint.x<20&&_this.startPoint.x-endPoint.x>-20&&_this.startPoint.y-endPoint.y>-20&&_this.startPoint.y-endPoint.y<20){
                            if(_this.firstPoint!=null){
                                _this.firstPoint.remove();
                            }
                            var tline = _this.checkInLine(_this.startPoint.x,_this.startPoint.y);                            
                            
                            //点击两次之后弹出窗口，修改点属性
                            if(_this.previousPoint==_this.startPoint){
                                document.getElementById("pointX").value = _this.startPoint.x;
                                document.getElementById("pointY").value = _this.startPoint.y;
                                document.getElementById("pointName").value = _this.startPoint.name;
                                _this.previousPoint=null;
                            }else{
                                //将上次点击点记录下来
                                _this.previousPoint = _this.startPoint;
                            }

                            //在点范围外双击时显示线的名字
                            if(!_this.firstExist){
                                //双击同一条直线之后，修改线属性
                                if(tline==_this.previousLine&&_this.previousLine!=null){
                                    _this.previousLine = null;
                                    document.getElementById("linex1").value = tline.x1
                                    document.getElementById("linex2").value = tline.x2
                                    document.getElementById("liney1").value = tline.y1
                                    document.getElementById("liney2").value = tline.y2
                                    document.getElementById("beforeLineName").value = tline.linename
                                    document.getElementById("lineName").value = tline.linename
                                    
                                }else if(tline!=null){
                                    _this.previousLine = tline;
                                }

                            }
                            
                            
                        }else{
                            randomNumber =_this.rollNumber();

                            //判断是否结束是在点上
                            for(var i=0;i<_this.jsonPoint.length;i++){
                                if(_this.jsonPoint[i].x-endPoint.x<20&&_this.jsonPoint[i].x-endPoint.x>-20&&_this.jsonPoint[i].y-endPoint.y<20&&_this.jsonPoint[i].y-endPoint.y>-20){
                                    coutend++;
                                    lastPoint = i;
                                }
                            }
                            if(coutend>0){
                                exist = true;
                                endPoint = _this.jsonPoint[lastPoint];
                            }

                            if(endPoint!=null&&_this.startPoint!=null){
                                for(var m=0;m<_this.jsonline.length;m++){
                                    if((_this.startPoint.x==_this.jsonline[m].x1&&_this.startPoint.y==_this.jsonline[m].y1&&endPoint.x==_this.jsonline[m].x2&&endPoint.y==_this.jsonline[m].y2)||(_this.startPoint.x==_this.jsonline[m].x2&&_this.startPoint.y==_this.jsonline[m].y2&&endPoint.x==_this.jsonline[m].x1&&endPoint.y==_this.jsonline[m].y1)){
                                        return false;
                                    }
                                }
                            }



                            //不存在结束点的时候将这个点创建
                            if(!exist){
                                 //结束中间点
                                var endmid = _this.getInLine(endPoint.x,endPoint.y)
                                //结束点是否在线判断
                                var endline = _this.checkInLine(endPoint.x,endPoint.y)

                                if(endmid!=null){
                                    console.log(_this.jsonline)
                                    for(var i=0;i<_this.jsonline.length;i++){
                                        if(_this.jsonline[i]==endline){
                                            randomNumber =_this.rollNumber();
                                            var endline1 = {"x1":_this.jsonline[i].x1,"y1":_this.jsonline[i].y1,"x2":endmid.x,"y2":endmid.y,"linename":randomNumber};
                                            randomNumber =_this.rollNumber();
                                            var endline2 = {"x1":endmid.x,"y1":endmid.y,"x2":_this.jsonline[i].x2,"y2":_this.jsonline[i].y2,"linename":randomNumber};
                                            _this.jsonline.splice(i,1);
                                            _this.jsonline.push(endline1)
                                            _this.jsonline.push(endline2)
                                        }
                                    }
                                }
                                
                                _this.setPoint(endPoint.x,endPoint.y)
                                _this.jsonPoint.push({"x":endPoint.x,"y":endPoint.y,name:"默认","lineslist":randomNumber})
                            }else{
                                //存在点的时候将改点添加刚生成的随机线编码
                                for(var i=0;i<_this.jsonPoint.length;i++){
                                    if(_this.jsonPoint[i].x==endPoint.x&&_this.jsonPoint[i].y==endPoint.y){
                                        _this.jsonPoint[i].lineslist=_this.jsonPoint[i].lineslist+","+randomNumber
                                    }
                                }
                            }
                            
                            

                            //如果这个起始点存在
                            if(_this.firstExist){
                            
                                
                                for(var i=0;i<_this.jsonPoint.length;i++){
                                    if(_this.jsonPoint[i].x==_this.startPoint.x&&_this.jsonPoint[i].y==_this.startPoint.y){
                                        //将该线段的随机码添加到之前的点上
                                        _this.jsonPoint[i].lineslist=_this.jsonPoint[i].lineslist+","+randomNumber
                                    }
                                }
                            }else{
                                //起始中间点
                                var startmid = _this.getInLine(_this.startPoint.x,_this.startPoint.y)
                                //起始点是否在线判断
                                var startline = _this.checkInLine(_this.startPoint.x,_this.startPoint.y)
                                
                                if(startmid!=null){
                                    for(var i=0;i<_this.jsonline.length;i++){
                                        if(_this.jsonline[i]==startline){
                                            randomNumber =_this.rollNumber();
                                            var startline1 = {"x1":_this.jsonline[i].x1,"y1":_this.jsonline[i].y1,"x2":startmid.x,"y2":startmid.y,"linename":randomNumber};
                                            randomNumber =_this.rollNumber();
                                            var startline2 = {"x1":startmid.x,"y1":startmid.y,"x2":_this.jsonline[i].x2,"y2":_this.jsonline[i].y2,"linename":randomNumber};
                                            _this.jsonline.splice(i,1);
                                            _this.jsonline.push(startline1)
                                            _this.jsonline.push(startline2)
                                        }
                                    }
                                }
                                //如果不存在将起始点添加进点集合
                                _this.jsonPoint.push({"x":_this.startPoint.x,"y":_this.startPoint.y,name:"默认","lineslist":randomNumber})
                            }
                            
                            _this.jsonline.push({"x1":_this.startPoint.x,"y1":_this.startPoint.y,"x2":endPoint.x,"y2":endPoint.y,"linename":randomNumber})
                            
                            _this.line();
                            
                        }
                        
                    }       
                }
                _this.firstExist= false;
                _this.startPoint =null;
                _this.firstPoint =null;
                _this.reDraw()
            }
        },
        getPositinoInfo:function(){
            axios.post("point").then(function(response){
                console.log(response.data.data)
            })
        },
        savePositinoInfo:function(){
            var sendPoint = this.jsonPoint;
            console.log(sendPoint)
            axios.post("point/del",{name:""}).then(function(response){
                console.log(response.data.data)
            })
            for(var i=0;i<sendPoint.length;i++){
                axios.post("point/add",{name:sendPoint[i].name,x:sendPoint[i].x,y:sendPoint[i].y,lineslist:sendPoint[i].lineslist}).then(function(response){
                    console.log(response.data.data)
                })
            }   
        },
        saveLineInfo:function(){
            var sendLine = this.jsonline;
            axios.post("line/del",{name:""}).then(function(response){
                console.log(response.data.data)
            })
            for(var i=0;i<sendLine.length;i++){
                axios.post("line/add",{linename:sendLine[i].linename,x1:sendLine[i].x1,y1:sendLine[i].y1,x2:sendLine[i].x2,y2:sendLine[i].y2})
            }
        }
    }
}
</script>

<style>

</style>