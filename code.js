

function dext(t, vx0){
    return 5*vx0 - 5*Math.pow(Math.E,(Math.log(vx0)-t/5));
}
function deyt(t, vy0){
    return 820-5*Math.pow(Math.E,(Math.log(vy0+164)-0.2*t))-164*t+5*vy0;
}

function ssxt(t, vx0){
}
function ssyt(t, vy0){
}

function draw_pre(){
    console.log("call draw_pre");
    //get power and angle
    var ppower = document.getElementById("power_input").value;
    var pangle = document.getElementById("angle_input").value;
    pangle = pangle*Math.PI/180;
    var vx0 = ppower*60*Math.cos(pangle);
    var vy0 = ppower*60*Math.sin(pangle);
    //take CanvasRenderingContext2D
    curve_canvas = document.getElementById("curve_canvas");
    cc = curve_canvas.getContext("2d");

    //clear canvas
    cc.fillStyle = "#FFFFFF";
    cc.fillRect(0, 0, 1000, 600);

    //draw view line
    cc.beginPath();
    cc.lineWidth = 2;
    cc.strokeStyle = "#CF00CF";
    cc.moveTo(0,0);
    cc.lineTo(Math.cos(pangle)*5000, Math.sin(pangle)*5000);
    cc.stroke();

    //draw path
    cc.beginPath();
    cc.lineWidth = 2;
    cc.strokeStyle = "#00FF00";
    cc.moveTo(0,0);
    for(var t = 0.0; t<20; t+=0.01){
        cc.lineTo(dext(t, vx0), deyt(t, vy0));
    }
    cc.stroke();
}

document.getElementById("pre_button").addEventListener("click", function(){
    draw_pre();
})