const config = require('config');
const request = require('request');
const LinuxInputListener = require('linux-input-device');

var apiurl = config.get('pace-url')+'/api/scan';
var keylist = [2,3,4,5,6,7,8,9,10,11]
var events = config.get('events')
var input = {};

events.forEach(function(event) {
  input[event] = new LinuxInputListener('/dev/input/event'+event);
  input[event].on('state', function(value, key, kind) {
    if (value == true) {
      handle_keys(key,event)
    }
  });
});

var number = {};

function handle_keys(key,event) {
  var paceRequest = request.defaults({
      headers: {'X-Pace-Token': config.get(token)}
  })
  if (keylist.indexOf(key) >= 0)  {
    if (typeof number[event] === "undefined") {
      number[event] = '';
    }
    if (key == 11) { key = 1 } // if you press the 0
    number[event] = "" + number[event] + (key-1)
  }
  if (key == 28) {
    paceRequest.post(apiurl, {form:{startnumber:input,time:Date.now()}})
      .on('response', function(response) {
       console.log(response);
      })
    .on('error', function(err) {
      console.log('error from server');
    });
    number[event] = '';
  }
};

function exitHandler(options, err) {
    process.exit();
}

process.on('exit', exitHandler.bind(null, {exit:true}));

