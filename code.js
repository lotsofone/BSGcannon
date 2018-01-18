//弹道公式的无限tickrate条件下的微积分形式
function dext(t, vx0){
    if(vx0>=0)return 5*vx0 - 5*Math.pow(Math.E,(Math.log(vx0)-t/5));
    return 5*vx0 + 5*Math.pow(Math.E,(Math.log(-vx0)-t/5));
}
function deyt(t, vy0){
    if(vy0+164.05>=0)return 820-5*Math.pow(Math.E,(Math.log(vy0+164.05)-0.2*t))-164.05*t+5*vy0;
    return 820+5*Math.pow(Math.E,(Math.log(-vy0-164.05)-0.2*t))-164.05*t+5*vy0;
}
//弹道公式的100tickrate条件下的等比数列形式
function ssxt(t, vx0){
    n=100*t; const q = 0.998;
    return vx0/100*(q-Math.pow(q,n+1))/(1-q);
}
function ssyt(t, vy0){
    n=100*t; const q = 0.998;
    //a0 = vy0/100  
    return (vy0/100+0.003281/(1-q)) * q * (1-Math.pow(q,n))/(1-q)  -  n*0.003281/(1-q);
}
function sstx(x, vx0){
    const q = 0.998;
    return Math.log(1-(100*x*(1-q))/(vx0*q))/Math.log(q)/100;
}

function lzoom(wheelDelta, x, y){
    vpx+=x/zoom_level;
    vpy-=y/zoom_level;
    zoom_level*=Math.pow(1.001,wheelDelta);
    if(zoom_level>1e7)zoom_level=1e7;if(zoom_level<1e-9)zoom_level=1e-9;
    vpx-=x/zoom_level;
    vpy+=y/zoom_level;
    full_draw();
}
function ldrag(dx,dy){
    vpx-=dx/zoom_level;
    vpy+=dy/zoom_level;
    full_draw();
}
function xWorldToScreen(x){//transform world x cordinate to screen x cordinate
    return (x-vpx)*zoom_level;}
function yWorldToScreen(y){//transform world y cordinate to screen y cordinate
    return -(y-vpy)*zoom_level;}
function xScreenToWord(x){
    return x/zoom_level+vpx;}
function yScreenToWord(y){
    return vpy-y/zoom_level;}
