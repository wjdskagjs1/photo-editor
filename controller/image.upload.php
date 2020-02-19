<?php
$orderNum = $_POST['orderNum'];
$pageNum = $_POST['pageNum'];

$uploadBase = '../order/'.$orderNum.'/before/'.$pageNum.'/';

@mkdir('../order/'.$orderNum.'/before/'.$pageNum ,0700,true);

foreach ($_FILES['fileupload']['name'] as $f => $name) {   

    //$name = $_FILES['fileupload']['name'][$f];
    $uploadName = explode('.', $name);

    // $fileSize = $_FILES['upload']['size'][$f];
    // $fileType = $_FILES['upload']['type'][$f];
    $uploadname = $uploadName[0].'.png'; //.$uploadName[1];
    $uploadFile = $uploadBase.$uploadname;
    

    if(move_uploaded_file($_FILES['fileupload']['tmp_name'][$f], $uploadFile)){
        echo $uploadname;
    }else{
        echo 'error';
    }
}
?>