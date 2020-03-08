const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

const addTextWatermarkToImage = async function(inputFile, outputFile, text) {
  try {
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    image.print(font, 0, 0, textData, image.getWidth(), image.getHeight());
    await image.quality(100).writeAsync(outputFile);
    console.log('Watermark was added successfully!');
    startApp();
  }
  catch(error) {
    console.log('Something went wrong... Try again!'); // if there's an error, we catch it and show it in console
  }
};

//addTextWatermarkToImage('./test.jpg', './test-with-watermark.jpg', 'Hello world')

const addImageWatermarkToImage = async function(inputFile, outputFile, watermarkFile) {
  try {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;
    
    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.3,
    });
    await image.quality(100).writeAsync(outputFile);
    console.log('Watermark was added successfully!');
    startApp();
  }
  catch(error) {
    console.log('Something went wrong... Try again!'); // if there's an error, we catch it and show it in console
  }
};
  
  //addImageWatermarkToImage('./test.jpg', './test-with-watermark2.jpg', './logo.png');

const prepareCopyFilename = function (fileFullName) {
  const nameEls = fileFullName.split(".");
  return nameEls[0] + '(modified).' + nameEls[1];
};

const prepareOutputFilename = function (fileFullName) {
  const nameEls = fileFullName.split(".");
  return nameEls[0] + '-with-watermark.' + nameEls[1];
};

const startApp = async () => {

    // Ask if user is ready
  const answer = await inquirer.prompt([{
    name: 'start',
    message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
    type: 'confirm'
  }]);
  
    // if answer is no, just quit the app
  if(!answer.start) process.exit();
  
  // ask about input file and watermark type
  const options = await inquirer.prompt([{
    name: 'inputImage',
    type: 'input',
    message: 'What file do you want to mark?',
    default: 'test.jpg',
  }, {
    name: 'editionChoice',
    message: 'Would you like to modify your file?',
    type: 'confirm',
  }]);

  
  if(options.editionChoice) {
    const types = await inquirer.prompt([{
      name: 'modificationType',
      type: 'list',
      choices: ['Make image brighter', 'Increase contrast', 'Make image b&w', 'Invert image'],
  }])

  const image = await Jimp.read('./img/' + options.inputImage);
    
  if(types.modificationType === 'Make image brighter') {
    console.log('ok');
    console.log(options.inputImage);
    image.brightness( 0.5 );
    await image.quality(100).writeAsync('./img/' + prepareCopyFilename(options.inputImage));
  }

  if(types.modificationType === 'Increase contrast') {
    console.log('ok');
    console.log(options.inputImage);
    image.contrast( 0.5 );
    await image.quality(100).writeAsync('./img/' + prepareCopyFilename(options.inputImage));
  }

  if(types.modificationType === 'Make image b&w') {
    console.log('ok');
    console.log(options.inputImage);
    image.greyscale();
    await image.quality(100).writeAsync('./img/' + prepareCopyFilename(options.inputImage));
  }

  if(types.modificationType === 'Invert image') {
    console.log('ok');
    console.log(options.inputImage);
    image.invert();
    await image.quality(100).writeAsync('./img/' + prepareCopyFilename(options.inputImage));
  }

}

  const watermarks = await inquirer.prompt([{
    name: 'watermarkType',
    type: 'list',
    choices: ['Text watermark', 'Image watermark'],
  }]);

  if(watermarks.watermarkType === 'Text watermark') {
    const text = await inquirer.prompt([{
      name: 'value',
      type: 'input',
      message: 'Type your watermark text:',
    }]);
    watermarks.watermarkText = text.value;
    console.log(options.inputImage);   // test.jpg
    
    if (fs.existsSync('./img/' + options.inputImage)) {
      console.log('The path exists.');
      console.log(options.inputImage);
      addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), watermarks.watermarkText);
    }
    else {
      console.log('Something went wrong... Try again');
    }
  
    
    if (fs.existsSync('./img/' + prepareCopyFilename(options.inputImage))) {
      const imgCopyName = prepareCopyFilename(options.inputImage);
      console.log('The path exists.');
      console.log(imgCopyName);   // test(modified).jpg
      addTextWatermarkToImage('./img/' + imgCopyName, './img/' + prepareOutputFilename(imgCopyName), watermarks.watermarkText);
    }
    
    else {
      console.log('Something went wrong... Try again');
    }
  }
  
  else {
    const image = await inquirer.prompt([{
      name: 'filename',
      type: 'input',
      message: 'Type your watermark name:',
      default: 'logo.png',
    }]);
    watermarks.watermarkImage = image.filename;
    
    if (fs.existsSync('./img/' + options.inputImage) && fs.existsSync('./img/' + watermarks.watermarkImage)) {
      console.log('The path exists.');
      addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + watermarks.watermarkImage);
    }
    else {
      console.log('Something went wrong... Try again');
    }

    if (fs.existsSync('./img/' + prepareCopyFilename(options.inputImage)) && fs.existsSync('./img/' + watermarks.watermarkImage)) {
      const imgCopyName = prepareCopyFilename(options.inputImage);
      console.log('The path exists.');
      addImageWatermarkToImage('./img/' + imgCopyName, './img/' + prepareOutputFilename(imgCopyName), './img/' + watermarks.watermarkImage);
    }
    else {
      console.log('Something went wrong... Try again');
    }
    
  }

};

startApp();