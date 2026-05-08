const transporter = require('../config/mail');

async function enviarCodigoRecuperacion(correo, codigo) {
  await transporter.sendMail({
    from: `"PACAYAT · ST 177" <${process.env.SMTP_USER}>`,
    to: correo,
    subject: 'Recuperación de contraseña — PACAYAT',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Recuperación de contraseña</title>
</head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Contenedor principal -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

          <!-- Encabezado verde -->
          <tr>
            <td style="background:linear-gradient(135deg,#166534 0%,#16a34a 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <!-- Logo circular -->
              <div style="width:64px;height:64px;background:#fff;border-radius:50%;border:3px solid #bbf7d0;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                <span style="font-size:22px;font-weight:700;color:#166534;line-height:64px;">ST</span>
              </div>
              <div style="color:#fff;font-size:20px;font-weight:700;margin-bottom:4px;">
                Secundaria Técnica 177
              </div>
              <div style="color:#bbf7d0;font-size:14px;">
                Sistema PACAYAT
              </div>
            </td>
          </tr>

          <!-- Cuerpo blanco -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #dcfce7;border-right:1px solid #dcfce7;">

              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;text-align:center;">
                Recuperación de contraseña
              </h2>
              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;text-align:center;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en PACAYAT. Usa el siguiente código de verificación:
              </p>

              <!-- Código destacado -->
              <div style="background:#f0fdf4;border:2px dashed #16a34a;border-radius:12px;padding:28px 20px;text-align:center;margin-bottom:28px;">
                <div style="font-size:11px;font-weight:600;color:#16a34a;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;">
                  Tu código de verificación
                </div>
                <div style="font-size:48px;font-weight:800;color:#166534;letter-spacing:12px;font-family:'Courier New',monospace;">
                  ${codigo}
                </div>
              </div>

              <!-- Advertencia de tiempo -->
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;display:flex;align-items:flex-start;margin-bottom:28px;">
                <span style="font-size:18px;margin-right:10px;line-height:1;">⏱</span>
                <div>
                  <div style="font-size:13px;font-weight:600;color:#92400e;margin-bottom:2px;">
                    Código válido por 15 minutos
                  </div>
                  <div style="font-size:12px;color:#78350f;line-height:1.5;">
                    Si no solicitaste este código, ignora este correo. Tu contraseña permanecerá sin cambios.
                  </div>
                </div>
              </div>

              <!-- Separador -->
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <!-- Pasos -->
              <p style="font-size:13px;font-weight:600;color:#374151;margin:0 0 12px;">
                ¿Cómo usar este código?
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                ${[
                  ['1', 'Regresa a la pantalla de recuperación en PACAYAT.'],
                  ['2', 'Ingresa los 6 dígitos en los campos indicados.'],
                  ['3', 'Crea tu nueva contraseña segura.'],
                ].map(([num, texto]) => `
                <tr>
                  <td style="width:32px;padding-bottom:10px;vertical-align:top;">
                    <div style="width:24px;height:24px;background:#166534;border-radius:50%;text-align:center;line-height:24px;font-size:12px;font-weight:700;color:#fff;">${num}</div>
                  </td>
                  <td style="padding-bottom:10px;padding-left:10px;vertical-align:top;">
                    <span style="font-size:13px;color:#6b7280;line-height:1.5;">${texto}</span>
                  </td>
                </tr>`).join('')}
              </table>

            </td>
          </tr>

          <!-- Pie de página -->
          <tr>
            <td style="background:#f9fafb;border:1px solid #dcfce7;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6;">
                Este correo fue enviado automáticamente por el sistema PACAYAT.<br/>
                Por favor no respondas a este mensaje.
              </p>
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                © 2026 Secundaria Técnica 177 — Todos los derechos reservados
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `,
  });
}

module.exports = { enviarCodigoRecuperacion };