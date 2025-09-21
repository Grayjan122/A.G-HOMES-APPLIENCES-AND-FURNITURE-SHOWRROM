<?php
// Simple Gmail message sender
function sendGmailMessage($to, $message) {
    // Gmail SMTP settings
    $smtp_server = 'smtp.gmail.com';
    $smtp_port = 587;
    $username = 'your-email@gmail.com';        // Replace with your Gmail
    $password = 'your-app-password';           // Replace with your App Password
    
    // Connect to Gmail SMTP
    $socket = fsockopen($smtp_server, $smtp_port);
    if (!$socket) {
        die("❌ Could not connect to Gmail");
    }
    
    // Read server greeting
    fgets($socket, 515);
    
    // SMTP commands
    fputs($socket, "EHLO localhost\r\n");
    fgets($socket, 515);
    
    // Start TLS
    fputs($socket, "STARTTLS\r\n");
    fgets($socket, 515);
    stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
    
    // EHLO again after TLS
    fputs($socket, "EHLO localhost\r\n");
    fgets($socket, 515);
    
    // Login
    fputs($socket, "AUTH LOGIN\r\n");
    fgets($socket, 515);
    fputs($socket, base64_encode($username) . "\r\n");
    fgets($socket, 515);
    fputs($socket, base64_encode($password) . "\r\n");
    $auth_response = fgets($socket, 515);
    
    if (substr($auth_response, 0, 3) != '235') {
        fclose($socket);
        die("❌ Login failed - check your email and app password");
    }
    
    // Send email
    fputs($socket, "MAIL FROM: <$username>\r\n");
    fgets($socket, 515);
    fputs($socket, "RCPT TO: <$to>\r\n");
    fgets($socket, 515);
    fputs($socket, "DATA\r\n");
    fgets($socket, 515);
    
    // Message content
    fputs($socket, "From: $username\r\n");
    fputs($socket, "To: $to\r\n");
    fputs($socket, "Subject: Message\r\n");
    fputs($socket, "\r\n");
    fputs($socket, "$message\r\n");
    fputs($socket, ".\r\n");
    
    $send_response = fgets($socket, 515);
    
    // Close connection
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    if (substr($send_response, 0, 3) == '250') {
        echo "✅ Message sent successfully!";
    } else {
        echo "❌ Failed to send message";
    }
}

// Send your message
$recipient = 'recipient@example.com';    // Replace with recipient email
$my_message = 'Hello! This is my message.';

sendGmailMessage($recipient, $my_message);
?>