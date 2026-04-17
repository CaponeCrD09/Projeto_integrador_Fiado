import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido ou ausente' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro de formatação do token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'secret_key_default';



    const payload = jwt.verify(token, secret);

    req.logeded = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      type: payload.type
    };

    return next();
  } catch (e) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};
