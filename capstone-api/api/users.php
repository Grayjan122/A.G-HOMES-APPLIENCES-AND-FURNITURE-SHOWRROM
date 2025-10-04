<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login
    function GetUsers($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT a.account_id, a.fname, a.mname,a.lname, a.username,a.user_password,a.email,
            a.address,a.phone,a.status,a.active_status, a.date_created,a.birth_date,a.location_id,
            b.location_name,a.role_id, c.role_name
            FROM `account` a
            INNER JOIN location b ON b.location_id = a.location_id 
            INNER JOIN role c ON c.role_id = a.role_id;";

        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    function AddUsers($json)
    {
        include 'conn.php';

        ini_set('display_errors', 1);
        error_reporting(E_ALL);

        $date = date("Y-m-d");
        $json = json_decode($json, true);

        if (!$json) {
            return json_encode("Error: Invalid or empty JSON input.");
        }

        $sql = "INSERT INTO account (
                username, user_password, fname, mname, 
                lname, role_id, email, address, phone, 
                status, date_created, birth_date, location_id
            ) VALUES (
                :userName, :userPassword, :fName, :mName, 
                :lName, :roleID, :email, :address, :phone, 
                :status, :dateCreated, :birthDate, :locationID
            )";

        $stmt = $conn->prepare($sql);

        $stmt->bindValue(':userName', $json['userName']);
        $stmt->bindValue(':userPassword', $json['passWord']);
        $stmt->bindValue(':fName', $json['fName']);
        $stmt->bindValue(':mName', $json['mName']);
        $stmt->bindValue(':lName', $json['lName']);
        $stmt->bindValue(':roleID', $json['roleID']);
        $stmt->bindValue(':email', $json['email']);
        $stmt->bindValue(':address', $json['address']);
        $stmt->bindValue(':phone', $json['phone']);
        $stmt->bindValue(':status', $json['status']);
        $stmt->bindValue(':dateCreated', $date);
        $stmt->bindValue(':birthDate', $json['birthDate']);
        $stmt->bindValue(':locationID', $json['locationID']);

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
    function GetUsersDetail($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);
        $sql = "SELECT a.account_id, a.fname, a.mname,a.lname, a.username,a.user_password,a.email,a.address,a.phone,a.status, 
            a.date_created,a.birth_date,
            b.location_name, b.location_id, c.role_name, c.role_id
            FROM `account` a
            INNER JOIN location b ON b.location_id = a.location_id 
            INNER JOIN role c ON c.role_id = a.role_id WHERE a.account_id = :accountID;";

        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':accountID', $json['userID']);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);
        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }
    function UpdateUser($json)
    {
        include 'conn.php';
        $json = json_decode($json, true);

        $sql = "UPDATE `account` SET 
                `fname` = :fname,
                `mname` = :mname,
                `lname` = :lname,
                `role_id` = :roleID,
                `email` = :email,
                `address` = :address,
                `phone` = :phone,
                `status` = :status,
                `birth_date` = :birthdate,
                `location_id` = :location 
            WHERE account_id = :account_id";

        $stmt = $conn->prepare($sql);

        // Bind values
        $stmt->bindParam(':fname', $json['fname']);
        $stmt->bindParam(':mname', $json['mname']);
        $stmt->bindParam(':lname', $json['lname']);
        $stmt->bindParam(':roleID', $json['role']);
        $stmt->bindParam(':email', $json['email']);
        $stmt->bindParam(':address', $json['address']);
        $stmt->bindParam(':phone', $json['phone']);
        $stmt->bindParam(':status', $json['accountStatus']); // Note the typo in key: accoutStatus
        $stmt->bindParam(':birthdate', $json['bDate']);
        $stmt->bindParam(':location', $json['location']);
        $stmt->bindParam(':account_id', $json['accountID']);

        try {
            $stmt->execute();
            $returnValue = 'Success';
        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();
        }

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
    case 'GetUsers':
        echo $user->GetUsers($json);
        break;
    case 'AddUser':
        echo $user->AddUsers($json);
        break;
    case 'GetUserDetails':
        echo $user->GetUsersDetail($json);
        break;
    case 'UpdateUser':
        echo $user->UpdateUser($json);
        break;


}
?>