var _ = require('lodash'),
    os = require('os'),
    dns = require('dns'),
    util = require('util'),
    satelize = require('satelize'),
    IPinfo = require('get-ipinfo'),
    fs = require('fs');


// Startup
// -------------------------------
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3008);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', 'public');

io.on('connection', function (socket) {
  //socket.emit('news', { hello: 'world' });
  socket.on('connect', function(data) {
    console.log(data);
  });

  // Send first set of collected data
  _.forEach(addrLookupList, function(item) {
    io.sockets.emit('packetEvent', item);
  });
});

init();

var addrList = [];
var addrLookupList = [];
var that = this;


function init() {
  fs.readFile('routes.json', 'utf-8', function(err, data) {
    if (err) throw err;
    var json = JSON.parse(data);
    var test = {
      routes: []
    };

    _.forEach(json.routes, function(item) {
      that.obj = {};

      that.obj.src = satelize.satelize({ip:item.src});

      // satelize.satelize({ip:item.src}, function(err, geoData) {
   
      //     that.obj.src = JSON.parse(geoData);
      // });
      // satelize.satelize({ip:item.dest}, function(err, geoData) {
    
      //     that.obj.dest = JSON.parse(geoData);
      // });

      test.routes.push(that.obj);
      console.log(test.routes);
    });



  });
}


/* Helpers
-----------------------*/

function reverseLookup(ip) {
  dns.reverse(ip,function(err,domains){
    if(err!=null) callback(err);
 
    domains.forEach(function(domain){
      dns.lookup(domain,function(err, address, family){
        console.log(domain,'[',address,']');
        console.log('reverse:',ip==address);
      });
    });
  });
}

function buildIp(ip) {
  return _.values(ip).join('.');
}

function isLocalIp(ip) {
  if (_.startsWith(ip, '192.168.1')) {
    return true
  } else {
    return false
  }
}

function rpad(num, len) {
  var str = num.toString();
  while (str.length < len) {
      str += " ";
  }
  return str;
}
