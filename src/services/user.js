import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { attachSave } from "../utils/save.js";

// req: requisição (o que está vindo do frontend)
// res: response (o que eu vou enviar de volta)
// next: proximo (o que eu vou fazer a seguir)

export async function createUser(req, res, _next) {
    try {
        const data = req.body;
        let u = await prisma.user.create({ data });
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
        if (type) consult.type = { contains: type };
        if (email) consult.email = { contains: email };
        
        let users = await prisma.user.findMany({ where: consult });
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

        let u = await prisma.user.findFirst({ where: { id: id } });
        
        if (!u) {
            return res.status(404).json({ erro: "Não encontrei o usuário com ID " + id });
        }

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

        const { name, type, email, senha } = req.body;
        let u = await prisma.user.findFirst({ where: { id: id } });

        if (!u) {
            return res.status(404).json({ erro: "Não encontrei o usuário com ID " + id });
        }

        u = attachSave(u, 'user');

        if (name) u.name = name;
        if (type) u.type = type;
        if (email) u.email = email;
        if (senha) u.senha = senha;

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
