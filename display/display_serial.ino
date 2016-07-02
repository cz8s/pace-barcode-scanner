#include "SevSeg.h"

SevSeg sevseg; //Instantiate a seven segment controller object
String number;

void setup() {
  byte numDigits = 4;   
  byte digitPins[] = {2, 3, 4, 5};
  byte segmentPins[] = {6, 7, 8, 9, 10, 11, 12, 13};

  sevseg.begin(COMMON_ANODE, numDigits, digitPins, segmentPins);
  sevseg.setBrightness(100);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available() >0) {
    char c = Serial.read();
    number += c;
  } 
  if (number.length() >3) {
    Serial.println(number);
    sevseg.setNumber(number.toInt(), 1);
    number = "";
  }
  sevseg.refreshDisplay();
}

