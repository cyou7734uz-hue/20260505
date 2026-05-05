// Face Mesh Detection + 手機按鈕版完整程式
// p5.js + ml5.js FaceMesh

let capture;
let faceMesh;
let faces = [];
let triangles;

let mode = 1;
let scanY = 0;

let videoX, videoY, videoW, videoH;
let buttons = [];

function preload() {
  // 檢查 ml5 是否成功載入
  if (typeof ml5 !== 'undefined') {
    faceMesh = ml5.faceMesh({
      maxFaces: 1,
      flipped: false // 關閉 ml5 自動翻轉，改由 p5 統一控制鏡像
    });
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  capture = createCapture(VIDEO);

  capture.hide();

  if (faceMesh) {
    faceMesh.detectStart(capture, gotFaces);
    triangles = faceMesh.getTriangles();
  }

  textFont("Arial");
}

function gotFaces(results) {
  faces = results;
}

function draw() {
  background("#c6ddff");

  // 手機與電腦都會自動調整攝影機區域
  if (width < height) {
    // 手機直式
    videoW = width * 0.86;
    videoH = videoW * 0.75;
  } else {
    // 電腦橫式
    videoW = width * 0.5;
    videoH = height * 0.5;
  }

  videoX = (width - videoW) / 2;
  videoY = height * 0.27;

  drawSoftBackground();
  drawTitle();
  drawVideoFrame();

  if (capture.width > 0) {
    capture.loadPixels();

    // 顯示攝影機畫面與特效 (統一在鏡像座標系下繪製)
    push();
    translate(width, 0);
    scale(-1, 1);
    
    image(capture, videoX, videoY, videoW, videoH);

    if (faces.length > 0 && triangles) {
      let face = faces[0];

      if (mode === 1) {
        drawOriginalMask(face);
      } else if (mode === 2) {
        drawNeonMask(face);
      } else if (mode === 3) {
        drawEnergyMask(face);
      } else if (mode === 4) {
        drawBrokenMask(face);
      }

      drawEyeEffect(face);
    }
    pop();

    if (faces.length === 0) {
      drawWaitingText();
    }
  }

  drawMobileHint();
  drawModeButtons();
}
function mapPoint(point) {
  let sx = videoW / capture.width;
  let sy = videoH / capture.height;

  return {
    x: videoX + point.x * sx,
    y: videoY + point.y * sy
  };
}

// 模式 1：原始三角臉譜
function drawOriginalMask(face) {
  for (let i = 0; i < triangles.length; i++) {
    let tri = triangles[i];
    let [a, b, c] = tri;

    let pA = face.keypoints[a];
    let pB = face.keypoints[b];
    let pC = face.keypoints[c];

    let pointA = mapPoint(pA);
    let pointB = mapPoint(pB);
    let pointC = mapPoint(pC);

    let cx = (pA.x + pB.x + pC.x) / 3;
    let cy = (pA.y + pB.y + pC.y) / 3;

    let index = (floor(cx) + floor(cy) * capture.width) * 4;

    let rr = capture.pixels[index];
    let gg = capture.pixels[index + 1];
    let bb = capture.pixels[index + 2];

    stroke(255, 255, 255, 120);
    strokeWeight(0.6);
    fill(rr, gg, bb, 230);

    triangle(
      pointA.x, pointA.y,
      pointB.x, pointB.y,
      pointC.x, pointC.y
    );
  }
}

// 模式 2：霓虹科技面具
function drawNeonMask(face) {
  for (let i = 0; i < triangles.length; i++) {
    let tri = triangles[i];
    let [a, b, c] = tri;

    let pA = face.keypoints[a];
    let pB = face.keypoints[b];
    let pC = face.keypoints[c];

    let pointA = mapPoint(pA);
    let pointB = mapPoint(pB);
    let pointC = mapPoint(pC);

    let cx = (pointA.x + pointB.x + pointC.x) / 3;
    let cy = (pointA.y + pointB.y + pointC.y) / 3;

    // 因為座標系翻轉了，滑鼠 X 座標也要對應處理
    let d = dist(width - mouseX, mouseY, cx, cy);
    let glow = map(d, 0, 250, 255, 50);
    glow = constrain(glow, 50, 255);

    let rr = map(sin(frameCount * 0.03 + i), -1, 1, 120, 255);
    let gg = map(cos(frameCount * 0.04 + i), -1, 1, 120, 255);
    let bb = 255;

    stroke(255, 255, 255, glow);
    strokeWeight(0.9);
    fill(rr, gg, bb, 95);

    triangle(
      pointA.x, pointA.y,
      pointB.x, pointB.y,
      pointC.x, pointC.y
    );
  }
}

// 模式 3：情緒能量粒子
function drawEnergyMask(face) {
  noStroke();

  for (let i = 0; i < triangles.length; i += 2) {
    let tri = triangles[i];
    let [a, b, c] = tri;

    let pA = face.keypoints[a];
    let pB = face.keypoints[b];
    let pC = face.keypoints[c];

    let pointA = mapPoint(pA);
    let pointB = mapPoint(pB);
    let pointC = mapPoint(pC);

    let cx = (pointA.x + pointB.x + pointC.x) / 3;
    let cy = (pointA.y + pointB.y + pointC.y) / 3;

    let size = map(sin(frameCount * 0.08 + i), -1, 1, 2, 8);

    fill(113, 52, 156, 150);
    ellipse(cx, cy, size, size);

    fill(255, 255, 255, 70);
    ellipse(cx, cy, size * 2.5, size * 2.5);
  }

  stroke(255, 255, 255, 110);
  strokeWeight(0.7);

  for (let i = 0; i < triangles.length; i += 5) {
    let tri = triangles[i];
    let [a, b, c] = tri;

    let pointA = mapPoint(face.keypoints[a]);
    let pointB = mapPoint(face.keypoints[b]);
    let pointC = mapPoint(face.keypoints[c]);

    line(pointA.x, pointA.y, pointB.x, pointB.y);
    line(pointB.x, pointB.y, pointC.x, pointC.y);
    line(pointC.x, pointC.y, pointA.x, pointA.y);
  }
}

// 模式 4：破碎臉譜
function drawBrokenMask(face) {
  for (let i = 0; i < triangles.length; i++) {
    let tri = triangles[i];
    let [a, b, c] = tri;

    let pA = face.keypoints[a];
    let pB = face.keypoints[b];
    let pC = face.keypoints[c];

    let pointA = mapPoint(pA);
    let pointB = mapPoint(pB);
    let pointC = mapPoint(pC);

    let cx = (pA.x + pB.x + pC.x) / 3;
    let cy = (pA.y + pB.y + pC.y) / 3;

    let index = (floor(cx) + floor(cy) * capture.width) * 4;

    let rr = capture.pixels[index];
    let gg = capture.pixels[index + 1];
    let bb = capture.pixels[index + 2];

    let offsetX = sin(frameCount * 0.03 + i) * 6;
    let offsetY = cos(frameCount * 0.03 + i) * 6;

    stroke(255, 255, 255, 70);
    strokeWeight(0.5);
    fill(rr, gg, bb, 190);

    triangle(
      pointA.x + offsetX, pointA.y + offsetY,
      pointB.x + offsetX, pointB.y + offsetY,
      pointC.x + offsetX, pointC.y + offsetY
    );
  }
}

// 眼睛科技感特效
function drawEyeEffect(face) {
  let leftEye = face.keypoints[33];
  let rightEye = face.keypoints[263];

  if (!leftEye || !rightEye) return;

  let l = mapPoint(leftEye);
  let r = mapPoint(rightEye);

  noFill();

  stroke("#ffffff");
  strokeWeight(3);
  ellipse(l.x, l.y, 36, 20);
  ellipse(r.x, r.y, 36, 20);

  stroke("#71349c");
  strokeWeight(2);
  line(l.x - 21, l.y, l.x + 21, l.y);
  line(r.x - 21, r.y, r.x + 21, r.y);
}

// 背景裝飾
function drawSoftBackground() {
  noStroke();

  fill(255, 255, 255, 45);
  ellipse(width * 0.18, height * 0.22, 180, 180);
  ellipse(width * 0.82, height * 0.72, 240, 240);

  stroke(255, 255, 255, 55);
  strokeWeight(1);

  for (let x = 0; x < width; x += 60) {
    line(x, 0, x, height);
  }

  for (let y = 0; y < height; y += 60) {
    line(0, y, width, y);
  }

  // 掃描線
  scanY += 2;
  if (scanY > height) {
    scanY = 0;
  }

  noStroke();
  fill(255, 255, 255, 45);
  rect(0, scanY, width, 6);
}

// 標題
function drawTitle() {
  fill("#71349c");
  stroke("#ffffff");
  strokeWeight(6);

  if (width < height) {
    textSize(38);
  } else {
    textSize(64);
  }

  textAlign(CENTER, CENTER);
  text("教科414730530", width / 2, height * 0.12);
  noStroke();
}

// 攝影機外框
function drawVideoFrame() {
  rectMode(CORNER);

  noStroke();
  fill(80, 60, 120, 50);
  rect(videoX + 10, videoY + 10, videoW, videoH, 24);

  fill(255, 255, 255, 230);
  rect(videoX - 10, videoY - 10, videoW + 20, videoH + 20, 26);

  noFill();
  stroke("#71349c");
  strokeWeight(4);
  rect(videoX - 10, videoY - 10, videoW + 20, videoH + 20, 26);

  noStroke();
}

// 沒有偵測到臉時
function drawWaitingText() {
  fill(255, 255, 255, 220);
  rect(videoX + 20, videoY + videoH / 2 - 32, videoW - 40, 64, 18);

  fill("#71349c");
  textAlign(CENTER, CENTER);

  if (width < height) {
    textSize(16);
  } else {
    textSize(22);
  }

  text("請面向鏡頭，生成你的數位臉譜", width / 2, videoY + videoH / 2);
}

// 小提示
function drawMobileHint() {
  let modeName = "";

  if (mode === 1) modeName = "原始三角臉譜";
  if (mode === 2) modeName = "霓虹科技面具";
  if (mode === 3) modeName = "情緒能量粒子";
  if (mode === 4) modeName = "破碎臉譜";

  noStroke();
  fill(255, 255, 255, 210);

  let boxW = width < height ? width * 0.76 : 300;
  let boxH = 42;
  let boxX = (width - boxW) / 2;
  let boxY = videoY + videoH + 35;

  rect(boxX, boxY, boxW, boxH, 18);

  fill("#71349c");
  textAlign(CENTER, CENTER);
  textSize(width < height ? 14 : 16);
  text("目前模式：" + modeName, width / 2, boxY + boxH / 2);
}

// 手機按鈕
function drawModeButtons() {
  buttons = [];

  let labels = ["三角", "霓虹", "粒子", "破碎"];

  let btnW;
  let btnH;
  let gap;

  if (width < height) {
    btnW = width * 0.19;
    btnH = 48;
    gap = width * 0.025;
  } else {
    btnW = 100;
    btnH = 46;
    gap = 14;
  }

  let totalW = labels.length * btnW + (labels.length - 1) * gap;
  let startX = (width - totalW) / 2;
  let y = height - 90;

  textAlign(CENTER, CENTER);
  textSize(width < height ? 15 : 16);

  for (let i = 0; i < labels.length; i++) {
    let x = startX + i * (btnW + gap);

    buttons.push({
      x: x,
      y: y,
      w: btnW,
      h: btnH,
      mode: i + 1
    });

    if (mode === i + 1) {
      fill("#71349c");
      stroke("#ffffff");
      strokeWeight(3);
    } else {
      fill(255, 255, 255, 225);
      stroke("#71349c");
      strokeWeight(2);
    }

    rect(x, y, btnW, btnH, 18);

    if (mode === i + 1) {
      fill("#ffffff");
    } else {
      fill("#71349c");
    }

    noStroke();
    text(labels[i], x + btnW / 2, y + btnH / 2);
  }
}

// 電腦鍵盤也可以切換
function keyPressed() {
  if (key === "1") mode = 1;
  if (key === "2") mode = 2;
  if (key === "3") mode = 3;
  if (key === "4") mode = 4;
}

// 電腦滑鼠點擊
function mousePressed() {
  checkButtonPressed(mouseX, mouseY);
}

// 手機觸控點擊
function touchStarted() {
  checkButtonPressed(mouseX, mouseY);
  return false;
}

function checkButtonPressed(px, py) {
  for (let btn of buttons) {
    if (
      px > btn.x &&
      px < btn.x + btn.w &&
      py > btn.y &&
      py < btn.y + btn.h
    ) {
      mode = btn.mode;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}