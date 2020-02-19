<?php
$img = $_POST['img'];
$orderNum = $_POST['orderNum'];
$pageNum = $_POST['pageNum'];
	// requires php5
    define('UPLOAD_DIR', '../order/'.$orderNum.'/');
    
    @mkdir( UPLOAD_DIR ,0700,true);
	
	$img = str_replace('data:image/png;base64,', '', $img);
	$img = str_replace(' ', '+', $img);
	$data = base64_decode($img);
	$file = UPLOAD_DIR . $pageNum . '.png';
	$success = file_put_contents($file, $data);
	print $success ? $file : 'Unable to save the file.';
?>