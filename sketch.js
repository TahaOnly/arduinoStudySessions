let pHtmlMsg;
let serialOptions = { baudRate: 9600 };
let serial;

let latestData = "waiting for data"; // Variable to hold the data
let studyTimes = []; // Array to hold study times


function setup() {
  createCanvas(680, 480);
  let cvs = createCanvas(400, 400);
  cvs.parent('canvas-container'); // This makes the p5.js canvas a child of the div
  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
}

function draw() {
  background(220);
  
  // Call the function to draw the graph based on the studyTimes array
  drawGraph(studyTimes);

  // Graph Labels and Title
  drawLabels();
}

// Function to draw the graph
function drawGraph(data) {
  stroke(0); // Set line color to black
  noFill();
  
  beginShape();
  for (let i = 0; i < data.length; i++) {
    // Map the data point to fit the graph dimensions
    let x = map(i, 0, data.length - 1, 60, width-20);
    let y = map(data[i], 0, max(data), height-50, 50); // Assuming max study time determines height
    vertex(x, y);
  }
  endShape();

  // Draw points and display values
  for (let i = 0; i < data.length; i++) {
    let x = map(i, 0, data.length - 1, 0, width);
    let y = map(data[i], 0, max(data), height, 0);
    fill(0); // Set fill color to black for the text
    ellipse(x, y, 1, 1); // Draw point
    text(data[i], x+3, y); // Display value
  }
}

function drawLabels() {
  fill(0);
  
  // Title
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Study Time Graph", width / 2, 20);

  // Y-axis label
  textSize(16);
  textAlign(CENTER, CENTER);
  push(); // Save the current drawing style settings and transformations
  translate(20, height / 2);
  rotate(-HALF_PI); // Rotate the text for Y-axis label
  text("Study Time (seconds)", 0, 0);
  pop(); // Restore the settings

  // X-axis label
  textSize(16);
  textAlign(CENTER, CENTER);
  text("Study Sessions", width / 2, height - 20);
}

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
  
  // Data is received in the form studyTime:minute:second
  if (newData.length > 0) {
    latestData = newData; // Save the latest data
    if (latestData.startsWith("studyTime:")) {
      // Extract minutes and seconds
      let times = latestData.split(":");
      let studyTime = int(times[1]) * 60 + int(times[2]); // Convert to total seconds
      if (studyTime > 0){
        studyTimes.push(studyTime); // Add to the array of study times
      }
    }
  }
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}