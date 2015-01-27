var PORT, MAPCODE, blue, red, turnmarker, selected, selectedB, selectedR, gameBoard, boardsize, iteratorCat, boardsizeArray;
function reset(){
var PORT=8090
var MAPCODE='00500500400010005000100000000000000.800.10000000000.400.20000000000.200.20000000000.100020000000000.800.10000000000.400.20000000000.200.20000000000.100020000000000.200.20000000000.400.20000000000.200.200000000000100020000000000.200.20000000000.400.20000000000.200.20000000000.100020000000000.200.20000000000.400.20000000000.800.10000000000.100020000000000.200.20000000000.400.20000000000.800.10002000500010000'





//[owner,strenghth,infrastructure,build progress]
var blue=null;
var red=null;
var turnmarker=[0,0]
var selected=[0,0,0]
var selectedB=[0,0,0]
var selectedR=[0,0,0]
var gameBoard=[
[
[1,5,1.0,0.0,function(){return;}],[0,0,0.8,0.1,function(){return;}],[0,0,0.4,0.2,function(){return;}],[0,0,0.2,0.2,function(){return;}],[0,0,0.1,2.0,function(){return;}]
]
,
[
[0,0,0.8,0.1,function(){return;}],[0,0,0.4,0.2,function(){return;}],[0,0,0.2,0.2,function(){return;}],[0,0,0.1,2.0,function(){return;}],[0,0,0.2,0.2,function(){return;}]
]
,
[
[0,0,0.4,0.2,function(){return;}],[0,0,0.2,0.2,function(){return;}],[0,0,1.0,2.0,function(){return;}],[0,0,0.2,0.2,function(){return;}],[0,0,0.4,0.2,function(){return;}]
]
,
[
[0,0,0.2,0.2,function(){return;}],[0,0,0.1,2.0,function(){return;}],[0,0,0.2,0.2,function(){return;}],[0,0,0.4,0.2,function(){return;}],[0,0,0.8,0.1,function(){return;}]
]
,
[
[0,0,0.1,2.0,function(){return;}],[0,0,0.2,0.2,function(){return;}],[0,0,0.4,0.2,function(){return;}],[0,0,0.8,0.1,function(){return;}],[2,5,1.0,0.0,function(){return;}]
]

]

var boardsize=MAPCODE.slice(0,9)
var iteratorCat=9
for(var x=0;x<boardsize[0];x++){for(var y=0;y<boardsize[1];y++){for(var z=0;z<boardsize[2];z++){
gameBoard[x][y][z]=Number(String(MAPCODE).slice(iteratorCat,iteratorCat+4))
iteratorCat+=4
}}}

var boardsizeArray=[Number(boardsize.slice(0,3)),Number(boardsize.slice(3,6)),Number(boardsize.slice(6,9))]

}
reset();

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
	      if(blue==null && message.utf8Data=='blue'){
		blue=connection.remoteAddress;
		connection.sendUTF('blue');
		console.log('blue is '+blue)
		connection.sendUTF('gameboardsize'+boardsize)
		updateClientBoard();
	      }
	      else if(red==null && message.utf8Data=='red'){
		red=connection.remoteAddress;
		connection.sendUTF('red');
		console.log('red is '+red)
		connection.sendUTF('gameboardsize'+boardsize)
		updateClientBoard();
	      }
	      else if(blue!=null && red!=null){
		connection.sendUTF('sorry');
	      }
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
	    if(message.utf8Data=='eytr'){
	      turnmarker[1]=1;
	      EYT();
	      connection.sendUTF('turned');
	    }
	    if(message.utf8Data=='eytb'){
	      turnmarker[0]=1;
	      EYT();
	      connection.sendUTF('turned');
	      }    
	    function updateClientBoard(){
	      var sendingData=''
	      for(var x=0;x<boardsizeArray[0];x++){for(var y=0;y<boardsizeArray[1];y++){for(var z=0;z<boardsizeArray[2];z++){
		if          (String(gameBoard[x][y][z]).length==4){sendingData+=''+String(gameBoard[x][y][z])}
		else if(String(gameBoard[x][y][z]).length==3){sendingData+='0'+String(gameBoard[x][y][z])}
		else if(String(gameBoard[x][y][z]).length==2){sendingData+='00'+String(gameBoard[x][y][z])}
		else{sendingData+='000'+String(gameBoard[x][y][z])}
	      }}}
	      connection.sendUTF(sendingData)
	      
	      var colors=['0','0']
	      if(turnmarker[0]==1){colors[0]='1'}
	      if(turnmarker[1]==1){colors[1]='1'}
	      connection.sendUTF('color'+colors[0]+colors[1])
	      
	      if(turnmarker[0]==1 && turnmarker[1]==1){
		turnmarker[0]=0
		turnmarker[1]=0
		console.log('just ended both turns!')
	      }
	      
	      setTimeout(updateClientBoard,100)
	    }
        }
    });
    connection.on('close', function(reasonCode, description) {
      if(connection.remoteAddress==blue){  
      console.log((new Date()) + ' Client ' + connection.remoteAddress + ' (Blue Player) disconnected.');
      blue=null
      reset();
      }
      else if(connection.remoteAddress==red){  
      console.log((new Date()) + ' Client ' + connection.remoteAddress + ' (Red Player) disconnected.');
      red=null
      reset();
      }
    });
});


