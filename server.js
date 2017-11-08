var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var clc = require('cli-color');
var moment = require('moment');
var ip = require('ip');
var os = require('os');
var figlet = require('figlet');
var qrcode = require('qrcode-terminal');
var cliSpinners = require('cli-spinners');
var ora = require("ora");

//Persistant Message database
var Messages = [];
var Users = [];

var AddressColorConnect = clc.green;
var AddressColorDisconnect = clc.xterm(202);

//express server function

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

//express server function for curling to url
app.get('/bash',function(req,res){
    app.set('json spaces',3)
    res.json(Messages)
});

// get the IP address of connections (filter and format result)

function getIp(client){
  if(client.handshake.address === "::1"){
    client_ip = 'localhost';
  } else {
    client_ip = client.handshake.address.split(":")[3];
  }
  return client_ip;
}

//Socket.io server-side function
io.on('connection', function(client){
  //run getIP function
  var client_ip = getIp(client);
  //get current date
  var newDate = new Date();
  //output connection notification
  console.log(AddressColorConnect("\r\n"+ client_ip));
  console.log(AddressColorConnect("connected "+ moment().format("MMMM Do") + " at " + moment().format("h:mm:ss a")));
  console.log(client.id)
  //Send update emitter message to client that has connected
  io.to(client.id).emit('update',Messages)

  //Emit message function TODO: Call this function instead of repeating code
  let emitMessage = (msg,emitter) => {
    var messageDate = new Date()
    msg.ipAddress = client_ip
    msg.time = moment().format("h:mm:ss a")
    msg.date = moment().format("MMMM Do")
    msg.year = moment().format("YYYY")
    Messages.push(msg)
    io.emit(emitter,msg)
  }

  //Update User DB
  let updateUsers = (msg,add) => {
    (add) 
      ? Users.push(msg)
      : Users = Users.filter((e) => e.user !== msg.user)
  }
  
  client.on('username update',(msg) =>{
    emitMessage(msg,'newuser')
    updateUsers(msg,true)
    console.log(Users)
  })

  client.on('disconnect',function(){
    //define diconnect date
    var date = new Date();
    //output disconnection notification
    console.log(AddressColorDisconnect("\r\n"+ client_ip));
    console.log(AddressColorDisconnect(" disconnected "+ moment().format("MMMM Do") +" at " + moment().format("h:mm:ss a")));
  });

  //post message to Messages object

  //message connection
  client.on('chat message',function(msg){
    console.log(clc.blueBright("\r\n - " + client_ip + " posted as " + msg.user + " at " + moment().format("h:mm:ss a")));
    emitMessage(msg,'chat message')
  });

  //Vibration for mobile
  client.on('vibrate',function(data){
    io.emit('vibrate',data);
    console.log('vibration function called');
    });

});
//run server
var port = 3000;
server.listen(port,function(){
  figlet('SocketChat',(err,data) => {
    if(err){
      console.log("something went wrong: " + err);
    } else {
      // console.log(data);
      var serverIp = ip.address();
      let connectedDate = new Date()
      console.log(qrcode.generate(serverIp+":"+port));
      console.log(clc.whiteBright("\r\n----------"));
      console.log(clc.whiteBright("Server Connected at " + moment().format("h:mm:ss a") + " on " + moment().format("MMMM Do YYYY")))
      console.log(clc.whiteBright("----------"));
      console.log(clc.whiteBright("\r\n----------"));
      console.log(clc.whiteBright('server running on LAN at '+serverIp+':3000'));
      console.log(clc.whiteBright("----------"));
  }
})
});
