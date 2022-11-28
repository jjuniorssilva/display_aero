import './style.css'
let turbo =false;
let posy=[276,260,237,220,202,187,174,159,148,139,132,127,124,122,122,126,132,139,149,158,171,186,202,220,238,255,276,]
let posx=[139,153,151,160,172,184,198,215,232,250,268,288,307,328,347,368,388,407,425,442,457,470,484,496,505,511,517,]
let ang=[75,70,65,60,55,45,45,40,35,30,25,20,15,10,0,]
let i=0, start=false;
let time=[0,0,0];
let contador;
// --------------- link dos botões -------------------
document.getElementById('calib').addEventListener('click', (event) => {
	websocket.send("calib=1");
});

document.getElementById('turbo').addEventListener('click', (event) => {
	if(!turbo) {
		websocket.send("turbo=1");
		turbo=true;
		return;
	}
	websocket.send("turbo=0");
	turbo=false;
});
document.getElementById('ligar').addEventListener('click', (event) => {
	start=true;
	websocket.send("lig=1");
	contagem();
	document.getElementById('desligar').removeAttribute("style");
	document.getElementById('ligar').setAttribute("style","display:none");
	console.log("ligou");
	
});
document.getElementById('desligar').addEventListener('click', (event) => {
	start=false;
	contagem();
	websocket.send("lig=0");
	document.getElementById('ligar').removeAttribute("style");
	document.getElementById('desligar').setAttribute("style","display:none");
	console.log("desligou");
});
// ------------------fim dos botoes -----------------

//-------------------- Atualização do display---------------------

function updateRadar(distx,dist, angle){
	//min = 65px, max =-5px
	let dist_px = map_range(dist,0, 1000,65,-5);
	if(dist_px>-4)document.getElementById('point').setAttribute('style','margin-top:'+dist_px+'px')
	document.getElementById('dist_display').innerText=dist+' M';
	document.getElementById('distx_display').innerHTML=distx+' M';

}
function updateSpeedometer(percent){
	document.getElementById('potencia_nivel').innerText=percent+"%"
	let i=Math.round((26*percent)/100);
	
	for (let index = 0; index < 27; index++) {
		if(index<=i){
			document.getElementById("p"+index).setAttribute('style','fill:rgba(0, 231, 244, 0.6);filter: drop-shadow(0 0 2px rgba(0, 231, 244, 0.6));stroke:rgba(0, 231, 244, 0.6);stroke-width: 0.7px;')
			document.getElementById("ponter_speedometer").setAttribute('style','margin-top:'+(posy[index]-4)+'px!important;margin-left:'+(posx[index]-5)+'px!important;')
		}else{
			
			document.getElementById("p"+(index)).setAttribute('style','fill: rgb(92, 85, 85);')
		
		}
	}
	if(i<26)document.getElementById("p"+(i+1)).setAttribute('style','fill: rgb(255, 0, 85);')
	
}
function updateAltimeter(alt){
	/*5px -max 295px -min */
	document.getElementById('alt_display').innerText=alt+" M";
	let alt_bar = map_range(alt,0, 1000,0,100);
	document.getElementById('n_bar_alt').setAttribute('style','height:'+(100-alt_bar)+'%')
	let alt_px = map_range(alt,0, 1000,295,5);
	document.getElementById('ponter_alt').setAttribute('style','margin-top:'+alt_px+'px')

}
function updateVelocimeter(vel){
	document.getElementById('vel_nivel').innerHTML=vel+' km/h';
}

function updateTemp(temp){
	document.getElementById('temp_display').innerHTML="Temperatura: "+temp+"°C";
}
function updateConexao(stage){
	document.getElementById('conexao_display').innerHTML="Conexão: "+stage;

}
 //-------------------------- fim do display-----------------------------



// ---------------------- funções auxiliares --------------------------

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function contagem(){
	if (!start){
		clearInterval(contador);
	}else{
		contador = setInterval(function () {
			time[2]++
			if(time[2]>59){
				time[2]=0
				time[1]++;	
			}
			if(time[1]>59){
				time[1]=0
				time[0]++;	
			}
			document.getElementById('time_display').innerText="Time: "+("00"+time[0]).slice(-2)+":"+("00"+time[1]).slice(-2)+":"+("00"+time[2]).slice(-2);
		}, 1000);
	}
}
//-----------------------------------------------------------------------

var gateway = `ws://192.168.137.246/ws`;
  var websocket;
  function initWebSocket() {
    console.log('Trying to open a WebSocket connection...');
    websocket = new WebSocket(gateway);
    websocket.onopen    = onOpen;
    websocket.onclose   = onClose;
    websocket.onmessage = onMessage; // <-- add this line
  }
  function onOpen(event) {
    console.log('Connection opened');
  }

  function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
  }
  function onMessage(event) {
	let dataJson;
	
		dataJson=JSON.parse(event.data)
		updateSpeedometer(0);
		if(dataJson.m>97)updateSpeedometer(Math.round(map_range(dataJson.m??0,98,180,0,100)));
		updateAltimeter(dataJson.a??0)
		updateRadar(dataJson.d??0,dataJson.d??0,1)
		updateVelocimeter(dataJson.v??0);
		updateTemp(dataJson.t??0);
		updateConexao("Boa");
		if(dataJson.tb==0){
			document.getElementById('turboIcon').setAttribute("class", 'turboIcon disable');
			return;
		}
		document.getElementById('turboIcon').setAttribute("class", 'turboIcon');

	
	
  }
  window.addEventListener('load', onLoad);
  function onLoad(event) {
    initWebSocket();
  }


 

