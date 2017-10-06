<?php
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(1);



if(!isset($_GET['uri']) || $_GET['uri'] == "") {echo "You must pass a URI parameter"; return;}

$uri = isset($_GET['uri']) ? $_GET['uri'] : '';
$strategy = isset($_GET['strategy']) ? $_GET['strategy'] : '';

$sanitizedURI = trim(preg_replace('/[\.\/\-]/','',$uri));
$sanitizedURI = str_replace('www','',$sanitizedURI);
$sanitizedURI = str_replace('http','',$sanitizedURI);

if($strategy != 'all') {
  generateScreenshot($sanitizedURI, $strategy, true);
} else {
  $strategies = array('alSum','interval','temporalInterval','random');
  for($s=0; $s<count($strategies); $s++) {
    generateScreenshot($sanitizedURI, $strategies[$s], false);
  }
  generateAllTheSameImageInComposite($sanitizedURI, false);

  echo "<html><body>";
  echo '<head><style type="text/css">div {float: left; border: 3px double red; margin: 5px; text-align: center;} img {width: 600px;} #allTheSame {margin: 0 auto; text-align: center; width: 600px;}</style></head>';
  echo "<body><h1>All strategies: ".$sanitizedURI."</h1>";

  for($s = 0; $s<count($strategies); $s++) {
    echo '<div><img src="./composites/'.$strategies[$s].'_'.$sanitizedURI.'_composite.png" /><br />'.$strategies[$s].'</div>';
  }
  echo '<div id="allTheSame"><img src="./composites/allTheSame_'.$sanitizedURI.'_composite.png" /><br />all the same</div>';
}

function createMontageFromSelectedImage($imgAry, $outputFile) {
  $im = new Imagick($imgAry);
  $res = $im->montageImage(new ImagickDraw(), '4x4', '200x150+1+1', imagick::MONTAGEMODE_UNFRAME, "1x1+2+2");
  $res->setImageFormat('png');

  $res->writeImage($outputFile);
}


function generateAllTheSameImageInComposite($uri, $httpForward=true) {
  $files = glob('./screenshots/alSum_*'.$uri.'_200.png');
  if(count($files) == 0) {
    echo "Composite not generated for this URI due to lack of files or bad strategy name. Try alSum, temporalInterval, interval, or random";
    return;
  }

  $imageCount = 0;
  $selectedImages = array();

  $sameIndex = rand(0, count($files)-1);

  for($f=0; $f<count($files); $f++) {
    array_push($selectedImages,'./'.$files[$sameIndex]);
    ++$imageCount;
    if($imageCount >= 16) {break;}
  }

  $outputFile = './composites/allTheSame_'.$uri.'_composite.png';
  createMontageFromSelectedImage($selectedImages, $outputFile);
  if($httpForward) {header('Location: '.$outputFile);}
}



function generateScreenshot($uri, $strategy, $httpForward=true) {
  $files = glob('./screenshots/'.$strategy.'_*'.$uri.'_200.png');
  if(count($files) == 0) {
    echo "Composite not generated for this URI due to lack of files or bad strategy name. Try alSum, temporalInterval, interval, or random";
    return;
  }

  $imageCount = 0;
  $selectedImages = array();

  for($f=0; $f<count($files); $f++) {
    array_push($selectedImages,'./'.$files[$f]);
    ++$imageCount;
    if($imageCount >= 16) {break;}
  }

  $outputFile = './composites/'.$strategy.'_'.$uri.'_composite.png';
  createMontageFromSelectedImage($selectedImages, $outputFile);
  if($httpForward) {header('Location: '.$outputFile);}
}



?>
