<?php
$orderNum = $_POST['orderNum'];
$pageNum = $_POST['pageNum'];

$data = json_decode($_POST['data'], true); //json_encode($_POST['data'], true);


$handle = fopen("../order/".$orderNum."/before\/".$pageNum."/setting.json", "w");
$str = json_encode($data, true);
fwrite($handle, $str);
fclose($handle);
echo $str;


?>