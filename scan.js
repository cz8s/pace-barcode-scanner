const readline = require('readline');
const config = require('config');
const request = require('request');
const LinuxInputListener = require('linux-input-device');
const i2c = require('i2c');
const Gpio = require('onoff').Gpio;
var colors = { blue: 17, red: 27, green: 22 };

var address = 0x04;
var wire = new i2c(address, {device: '/dev/i2c-1'});

var apiurl = config.get('pace-url')+'/api/scan';
var keylist = [2,3,4,5,6,7,8,9,10,11]
var events = config.get('events')
var input = {};
light_on('blue')
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
    request.post(apiurl, {form:{startnumber:input,time:Date.now()}})
      .on('response', function(response) {
      })
    .on('error', function(err) {
      blink('red');
    });
    send_to_display(number[event],blink);
    number[event] = '';
  }
};

function send_to_display(number) {
 for ( digit in number) {
    wire.writeByte(number[digit], function(err) {});
  }
  wire.writeByte(255, function(err) {}); //end byte
  blink('green');
};

function blink(color) {
  light_on(color)
  setTimeout(light_off,1000,color);
}
function light_on(color) {
  var led = new Gpio(colors[color], 'out');
  led.writeSync(1);
}

function light_off(color) {
  var led = new Gpio(colors[color], 'out');
  led.writeSync(0);
}

function exitHandler(options, err) {
    light_off('blue')
    process.exit();
}

process.on('exit', exitHandler.bind(null, {exit:true}));

