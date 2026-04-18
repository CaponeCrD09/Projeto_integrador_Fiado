import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { attachSave } from "../utils/save.js";
import jwt from 'jsonwebtoken';

// req: requisição (o que está vindo do frontend)
// res: response (o que eu vou enviar de volta)
// next: proximo (o que eu vou fazer a seguir)

// Lógica de type dinâmico foi removida por solicitação.

// Login: autentica o usuário por email e senha, retorna um token JWT
export async function loginUser(req, res, _next) {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ erro: "Email e senha são obrigatórios." });
        }

        const user = await prisma.user.findFirst({
            where: { email },
            include: { companies: true },
        });

        if (!user) {
            return res.status(401).json({ erro: "Email ou senha inválidos." });
        }

        if (user.senha !== senha) {
            return res.status(401).json({ erro: "Email ou senha inválidos." });
        }

        // Usa diretamente o type do banco de dados
        const type = user.type;

        const secret = process.env.JWT_SECRET || 'secret_key_default';

        const token = jwt.sign(
            {
                sub: user.id,
                name: user.name,
                email: user.email,
                type: type,
            },
            secret,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            usuario: {
                id: user.id,
                name: user.name,
                email: user.email,
                type: type,
            },
            token,
        });
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao realizar login.", detalhe: error.message });
    }
}

export async function createUser(req, res, _next) {
    try {
        const { name, email, senha, type } = req.body;

        // Verifica se já existe um usuário com o mesmo email
        const emailExistente = await prisma.user.findFirst({ where: { email } });
        if (emailExistente) {
            return res.status(409).json({ erro: "Este email já está cadastrado." });
        }

        let finalType = "userClient";
        let loggedUserType = null;
        const authHeader = req.headers.authorization;

        // 1. Extração manual do JWT para verificar a role do criador
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                try {
                    const secret = process.env.JWT_SECRET || 'secret_key_default';
                    const payload = jwt.verify(parts[1], secret);
                    loggedUserType = payload.type;
                } catch (e) {
                    // Token inválido: segue como não autenticado
                }
            }
        }

        // 2. Aplicação da Hierarquia
        if (loggedUserType === 'admin') {
            // Regra do Admin: Pode criar qualquer um
            finalType = type || "userClient";
        } else if (loggedUserType === 'userOwner') {
            // Regra do Owner: Apenas criar Clients. Bloqueia ativamente tentativas de criar Admin/Owner
            if (type && type !== 'userClient') {
                return res.status(403).json({ erro: "Acesso Negado: Proprietários só têm permissão para cadastrar Clientes (userClient)." });
            }
            finalType = "userClient";
        } else {
            // Regra Pública/Cliente: Força a criação padrão e ignora tentativas maliciosas
            finalType = "userClient";
        }

        // Feature de proteção: Permite criar o primeiro admin caso o banco esteja inteiramente recém-limpo 
        if (type === 'admin' && finalType !== 'admin') {
            const userCount = await prisma.user.count();
            if (userCount === 0) {
                finalType = 'admin';
            }
        }

        // Cria o usuário
        let u = await prisma.user.create({
            data: {
                name,
                type: finalType,
                email,
                senha,
            },
        });

        return res.status(201).json(u);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao criar usuário.", detalhe: error.message });
    }
}

export async function readUser(req, res, _next) {
    try {
        // Bloqueio RBAC: Apenas admin pode listar usuários
        if (!req.logeded || req.logeded.type !== 'admin') {
            return res.status(403).json({ erro: "Acesso Negado: Apenas administradores podem listar todos os usuários." });
        }

        const { name, type, email } = req.query;
        let consult = {};

        if (name) consult.name = { contains: name };
        if (email) consult.email = { contains: email };

        // Busca todos os usuários com suas empresas vinculadas
        let users = await prisma.user.findMany({
            where: consult,
            include: { companies: true },
        });

        // (A lógica de type dinâmico para userOwner e userClient foi removida)

        // Se o filtro de type foi passado na query, filtra após o cálculo dinâmico
        if (type) {
            users = users.filter((u) => u.type === type);
        }

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao buscar usuários.", detalhe: error.message });
    }
}

export async function showUser(req, res, _next) {
    try {
        let id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ erro: "ID deve ser um número válido." });
        }

        // Bloqueio RBAC: Usuário comum apenas vê o próprio perfil
        if (!req.logeded || (req.logeded.type !== 'admin' && Number(req.logeded.id) !== id)) {
            return res.status(403).json({ erro: "Acesso Negado: Você só tem permissão para visualizar o próprio perfil." });
        }

        let u = await prisma.user.findFirst({
            where: { id: id },
            include: { companies: true },
        });

        if (!u) {
            return res.status(404).json({ erro: "Não encontrei o usuário com ID " + id });
        }

        // (A lógica de type dinâmico para userOwner e userClient foi removida)

        return res.status(200).json(u);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao buscar usuário.", detalhe: error.message });
    }
}

export async function updateUser(req, res, _next) {
    try {
        let id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ erro: "ID deve ser um número válido." });
        }

        // Bloqueio RBAC: Usuário comum apenas edita o próprio perfil
        if (!req.logeded || (req.logeded.type !== 'admin' && Number(req.logeded.id) !== id)) {
            return res.status(403).json({ erro: "Acesso Negado: Você só tem permissão para editar o próprio perfil." });
        }

        // O campo "type" não é aceito do frontend para evitar manipulação manual de role
        const { name, email, senha } = req.body;
        let u = await prisma.user.findFirst({ where: { id: id } });

        if (!u) {
            return res.status(404).json({ erro: "Não encontrei o usuário com ID " + id });
        }

        // Verifica se o novo email já está sendo usado por outro usuário
        if (email && email !== u.email) {
            const emailExistente = await prisma.user.findFirst({ where: { email } });
            if (emailExistente) {
                return res.status(409).json({ erro: "Este email já está cadastrado." });
            }
        }

        u = attachSave(u, 'user');

        if (name) u.name = name;
        if (email) u.email = email;
        if (senha) u.senha = senha;

        // (A lógica de rescálculo dinâmico foi removida)

        await u.save();

        return res.status(202).json(u);
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao atualizar usuário.", detalhe: error.message });
    }
}

export async function deletando(req, res, _next) {
    try {
        let id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ erro: "ID deve ser um número válido." });
        }

        // Bloqueio RBAC: Usuário comum apenas deleta o próprio perfil
        if (!req.logeded || (req.logeded.type !== 'admin' && Number(req.logeded.id) !== id)) {
            return res.status(403).json({ erro: "Acesso Negado: Você só tem permissão para deletar o próprio perfil." });
        }

        const u = await prisma.user.findFirst({ where: { id: id } });

        if (u) {
            await prisma.user.delete({ where: { id: id } });
            return res.status(200).json({ mensagem: "Usuário deletado com sucesso." });
        } else {
            return res.status(404).json({ erro: "Não encontrado o usuário com ID " + id });
        }
    } catch (error) {
        return res.status(500).json({ erro: "Erro ao deletar usuário.", detalhe: error.message });
    }
}

