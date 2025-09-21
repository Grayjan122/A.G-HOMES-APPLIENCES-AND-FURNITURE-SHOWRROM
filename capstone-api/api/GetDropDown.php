<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetRole($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT * from role ORDER BY role_name ASC;";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function GetLocation($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT * from location ORDER BY location_name ASC;";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
     function GetBranch($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT * from branch ORDER BY branch_name ASC;";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
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
    case 'GetRole':
        echo $user->GetRole($json);
        break;
    case 'GetLocation':
        echo $user->GetLocation($json);
        break;
    case 'GetBranch':
        echo $user->GetBranch($json);
        break;


}
?>