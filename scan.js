const config = require('config');
const request = require('request');
const moment = require('moment');
const fs = require('fs');
const LinuxInputListener = require('linux-input-device');
var Gpio = require('onoff').Gpio;

var apiurl = config.get('pace-url')+'/api/scan';
var keylist = [2,3,4,5,6,7,8,9,10,11]
var colors = { red: 15, green: 14 };
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
blink('green');
blink('red');

function handle_keys(key,event) {
  if (keylist.indexOf(key) >= 0)  {
    if (typeof number[event] === "undefined") {
      number[event] = '';
    }
    if (key == 11) { key = 1 } // if you press the 0
    number[event] = "" + number[event] + (key-1)
  }
  if (key == 28) {
    time = moment().unix();
    sendResult(number[event],time);
    writeCSV(number[event],time);
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

function handleResponse(error, response, body) {
    if (!error ) {
      if (response.statusCode === 200) { blink('green');
      } else { blink('red'); };
    }
   else {
     console.log(error)
     blink('red');
   }
};
 
function blink(color) {
  light_on(color);
  setTimeout(light_off,1000,color);
}
function light_on(color) {
  if (config.get('led')) {
    var led = new Gpio(colors[color], 'out');
    led.writeSync(1);
  }
}

function light_off(color) {
  if (config.get('led')) {
    var led = new Gpio(colors[color], 'out');
    led.writeSync(0);
  }
}

function writeCSV(startnumber,time) {
var csvstring = '"' + startnumber + '","' + time + '"\n'
fs.appendFile('results.csv', csvstring , function (err) {
    if (err) throw err;
});
};

process.on('exit', exitHandler.bind(null, {exit:true}));

