/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import * as posenet from '@tensorflow-models/posenet';
import * as tf from '@tensorflow/tfjs';

const color = 'aqua';
const boundingBoxColor = 'red';
const lineWidth = 2;

export const tryResNetButtonName = 'tryResNetButton';
export const tryResNetButtonText = '[New] Try ResNet50';
const tryResNetButtonTextCss = 'width:100%;text-decoration:underline;';
const tryResNetButtonBackgroundCss = 'background:#e61d5f;';

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function isMobile() {
  return isAndroid() || isiOS();
}

function setDatGuiPropertyCss(propertyText, liCssString, spanCssString = '') {
  var spans = document.getElementsByClassName('property-name');
  for (var i = 0; i < spans.length; i++) {
    var text = spans[i].textContent || spans[i].innerText;
    if (text == propertyText) {
      spans[i].parentNode.parentNode.style = liCssString;
      if (spanCssString !== '') {
        spans[i].style = spanCssString;
      }
    }
  }
}

export function updateTryResNetButtonDatGuiCss() {
  setDatGuiPropertyCss(
      tryResNetButtonText, tryResNetButtonBackgroundCss,
      tryResNetButtonTextCss);
}

/**
 * Toggles between the loading UI and the main canvas UI.
 */
export function toggleLoadingUI(
    showLoadingUI, loadingDivId = 'loading', mainDivId = 'main') {
  if (showLoadingUI) {
    document.getElementById(loadingDivId).style.display = 'block';
    document.getElementById(mainDivId).style.display = 'none';
  } else {
    document.getElementById(loadingDivId).style.display = 'none';
    document.getElementById(mainDivId).style.display = 'block';
  }
}

function toTuple({y, x}) {
  return [y, x];
}

export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawAngle( ctx, poseJoint ){
  // ctx.font = "24px serif";
  // ctx.fillStyle = 'red';
  // ctx.textAlign = "center";
  // ctx.fillText( ( poseJoint.angle*(180/Math.PI) ).toFixed(2), poseJoint.position.x, poseJoint.position.y );

  // ctx.beginPath();
  // ctx.moveTo(keypoints[i].position.x, keypoints[i].position.y);
  // ctx.lineTo(keypoints[i-1].position.x, keypoints[i-1].position.y);
  // ctx.lineWidth = lineWidth;
  // ctx.strokeStyle = 'orange';
  // ctx.stroke();
  //
  // ctx.beginPath();
  // ctx.moveTo(keypoints[i].position.x, keypoints[i].position.y);
  // ctx.lineTo(keypoints[i+1].position.x, keypoints[i+1].position.y);
  // ctx.lineWidth = lineWidth;
  // ctx.strokeStyle = 'blue';
  // ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
 export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
   let scoreThreshold = minConfidence;
   let poseObj = {};
   poseObj.rightAnkle = keypoints.filter(obj => { return obj.part === "rightAnkle" })[0];
   poseObj.leftAnkle = keypoints.filter(obj => { return obj.part === "leftAnkle" })[0];
   poseObj.rightKnee = keypoints.filter(obj => { return obj.part === "rightKnee" })[0];
   poseObj.leftKnee = keypoints.filter(obj => { return obj.part === "leftKnee" })[0];
   poseObj.rightHip = keypoints.filter(obj => { return obj.part === "rightHip" })[0];
   poseObj.leftHip = keypoints.filter(obj => { return obj.part === "leftHip" })[0];
   poseObj.rightWrist = keypoints.filter(obj => { return obj.part === "rightWrist" })[0];
   poseObj.leftWrist = keypoints.filter(obj => { return obj.part === "leftWrist" })[0];
   poseObj.rightElbow = keypoints.filter(obj => { return obj.part === "rightElbow" })[0];
   poseObj.leftElbow = keypoints.filter(obj => { return obj.part === "leftElbow" })[0];
   poseObj.leftShoulder = keypoints.filter(obj => { return obj.part === "leftShoulder" })[0];
   poseObj.rightShoulder = keypoints.filter(obj => { return obj.part === "rightShoulder" })[0];

   if ( poseObj.rightShoulder.score > scoreThreshold && poseObj.rightHip.score > scoreThreshold && poseObj.rightElbow.score > scoreThreshold ){
     poseObj.rightShoulder.angle = find_angle( poseObj.rightElbow.position, poseObj.rightShoulder.position, poseObj.rightHip.position );
     drawAngle( ctx, poseObj.rightShoulder );
   }
   if ( poseObj.leftShoulder.score > scoreThreshold && poseObj.leftHip.score > scoreThreshold && poseObj.leftElbow.score > scoreThreshold ){
     poseObj.leftShoulder.angle = find_angle( poseObj.leftElbow.position, poseObj.leftShoulder.position, poseObj.leftHip.position );
     drawAngle( ctx, poseObj.leftShoulder );
   }
   if ( poseObj.leftElbow.score > scoreThreshold && poseObj.leftWrist.score > scoreThreshold && poseObj.leftHip.score > scoreThreshold ){
     poseObj.leftElbow.angle = find_angle( poseObj.leftShoulder.position, poseObj.leftElbow.position, poseObj.leftWrist.position );
     drawAngle( ctx, poseObj.leftElbow );
   }
   if ( poseObj.rightElbow.score > scoreThreshold && poseObj.rightWrist.score > scoreThreshold && poseObj.rightHip.score > scoreThreshold ){
     poseObj.rightElbow.angle = find_angle( poseObj.rightShoulder.position, poseObj.rightElbow.position, poseObj.rightWrist.position );
     drawAngle( ctx, poseObj.rightElbow );
   }



   const adjacentKeyPoints =
       posenet.getAdjacentKeyPoints(keypoints, minConfidence);
   //console.log(adjacentKeyPoints);
   adjacentKeyPoints.forEach((keypoints, index) => {
     drawSegment(
         toTuple(keypoints[0].position), toTuple(keypoints[1].position), color,
         scale, ctx);
   });


 }

 export function find_angle(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x-A.x,2)+ Math.pow(B.y-A.y,2));
    var BC = Math.sqrt(Math.pow(B.x-C.x,2)+ Math.pow(B.y-C.y,2));
    var AC = Math.sqrt(Math.pow(C.x-A.x,2)+ Math.pow(C.y-A.y,2));
    return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

