<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function Progress($json)
    {
        include 'conn.php';
        // global $conn;

        $json = json_decode($json, true);
        $sql = "SELECT COUNT(rr_id) AS Count FROM request_reports WHERE request_stock_id = :reqID";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':reqID', $json['reqID']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn, $stmt);
        return json_encode($returnValue);
    }

    function Progress1($json)
    {
        include 'conn.php';
        // global $conn;

        $json = json_decode($json, true);
        $sql = "SELECT * FROM request_reports WHERE request_stock_id = :reqID ORDER BY rr_id ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':reqID', $json['reqID']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn, $stmt);
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
    case 'progress':
        echo $user->Progress($json);
        break;
    case 'progress1':
        echo $user->Progress1($json);
        break;
}
?>