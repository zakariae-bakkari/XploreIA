<?php

namespace Core;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    /**
     * Send a verification email with a 6-digit code using PHPMailer
     * 
     * @param string $to Email address
     * @param string $code 6-digit code
     * @return bool
     */
    public static function sendVerificationCode($to, $code) {
        $mail = new PHPMailer(true);

        // Always log to file for local debugging
        self::logEmail($to, $code);

        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.mailtrap.io';
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('SMTP_USER');
            $mail->Password   = getenv('SMTP_PASS');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = getenv('SMTP_PORT') ?: 2525;

            // Recipients
            $mail->setFrom('noreply@xplore-ia.com', 'XploreIA');
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = 'Verify your XploreIA account';
            $mail->Body    = self::getEmailTemplate($code);
            $mail->AltBody = "Your verification code is: $code";

            return $mail->send();
        } catch (Exception $e) {
            error_log("PHPMailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }

    private static function getEmailTemplate($code) {
        return "
        <html>
        <head>
            <style>
                .container { font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; }
                .header { text-align: center; margin-bottom: 20px; }
                .code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #aa3bff; text-align: center; padding: 20px; background: #f4f3ec; border-radius: 8px; margin: 20px 0; }
                .footer { font-size: 12px; color: #888; text-align: center; margin-top: 30px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Welcome to XploreIA</h1>
                </div>
                <p>Hello,</p>
                <p>Thank you for signing up! Please use the following verification code to complete your registration. This code will expire in 15 minutes.</p>
                <div class='code'>$code</div>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <div class='footer'>
                    &copy; " . date('Y') . " XploreIA. All rights reserved.
                </div>
            </div>
        </body>
        </html>";
    }

    private static function logEmail($to, $code) {
        $logPath = dirname(__DIR__) . '/storage/logs/email.log';
        if (!is_dir(dirname($logPath))) {
            mkdir(dirname($logPath), 0777, true);
        }
        $logEntry = "[" . date('Y-m-d H:i:s') . "] To: $to | Code: $code\n";
        file_put_contents($logPath, $logEntry, FILE_APPEND);
    }
}
