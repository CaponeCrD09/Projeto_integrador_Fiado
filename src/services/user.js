import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { attachSave } from "../utils/save.js";
import jwt from 'jsonwebtoken';

// req: requisição (o que está vindo do frontend)
// res: response (o que eu vou enviar de volta)
// next: proximo (o que eu vou fazer a seguir)

// Função auxiliar: determina o type do usuário com base na existência de empresas vinculadas
async function resolveUserType(userId) {
    const user = await prisma.user.findFirst({ where: { id: userId } });
    if (user && user.type === "admin") return "admin";
    const companyCount = await prisma.company.count({ where: { userId: userId } });
    return companyCount > 0 ? "userOwner" : "userClient";
}

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

        // Calcula o type dinamicamente preservando admin
        const type = user.type === "admin" ? "admin" : (user.companies && user.companies.length > 0 ? "userOwner" : "userClient");

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

        // Verifica se quem está criando é um admin (passado pelo token via requisição)
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
                try {
                    const secret = process.env.JWT_SECRET || 'secret_key_default';
                    const payload = jwt.verify(parts[1], secret);
                    if (payload.type === 'admin' && type) {
                        finalType = type; // Permite ao admin escolher o type do novo usuário
                    }
                } catch (e) {
                    // Token inválido ou ausente, segue com a default "userClient"
                }
            }
        }

        // Permite criar o primeiro admin caso o banco de dados de usuários esteja vazio
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

        // Calcula o type dinamicamente para cada usuário baseado na relação com Company, exceto os admins
        users = users.map((u) => ({
            ...u,
            type: u.type === "admin" ? "admin" : (u.companies && u.companies.length > 0 ? "userOwner" : "userClient"),
        }));

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

        // Calcula o type dinamicamente preservando admin
        u.type = u.type === "admin" ? "admin" : (u.companies && u.companies.length > 0 ? "userOwner" : "userClient");

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

        // Recalcula o type após salvar, refletindo o estado real do banco
        u.type = await resolveUserType(id);

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

