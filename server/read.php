<?php
 
# Get JSON as a string
$json_str = file_get_contents('php://input');
 
# Get as an object
$json_obj = json_decode($json_str, true);
$out = file_get_contents('./list/'.$json_obj['id'].'.json');
echo $out;
?>