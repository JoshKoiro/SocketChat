var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var clc = require('cli-color');

var AddressColorConnect = clc.magentaBright;
var AddressColorDisconnect = clc.xterm(202);

//express server function

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// get the IP address of connections (filter and format result)

function getIp(client){
  if(client.handshake.address === "::1"){
    client_ip = 'localhost';
  } else {
    client_ip = client.handshake.address;
  }
  return client_ip;
}

//Socket.io server-side function
io.on('connection', function(client){
  //run getIP function
  var client_ip = getIp(client);
  //get current date
  var newDate = new Date();
  //format current date
  var date = newDate.getMonth()+"/"+ newDate.getDate()+ " at: " + newDate.getHours()+ ':' + newDate.getMinutes() + ":" + newDate.getSeconds();
  //output connection notification
  console.log(AddressColorConnect("\r\n"+ client_ip));
  console.log(AddressColorConnect("connected at " + date));

  client.on('disconnect',function(){
    //define diconnect date
    var date = new Date();
    //output disconnection notification
    console.log(AddressColorDisconnect("\r\n"+ client_ip));
    console.log(AddressColorDisconnect(" disconnected at " + date));
  });
  //message connection
  client.on('chat message',function(msg){
    io.emit('chat message',msg);
  });


});
//run server
server.listen(3000,function(){
  console.log('server running on localhost:3000');
});