//draw
function full_draw(){
    draw_pre();
    draw_net();
    draw_target();
}
//net_drawing
function draw_net(){
    //take CanvasRenderingContext2D
    cc = net_canvas.getContext("2d");
    ccac = netnum_canvas.getContext("2d");//netnum_canvas
    //clear canvas
    cc.clearRect(0, 0, net_canvas.width, net_canvas.height);
    ccac.clearRect(0, 0, netnum_canvas.width, netnum_canvas.height);
    //draw axis
    cc.lineWidth = 2;
    cc.strokeStyle = "#00000080";
    cc.beginPath();
    cc.moveTo(0, yWorldToScreen(0));
    cc.lineTo(net_canvas.width, yWorldToScreen(0));
    cc.stroke();
    cc.beginPath();
    cc.moveTo(xWorldToScreen(0), 0);
    cc.lineTo(xWorldToScreen(0), net_canvas.height);
    cc.stroke();
    //calculate zoom index and min_unit
    var zoom_index10 = Math.log(zoom_level)/Math.log(10);
    zoom_index10-=1.7;
    var zi10int = Math.round(zoom_index10);
    var zi10float = zoom_index10-zi10int;
    var min_unit = Math.pow(10,-zi10int);
    tempvar = Math.pow(10, 0.5-zi10float);
    if(tempvar>5){
        min_unit*=5;
    }
    else if(tempvar>2){
        min_unit*=2;
    }
    //draw net
    cc.lineWidth = 0.6;
    cc.strokeStyle = "#00000040";
    for(var xstart = Math.round(vpx/min_unit)*min_unit;xWorldToScreen(xstart)<net_canvas.width;xstart+=min_unit){
        cc.beginPath();
        cc.moveTo(xWorldToScreen(xstart), 0);
        cc.lineTo(xWorldToScreen(xstart), net_canvas.height);
        cc.stroke();
    }
    for(var yend = Math.round(vpy/min_unit)*min_unit;yWorldToScreen(yend)<net_canvas.height;yend-=min_unit){
        cc.beginPath();
        cc.moveTo(0, yWorldToScreen(yend));
        cc.lineTo(net_canvas.width, yWorldToScreen(yend));
        cc.stroke();
    }
    //draw net numbers
    ccac.fillStyle = "#000000";
    ccac.font = '18px sans-serif';
    function niceStr(a){
        if(min_unit<1)return (a.toFixed(zi10int));
        return a.toString();
    }
    for(var xstart = Math.round(vpx/min_unit)*min_unit;xWorldToScreen(xstart)<net_canvas.width;xstart+=min_unit){
        cc.fillText(niceStr(xstart), xWorldToScreen(xstart), 10, 80);
    }
    for(var yend = Math.round(vpy/min_unit)*min_unit;yWorldToScreen(yend)<net_canvas.height;yend-=min_unit){
        cc.fillText(niceStr(yend), 0, yWorldToScreen(yend));
    }
}
function draw_target(){
    var ed = document.getElementById("enemy_distance").value;
    var ea = document.getElementById("enemy_angle").value;
    var dx = ed*Math.cos(ea/180*Math.PI);
    var dy = ed*Math.sin(ea/180*Math.PI);
    var scrx = xWorldToScreen(dx);
    var scry = yWorldToScreen(dy);
    //take CanvasRenderingContext2D
    cc = target_canvas.getContext("2d");
    //clear
    cc.clearRect(0, 0, 4000, 2400);
    cc.fillStyle = "#FF2222";
    cc.beginPath();
    cc.moveTo(scrx+4, scry);
    for(var i=0; i<360; i+=5){
        ai=i*Math.PI/180;
        cc.lineTo(scrx+4*Math.cos(ai), scry+4*Math.sin(ai));
    }
    cc.closePath();
    cc.fill();
}
function set_aim(){
    var ed = document.getElementById("enemy_distance").value;
    var ea = document.getElementById("enemy_angle").value;
    var dx = ed*Math.cos(ea/180*Math.PI);//水平距离
    df=0;if(dx<0){dx=-dx;df=1;}
    var dy = ed*Math.sin(ea/180*Math.PI);//垂直距离
    ppower = document.getElementById("power_input").value;
    v0 = ppower*60-1.5;
    function calculate_angle(){
        if(v0*5<dx)return NaN;// 0G never hit
        var vx,vy;
        //先任意寻找一条弹道，能从目标上方越过即可
        var aaa=90;
        sf = false;
        for(var i=0; i<1000; i++){
            testa = (90-aaa)*Math.PI/180;
            vx=v0*Math.cos(testa);
            vy=v0*Math.sin(testa);
            if(ssyt(sstx(dx,vx),vy)>dy){
                sf=true; break;
            }
            aaa*=0.99;
        }
        if(sf==false)return NaN;//找不到飞越弹道
        //找到了一个弹道
        var amid = (90-aaa)*Math.PI/180;
        var amax = Math.acos(dx/5/v0);//向高抛方向二分求解的最大角度
        var amin = -amax;//向直射方向二分求解的最小角度
        //开始以直射优先进行二分求解
        onemax=amid; onemin=amin;
        for(var i=0; i<64; i++){
            var onemid = (onemax+onemin)/2;
            vx=v0*Math.cos(onemid);
            vy=v0*Math.sin(onemid);
            if(ssyt(sstx(dx,vx),vy)>dy){//飞越
                onemax=onemid;
            }
            else{//低于
                onemin=onemid;
            }
        }
        return onemid;
    }
    var ans = calculate_angle();
    if(df==1)ans = Math.PI-ans;
    if(isNaN(ans)){
        document.getElementById("aim_buttom_reply").textContent="这个炮力无论如何也无法命中目标";
    }
    else{
        //设置瞄准角度
        document.getElementById("angle_input").value=ans*180/Math.PI;
        //给出瞄准的结果提示
        var aim_up_delta = Math.abs(ans*180/Math.PI-ea);
        document.getElementById("aim_buttom_reply").textContent="瞄准相对目标抬头"+aim_up_delta.toFixed(8)+"度";
    }
}
function draw_pre(){
    //get power and angle
    var ppower = document.getElementById("power_input").value;
    var pangle = document.getElementById("angle_input").value;
    pangle = pangle*Math.PI/180;
    var v0 = ppower*60-1.5;
    var vx0 = v0*Math.cos(pangle);
    var vy0 = v0*Math.sin(pangle);
    //take CanvasRenderingContext2D
    cc = curve_canvas.getContext("2d");

    //clear canvas
    cc.clearRect(0, 0, curve_canvas.width, curve_canvas.height);

    //draw view line
    cc.beginPath();
    cc.lineWidth = 2;
    cc.strokeStyle = "#CF00CF80";
    cc.moveTo(xWorldToScreen(0),yWorldToScreen(0));
    tempvar = (net_canvas.height+net_canvas.width)/zoom_level+Math.abs(vpx)+Math.abs(vpy);
    cc.lineTo(xWorldToScreen(Math.cos(pangle)*tempvar),yWorldToScreen(Math.sin(pangle)*tempvar));
    cc.stroke();

    //draw path
    cc.beginPath();
    cc.lineWidth = 2;
    cc.strokeStyle = "#00CC00";
    var scrx;
    for(scrx=0; scrx<=1000; scrx+=0.5){
        var tempvar = sstx(xScreenToWord(scrx), vx0);
        if(!isNaN(tempvar)&&tempvar>=0)break;
    }
    cc.moveTo(scrx,yWorldToScreen(ssyt(sstx(xScreenToWord(scrx), vx0),vy0)));
    scrx+=0.5;
    for(; scrx<=1000; scrx+=0.5){
        xt=xScreenToWord(scrx);
        if(isNaN(sstx(xt, vx0))){
            cc.lineTo(scrx, curve_canvas.height+100);break;
        }
        yt=ssyt(sstx(xt, vx0), vy0);
        cc.lineTo(scrx,yWorldToScreen(yt));
    }
    cc.stroke();
    /*cc.beginPath();
    cc.lineWidth = 2;
    cc.strokeStyle = "#00CC00";
    cc.moveTo(xWorldToScreen(0),yWorldToScreen(0));
    for(var t = 0.0; t<51; t+=0.01){
        xt=ssxt(t, vx0); yt=ssyt(t, vy0);
        //cc.lineTo(xt, yt);
        cc.lineTo(xWorldToScreen(xt),yWorldToScreen(yt));
    }
    cc.stroke();*/
}
//set enemy position from double click
function set_enemy_position(scrx, scry){
    var ex = xScreenToWord(scrx);
    var ey = yScreenToWord(scry);
    var d = Math.sqrt(ex*ex+ey*ey);
    var angle = Math.asin(ey/d)*180/Math.PI;
    if(ex<0)angle = 180-angle;
    document.getElementById("enemy_distance").value=d;
    document.getElementById("enemy_angle").value=angle;
    draw_target();
}
//element
var curve_canvas = document.getElementById("curve_canvas");
curve_canvas.width = curve_canvas.scrollWidth; curve_canvas.height = curve_canvas.scrollHeight;
var netnum_canvas = document.getElementById("netnum_canvas");
netnum_canvas.width = netnum_canvas.scrollWidth; netnum_canvas.height = netnum_canvas.scrollHeight;
var net_canvas = document.getElementById("net_canvas");
net_canvas.width = net_canvas.scrollWidth; net_canvas.height = net_canvas.scrollHeight;
var target_canvas = document.getElementById("target_canvas");
target_canvas.width = target_canvas.scrollWidth; target_canvas.height = target_canvas.scrollHeight;

