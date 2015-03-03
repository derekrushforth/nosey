var Site = {

  init: function() {


    function error(msg) {
      var s = document.querySelector('#status');
      s.innerHTML = typeof msg == 'string' ? msg : "failed";
      s.className = 'fail';
      
      // console.log(arguments);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(data) {
        Site.location = {
          coords: data.coords,
          latlng: new google.maps.LatLng(data.coords.latitude, data.coords.longitude)
        }
        Site.createMaps(data.coords)
      }, error);
    } else {
      error('not supported');
    }
  },


  createMaps: function(coords) {
    var gcoords = new google.maps.LatLng(coords.latitude, coords.longitude);
    var mapStyles = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"},{"weight":"1.62"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}];

    // Create satellite map
    // TODO: need to show something else if street view isn't available
    Site.satelliteMap = new google.maps.Map(document.getElementById('satellite-view'), {
      center: gcoords,
      zoom: 4,
      styles: mapStyles
    });

    Site.connectSockets();
  },

  connectSockets: function() {
    var socket = io('http://localhost:3008');

    socket.on('connected', function(data) {
      console.log(data);
      //socket.emit('my other event', { my: 'data' });
    });

    socket.on('packetEvent', function(data) {
      console.log(data);
      if (typeof(data.src) == 'object') {
        
        var coords = new google.maps.LatLng(data.src.latitude, data.src.longitude);
        var path = new google.maps.Polyline({
          path: [coords, Site.location.latlng],
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: .3,
          strokeWeight: 2
        });

        path.setMap(Site.satelliteMap);

        var marker = new google.maps.Marker({
            position: coords,
            map: Site.satelliteMap,
            title: 'Hello World!'
        });
      }

      if (typeof(data.dest) == 'object') {
        var coords = new google.maps.LatLng(data.dest.latitude, data.dest.longitude);
        var path = new google.maps.Polyline({
          path: [coords, Site.location.latlng],
          geodesic: true,
          strokeColor: '#0000FF',
          strokeOpacity: .3,
          strokeWeight: 2
        });

        path.setMap(Site.satelliteMap);

        var marker = new google.maps.Marker({
            position: coords,
            map: Site.satelliteMap,
            title: 'Hello World!'
        });
      }
    });
  },

  isLocalIp: function(ip) {
    if (_.startsWith(ip, '192.168.1')) {
      return true
    } else {
      return false
    }
  }
};

$(document).ready(Site.init);