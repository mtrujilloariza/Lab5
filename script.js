// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

const canvas = document.getElementById("user-image");
const ctx = canvas.getContext('2d');

const imageInput = document.getElementById('image-input');
const topTextInput = document.getElementById('text-top');
const bottomTextInput = document.getElementById('text-bottom');

const form = document.getElementById('generate-meme')
const generateButton = document.querySelector("[type='submit']");
const clearButton = document.querySelector("[type='reset']");
const readButton = document.querySelector("[type='button']");

const volumeGroup = document.getElementById('volume-group');
const volumeSlider = document.querySelector("[type='range']")
var volumeLevelAdj = 1;
let synth = window.speechSynthesis;

const voiceSelect  = document.getElementById('voice-selection')
var voices = [];

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO
  ctx.clearRect(0, 0, canvas.width, canvas.width)
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const imgCords = getDimmensions(canvas.width, canvas.height, img.width, img.height);
  ctx.drawImage(img, imgCords.startX, imgCords.startY, imgCords.width, imgCords.height)

  generateButton.disabled = false;
  clearButton.disabled = true;
  readButton.disabled = true;
  voiceSelect.disabled = true;
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

imageInput.addEventListener('change', () =>{
  let imgInputFile = imageInput.files[0];
  img.src = URL.createObjectURL(imgInputFile)
  canvas.setAttribute('alt', imgInputFile.name)
});


form.addEventListener('submit', (e) => {
  e.preventDefault();
  let topText = topTextInput.value;
  let bottomText = bottomTextInput.value;


  ctx.font = '48px Impact';
  ctx.fillStyle = `rgb(255,255,255)`;
  ctx.textAlign = 'center';
  ctx.lineWidth = 2;
  ctx.textBaseline = 'top';
  ctx.fillText(topText, canvas.width/2, 0);
  ctx.strokeText(topText, canvas.width/2, 0);
  ctx.textBaseline = 'bottom';
  ctx.fillText(bottomText, canvas.width/2, canvas.width);
  ctx.strokeText(bottomText, canvas.width/2, canvas.width);

  generateButton.disabled = true;
  clearButton.disabled = false;
  readButton.disabled = false;
  voiceSelect.disabled = false;
});

clearButton.addEventListener('click', ()=>{
  ctx.clearRect(0, 0, canvas.width, canvas.width)
  generateButton.disabled = false;
  clearButton.disabled = true;
  readButton.disabled = true;
  voiceSelect.disabled = true;
  form.reset();
});

readButton.addEventListener('click', ()=> {
  let topText = topTextInput.value;
  let bottomText = bottomTextInput.value;
  


  let topTextUtter = new SpeechSynthesisUtterance(topText);
  topTextUtter.volume = volumeLevelAdj;

  let bottomTextUtter = new SpeechSynthesisUtterance(bottomText);
  bottomTextUtter.volume = volumeLevelAdj;  

  var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for(var i = 0; i < voices.length ; i++) {
    if(voices[i].name === selectedOption) {
      topTextUtter.voice = voices[i];
      bottomTextUtter.voice = voices[i];
    }
  }

  synth.speak(topTextUtter);
  synth.speak(bottomTextUtter);
});


volumeSlider.addEventListener('input', ()=> {
  let volumeLevel = volumeSlider.value;
  let volumeImg = volumeGroup.childNodes[1];

  volumeLevelAdj = volumeLevel / 100;

  if(volumeLevel >= 67){
    volumeImg.src = 'icons/volume-level-3.svg'
  } else if (volumeLevel <= 66 && volumeLevel >= 34){
    volumeImg.src = 'icons/volume-level-2.svg'
  } else if (volumeLevel <= 33 && volumeLevel >= 1 ){
    volumeImg.src = 'icons/volume-level-1.svg'
  } else {
    volumeImg.src = 'icons/volume-level-0.svg'
  }
});

function populateVoiceList() {
  console.log(synth.getVoices())
  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = '';

  for(let i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    


    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}

window.speechSynthesis.onvoiceschanged = function() {
  populateVoiceList();
};
/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
