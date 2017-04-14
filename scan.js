const config = require('config');
const request = require('request');
const moment = require('moment');
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
  if (keylist.indexOf(key) >= 0)  {
    if (typeof number[event] === "undefined") {
      number[event] = '';
    }
    if (key == 11) { key = 1 } // if you press the 0
    number[event] = "" + number[event] + (key-1)
  }
  if (key == 28) {
    sendResult(input,Date.now());
    number[event] = '';
  };
};

function exitHandler(options, err) {
    process.exit();
}


function sendResult(startnumber,time) {
  var options = {
      url: apiurl,
      method: 'POST',
      form: {startnumber:startnumber,time:time},
      headers: {
            'X-Pace-Token': config.get('token')
          }
  };
  request(options, handleResponse);
};

function finishSeconds() {
  return moment().unix() - moment().startOf('day').unix();
};

function handleResponse(error, response, body) {
    if (!error ) {
      console.log(response.statusCode);
    }
   else {
     console.log(error)
   }
}
 

process.on('exit', exitHandler.bind(null, {exit:true}));

