<?php
$servername = "localhost";
$username = "root";
$password = "";
date_default_timezone_set('Asia/Manila');
$date = date("Y-m-d");
$time = date("H:i"); 


try {
  $conn = new PDO("mysql:host=$servername;dbname=AGDataBase", $username, $password);
  // set the PDO error mode to exception
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  //   echo "Connected successfully";


} catch (PDOException $e) {
  //   echo "Connection failed: " . $e->getMessage();
}

?>