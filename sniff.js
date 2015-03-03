var pcap = require("pcap"),
    _ = require('lodash'),
    os = require('os'),
    dns = require('dns'),
    util = require('util'),
    satelize = require('satelize'),
    IPinfo = require('get-ipinfo'),
    pcap_session = pcap.createSession("", "");

console.log("Listening on " + pcap_session.device_name);


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
  })
});

listenPackets();

var addrList = [];
var addrLookupList = [];
var that = this;

function listenPackets() {

  pcap_session.on('packet', function (raw_packet) {
    var packet = pcap.decode.packet(raw_packet);

    // Log ips
    var addr = {
      src: buildIp(packet.payload.payload.saddr),
      dest: buildIp(packet.payload.payload.daddr)
    };

    
    //console.log(addr);

    // Make sure this isn't a dupe request
    if (_.find(addrList, addr) == undefined) {

      // Validate address source and destination
      if (addr.src !== '' && addr.src !== '.......' && addr.dest !== '' && addr.dest !== '.......') {
        
        addrList.push(addr);
        console.log(addrList);
        console.log('----------------')

        
        that.obj = {};

        // Lookup address
        if (!isLocalIp(addr.src)) {
          satelize.satelize({ip:addr.src}, function(err, geoData) {
            if (geoData != undefined) {
              that.obj.src = JSON.parse(geoData);
            } else {
              return false;
            }

            if (_.has(that.obj, 'dest')) {
              ready();
            }
          });
        } else {
          that.obj.src = addr.src;
        }

        // Lookup address
        if (!isLocalIp(addr.dest)) {
          satelize.satelize({ip:addr.dest}, function(err, geoData) {
            if (geoData != undefined) {
              that.obj.dest = JSON.parse(geoData);
            } else {
              return false;
            }
            
            if (_.has(that.obj, 'src')) {
              ready();
            }
          });
        } else {
          that.obj.dest = addr.dest;
        }

      }
    }
      

      function ready() {
        addrLookupList.push(that.obj);
        io.sockets.emit('packetEvent', that.obj);
      }
  });
}


/* Helpers
-----------------------*/

function reverseLookup(ip) {
  dns.reverse(ip,function(err,domains){
    if (err!=null) callback(err);
 
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
