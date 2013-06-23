var PORT=8090










var blue=null;
var red=null;
var turnmarker=[0,0]
var selected=[0,0,0]
var selectedB=[0,0,0]
var selectedR=[0,0,0]
var gameBoard=[
[
[1,5,5,3],[0,0,3,3],[0,0,1,5],[0,0,1,5],[0,0,0,1]
]
,
[
[0,0,3,3],[0,0,2,4],[0,0,3,2],[0,0,2,3],[0,0,1,5]
]
,
[
[0,0,1,5],[0,0,3,3],[0,0,5,1],[0,0,3,3],[0,0,1,5]
]
,
[
[0,0,1,5],[0,0,2,3],[0,0,3,2],[0,0,2,4],[0,0,3,3]
]
,
[
[0,0,0,1],[0,0,1,5],[0,0,1,5],[0,0,3,3],[2,5,5,3]
]

]




var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(PORT, function() {
    console.log((new Date()) + ' Server is listening on port '+PORT);
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {

    var connection = request.accept('soap', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
	    if(message.utf8Data=='blue' || message.utf8Data=='red'){
	      if(blue==null && message.utf8Data=='blue'){blue=connection.remoteAddress;connection.sendUTF('blue');console.log('blue is '+blue)}
	      else if(red==null && message.utf8Data=='red'){red=connection.remoteAddress;connection.sendUTF('red');console.log('red is '+red)}
	      else if(blue!=null && red!=null){connection.sendUTF('sorry')}
	      else{connection.sendUTF('change');}
	    }
	    
	    if(message.utf8Data.slice(9,10)=='b' && message.utf8Data.length==10){
	      var coords=[Number(String(message.utf8Data).slice(0,3)),Number(String(message.utf8Data).slice(3,6)),Number(String(message.utf8Data).slice(6,9))]
	      selected=selectedB
	      interpretClick(coords[0],coords[1],coords[2])
	      selectedB=selected
	      connection.sendUTF('movealong')
	    }
	    else if(message.utf8Data.slice(9,10)=='r' && message.utf8Data.length==10){
	      var coords=[Number(String(message.utf8Data).slice(0,3)),Number(String(message.utf8Data).slice(3,6)),Number(String(message.utf8Data).slice(6,9))]
	      selected=selectedR
	      interpretClick(coords[0],coords[1],coords[2])
	      selectedR=selected
	      connection.sendUTF('movealong')
	    }
	    if(message.utf8Data=='eytr'){turnmarker[1]=1;EYT();connection.sendUTF('turned');}
	    if(message.utf8Data=='eytb'){turnmarker[0]=1;EYT();connection.sendUTF('turned');}
	    var sendingData=''
	    for(var x=0;x<5;x++){for(var y=0;y<5;y++){for(var z=0;z<4;z++){
	      if(String(gameBoard[x][y][z]).length==2){sendingData+='0'+String(gameBoard[x][y][z])}
	      else if(String(gameBoard[x][y][z]).length==1){sendingData+='00'+String(gameBoard[x][y][z])}
	      else{sendingData+=String(gameBoard[x][y][z])}
	    }}}
	    connection.sendUTF(sendingData)
        }
    });
    connection.on('close', function(reasonCode, description) {
      if(connection.remoteAddress==blue){  
      console.log((new Date()) + ' Client ' + connection.remoteAddress + ' (Blue Player) disconnected.');
      blue=null
      }
      else if(connection.remoteAddress==red){  
      console.log((new Date()) + ' Client ' + connection.remoteAddress + ' (Red Player) disconnected.');
      red=null
      }
    });
});





































function checkLose(side){
var loser=1;
for(var xx=0;xx<5;xx++){
for(var yy=0;yy<5;yy++){
if(gameBoard[xx][yy][0]==side){
loser=0;
}}}
return Boolean(loser);
}

function getCanvasCoords(x,y){
return [x*100,y*100,(x+1)*100,(y+1)*100]
}

function getArrayCoords(x,y){
return [Math.floor(x/100),Math.floor(y/100)]
}

