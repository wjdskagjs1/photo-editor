<?php
$orderNum = $_POST['orderNum'];
$path = './order/'.$orderNum;
mkdir('./order/'.$orderNum, 0700, true);
mkdir('./order/'.$orderNum.'/before', 0700, true);

for($i=0;$i<30;$i++){
    mkdir('./order/'.$orderNum.'/before\/'.$i, 0700, true);
    fopen('./order/'.$orderNum.'/before\/'.$i.'/setting.json', "w");
}

?>