var canvas_area = document.getElementById("canvas_area");
//viewport initial
var zoom_level = 1;//1 px refers to 1 meter
var vpx = 0; var vpy = curve_canvas.height;
//set mouse
canvas_area.addEventListener("mousewheel", function(e){
    lzoom(e.wheelDelta, e.offsetX, e.offsetY);
    e.preventDefault();
},false)
//mouse drag
canvas_area.mouse_down = false;
canvas_area.addEventListener("mousedown", function(e){
    canvas_area.mouse_down = true;
    canvas_area.prex = e.pageX;
    canvas_area.prey = e.pageY;
    e.preventDefault();
},false)
document.body.addEventListener("mouseup", function(e){
    canvas_area.mouse_down = false;
    e.preventDefault();
},false)
document.body.addEventListener("mouseleave", function(e){
    canvas_area.mouse_down = false;
    e.preventDefault();
},false)
document.body.addEventListener("mousemove", function(e){
    if(canvas_area.mouse_down){
        ldrag(e.pageX-canvas_area.prex, e.pageY-canvas_area.prey);
        canvas_area.prex = e.pageX;
        canvas_area.prey = e.pageY;}
    e.preventDefault();
},false)
//set buttons
document.getElementById("pre_button").addEventListener("click", function(){
    draw_pre();
})
document.getElementById("aim_buttom").addEventListener("click", function(){
    set_aim();
    full_draw();
})
//double click
canvas_area.addEventListener("dblclick", function(e){
    set_enemy_position(e.offsetX, e.offsetY);
    e.preventDefault();
},false)
//initialize
full_draw();