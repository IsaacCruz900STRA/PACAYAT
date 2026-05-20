const { z } = require('zod');

const ROLES_VALIDOS = [
  'ADMIN', 'ADMINISTRATIVO', 'DIRECTIVO', 'DOCENTE',
  'PREFECTO', 'SECRETARIA', 'CONTROL_ESCOLAR', 'TUTOR',
];

const loginSchema = z.object({
  username: z
    .string({ required_error: 'El usuario es requerido' })
    .min(1, 'El usuario es requerido')
    .max(100, 'Usuario demasiado largo')
    .trim(),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida')
    .max(200, 'Contraseña demasiado larga'),
  rol: z.enum(ROLES_VALIDOS, { errorMap: () => ({ message: 'Rol inválido' }) }),
});

const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'El correo es requerido' })
    .email('Correo electrónico inválido')
    .max(200, 'Correo demasiado largo')
    .toLowerCase(),
});

module.exports = { loginSchema, forgotPasswordSchema };
