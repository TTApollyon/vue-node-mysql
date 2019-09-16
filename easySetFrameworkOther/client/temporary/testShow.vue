<template>
    <div>
        <svg id="svgP"></svg>
        <div class="popup" style="display:none;">
            <div class="inpopup">
                <input>
            </div>
        </div>
        <input type="hidden" id="pointX"/>
        <input type="hidden" id="pointY"/>
        <input type="text" id="pointName"/>
        <button onclick="updatePoint()">修改</button>
        <form id="lineProperty">
            <label>连线框</label>
            <input type="hidden" id="linex1"/>
            <input type="hidden" id="linex2"/>
            <input type="hidden" id="liney1"/>
            <input type="hidden" id="liney2"/>
            <input type="hidden" id="beforeLineName"/>
            <input type="text" id="lineName"/>
            
        </form>
        <button onclick="updateLineName()">修改</button>
        <button onclick="deleteLine()">删除该线段</button>
    </div>
</template>

<script>
import * as d3 from 'd3'

// function deleteLine(){
//     var linex1 = document.getElementById("linex1").value;
//     var linex2 = document.getElementById("linex2").value;
//     var liney1 = document.getElementById("liney1").value;
//     var liney2 = document.getElementById("liney2").value;
//     delLine(linex1,liney1,linex2,liney2);
//     document.getElementById("lineProperty").reset();
    
// }



document.onmousedown = function(ev){
    var oEvent = ev||event;
    if(oEvent.button==0&&oEvent.clientX<max_x&&oEvent.clientY<max_y){
        
        //点击触发连线判断或连线事件
        var exist = false;
        startPoint = {"x":oEvent.clientX,"y":oEvent.clientY};
        var countstar = 0;
        var lastPoint = 0;
        for(var i=0;i<jsonPoint.length;i++){
            if(jsonPoint[i].x-startPoint.x<20&&jsonPoint[i].x-startPoint.x>-20&&jsonPoint[i].y-startPoint.y<20&&jsonPoint[i].y-startPoint.y>-20){
                countstar++;
                lastPoint = i;
            }
        }
        if(countstar>0){
            exist = true;
            firstExist = true;
            startPoint = jsonPoint[lastPoint];
            
        }
        if(!exist){
            firstPoint = setPoint(startPoint.x,startPoint.y)
        }

        //确认点是否在线上
        
        
    }
    
}

