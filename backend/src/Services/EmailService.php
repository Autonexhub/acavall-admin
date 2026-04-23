<?php

declare(strict_types=1);

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService
{
    private string $fromEmail;
    private string $fromName;
    private string $smtpHost;
    private int $smtpPort;
    private bool $smtpSecure;
    private string $smtpUser;
    private string $smtpPass;

    public function __construct()
    {
        $this->fromEmail = $_ENV['SMTP_FROM_EMAIL'] ?? $_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@fundacionacavall.com';
        $this->fromName = $_ENV['SMTP_FROM_NAME'] ?? $_ENV['MAIL_FROM_NAME'] ?? 'Fundación Acavall';
        $this->smtpHost = $_ENV['SMTP_HOST'] ?? 'localhost';
        $this->smtpPort = (int)($_ENV['SMTP_PORT'] ?? 587);
        $this->smtpSecure = filter_var($_ENV['SMTP_SECURE'] ?? 'true', FILTER_VALIDATE_BOOLEAN);
        $this->smtpUser = $_ENV['SMTP_USER'] ?? '';
        $this->smtpPass = $_ENV['SMTP_PASS'] ?? '';

        error_log("EmailService::__construct - SMTP Config: host={$this->smtpHost}, port={$this->smtpPort}, secure=" . ($this->smtpSecure ? 'true' : 'false') . ", user={$this->smtpUser}, from={$this->fromEmail}");
    }

    /**
     * Send password reset email
     *
     * @param string $toEmail
     * @param string $userName
     * @param string $resetUrl
     * @return bool
     */
    public function sendPasswordResetEmail(string $toEmail, string $userName, string $resetUrl): bool
    {
        $subject = 'Restablece tu contraseña - Fundación Acavall';

        $htmlBody = $this->getPasswordResetTemplate($userName, $resetUrl);
        $plainBody = $this->getPasswordResetPlainText($userName, $resetUrl);

        return $this->sendEmail($toEmail, $subject, $htmlBody, $plainBody);
    }

    /**
     * Send welcome email with account credentials
     *
     * @param string $toEmail
     * @param string $userName
     * @param string $password
     * @return bool
     */
    public function sendWelcomeEmail(string $toEmail, string $userName, string $password): bool
    {
        $subject = 'Bienvenido a Fundación Acavall';

        $htmlBody = $this->getWelcomeEmailTemplate($userName, $toEmail, $password);
        $plainBody = $this->getWelcomeEmailPlainText($userName, $toEmail, $password);

        return $this->sendEmail($toEmail, $subject, $htmlBody, $plainBody);
    }

    /**
     * Send email using PHPMailer with SMTP
     *
     * @param string $to
     * @param string $subject
     * @param string $htmlBody
     * @param string $plainBody
     * @return bool
     * @throws \Exception
     */
    private function sendEmail(string $to, string $subject, string $htmlBody, string $plainBody): bool
    {
        error_log("EmailService::sendEmail - Starting to send email to: {$to}");
        error_log("EmailService::sendEmail - Subject: {$subject}");
        error_log("EmailService::sendEmail - SMTP: {$this->smtpHost}:{$this->smtpPort}");

        // Validate SMTP configuration
        if (empty($this->smtpHost) || $this->smtpHost === 'localhost') {
            $error = "SMTP no configurado correctamente. Host: {$this->smtpHost}";
            error_log("EmailService::sendEmail - ERROR: {$error}");
            throw new \Exception($error);
        }

        if (empty($this->smtpUser) || empty($this->smtpPass)) {
            $error = "Credenciales SMTP no configuradas";
            error_log("EmailService::sendEmail - ERROR: {$error}");
            throw new \Exception($error);
        }

        try {
            $mail = new PHPMailer(true);

            // Enable verbose debug output for logging
            $mail->SMTPDebug = 0; // Set to 2 for verbose debugging
            $mail->Debugoutput = function($str, $level) {
                error_log("PHPMailer Debug [{$level}]: {$str}");
            };

            // Server settings
            $mail->isSMTP();
            $mail->Host = $this->smtpHost;
            $mail->SMTPAuth = true;
            $mail->Username = $this->smtpUser;
            $mail->Password = $this->smtpPass;
            $mail->SMTPSecure = $this->smtpSecure ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $this->smtpPort;
            $mail->CharSet = 'UTF-8';
            $mail->Timeout = 30; // 30 second timeout

            error_log("EmailService::sendEmail - SMTP configured, setting from address");

            // Sender
            $mail->setFrom($this->fromEmail, $this->fromName);
            $mail->addReplyTo($this->fromEmail, $this->fromName);

            // Recipient
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = $plainBody;

            error_log("EmailService::sendEmail - Attempting to send...");

            // Send email
            $result = $mail->send();

            if ($result) {
                error_log("EmailService::sendEmail - SUCCESS: Email sent to {$to}");
            } else {
                error_log("EmailService::sendEmail - FAILED: mail->send() returned false");
                throw new \Exception("Error al enviar: " . $mail->ErrorInfo);
            }

            return $result;
        } catch (Exception $e) {
            $error = "Error PHPMailer: " . $e->getMessage();
            error_log("EmailService::sendEmail - PHPMailer Exception: " . $e->getMessage());
            throw new \Exception($error);
        } catch (\Exception $e) {
            error_log("EmailService::sendEmail - General Exception: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Test email configuration by sending a test email
     *
     * @param string $toEmail
     * @return bool
     */
    public function sendTestEmail(string $toEmail): bool
    {
        $subject = 'Test Email - Fundación Acavall';

        $htmlBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #F7DC6F; padding: 30px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1 style='margin: 0; color: #333;'>Fundación Acavall</h1>
                </div>
                <div class='content'>
                    <h2>Email de Prueba</h2>
                    <p>Este es un email de prueba para verificar la configuración SMTP.</p>
                    <p>Si recibes este mensaje, significa que la configuración de correo está funcionando correctamente.</p>
                    <p><strong>Hora de envío:</strong> " . date('Y-m-d H:i:s') . "</p>
                </div>
                <div class='footer'>
                    <p>&copy; " . date('Y') . " Fundación Acavall. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        $plainBody = "
Email de Prueba - Fundación Acavall

Este es un email de prueba para verificar la configuración SMTP.

Si recibes este mensaje, significa que la configuración de correo está funcionando correctamente.

Hora de envío: " . date('Y-m-d H:i:s') . "

Fundación Acavall
" . date('Y');

        return $this->sendEmail($toEmail, $subject, $htmlBody, $plainBody);
    }

    /**
     * Get password reset HTML template
     *
     * @param string $userName
     * @param string $resetUrl
     * @return string
     */
    private function getPasswordResetTemplate(string $userName, string $resetUrl): string
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #F7DC6F; padding: 30px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .button { display: inline-block; padding: 12px 30px; background-color: #F7DC6F; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1 style='margin: 0; color: #333;'>Fundación Acavall</h1>
                </div>
                <div class='content'>
                    <h2>Hola {$userName},</h2>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                    <p style='text-align: center; margin: 30px 0;'>
                        <a href='{$resetUrl}' class='button'>Restablecer Contraseña</a>
                    </p>
                    <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.</p>
                    <p><strong>Este enlace expirará en 1 hora.</strong></p>
                    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style='word-break: break-all; color: #666;'>{$resetUrl}</p>
                </div>
                <div class='footer'>
                    <p>&copy; " . date('Y') . " Fundación Acavall. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Get password reset plain text
     *
     * @param string $userName
     * @param string $resetUrl
     * @return string
     */
    private function getPasswordResetPlainText(string $userName, string $resetUrl): string
    {
        return "
Hola {$userName},

Hemos recibido una solicitud para restablecer tu contraseña en Fundación Acavall.

Para crear una nueva contraseña, visita el siguiente enlace:
{$resetUrl}

Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.

Este enlace expirará en 1 hora.

Fundación Acavall
" . date('Y');
    }

    /**
     * Get welcome email HTML template
     *
     * @param string $userName
     * @param string $email
     * @param string $password
     * @return string
     */
    private function getWelcomeEmailTemplate(string $userName, string $email, string $password): string
    {
        $loginUrl = ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000') . '/login';

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #F7DC6F; padding: 30px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .credentials { background-color: #fff; padding: 20px; border-left: 4px solid #F7DC6F; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background-color: #F7DC6F; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1 style='margin: 0; color: #333;'>Fundación Acavall</h1>
                </div>
                <div class='content'>
                    <h2>¡Bienvenido {$userName}!</h2>
                    <p>Se ha creado una cuenta para ti en el sistema de gestión de Fundación Acavall.</p>
                    <p>Ahora puedes acceder al sistema para ver tus sesiones y reportes.</p>

                    <div class='credentials'>
                        <h3 style='margin-top: 0;'>Tus credenciales de acceso:</h3>
                        <p><strong>Usuario:</strong> {$email}</p>
                        <p><strong>Contraseña:</strong> {$password}</p>
                    </div>

                    <p><strong>Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez.</strong></p>

                    <p style='text-align: center; margin: 30px 0;'>
                        <a href='{$loginUrl}' class='button'>Iniciar Sesión</a>
                    </p>

                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                </div>
                <div class='footer'>
                    <p>&copy; " . date('Y') . " Fundación Acavall. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Get welcome email plain text
     *
     * @param string $userName
     * @param string $email
     * @param string $password
     * @return string
     */
    private function getWelcomeEmailPlainText(string $userName, string $email, string $password): string
    {
        $loginUrl = ($_ENV['FRONTEND_URL'] ?? 'http://localhost:3000') . '/login';

        return "
¡Bienvenido {$userName}!

Se ha creado una cuenta para ti en el sistema de gestión de Fundación Acavall.

Tus credenciales de acceso:
Usuario: {$email}
Contraseña: {$password}

Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión por primera vez.

Puedes acceder al sistema en:
{$loginUrl}

Si tienes alguna pregunta, no dudes en contactarnos.

Fundación Acavall
" . date('Y');
    }

    /**
     * Send invite email for new user to set their password
     *
     * @param string $toEmail
     * @param string $userName
     * @param string $setupUrl
     * @return bool
     */
    public function sendInviteEmail(string $toEmail, string $userName, string $setupUrl): bool
    {
        $subject = 'Invitación a Fundación Acavall - Configura tu cuenta';

        $htmlBody = $this->getInviteEmailTemplate($userName, $toEmail, $setupUrl);
        $plainBody = $this->getInviteEmailPlainText($userName, $toEmail, $setupUrl);

        return $this->sendEmail($toEmail, $subject, $htmlBody, $plainBody);
    }

    /**
     * Get invite email HTML template
     *
     * @param string $userName
     * @param string $email
     * @param string $setupUrl
     * @return string
     */
    private function getInviteEmailTemplate(string $userName, string $email, string $setupUrl): string
    {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #F7DC6F; padding: 30px; text-align: center; }
                .content { background-color: #f9f9f9; padding: 30px; }
                .credentials { background-color: #fff; padding: 20px; border-left: 4px solid #F7DC6F; margin: 20px 0; }
                .button { display: inline-block; padding: 12px 30px; background-color: #F7DC6F; color: #333; text-decoration: none; border-radius: 5px; font-weight: bold; }
                .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1 style='margin: 0; color: #333;'>Fundación Acavall</h1>
                </div>
                <div class='content'>
                    <h2>¡Hola {$userName}!</h2>
                    <p>Has sido invitado/a a unirte al sistema de gestión de Fundación Acavall.</p>
                    <p>Ahora podrás acceder al sistema para ver tus sesiones y reportes.</p>

                    <div class='credentials'>
                        <h3 style='margin-top: 0;'>Tu información de acceso:</h3>
                        <p><strong>Usuario:</strong> {$email}</p>
                    </div>

                    <p>Para comenzar, necesitas crear tu contraseña haciendo clic en el siguiente botón:</p>

                    <p style='text-align: center; margin: 30px 0;'>
                        <a href='{$setupUrl}' class='button'>Configurar mi Contraseña</a>
                    </p>

                    <p><strong>Este enlace expirará en 7 días.</strong></p>

                    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style='word-break: break-all; color: #666;'>{$setupUrl}</p>

                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                </div>
                <div class='footer'>
                    <p>&copy; " . date('Y') . " Fundación Acavall. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Get invite email plain text
     *
     * @param string $userName
     * @param string $email
     * @param string $setupUrl
     * @return string
     */
    private function getInviteEmailPlainText(string $userName, string $email, string $setupUrl): string
    {
        return "
¡Hola {$userName}!

Has sido invitado/a a unirte al sistema de gestión de Fundación Acavall.

Tu información de acceso:
Usuario: {$email}

Para comenzar, necesitas crear tu contraseña visitando el siguiente enlace:
{$setupUrl}

Este enlace expirará en 7 días.

Si tienes alguna pregunta, no dudes en contactarnos.

Fundación Acavall
" . date('Y');
    }
}
