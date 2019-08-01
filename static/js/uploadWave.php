<?php

session_start();

        $target_dir = "../../static/js/waveFiles/";
        $target_file = $target_dir . basename($_FILES["input_file_name"]["name"]);

        
if (move_uploaded_file($_FILES["input_file_name"]["tmp_name"], $target_file))


?>