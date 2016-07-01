var sleep = require('sleep');

var Gpio = require('onoff').Gpio,
    pin_digit = { 1: 2, 2: 3, 3: 17, 4: 5 },
    pin_seg = {a:10, b:11, c:18, d:13, e:14, f:15, g:12},
    numbers = [ "abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg" ];
var digit = [];
var seg = [];
for (key in pin_digit) {
  digit[key] = new Gpio(pin_digit[key], 'out');
  digit[key].writeSync(0);
};  
for (key in pin_seg) {
  seg[key] = new Gpio(pin_seg[key], 'out');
  seg[key].writeSync(1);
};  


function show_digit(num) {
  var all = 'abcdefg';
  for (key in all) {
    seg[all[key]].writeSync(1);
  }
  for (key in numbers[num]) {
    seg[numbers[num][key]].writeSync(0);
  };
};


function show_number(num) {
  for (i = 0; i < 200; i++) {
    for (d in num) {
      pos = parseInt(d)+1;
      digit[pos].writeSync(1);
      show_digit(num[pos-1]);
      sleep.usleep(2000);
      digit[pos].writeSync(0);
    };
  };
}



show_number('4342');

