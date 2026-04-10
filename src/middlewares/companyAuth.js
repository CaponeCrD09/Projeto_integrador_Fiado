import jwt from 'jsonwebtoken';

export const companyAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido ou ausente' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ erro: 'Erro de formatação do token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ erro: 'Token mal formatado' });
  }

  const secret = process.env.JWT_SECRET || 'secret_key_default';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

    if (!decoded.companyId) {
        return res.status(401).json({ erro: 'Token inválido: companyId ausente no payload.' });
    }

    req.companyId = decoded.companyId; 
    return next();
  });
};
