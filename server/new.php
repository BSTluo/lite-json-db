<?php
header("Access-Control-Allow-Origin: *");
if (!is_dir($file)) {
    mkdir('./list', 0755);
}

# Get JSON as a string
$json_str = file_get_contents('php://input');
$num = rand(1,99999999);
$num2 = rand(1,99999999);
file_put_contents('./list/'.$num.$num2.'.json', $json_str);
echo $num.$num2;

?>
