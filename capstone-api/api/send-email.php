<?php
// api/send-email.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required_fields = ['to', 'subject', 'message'];
$missing_fields = [];

foreach ($required_fields as $field) {
    if (empty($input[$field])) {
        $missing_fields[] = $field;
    }
}

if (!empty($missing_fields)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Missing required fields',
        'missing_fields' => $missing_fields
    ]);
    exit();
}

// Sanitize inputs
$to = filter_var($input['to'], FILTER_SANITIZE_EMAIL);
$subject = htmlspecialchars($input['subject'], ENT_QUOTES, 'UTF-8');
$message = htmlspecialchars($input['message'], ENT_QUOTES, 'UTF-8');
$from = !empty($input['from']) ? filter_var($input['from'], FILTER_SANITIZE_EMAIL) : 'noreply@yourdomain.com';
$from_name = !empty($input['from_name']) ? htmlspecialchars($input['from_name'], ENT_QUOTES, 'UTF-8') : 'Your Website';

// Validate email addresses
if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid recipient email address']);
    exit();
}

if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid sender email address']);
    exit();
}

// Email headers
$headers = [
    'From: ' . $from_name . ' <' . $from . '>',
    'Reply-To: ' . $from,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'X-Mailer: PHP/' . phpversion()
];

// Create HTML email body
$html_message = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <title>{$subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #ffffff; }
        .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>{$subject}</h2>
        </div>
        <div class='content'>
            " . nl2br($message) . "
        </div>
        <div class='footer'>
            <p>This email was sent from your website contact form.</p>
        </div>
    </div>
</body>
</html>
";

// Attempt to send email
try {
    $success = mail($to, $subject, $html_message, implode("\r\n", $headers));
    
    if ($success) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Email sent successfully'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to send email',
        'details' => $e->getMessage()
    ]);
}

// Log email attempt (optional)
$log_entry = date('Y-m-d H:i:s') . " - Email sent to: {$to}, Subject: {$subject}\n";
file_put_contents('email_log.txt', $log_entry, FILE_APPEND | LOCK_EX);
?>