//抬起鼠标操作
//根据鼠标抬起时如果在点附近20*20范围内自动连接到该点上，如果不存在新建一点
//如果连线长度不超于20*20对角线长度的话，创建连线失效
document.onmouseup = function(ev){
    var oEvent = ev||event;
    if(oEvent.button==0){
        if(startPoint!=null&&oEvent.clientX<max_x&&oEvent.clientY<max_y){
            var exist = false;
            var endPoint = {"x":oEvent.clientX,"y":oEvent.clientY};
            var coutend = 0;
            var lastPoint = 0;
            var randomNumber = null;
            if(startPoint.x-endPoint.x<20&&startPoint.x-endPoint.x>-20&&startPoint.y-endPoint.y>-20&&startPoint.y-endPoint.y<20){
                if(firstPoint!=null){
                    firstPoint.remove();
                }
                var tline = checkInLine(startPoint.x,startPoint.y);                            
                
                //点击两次之后弹出窗口，修改点属性
                if(previousPoint==startPoint){
                    document.getElementById("pointX").value = startPoint.x;
                    document.getElementById("pointY").value = startPoint.y;
                    document.getElementById("pointName").value = startPoint.name;
                    previousPoint=null;
                }else{
                    //将上次点击点记录下来
                    previousPoint = startPoint;
                }

                //在点范围外双击时显示线的名字
                if(!firstExist){
                    //双击同一条直线之后，修改线属性
                    if(tline==previousLine&&previousLine!=null){
                        previousLine = null;
                        document.getElementById("linex1").value = tline.x1
                        document.getElementById("linex2").value = tline.x2
                        document.getElementById("liney1").value = tline.y1
                        document.getElementById("liney2").value = tline.y2
                        document.getElementById("beforeLineName").value = tline.linename
                        document.getElementById("lineName").value = tline.linename
                        
                    }else if(tline!=null){
                        previousLine = tline;
                    }

                }
                
                
            }else{
                randomNumber =rollNumber();

                //判断是否结束是在点上
                for(var i=0;i<jsonPoint.length;i++){
                    if(jsonPoint[i].x-endPoint.x<20&&jsonPoint[i].x-endPoint.x>-20&&jsonPoint[i].y-endPoint.y<20&&jsonPoint[i].y-endPoint.y>-20){
                        coutend++;
                        lastPoint = i;
                    }
                }
                if(coutend>0){
                    exist = true;
                    endPoint = jsonPoint[lastPoint];
                }

                if(endPoint!=null&&startPoint!=null){
                    for(var m=0;m<jsonline.length;m++){
                        if((startPoint.x==jsonline[m].x1&&startPoint.y==jsonline[m].y1&&endPoint.x==jsonline[m].x2&&endPoint.y==jsonline[m].y2)||(startPoint.x==jsonline[m].x2&&startPoint.y==jsonline[m].y2&&endPoint.x==jsonline[m].x1&&endPoint.y==jsonline[m].y1)){
                            return false;
                        }
                    }
                }



                //不存在结束点的时候将这个点创建
                if(!exist){
                        //结束中间点
                    var endmid = getInLine(endPoint.x,endPoint.y)
                    //结束点是否在线判断
                    var endline = checkInLine(endPoint.x,endPoint.y)

                    if(endmid!=null){
                        console.log(jsonline)
                        for(var i=0;i<jsonline.length;i++){
                            if(jsonline[i]==endline){
                                randomNumber =rollNumber();
                                var endline1 = {"x1":jsonline[i].x1,"y1":jsonline[i].y1,"x2":endmid.x,"y2":endmid.y,"linename":randomNumber};
                                randomNumber =rollNumber();
                                var endline2 = {"x1":endmid.x,"y1":endmid.y,"x2":jsonline[i].x2,"y2":jsonline[i].y2,"linename":randomNumber};
                                jsonline.splice(i,1);
                                jsonline.push(endline1)
                                jsonline.push(endline2)
                            }
                        }
                    }
                    
                    setPoint(endPoint.x,endPoint.y)
                    jsonPoint.push({"x":endPoint.x,"y":endPoint.y,name:"默认","lineslist":randomNumber})
                }else{
                    //存在点的时候将改点添加刚生成的随机线编码
                    for(var i=0;i<jsonPoint.length;i++){
                        if(jsonPoint[i].x==endPoint.x&&jsonPoint[i].y==endPoint.y){
                            jsonPoint[i].lineslist=jsonPoint[i].lineslist+","+randomNumber
                        }
                    }
                }
                
                

                //如果这个起始点存在
                if(firstExist){
                
                    
                    for(var i=0;i<jsonPoint.length;i++){
                        if(jsonPoint[i].x==startPoint.x&&jsonPoint[i].y==startPoint.y){
                            //将该线段的随机码添加到之前的点上
                            jsonPoint[i].lineslist=jsonPoint[i].lineslist+","+randomNumber
                        }
                    }
                }else{
                    //起始中间点
                    var startmid = getInLine(startPoint.x,startPoint.y)
                    //起始点是否在线判断
                    var startline = checkInLine(startPoint.x,startPoint.y)
                    
                    if(startmid!=null){
                        for(var i=0;i<jsonline.length;i++){
                            if(jsonline[i]==startline){
                                randomNumber =rollNumber();
                                var startline1 = {"x1":jsonline[i].x1,"y1":jsonline[i].y1,"x2":startmid.x,"y2":startmid.y,"linename":randomNumber};
                                randomNumber =rollNumber();
                                var startline2 = {"x1":startmid.x,"y1":startmid.y,"x2":jsonline[i].x2,"y2":jsonline[i].y2,"linename":randomNumber};
                                jsonline.splice(i,1);
                                jsonline.push(startline1)
                                jsonline.push(startline2)
                            }
                        }
                    }
                    //如果不存在将起始点添加进点集合
                    jsonPoint.push({"x":startPoint.x,"y":startPoint.y,name:"默认","lineslist":randomNumber})
                }
                
                jsonline.push({"x1":startPoint.x,"y1":startPoint.y,"x2":endPoint.x,"y2":endPoint.y,"linename":randomNumber})
                
                line();
                
            }
            
        }       
    }
    firstExist= false;
    startPoint =null;
    firstPoint =null;
    reDraw()
}













