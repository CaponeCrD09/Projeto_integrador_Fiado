/**
 * Middleware de autorização por tipo de usuário.
 *
 * Verifica se o tipo do usuário autenticado (req.logeded.type)
 * está entre os tipos permitidos. Deve ser usado APÓS o authMiddleware.
 *
 * @param  {...string} allowedTypes - Tipos de usuário permitidos (ex: "admin", "userowner")
 * @returns {Function} Middleware do Express
 *
 * @example
 *   // Permitir apenas "admin"
 *   router.post('/', authMiddleware, authorizeUserType('admin'), createCompany);
 *
 *   // Permitir "admin" ou "userowner"
 *   router.post('/', authMiddleware, authorizeUserType('admin', 'userowner'), createCompany);
 */
export const authorizeUserType = (...allowedTypes) => {
  return (req, res, next) => {
    // Verifica se o usuário foi autenticado pelo authMiddleware
    if (!req.logeded) {
      return res.status(401).json({
        error: 'Usuário não autenticado. Faça login para continuar.',
      });
    }

    const userType = req.logeded.type;

    // Verifica se o tipo do usuário está na lista de tipos permitidos
    if (!userType || !allowedTypes.includes(userType)) {
      return res.status(403).json({
        error: 'Acesso negado. Você não tem permissão para realizar esta ação.',
      });
    }

    return next();
  };
};
