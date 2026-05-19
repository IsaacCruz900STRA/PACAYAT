const transporter = require('../config/mail');

async function sendTemporaryPassword(correo, password, nombre, tipo = 'TUTOR') {
  const descripcion = tipo === 'PERSONAL'
    ? 'Has sido registrado como personal en PACAYAT. Aquí están tus credenciales temporales para acceder al sistema.'
    : 'Has sido registrado como tutor en PACAYAT. Aquí están tus credenciales temporales para acceder al sistema.';

  await transporter.sendMail({
    from: `"PACAYAT · ST 177" <${process.env.SMTP_USER}>`,
    to: correo,
    subject: 'Bienvenido a PACAYAT — Credenciales de acceso',
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Credenciales de acceso</title>
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
                ¡Bienvenido, ${nombre}!
              </h2>
              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;text-align:center;line-height:1.6;">
                ${descripcion}
              </p>

              <!-- Credenciales destacadas -->
              <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px 20px;margin-bottom:28px;">
                <div style="margin-bottom:16px;">
                  <div style="font-size:12px;font-weight:600;color:#16a34a;text-transform:uppercase;margin-bottom:6px;">
                    Email de acceso
                  </div>
                  <div style="font-size:15px;font-weight:600;color:#111827;font-family:'Courier New',monospace;word-break:break-all;">
                    ${correo}
                  </div>
                </div>
                
                <hr style="border:none;border-top:1px solid #dcfce7;margin:16px 0;" />
                
                <div>
                  <div style="font-size:12px;font-weight:600;color:#16a34a;text-transform:uppercase;margin-bottom:6px;">
                    Contraseña temporal
                  </div>
                  <div style="font-size:15px;font-weight:600;color:#111827;font-family:'Courier New',monospace;word-break:break-all;letter-spacing:1px;">
                    ${password}
                  </div>
                </div>
              </div>

              <!-- Advertencia importante -->
              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px 18px;display:flex;align-items:flex-start;margin-bottom:28px;">
                <span style="font-size:18px;margin-right:10px;line-height:1;">⚠️</span>
                <div>
                  <div style="font-size:13px;font-weight:600;color:#991b1b;margin-bottom:2px;">
                    Contraseña temporal
                  </div>
                  <div style="font-size:12px;color:#7f1d1d;line-height:1.5;">
                    Al iniciar sesión por primera vez, se te pedirá que cambies esta contraseña. Es importante que crees una contraseña segura y única que solo tú conozcas.
                  </div>
                </div>
              </div>

              <!-- Separador -->
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <!-- Pasos -->
              <p style="font-size:13px;font-weight:600;color:#374151;margin:0 0 12px;">
                ¿Qué hacer ahora?
              </p>
              <table cellpadding="0" cellspacing="0" width="100%">
                ${[
                  ['1', 'Inicia sesión en PACAYAT con tu email y contraseña temporal.'],
                  ['2', 'Se te pedirá cambiar tu contraseña inmediatamente.'],
                  ['3', 'Crea una contraseña segura que solo tú conoces.'],
                  ['4', 'ˇListo! Ya podrás acceder a todas las funciones del sistema.'],
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

              <!-- Recordatorio de seguridad -->
              <div style="background:#f3f4f6;border-radius:10px;padding:14px 18px;margin-top:24px;">
                <div style="font-size:12px;color:#6b7280;line-height:1.6;">
                  <strong style="color:#374151;">💡 Consejo de seguridad:</strong> Nunca compartas tus credenciales con nadie. El administrador no volverá a ver tu contraseña.
                </div>
              </div>

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

module.exports = { sendTemporaryPassword };