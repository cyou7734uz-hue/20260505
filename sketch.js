let capture;

function setup() {
  // 步驟 1：產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  
  // 隱藏預設產生的 HTML5 video 元件，只在畫布上顯示
  capture.hide();
}

function draw() {
  // 步驟 2：設定畫布背景顏色為 #e7c6ff
  background('#c6ddff');
  
  // 步驟 3：計算影像的寬高為整個畫布的 50%
  let videoWidth = width * 0.5;
  let videoHeight = height * 0.5;
  
  // 步驟 4：計算置中位置
  let x = (width - videoWidth) / 2;
  let y = (height - videoHeight) / 2;
  
  // 步驟 5：將攝影機影像繪製在畫布中間
  image(capture, x, y, videoWidth, videoHeight);
}

// 當視窗大小改變時，自動調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
