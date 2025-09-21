<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

class User
{
    // login


    function GetToDeliver($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;


        // Base SQL
        $sql = "SELECT a.ts_id, a.request_stock_id, a.location_id_sender, b.location_name AS sender ,
                 a.location_id_receiver, d.location_name AS receiver, a.date, a.current_status, a.account_id, 
                 c.fname, c.mname, c.lname 
                    FROM transfer_stock a INNER JOIN location b ON a.location_id_sender = b.location_id
                    INNER JOIN location d ON a.location_id_receiver = d.location_id
                    INNER JOIN account c ON a.account_id = c.account_id
                    WHERE a.location_id_sender = :locID AND a.current_status = 'Approved'
                    ORDER BY a.ts_id DESC;";



        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetToDeliverD($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;


        // Base SQL
        $sql = "SELECT a.ts_id, a.request_stock_id, a.location_id_sender,b.location_name AS sender, a.location_id_receiver,c.location_name AS receiver, a.date, a.current_status, a.account_id,d.fname,d.mname,d.lname FROM transfer_stock a
                    INNER JOIN location b ON a.location_id_sender = b.location_id
                    INNER JOIN location c ON a.location_id_receiver = c.location_id
                    INNER JOIN account d ON a.account_id = d.account_id
                    WHERE A.ts_id = :transID;";



        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':transID', $transferID, PDO::PARAM_STR);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetToDeliverDetails($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;


        // Base SQL
        $sql = "SELECT a.tsd_id, a.ts_id, a.product_id, b.product_name , a.qty FROM transfer_stock_details a 
                INNER JOIN products b ON a.product_id = b.product_id WHERE a.ts_id = :transID;";



        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':transID', $transferID, PDO::PARAM_STR);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    public function AppointDeliveryTransfer($json)
    {
        include 'conn.php';
        $json = json_decode($json, true);
        $date = date("Y-m-d");
        // $time = date("H:i");

        // $transferID =$json['transID'];
        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;
        $accountID = $json['accID'];
        $requestID = $json['reqID'];

        try {
            // Insert into deliver_transfer
            $sql = "INSERT INTO `deliver_transfer` (`ts_id`, `date`, `delivery_status`, `account_id`) 
                VALUES (:transID, :date, 'Ready To Deliver', :accID)";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':transID', $transferID, PDO::PARAM_INT);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();

            // Insert into transfer_stock_reports
            $sql = "INSERT INTO `transfer_stock_reports` (
                    `ts_id`, `date`, `time`, `status`, `account_id`
                ) VALUES (
                    :tsID, :date, :time, 'Ready To Deliver', :accID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':tsID', $transferID, PDO::PARAM_INT);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':time', $time);
            $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();

            // Update trasfer stock
            $sql = "UPDATE `transfer_stock` SET 
                    `current_status`='Ready To Deliver' WHERE ts_id = :tsID";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':tsID', $transferID, PDO::PARAM_INT);
            $stmt->execute();

            //update request stock
            $sql = "UPDATE `request_stock` 
                SET `request_status` = 'Ready To Deliver' 
                WHERE `request_stock_id` = :reqID";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':reqID', $requestID, PDO::PARAM_INT);
            $stmt->execute();

            $returnValue = 'Success';


        } catch (PDOException $e) {
            $returnValue = 'Error: ' . $e->getMessage();

        }


        unset($stmt);
        unset($conn);