//start mods here

//end mods here

function checkLose(side){
	var loser=1;
	for(var xx=0;xx<5;xx++){
		for(var yy=0;yy<5;yy++){
			if(gameBoard[xx][yy][0]==side){
				loser=0;
			}
		}
	}
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
	if(turnmarker[0]&&turnmarker[1]){
		for(var x=0;x<5;x++){
			for(var y=0;y<5;y++){
				//if out of soldiers remove ownership
				if(gameBoard[x][y][1]==0){
					gameBoard[x][y][0]=0
				}
				
				//if owned, produce
				if(gameBoard[x][y][0]!=0){
					gameBoard[x][y][3]+=gameBoard[x][y][2]
				}
				
				//if at least one ready, deploy one
				if(gameBoard[x][y][0]!=0 && gameBoard[x][y][3]>=1){
					gameBoard[x][y][3]--
					gameBoard[x][y][1]++
				}
				
				//if terrain modifier, apply
				else if(gameBoard[x][y][4]!= function(){return;}){
					gameBoard[x][y][4]();
				}
			
			}
		
		}
	}
}

function interpretClick(clix,cliy,armySize){
	armySize=Math.floor(armySize)
	clix-=9
	cliy-=9
	var clixyarr=getArrayCoords(clix,cliy);
	if(selected[2]==0){
		selected=[clixyarr[0],clixyarr[1],1]
	}
	else{
		//if were not bluffing, having a civil war, moving the other player's troops, or missing the ground
		if(armySize<gameBoard[selected[0]][selected[1]][1] && 
		gameBoard[selected[0]][selected[1]][0]!=gameBoard[clixyarr[0]][clixyarr[1]][0] && 
		checkContingent(clixyarr[0],clixyarr[1],gameBoard[selected[0]][selected[1]][0]) ){
			//if our army is smaller or equal than theirs, compute; target-=armySize;attacker-=Armysize
			if(armySize<=gameBoard[clixyarr[0]][clixyarr[1]][1]){gameBoard[clixyarr[0]][clixyarr[1]][1]-=armySize;gameBoard[selected[0]][selected[1]][1]-=armySize}
			
			else{
			//if our army is bigger than theirs, compute and take over; attacker-=armySize; target=remainingArmy; capture
			if(armySize>gameBoard[clixyarr[0]][clixyarr[1]][1]){gameBoard[selected[0]][selected[1]][1]-=armySize;gameBoard[clixyarr[0]][clixyarr[1]][1]=armySize-gameBoard[clixyarr[0]][clixyarr[1]][1];gameBoard[clixyarr[0]][clixyarr[1]][0]=gameBoard[selected[0]][selected[1]][0];}
			}
		}
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
 
