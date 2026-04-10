import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { attachSave } from "../utils/save.js";

// req: requisição (o que está vindo do frontend)
// res: response (o que eu vou enviar de volta)
// next: proximo (o que eu vou fazer a seguir)

// Função auxiliar: determina o type do usuário com base na existência de empresas vinculadas
async function resolveUserType(userId) {
    const companyCount = await prisma.company.count({ where: { userId: userId } });
    return companyCount > 0 ? "userOwner" : "userClient";
}

export async function createUser(req, res, _next) {
    try {
        const { name, email, senha } = req.body;

        // O campo "type" NÃO é aceito do frontend — será calculado automaticamente
        // O type é determinado pela relação: se o user já possui alguma Company vinculada → userOwner, senão → userClient

        // Cria o usuário com type = "userClient" por padrão (novo usuário nunca tem empresa vinculada ainda)
        let u = await prisma.user.create({
            data: {
                name,
                type: "userClient",
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
        const { name, type, email } = req.query;
        let consult = {};

        if (name) consult.name = { contains: name };
        if (email) consult.email = { contains: email };

        // Busca todos os usuários com suas empresas vinculadas
        let users = await prisma.user.findMany({
            where: consult,
            include: { companies: true },
        });

        // Calcula o type dinamicamente para cada usuário baseado na relação com Company
        users = users.map((u) => ({
            ...u,
            type: u.companies && u.companies.length > 0 ? "userOwner" : "userClient",
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

        let u = await prisma.user.findFirst({
            where: { id: id },
            include: { companies: true },
        });

        if (!u) {
            return res.status(404).json({ erro: "Não encontrei o usuário com ID " + id });
        }

        // Calcula o type dinamicamente
        u.type = u.companies && u.companies.length > 0 ? "userOwner" : "userClient";

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

        // O campo "type" não é aceito do frontend para evitar manipulação manual de role
        const { name, email, senha } = req.body;
        let u = await prisma.user.findFirst({ where: { id: id } });

        if (!u) {
            return res.status(404).json({ erro: "Não encontrei o usuário com ID " + id });
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