export default {
    name:"showTest",
    mounted:function(){
        var jsonPoint = [
            {"x":100,"y":100,name:"1","lineslist":"A,D"},
            {"x":200,"y":400,name:"2","lineslist":"F"},
            {"x":400,"y":200,name:"3","lineslist":"B,D,F"},
            {"x":500,"y":100,name:"4","lineslist":"C"},
            {"x":900,"y":600,name:"5","lineslist":"A,B,C"}
        ]

        var jsonPerson = [
            {"x":100,"y":100,"rate":1,"from":"1","to":"5","line":"A"}
        ]



        var max_x = 0;//用于存储最大x坐标
        var max_y = 0;//用于存储最大y坐标

        //在jsonRectangle数组上的循环
        for(var i = 0;i<jsonPoint.length;i++){
        var temp_x,temp_y;

        //为了得到最右的点，我们需要把x坐标和width相加
        temp_x = jsonPoint[i].x+10;

        //为了得到最下面的点，我们需要把y坐标和height相加
        temp_y = jsonPoint[i].y+10;

        /**
        *如果临时x坐标比max_x大，
        *那么就让max_x等于temp_x
        *否则，什么都不用做
        *同理，max_y也一样0
        */
        if(temp_x>=max_x){
        max_x = temp_x;  
        }

        if(temp_y>=max_y){
        max_y = temp_y;  
        }

        }//循环停止


        var jsonline = [];
        var startPoint = null;
        var firstPoint = null;
        var firstExist = false;
        var previousPoint = null;
        var previousLine = null;
        //设置定时器
        var reloadInterval = self.setInterval("initV()",1000*0.02)

        //通过点和点上的随机数标记来做连线
        for (var i = 0;i<jsonPoint.length;i++){
            for(var j=0;j<jsonPoint.length;j++){
                if(i!=j){
                    var first = jsonPoint[i].lineslist.split(",");
                    var second = jsonPoint[j].lineslist.split(",");
                    var allow = 0;
                    for(var one = 0;one<first.length;one++){
                        for(var two = 0;two<second.length;two++){
                            if(first[one]==second[two]){
                                allow=1;
                            }
                        }
                    }
                    if(allow!=0&&jsonPoint[i].x<jsonPoint[j].x){
                        var name = null;
                        var namelist1 = jsonPoint[i].lineslist.split(",");
                        var namelist2 = jsonPoint[j].lineslist.split(",");
                        for(var n = 0;n<namelist1.length;n++){
                            for(var m=0;m<namelist2.length;m++){
                                if(namelist1[n]==namelist2[m]){
                                    name = namelist1[n];
                                }
                            }
                        }
                        
                        jsonline.push({"x1":jsonPoint[i].x,"y1":jsonPoint[i].y,"x2":jsonPoint[j].x,"y2":jsonPoint[j].y,linename:name})
                    }
                }
            }
        }

        //svg初始化
        var svgContainer = d3.select("body").select("svg")
                                    .attr("width",max_x)
                                    .attr("height",max_y)


        setPointText();
        line();
    },
    methods:{
        //初始化点线图
        setPointText(){
            var edges_text = svgContainer.selectAll("text")
                                        .data(jsonPoint)
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

            var point = svgContainer.selectAll("circle")
                                .data(jsonPoint)
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

        //创建新点
        setPoint(x,y){
            var newPoint  = svgContainer
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


        //绘制直线
        line(){
            for(var i=0;i<jsonline.length;i++){
                var line = svgContainer.append("line")
                                .attr("x1",jsonline[i].x1)
                                .attr("y1",jsonline[i].y1)
                                .attr("x2",jsonline[i].x2)
                                .attr("y2",jsonline[i].y2)
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

    //判断直线中间的线
        checkInLine(lx,ly){
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

            for(var i=0;i<jsonline.length;i++){
                var l = 0;

                var cross = (jsonline[i].x2-jsonline[i].x1)*(lx-jsonline[i].x1)+(jsonline[i].y2-jsonline[i].y1)*(ly-jsonline[i].y1)
                
                var d2 = (jsonline[i].x2-jsonline[i].x1)*(jsonline[i].x2-jsonline[i].x1)+(jsonline[i].y2-jsonline[i].y1)*(jsonline[i].y2-jsonline[i].y1)
                

                var r = cross/d2;
                var px = jsonline[i].x1 + (jsonline[i].x2-jsonline[i].x1) * r
                var py = jsonline[i].y1 + (jsonline[i].y2-jsonline[i].y1) * r
                
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
                    thisline = jsonline[i];
                }
            }
            return thisline;
        },

        //获得中间点的数据
        getInLine(lx,ly){
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

            for(var i=0;i<jsonline.length;i++){
                var l = 0;
                
                var y = -(jsonline[i].x2-jsonline[i].x1)/(jsonline[i].y2-jsonline[i].y1);
                var x = 1;
                var c = -1*(jsonline[i].x1+y*jsonline[i].y1)

                var cross = (jsonline[i].x2-jsonline[i].x1)*(lx-jsonline[i].x1)+(jsonline[i].y2-jsonline[i].y1)*(ly-jsonline[i].y1)
                
                var d2 = (jsonline[i].x2-jsonline[i].x1)*(jsonline[i].x2-jsonline[i].x1)+(jsonline[i].y2-jsonline[i].y1)*(jsonline[i].y2-jsonline[i].y1)

                var r = cross/d2;
                var px = jsonline[i].x1 + (jsonline[i].x2-jsonline[i].x1) * r
                var py = jsonline[i].y1 + (jsonline[i].y2-jsonline[i].y1) * r
                

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

        //随机数生成不重复的线路名
        rollNumber(){
            return Math.random().toString(36).substr(2);
        },

        //删除连线(存在问题，如果点还有其他连线点依旧被删除了，如果是中断点的线段被删除之后，线段中间点消失，线段依旧处于分成两段的情况)
        delLine(lx1,ly1,lx2,ly2){
            var lineName ="";
            for(var i=0;i<jsonline.length;i++){
                if((jsonline[i].x1==lx1&&jsonline[i].x2==lx2&&jsonline[i].y1==ly1&&jsonline[i].y2==ly2)||(jsonline[i].x1==lx2&&jsonline[i].x2==lx1&&jsonline[i].y1==ly2&&jsonline[i].y2==ly1)){
                    lineName = jsonline[i].linename;
                    jsonline.splice(i,1);
                    
                }
            }

            var pointDelLine = [];
            for(var i=0;i<jsonPoint.length;i++){
                var namelist = jsonPoint[i].lineslist.split(",");
                var newlist = "";
                for(var j=0;j<namelist.length;j++){
                    if(namelist[j]!=lineName){
                        if(newlist!=""){
                            newlist=newlist+","
                        }
                        newlist=newlist+namelist[j];
                    }
                }
                
                jsonPoint[i].lineslist = newlist;
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
                jsonPoint.splice(pointDelLine[i],1)
            }
            


            //删除全部连线并重新连线
            reDraw();
        },

        //重新绘制连线方法1
        reDraw(){
            document.querySelector('svg').innerHTML = '<p></p>'

            setPointText();
            line();
        },

        //更新点信息
        updatePoint(){
            var newX=document.getElementById("pointX").value;
            var newY=document.getElementById("pointY").value;
            var newName=document.getElementById("pointName").value;
            for(var i=0;i<jsonPoint.length;i++){
                if(jsonPoint[i].x==newX&&jsonPoint[i].y==newY){
                    jsonPoint[i].name=newName;
                    console.log(jsonPoint[i].name)
                }
            }

            reDraw();
        },

        //更新线的名称
        updateLineName(){
            var beforeLineName = document.getElementById(beforeLineName).value;
            var lineName = document.getElementById(lineName).value;
            for(var i=0;i<jsonline.length;i++){
                if(beforeLineName==jsonline[i].linename){
                    jsonline[i]=lineName;
                }
            }

            reDraw();
        },
        //定时器方法
        initV(){
            drawPerson();
        },

        //绘制人员实时位置
        drawPerson(){
            dperson()
        },
        //绘制人员
        dperson(){ 
            $("#svgP").find("image").each(function(){
                $(this).remove()
            })
            for(var i=0;i<jsonPerson.length;i++){
                var from = null;
                var to = null;
                //获取触发点和结束点
                for(var j=0;j<jsonPoint.length;j++){
                    if(jsonPoint[j].name==jsonPerson[i].from){
                        from = jsonPoint[i];
                    }

                    if(jsonPoint[j].name==jsonPerson[i].to){
                        to = jsonPoint[j];
                    }
                }
                var Xadd = to.x-from.x;
                var Yadd = to.y-from.y;
                var rateSet = 0.01*jsonPerson[i].rate;
                jsonPerson[i].rate=jsonPerson[i].rate+0.2;
                xp = from.x+Xadd*rateSet;
                yp = from.y+Yadd*rateSet;

                if(jsonPerson[i].rate<=100){
                    var persons = svgContainer.append("image")
                                    .attr("width","20px")
                                    .attr("height","30px")
                                    .attr("x",xp-10)
                                    .attr("y",yp-15)
                                    .attr("xlink:href","person.png")
                }
                
            }
        },
    }
}
</script>