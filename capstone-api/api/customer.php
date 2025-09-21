<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetCustomer($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT * from customers ORDER BY cust_name ASC;";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    function AddCustomer($json)
    {
        include 'conn.php';

        header('Content-Type: application/json');
        ini_set('display_errors', 1);
        error_reporting(E_ALL);

        $json = json_decode($json, true);

        if (!$json) {
            return json_encode(['status' => 'error', 'message' => 'Invalid or empty JSON input.']);
        }

        $sql = "INSERT INTO `customers`(`cust_name`, `phone`, `email`, `address`) 
                VALUES ( :custName, :custPhone, :custEmail, :custAddress)";

        $stmt = $conn->prepare($sql);

        $stmt->bindValue(':custName', $json['custName']);
        $stmt->bindValue(':custPhone', $json['custPhone']);
        $stmt->bindValue(':custEmail', $json['custEmail']);
        $stmt->bindValue(':custAddress', $json['custAddress']);



        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    function GetCustomerDetails($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT * from customers WHERE cust_id = :custID;";

        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':custID', $json['custID']);

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

     function UpdateCustomerDetails($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "UPDATE `customers` SET `cust_name`= :custName,
                `phone`= :custPhone,`email`= :custEmail,`address`= :custAddress WHERE cust_id = :custID";

        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':custID', $json['custID']);
         $stmt->bindValue(':custName', $json['custName']);
        $stmt->bindValue(':custPhone', $json['custPhone']);
        $stmt->bindValue(':custEmail', $json['custEmail']);
        $stmt->bindValue(':custAddress', $json['custAddress']);

       
        

         try {
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
    case 'GetCustomer':
        echo $user->GetCustomer($json);
        break;
    case 'AddCustomer':
        echo $user->AddCustomer($json);
        break;
    case 'GetCustomerDetails':
        echo $user->GetCustomerDetails($json);
        break;
     case 'UpdateCustomerDetails':
        echo $user->UpdateCustomerDetails($json);
        break;
    


}
?>