import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// REGRAS DE AUTORIZAÇÃO — COMPANY
//
// Tipos de usuário no sistema:
//   admin      → acesso total a qualquer empresa
//   userOwner  → acesso somente à sua própria empresa
//   userClient → somente leitura (não pode criar, editar ou deletar)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bloqueia userClient de operações de escrita (POST).
 * Apenas admin e userOwner podem criar empresas.
 */
export const blockUserClient = (req, res, next) => {
  if (!req.logeded) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  if (req.logeded.type === 'userClient') {
    return res.status(403).json({
      erro: 'Acesso negado. Clientes não podem criar empresas.',
    });
  }

  return next();
};

/**
 * Garante que o usuário pode operar sobre a empresa solicitada.
 *
 * - admin      → passa livre (sem restrição de ownership)
 * - userOwner  → busca a empresa vinculada ao seu userId e injeta em req.companyId.
 *                Se o :id da rota não bater com a empresa dele → 403.
 * - userClient → 403 sempre (não deve chegar aqui, mas protege por segurança)
 */
export const requireOwnership = async (req, res, next) => {
  if (!req.logeded) {
    return res.status(401).json({ erro: 'Usuário não autenticado.' });
  }

  const { type, id: userId } = req.logeded;

  // Admin tem acesso irrestrito
  if (type === 'admin') {
    return next();
  }

  // userClient nunca pode editar/deletar
  if (type === 'userClient') {
    return res.status(403).json({
      erro: 'Acesso negado. Clientes não podem modificar empresas.',
    });
  }

  // userOwner: verifica se a empresa requisitada pertence a ele
  if (type === 'userOwner') {
    const requestedId = Number(req.params.id);

    if (isNaN(requestedId)) {
      return res.status(400).json({ erro: 'ID inválido.' });
    }

    try {
      const company = await prisma.company.findFirst({
        where: { userId: Number(userId), deletedAt: null },
      });

      if (!company) {
        return res.status(403).json({
          erro: 'Acesso negado. Você não possui nenhuma empresa cadastrada.',
        });
      }

      if (company.id !== requestedId) {
        return res.status(403).json({
          erro: 'Acesso negado. Você só pode modificar a sua própria empresa.',
        });
      }

      // Injeta o companyId para uso nos serviços
      req.companyId = company.id;
      return next();
    } catch (error) {
      return res.status(500).json({ erro: 'Erro ao verificar ownership.', detalhe: error.message });
    }
  }

  return res.status(403).json({ erro: 'Tipo de usuário não reconhecido.' });
};

/**
 * Injeta req.companyId para rotas de leitura (GET).
 *
 * - admin      → req.companyId = undefined (vê todas as empresas)
 * - userOwner  → req.companyId = id da própria empresa
 * - userClient → req.companyId = undefined (vê todas, só leitura)
 *
 * Não bloqueia nenhum tipo — apenas enriquece a requisição.
 */
export const injectCompanyId = async (req, res, next) => {
  if (!req.logeded) {
    return next(); // rota pública, sem filtro
  }

  const { type, id: userId } = req.logeded;

  if (type === 'userOwner') {
    try {
      const company = await prisma.company.findFirst({
        where: { userId: Number(userId), deletedAt: null },
      });

      if (company) {
        req.companyId = company.id;
      }
    } catch (_) {
      // falha silenciosa — o serviço vai retornar lista vazia
    }
  }

  return next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Mantido para compatibilidade com outros arquivos de rota que usam essa função
// ─────────────────────────────────────────────────────────────────────────────
export const authorizeUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.logeded) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    if (!allowedTypes.includes(req.logeded.type)) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    return next();
  };
};
