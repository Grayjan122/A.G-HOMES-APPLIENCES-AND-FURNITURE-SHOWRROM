<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetLogs($json)
    {

        include 'conn.php';
        //$json = '{"username":"pitok","password":"12345"}'
        $json = json_decode($json, true);
        $sql = "SELECT a.`activity_log_id`, a.`activity`, a.`time`, a.`date`, a.`account_id`, b.fname, b.mname, b.lname
                FROM `activity_log`a
                INNER JOIN account b ON a.account_id = b.account_id
                ORDER BY a.activity_log_id DESC";

        $stmt = $conn->prepare($sql);
        // $stmt->bindParam(':username', $json['username']);
        // $stmt->bindParam(':password', $json['password']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);

    }

    function Logs($json)
    {
        include 'conn.php';
        $json = json_decode($json, true);
        $date = date("Y-m-d");
        $time = date("H:i");

        try {
            $sql = "INSERT INTO `activity_log`(`activity`, `time`, `date`, `account_id`) 
            VALUES (:activity, :time, :date, :accID)";
            $stmt = $conn->prepare($sql);

            $stmt->bindParam(':activity', $json['activity']);
            $stmt->bindParam(':time', $time);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':accID', $json['accID']);

            $stmt->execute();

            $returnValue = 'Success';

        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();

        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }
}

// submitted by the client - operation and json data
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $operation = $_GET['operation'];
    $json = $_GET['json'];
} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];
}

$user = new User();
switch ($operation) {
    case 'Logs':
        echo $user->Logs($json);
        break;
    case 'GetLogs':
        echo $user->GetLogs($json);
        break;
}
?>