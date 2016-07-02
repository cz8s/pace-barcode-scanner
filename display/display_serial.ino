#include "SevSeg.h"
#include <Wire.h>

#define SLAVE_ADDRESS 0x04

SevSeg sevseg; //Instantiate a seven segment controller object
String number;

void receiveData(int byteCount){
  byte c;
  Serial.println(byteCount);
  while ( Wire.available()) {
    c = Wire.read();
    number += c;
  }
  Serial.println(number);
  if (number.length() >3) {
    sevseg.setNumber(number.toInt(), 1);
    number = "";
  }
}

void setup() {
  byte numDigits = 4;   
  byte digitPins[] = {2, 3, 4, 5};
  byte segmentPins[] = {6, 7, 8, 9, 10, 11, 12, 13};
  sevseg.begin(COMMON_ANODE, numDigits, digitPins, segmentPins);
  sevseg.setBrightness(100);

  Serial.begin(9600);
  Wire.begin(SLAVE_ADDRESS);
  Wire.onReceive(receiveData);
}

void loop() {
    sevseg.refreshDisplay();
}


