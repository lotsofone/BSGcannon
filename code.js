function dext(t, vx0){
    if(vx0>=0)return 5*vx0 - 5*Math.pow(Math.E,(Math.log(vx0)-t/5));
    return 5*vx0 + 5*Math.pow(Math.E,(Math.log(-vx0)-t/5));
}
function deyt(t, vy0){
    if(vy0+164>=0)return 820-5*Math.pow(Math.E,(Math.log(vy0+164)-0.2*t))-164*t+5*vy0;
    return 820+5*Math.pow(Math.E,(Math.log(-vy0-164)-0.2*t))-164*t+5*vy0;
}

function ssxt(t, vx0){
}
function ssyt(t, vy0){
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
//draw
function full_draw(){
    draw_pre();
    draw_net();
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
    cc.strokeStyle = "#00FF00";
    cc.moveTo(xWorldToScreen(0),yWorldToScreen(0));
    for(var t = 0.0; t<51; t+=0.01){
        xt=dext(t, vx0); yt=deyt(t, vy0);
        //cc.lineTo(xt, yt);
        cc.lineTo(xWorldToScreen(xt),yWorldToScreen(yt));
    }
    cc.stroke();
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
//element
var curve_canvas = document.getElementById("curve_canvas");
curve_canvas.width = curve_canvas.scrollWidth; curve_canvas.height = curve_canvas.scrollHeight;
var netnum_canvas = document.getElementById("netnum_canvas");
netnum_canvas.width = netnum_canvas.scrollWidth; netnum_canvas.height = netnum_canvas.scrollHeight;
var net_canvas = document.getElementById("net_canvas");
net_canvas.width = net_canvas.scrollWidth; net_canvas.height = net_canvas.scrollHeight;
var canvas_area = document.getElementById("canvas_area");
//viewport initial
var zoom_level = 1;//1 px refers to 1 meter
var vpx = 0; var vpy = curve_canvas.height;
//set mouse
curve_canvas.addEventListener("mousewheel", function(e){
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
//initialize
full_draw();