        return json_encode($returnValue);
    }

    function GetDeliveries($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;

        // Base SQL
        $sql = "SELECT 
                a.dt_id, a.ts_id, c.location_id_receiver, d.location_name AS receiver,
                a.date, a.delivery_status, a.account_id,
                b.fname, b.mname, b.lname
            FROM deliver_transfer a 
            INNER JOIN account b ON a.account_id = b.account_id
            INNER JOIN transfer_stock c ON c.ts_id = a.ts_id
            INNER JOIN location d ON c.location_id_receiver = d.location_id";

        if ($accountID != 0) {
            $sql .= " WHERE a.account_id = :accID";
            $sql .= " AND a.delivery_status != 'Completed' ";
            $sql .= " ORDER BY a.dt_id DESC ";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
        } else if ($locationID != 0) {
            $sql .= " WHERE c.location_id_sender = :locID";
            $sql .= " ORDER BY a.dt_id DESC";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':locID', $locationID, PDO::PARAM_INT);
        } else {
            $sql .= " ORDER BY a.dt_id DESC";
            $stmt = $conn->prepare($sql); // no filters
        }

        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetDeliveriesData($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        // $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        // $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;


        // Base SQL
        $sql = "SELECT 
                a.dt_id, a.ts_id, c.request_stock_id,  c.location_id_receiver, d.location_name AS receiver,
                a.date, a.delivery_status, a.account_id,
                b.fname, b.mname, b.lname
            FROM deliver_transfer a 
            INNER JOIN account b ON a.account_id = b.account_id
            INNER JOIN transfer_stock c ON c.ts_id = a.ts_id
            INNER JOIN location d ON c.location_id_receiver = d.location_id
            WHERE a.dt_id = :tsID";


        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':tsID', $transferID, PDO::PARAM_INT);



        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetToDeliveriesDetails($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;


        // Base SQL
        $sql = "SELECT a.tsd_id, a.ts_id, a.product_id, b.product_name , a.qty FROM transfer_stock_details a 
                INNER JOIN products b ON a.product_id = b.product_id WHERE a.ts_id = :transID;";



        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':transID', $transferID, PDO::PARAM_STR);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function UpdateDeliveryStatus($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;
        $dtID = isset($json['dtID']) ? (int) $json['dtID'] : 0;
        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;
        $status = $json['stats'];
        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;

        $date = date("Y-m-d");
        // $time = date("H:i");

        try {
            // 1. Update transfer_stock status
            $sql = "UPDATE `transfer_stock` SET `current_status` = :status WHERE ts_id = :transID";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':transID', $transferID, PDO::PARAM_INT);
            $stmt->execute();

            // 2. Update deliver_transfer status
            $sql = "UPDATE `deliver_transfer` SET `delivery_status` = :status WHERE dt_id = :dtID";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':dtID', $dtID, PDO::PARAM_INT);
            $stmt->execute();

            // 3. Update request_stock status
            $sql = "UPDATE `request_stock` SET `request_status` = :status WHERE request_stock_id = :reqID";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':reqID', $requestID, PDO::PARAM_INT);
            $stmt->execute();

            // 4. Insert report into transfer_stock_reports
            $sql = "INSERT INTO `transfer_stock_reports` (
                    `ts_id`, `date`, `time`, `status`, `account_id`
                ) VALUES (
                    :tsID, :date, :time, :status, :accID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':tsID', $transferID, PDO::PARAM_INT);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':time', $time);
            $stmt->bindParam(':status', $status);
            $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();

            $returnValue = "Success";
        } catch (PDOException $e) {
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetDelivered($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        // $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;



        // Base SQL
        $sql = "SELECT a.dt_id, a.ts_id, c.request_stock_id,  c.location_id_sender, d.location_name AS sender,
                        a.date, a.delivery_status, a.account_id,
                        b.fname, b.mname, b.lname
                    FROM deliver_transfer a 
                    INNER JOIN account b ON a.account_id = b.account_id
                    INNER JOIN transfer_stock c ON c.ts_id = a.ts_id
                    INNER JOIN location d ON c.location_id_sender = d.location_id
                    WHERE c.location_id_receiver = :locID AND a.delivery_status = 'Delivered'";



        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':locID', $locationID, PDO::PARAM_STR);
        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetDeliveredData($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        // $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        // $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;


        // Base SQL
        $sql = "SELECT 
                a.dt_id, a.ts_id, c.request_stock_id,  c.location_id_sender, d.location_name AS sender,
                a.date, a.delivery_status, a.account_id,
                b.fname, b.mname, b.lname
            FROM deliver_transfer a 
            INNER JOIN account b ON a.account_id = b.account_id
            INNER JOIN transfer_stock c ON c.ts_id = a.ts_id
            INNER JOIN location d ON c.location_id_sender = d.location_id
            WHERE a.dt_id = :tsID";


        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':tsID', $transferID, PDO::PARAM_INT);



        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function GetUnavailDetails($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        // $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        // $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;


        // Base SQL
        $sql = "SELECT a.unavailable_id, a.ts_id, a.product_id, b.product_name FROM unavailable_products a 
                INNER JOIN products b ON a.product_id = b.product_id WHERE a.ts_id = :tsID;";


        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':tsID', $transferID, PDO::PARAM_INT);



        $stmt->execute();
        $returnValue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        unset($conn);
        unset($stmt);

        return json_encode($returnValue);
    }

    function ReceiveStock($json, $updatedInventory, $newInventory, $reportInventory)
    {
        include 'conn.php';


        $oldProduct = json_decode($updatedInventory, true);
        $newProduct = json_decode($newInventory, true);
        $report = json_decode($reportInventory, true);
        $json = json_decode($json, true);

        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;
        $dtID = isset($json['dtID']) ? (int) $json['dtID'] : 0;
        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;
        // $status = $json['stats'];
        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;


        $date = date("Y-m-d");
        // $time = date("H:i");


        // return json_encode($oldProduct);

        try {
            // 1. Update transfer_stock status
            $sql = "UPDATE `transfer_stock` SET `current_status` = 'Completed' WHERE ts_id = :transID";
            $stmt = $conn->prepare($sql);
            // $stmt->bindParam(':status', $status);
            $stmt->bindParam(':transID', $transferID, PDO::PARAM_INT);
            $stmt->execute();

            // 2. Update deliver_transfer status
            $sql = "UPDATE `deliver_transfer` SET `delivery_status` = 'Completed' WHERE dt_id = :dtID";
            $stmt = $conn->prepare($sql);
            // $stmt->bindParam(':status', $status);
            $stmt->bindParam(':dtID', $dtID, PDO::PARAM_INT);
            $stmt->execute();

            // 3. Update request_stock status
            $sql = "UPDATE `request_stock` SET `request_status` = 'Completed' WHERE request_stock_id = :reqID";
            $stmt = $conn->prepare($sql);
            // $stmt->bindParam(':status', $status);
            $stmt->bindParam(':reqID', $requestID, PDO::PARAM_INT);
            $stmt->execute();

            // 4. Insert report into transfer_stock_reports
            $sql = "INSERT INTO `transfer_stock_reports` (
                    `ts_id`, `date`, `time`, `status`, `account_id`
                ) VALUES (
                    :tsID, :date, :time, 'Completed', :accID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':tsID', $transferID, PDO::PARAM_INT);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':time', $time);
            // $stmt->bindParam(':status', $status);
            $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();

            //5
            if (!empty($oldProduct)) {
                foreach ($oldProduct as $item) {
                    $sql = "UPDATE `store_inventory` 
                        SET qty = :qty 
                        WHERE location_id = :storeID AND product_id = :productID";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['product_id'], PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 6 - Insert new products into store_inventory
            if (!empty($newProduct)) {
                foreach ($newProduct as $item) {
                    $sql = "INSERT INTO `store_inventory` (location_id, product_id, qty)
                VALUES (:storeID, :productID, :qty)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['product_id'], PDO::PARAM_INT);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 7 - Record ledger report
            if (!empty($report)) {
                foreach ($report as $item) {
                    $sql = "INSERT INTO `store_inventory_transaction_ledger` (
                    `location_id`, `type`, `product_id`, `past_balance`, `qty`, `current_balance`, `date`, `time`, `account_id`
                ) VALUES (
                    :storeID, 'Transfer In', :productID, :pastBal, :qty, :currentBal, :date, :time, :accID
                )";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['prodID'], PDO::PARAM_INT);
                    $stmt->bindParam(':pastBal', $item['pastBalance'], PDO::PARAM_INT);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->bindParam(':currentBal', $item['currentBalance'], PDO::PARAM_INT);
                    $stmt->bindParam(':date', $date);
                    $stmt->bindParam(':time', $time);
                    $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }


            $returnValue = "Success";
        } catch (PDOException $e) {
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }

    function ReceiveStockRequest($json, $updatedInventory, $newInventory, $reportInventory)
    {
        include 'conn.php';

        $oldProduct = json_decode($updatedInventory, true);
        $newProduct = json_decode($newInventory, true);
        $report = json_decode($reportInventory, true);
        $json = json_decode($json, true);

        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;
        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;

        $date = date("Y-m-d");
        $time = date("H:i");

        try {
            // ✅ Start transaction
            $conn->beginTransaction();

            // 1. Update the request
            $sql = "UPDATE `request_stock` 
                SET `request_status`='Delivered' 
                WHERE request_stock_id = :reqID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':reqID', $requestID, PDO::PARAM_INT);
            $stmt->execute();

            // 2. Insert request report
            $sql = "INSERT INTO `request_reports`(
                    `request_stock_id`, `date`, `time`, `status`, `account_id`
                ) VALUES (
                    :tsID, :date, :time, 'Delivered', :accID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':tsID', $requestID, PDO::PARAM_INT);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':accID', $accountID, PDO::PARAM_INT);
            $stmt->execute();

            // 3. Update the delivery
            $sql = "UPDATE `request_deliver` 
                SET `delivery_status`='Delivered' 
                WHERE request_stock_id = :tsID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':tsID', $requestID, PDO::PARAM_INT);
            $stmt->execute();

            // 5. Update old products
            if (!empty($oldProduct)) {
                foreach ($oldProduct as $item) {
                    $sql = "UPDATE `store_inventory` 
                        SET qty = :qty 
                        WHERE location_id = :storeID AND product_id = :productID";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['product_id'], PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 6. Insert new products
            if (!empty($newProduct)) {
                foreach ($newProduct as $item) {
                    $sql = "INSERT INTO `store_inventory` (location_id, product_id, qty)
                        VALUES (:storeID, :productID, :qty)";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['product_id'], PDO::PARAM_INT);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 7. Record ledger report
            if (!empty($report)) {
                foreach ($report as $item) {
                    $sql = "INSERT INTO `store_inventory_transaction_ledger` (
                            `location_id`, `type`, `product_id`, `past_balance`, `qty`, `current_balance`, 
                            `date`, `time`, `account_id`
                        ) VALUES (
                            :storeID, 'Stock In', :productID, :pastBal, :qty, :currentBal, 
                            :date, :time, :accID
                        )";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':storeID', $locationID, PDO::PARAM_INT);
                    $stmt->bindParam(':productID', $item['prodID'], PDO::PARAM_INT);
                    $stmt->bindParam(':pastBal', $item['pastBalance'], PDO::PARAM_INT);
                    $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                    $stmt->bindParam(':currentBal', $item['currentBalance'], PDO::PARAM_INT);
                    $stmt->bindParam(':date', $date);
                    $stmt->bindParam(':time', $time);
                    $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
                    $stmt->execute();
                }
            }

            // 8. Stock receiving report
            $itemCount = 0;
            foreach ($report as $item) {
                $itemCount += $item['qty'];
            }

            $sql = "INSERT INTO `stock_receiving`(
                    `transaction_date`, `total_item`, `report`, `account_id`, `location_id`
                ) VALUES (
                    :date, :totalItem, 'Stock In From Delivery' , :accID, :locID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':date', $date);
            $stmt->bindParam(':totalItem', $itemCount, PDO::PARAM_INT);
            $stmt->bindParam(':accID', $accountID, PDO::PARAM_INT);
            $stmt->bindParam(':locID', $locationID, PDO::PARAM_INT);
            $stmt->execute();
            $lastID1 = $conn->lastInsertId();

            // 9. Stock receiving details
            foreach ($report as $item) {
                $sql = "INSERT INTO `stock_receiving_details`(
                        `stock_receiving_id`, `product_id`, `qty`
                    ) VALUES (
                        :srID, :prodID , :qty
                    )";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':srID', $lastID1, PDO::PARAM_INT);
                $stmt->bindParam(':prodID', $item['prodID'], PDO::PARAM_INT);
                $stmt->bindParam(':qty', $item['qty'], PDO::PARAM_INT);
                $stmt->execute();
            }

            // ✅ Commit if everything succeeds
            $conn->commit();
            $returnValue = "Success";

        } catch (PDOException $e) {
            // ❌ Rollback all queries if any error occurs
            $conn->rollBack();
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }


    function MarkComplete($json, $updatedInventory, $newInventory, $reportInventory)
    {
        include 'conn.php';
        //recive a stock from request to warehouse

        $oldProduct = json_decode($updatedInventory, true);
        $newProduct = json_decode($newInventory, true);
        $report = json_decode($reportInventory, true);
        $json = json_decode($json, true);

        // $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;
        // $dtID = isset($json['dtID']) ? (int) $json['dtID'] : 0;
        $requestID = isset($json['reqID']) ? (int) $json['reqID'] : 0;
        $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;


        $date = date("Y-m-d");
        // $time = date("H:i");


        // return json_encode($oldProduct);

        try {
            // 1. Update the request
            $sql = "UPDATE `request_stock` 
                SET `request_status`= 'Complete' 
                WHERE request_stock_id = :reqID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':reqID', $requestID);
            $stmt->execute();


            //2. insert report
            $sql = "INSERT INTO `request_reports`(
                    `request_stock_id`, `date`, `time`, `status`, `account_id`
                ) VALUES (
                    :tsID, :date, :time, 'Complete', :accID
                )";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':tsID', $requestID);
            $stmt->bindValue(':date', $date);
            $stmt->bindValue(':time', $time);
            $stmt->bindValue(':accID', $accountID);
            $stmt->execute();

            //3 update the delivery
            $sql = " UPDATE `request_deliver` SET `delivery_status`='Complete' WHERE request_stock_id = :tsID";
            $stmt = $conn->prepare($sql);
            $stmt->bindValue(':tsID', $requestID);
            $stmt->execute();


            $returnValue = "Success";
        } catch (PDOException $e) {
            $returnValue = "Error: " . $e->getMessage();
        }

        unset($conn);
        unset($stmt);
        return json_encode($returnValue);
    }


    function GetRequestData($json)
    {
        include 'conn.php';

        $json = json_decode($json, true);

        // $locationID = isset($json['locID']) ? (int) $json['locID'] : 0;
        // $accountID = isset($json['accID']) ? (int) $json['accID'] : 0;
        $transferID = isset($json['transID']) ? (int) $json['transID'] : 0;


        // Base SQL
        $sql = "SELECT a.`request_stock_id`, a.`request_from`,b.location_name AS reqFrom, 
                a.`request_to`,c.location_name AS reqTo, a.`date`, a.`request_status`, 
                a.`request_by`,d.fname, d.mname, d.lname FROM `request_stock` a
                    INNER JOIN location b ON a.request_from = b.location_id
                    INNER JOIN location c ON a.request_to = c.location_id
                    INNER JOIN account d ON a.request_by = d.account_id
                    WHERE a.request_stock_id = :tsID;";


        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':tsID', $transferID, PDO::PARAM_INT);



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
    $updatedInventory = $_GET['updatedInventory'] ?? '[]';
    $newInventory = $_GET['newInventory'] ?? '[]';
    $reportInventory = $_GET['reportInventory'] ?? '[]';






} else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $operation = $_POST['operation'];
    $json = $_POST['json'];
    $updatedInventory = $_POST['updatedInventory'] ?? '[]';
    $newInventory = $_POST['newInventory'] ?? '[]';
    $reportInventory = $_POST['reportInventory'] ?? '[]';
}

