<?php

declare(strict_types=1);

namespace App\Services;

class EmailService
{
    private string $fromEmail;
    private string $fromName;

    public function __construct()
    {
        $this->fromEmail = $_ENV['MAIL_FROM_ADDRESS'] ?? 'noreply@fundacionacavall.com';
        $this->fromName = $_ENV['MAIL_FROM_NAME'] ?? 'Fundación Acavall';
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
     * Send email using PHP mail function
     *
     * @param string $to
     * @param string $subject
     * @param string $htmlBody
     * @param string $plainBody
     * @return bool
     */
    private function sendEmail(string $to, string $subject, string $htmlBody, string $plainBody): bool
    {
        try {
            // Create a unique boundary
            $boundary = md5(uniqid(time()));

            // Headers
            $headers = [
                'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
                'Reply-To: ' . $this->fromEmail,
                'MIME-Version: 1.0',
                'Content-Type: multipart/alternative; boundary="' . $boundary . '"'
            ];

            // Message body
            $message = "--{$boundary}\r\n";
            $message .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
            $message .= $plainBody . "\r\n\r\n";

            $message .= "--{$boundary}\r\n";
            $message .= "Content-Type: text/html; charset=UTF-8\r\n";
            $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
            $message .= $htmlBody . "\r\n\r\n";

            $message .= "--{$boundary}--";

            // Send email
            $result = mail($to, $subject, $message, implode("\r\n", $headers));

            if ($result) {
                error_log("Email sent successfully to: {$to}");
            } else {
                error_log("Failed to send email to: {$to}");
            }

            return $result;
        } catch (\Exception $e) {
            error_log("Error sending email: " . $e->getMessage());
            return false;
        }
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
}
