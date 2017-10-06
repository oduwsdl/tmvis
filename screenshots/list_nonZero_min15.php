<?php
//echo "This script seems to halt the generation script, so it's been disabled.";
//return;

ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

//$src = "list_nonZero_min15.txt";
$src = "../uris_lulwah_refined.txt";
$lines = file($src);
echo "<html><body><head><style type='text/css'>.strategy {width: 100px; float: left; padding-top: 2.5em;}</style></head><body>";
echo "<p>Run: 128-bit (0,1) SimHash: k=4, AlSummarization, Lulwah's only-IA, n>15 mementos, results trimmed to 4<=x<=16 for each URI-M to match count per strategy for a single URI.</p>";
echo "<h4>Processed ".count($lines)." URIs from ".$src."</h4><hr /><hr />";
//print_r($lines);
foreach($lines as $line) {
  //$uri = explode(",",$line);
  $uri = $line;
  $squishedURI = trim(preg_replace('/[\.\/\-]/','',$uri));
  $cmd = "ls -1 alSum*".$squishedURI."*_200.png";

  $filez = preg_split('/\s+/',shell_exec($cmd));

  $bucketz = array();;
  if($filez[count($filez) - 1] == "") {
   array_pop($filez);
  }

  foreach($filez as $fileX) {
   $bucketId = substr($fileX,-10);
   if(!array_key_exists($bucketId,$bucketz)) {
    $bucketz[$bucketId] = array();
   }
   array_push($bucketz[$bucketId], $fileX);
  }

  $out = "";


  foreach($bucketz as $bucket) {
    $cURI = str_replace("_200.png","",str_replace("alSum_","",$bucket[0]));
    $cURI = preg_replace('/httpweb.*[0-9]+/','',$cURI);
    //$out .= $cURI." (<a href='./cache/simhashes_".$cURI.".json'>cache</a>)<br />";
    $mementoCount = count(array_keys($bucket));
    $out .= '<div style="border-bottom: 2px dotted black; margin-bottom: 7px;">'.$cURI.' (composite: '.
            '<a href="../createComposite.php?uri='.$cURI.'&strategy=alSum" target="_blank">AlSum</a> - '.
            '<a href="../createComposite.php?uri='.$cURI.'&strategy=temporalInterval" target="_blank">Temporal Interval</a> - '.
            '<a href="../createComposite.php?uri='.$cURI.'&strategy=interval" target="_blank">Interval</a> - '.
            '<a href="../createComposite.php?uri='.$cURI.'&strategy=random" target="_blank">Random</a> - '.
            '<a href="../createComposite.php?uri='.$cURI.'&strategy=all" target="_blank">all</a>'.
            ')<br />';
    $cURI = "";
    $out .= "<p class='strategy'>AlSum:</p>";
    foreach($bucket as $uri) {
      $fullSize = str_replace("_200","",$uri);
      $out .= '<img style="border: 1px solid black; width: 150px;" src="./'.$uri.'" />';
    }
   $out .= "</div>";
  }

  echo $out;
}

?>