function checkContingent(x,y,reqOwner,useCorner){
if(useCorner==null){useCorner=0;}
var doup=1
var dodown=1
var doleft=1
var doright=1
if(x==0){doleft=0;}
if(x==4){doright=0;}
if(y==0){doup=0;}
if(y==4){dodown=0;}

var result=0

if(doup){
result=(result || gameBoard[x][y-1][0]==reqOwner)
}
if(dodown){
result=(result || gameBoard[x][y+1][0]==reqOwner)
}
if(doleft){
result=(result || gameBoard[x-1][y][0]==reqOwner)
}
if(doright){
result=(result || gameBoard[x+1][y][0]==reqOwner)
}
result=(result || gameBoard[x][y][0]==reqOwner)
if(doup && doleft && useCorner){
result=(result || gameBoard[x-1][y-1][0]==reqOwner)
}
if(doup && doright && useCorner){
result=(result || gameBoard[x+1][y-1][0]==reqOwner)
}
if(dodown && doleft && useCorner){
result=(result || gameBoard[x-1][y+1][0]==reqOwner)
}
if(dodown && doright && useCorner){
result=(result || gameBoard[x+1][y+1][0]==reqOwner)
}



return Boolean(result)
}

function EYT(){
/*
var bluePro;
var redPro;
for(var x=0;x<5;x++){
for(var y=0;y<5;y++){
if(gameBoard[x][y][0]==1){
bluePro+=gameBoard[x][y][2]
}
if(gameBoard[x][y][0]==2){
redPro+=gameBoard[x][y][2]
}
}}
*/
if(turnmarker[0]&&turnmarker[1]){
connection.sendUTF('turnedall')
for(var x=0;x<5;x++){
for(var y=0;y<5;y++){
if(gameBoard[x][y][1]==0){
gameBoard[x][y][0]=0
}
if(gameBoard[x][y][0]!=0 && gameBoard[x][y][1]<gameBoard[x][y][2]){
gameBoard[x][y][1]++
}
if(gameBoard[x][y][0]!=0 && gameBoard[x][y][3]>0){
gameBoard[x][y][3]--
}
else if(gameBoard[x][y][0]!=0 && gameBoard[x][y][3]==0){
gameBoard[x][y][2]++
gameBoard[x][y][3]=5
}

}}
turnmarker[0]=0
turnmarker[1]=0
}
}

function interpretClick(clix,cliy,armySize){

clix-=9
cliy-=9
var clixyarr=getArrayCoords(clix,cliy);
if(selected[2]==0){
selected=[clixyarr[0],clixyarr[1],1]
}
else{

//_*_*_*_*_*_*_*_*_*_*_*_*_*ATTACK*_*_*_*_*_*_*_*_*_*_*_*_*_

	//target is gameBoard[clixyarr[0]][clixyarr[1]][1]
	//attacker is gameBoard[selected[0]][selected[1]][1]

//var armySize=Number(document.getElementById('armysize').value)
//var armySize=Number(prompt('How many soldiers?',String(Math.floor(gameBoard[selected[0]][selected[1]][1]/2))))

//if were not bluffing, having a civil war, moving the other player's troops, or missing the ground
if(armySize<gameBoard[selected[0]][selected[1]][1] && gameBoard[selected[0]][selected[1]][0]!=gameBoard[clixyarr[0]][clixyarr[1]][0] && checkContingent(clixyarr[0],clixyarr[1],gameBoard[selected[0]][selected[1]][0]) ){
	
	//if our army is smaller or equal than theirs, compute; target-=armySize;attacker-=Armysize
	if(armySize<=gameBoard[clixyarr[0]][clixyarr[1]][1]){gameBoard[clixyarr[0]][clixyarr[1]][1]-=armySize;gameBoard[selected[0]][selected[1]][1]-=armySize}
	
	else{
	//if our army is bigger than theirs, compute and take over; attacker-=armySize; target=remainingArmy; capture
	if(armySize>gameBoard[clixyarr[0]][clixyarr[1]][1]){gameBoard[selected[0]][selected[1]][1]-=armySize;gameBoard[clixyarr[0]][clixyarr[1]][1]=armySize-gameBoard[clixyarr[0]][clixyarr[1]][1];gameBoard[clixyarr[0]][clixyarr[1]][0]=gameBoard[selected[0]][selected[1]][0];}
	}
}
//_*_*_*_*_*_*_*_*_*_*_*_*_*ATTACK*_*_*_*_*_*_*_*_*_*_*_*_*_

//if we are moving troops, but not the other player's, and we're not bluffing
else if(gameBoard[selected[0]][selected[1]][0]!=gameBoard[clixyarr[0]][clixyarr[1]][0] && armySize<=gameBoard[selected[0]][selected[1]][1]){
if(armySize<gameBoard[selected[0]][selected[1]][1] && gameBoard[selected[0]][selected[1]][0]==gameBoard[clixyarr[0]][clixyarr[1]][0]){
gameBoard[clixyarr[0]][clixyarr[1]][1]+=armySize
gameBoard[selected[0]][selected[1]][1]-=armySize
}
}
selected=[selected[0],selected[1],0]
}
/*drawBoard()*/;
}