/**
 * Draw pose keypoints onto a canvas
 */
export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const {y, x} = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 3, color);
  }
}

/**
 * Draw the bounding box of a pose. For example, for a whole person standing
 * in an image, the bounding box will begin at the nose and extend to one of
 * ankles
 */
export function drawBoundingBox(keypoints, ctx) {
  const boundingBox = posenet.getBoundingBox(keypoints);

  ctx.rect(
      boundingBox.minX, boundingBox.minY, boundingBox.maxX - boundingBox.minX,
      boundingBox.maxY - boundingBox.minY);

  ctx.strokeStyle = boundingBoxColor;
  ctx.stroke();
}

/**
 * Converts an arary of pixel data into an ImageData object
 */
export async function renderToCanvas(a, ctx) {
  const [height, width] = a.shape;
  const imageData = new ImageData(width, height);

  const data = await a.data();

  for (let i = 0; i < height * width; ++i) {
    const j = i * 4;
    const k = i * 3;

    imageData.data[j + 0] = data[k + 0];
    imageData.data[j + 1] = data[k + 1];
    imageData.data[j + 2] = data[k + 2];
    imageData.data[j + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw an image on a canvas
 */
export function renderImageToCanvas(image, size, canvas) {
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);
}

/**
 * Draw heatmap values, one of the model outputs, on to the canvas
 * Read our blog post for a description of PoseNet's heatmap outputs
 * https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
 */
export function drawHeatMapValues(heatMapValues, outputStride, canvas) {
  const ctx = canvas.getContext('2d');
  const radius = 5;
  const scaledValues = heatMapValues.mul(tf.scalar(outputStride, 'int32'));

  drawPoints(ctx, scaledValues, radius, color);
}

/**
 * Used by the drawHeatMapValues method to draw heatmap points on to
 * the canvas
 */
function drawPoints(ctx, points, radius, color) {
  const data = points.buffer().values;

  for (let i = 0; i < data.length; i += 2) {
    const pointY = data[i];
    const pointX = data[i + 1];

    if (pointX !== 0 && pointY !== 0) {
      ctx.beginPath();
      ctx.arc(pointX, pointY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }
}

/**
 * Draw offset vector values, one of the model outputs, on to the canvas
 * Read our blog post for a description of PoseNet's offset vector outputs
 * https://medium.com/tensorflow/real-time-human-pose-estimation-in-the-browser-with-tensorflow-js-7dd0bc881cd5
 */
export function drawOffsetVectors(
    heatMapValues, offsets, outputStride, scale = 1, ctx) {
  const offsetPoints =
      posenet.singlePose.getOffsetPoints(heatMapValues, outputStride, offsets);

  const heatmapData = heatMapValues.buffer().values;
  const offsetPointsData = offsetPoints.buffer().values;

  for (let i = 0; i < heatmapData.length; i += 2) {
    const heatmapY = heatmapData[i] * outputStride;
    const heatmapX = heatmapData[i + 1] * outputStride;
    const offsetPointY = offsetPointsData[i];
    const offsetPointX = offsetPointsData[i + 1];

    drawSegment(
        [heatmapY, heatmapX], [offsetPointY, offsetPointX], color, scale, ctx);
  }
}
