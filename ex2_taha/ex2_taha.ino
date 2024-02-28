#include <LiquidCrystal.h>

const int rs = 12, en = 11, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);
const int buttonPin = 7; // Reset button
const int stopResumePin = 8; // Stop/Resume button
const int trigPin = 13; // Ultrasonic sensor trigger pin
const int echoPin = 10; // Ultrasonic sensor echo pin

//time tracking variables
// m and s are for time interval measurement which are sent to p5
// minutes and secondes are for timer which is displayed on lcd
signed short minutes = 0, secondes = 0, m=0, s=0; 

// stores character of the cell
char timeline[16];

// check if timer is running to trigger sending time interval to p5
bool timerRunning = true;

void setup() {
  Serial.begin(9600);
  lcd.begin(16, 2);
  lcd.print("Timer :");
  pinMode(buttonPin, INPUT);
  pinMode(stopResumePin, INPUT);
  pinMode(trigPin, OUTPUT); // Set the trig pin as output
  pinMode(echoPin, INPUT); // Set the echo pin as input
}

void loop() {
  // Ultrasonic sensor distance measurement
  long duration, distance;
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = (duration / 2) / 29.1; // Convert to distance in cm

  // Check if the reset button is pressed
  if (digitalRead(buttonPin) == HIGH) {
    minutes = 0;
    secondes = 0;

    m=0;
    s=0;
    
    lcd.clear();
    lcd.print("Timer :");
    timerRunning = true;
  }

  // Toggle timer running state if stop/resume button is pressed
  static bool lastButtonState = LOW;
  bool currentButtonState = digitalRead(stopResumePin);
  if (currentButtonState != lastButtonState) {
    if (currentButtonState == HIGH) {
      timerRunning = !timerRunning;
    }
    delay(50); // Debouncing
  }
  lastButtonState = currentButtonState;

  // Timer runs only if the ultrasonic sensor senses an object within a certain distance
  if (distance <= 50 && timerRunning) {
    lcd.setCursor(0, 0);
    lcd.print("Timer : STUDY");
    lcd.setCursor(0, 1);
    sprintf(timeline, "%0.2d mins %0.2d secs", minutes, secondes);
    lcd.print(timeline);
  
    delay(1000);
  
    secondes++;
    s++;

    // increment minutes when seconds reach 60 mark
    if (secondes == 60) {
      secondes = 0;
      minutes++;

      s = 0;
      m++;
    }
  } else {
    // due to the object being out of range
    lcd.setCursor(0, 0);
    lcd.print("Timer : RELAX");
    // send time interval to p5
    Serial.print("studyTime:");
    Serial.print(m);
    Serial.print(":");
    Serial.println(s);
    // reset time to 0 so next time interval could be calculated
    m=0;
    s=0;
  }
}