$user = new User();
switch ($operation) {
    case 'GetToDeliver':
        echo $user->GetToDeliver($json);
        break;
    case 'GetDeliveryD':
        echo $user->GetToDeliverD($json);
        break;
    case 'GetDeliveryDetails':
        echo $user->GetToDeliverDetails($json);
        break;
    case 'AppointDeliveryTransfer':
        echo $user->AppointDeliveryTransfer($json);
        break;
    case 'GetDeliveries':
        echo $user->GetDeliveries($json);
        break;
    case 'GetDeliveriesData':
        echo $user->GetDeliveriesData($json);
        break;
    case 'GetRequestData':
        echo $user->GetRequestData($json);
        break;
    case 'GetDeliveriesDetails':
        echo $user->GetToDeliveriesDetails($json);
        break;
    case 'UpdateStatus':
        echo $user->UpdateDeliveryStatus($json);
        break;
    case 'GetDelivered':
        echo $user->GetDelivered($json);
        break;
    case 'GetDeliveredData':
        echo $user->GetDeliveredData($json);
        break;
    case 'GetUnavail';
        echo $user->GetUnavailDetails($json);
        break;
    case 'ReceiveStock':
        echo $user->ReceiveStock($json, $updatedInventory, $newInventory, $reportInventory);
        break;
    case 'ReceiveStockRequest':
        echo $user->ReceiveStockRequest($json, $updatedInventory, $newInventory, $reportInventory);
        break;
    case 'MarkComplete':
        echo $user->MarkComplete($json, $updatedInventory, $newInventory, $reportInventory);
        break;

}
?>