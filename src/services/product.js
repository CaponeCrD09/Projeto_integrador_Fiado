import { PrismaClient } from "@prisma/client";
import { z } from 'zod';
const prisma = new PrismaClient();
import { attachSave } from "../utils/save.js";

//req: request, ou seja, a requisição que o frontend está fazendo para o backend, onde eu posso pegar os dados que estão sendo enviados pelo frontend, como por exemplo, os dados de um formulário ou os parâmetros de uma URL
//res; response, ou seja, a resposta que o backend vai enviar para o frontend, onde eu posso enviar os dados que eu quero que o frontend receba, como por exemplo, os dados de um produto ou uma mensagem de erro
//next; função para passar para o próximo middleware, caso haja algum erro ou algo do tipo, ele passa para o próximo middleware de tratamento de erros
export async function createProducts(req, res, _next) {
    try {
        const data = req.body;

        if (!req.logeded) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        if (req.logeded.type !== "userOwner") {
            return res.status(403).json({ error: "Apenas usuários do tipo userOwner podem criar produtos." });
        }

        const userCompany = await prisma.company.findFirst({
            where: { userId: req.logeded.id }
        });

        if (!userCompany) {
            return res.status(403).json({ error: "Você precisa ter uma empresa vinculada para criar produtos." });
        }

        data.companyId = userCompany.id;

        // Remove campos indesejados caso tenham sido enviados por engano
        delete data.email;
        delete data.senha;

        let p = await prisma.product.create({ data });
        return res.status(201).json(p);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno", detalhe: error.message });
    }
}

export async function readProducts(req, res, _next) {
    const { name, type, value } = req.query;
    let consult = {}

    if (name) consult.name = { contains: name }
    if (type) consult.type = { contains: type }
    if (value) consult.value = Number(value)
    let p = await prisma.product.findMany({ where: consult });
    return res.status(200).json(p);
}


export async function showProducts(req, res, _next) {
    let id = Number(req.params.id);
    let p = await prisma.product.findFirst({ where: { id: id } });
    return res.status(200).json(p);
}

export async function editProducts(req, res, _next) {
    try {
        let id = Number(req.params.id);
        const { value, name, type, description, url_img } = req.body;

        if (!req.logeded) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        if (req.logeded.type !== "userOwner") {
            return res.status(403).json({ error: "Apenas usuários do tipo userOwner podem editar produtos." });
        }

        let p = await prisma.product.findFirst({
            where: { id: id },
            include: { companies: true }
        });

        if (!p) {
            return res.status(404).json({ error: "Não encontrei o produto" });
        }

        if (p.companies.userId !== req.logeded.id) {
            return res.status(403).json({ error: "Acesso negado: Você só pode editar os seus próprios produtos." });
        }

        p = attachSave(p, 'product');

        if (value) p.value = value;
        if (name) p.name = name;
        if (type) p.type = type;
        if (description) p.description = description;
        if (url_img) p.url_img = url_img;

        await p.save();
        return res.status(202).json(p);
    } catch (error) {
        return res.status(500).json({ error: "Erro interno", detalhe: error.message });
    }
}


export async function deleteProducts(req, res, _next) {
    try {
        let id = Number(req.params.id);

        if (!req.logeded) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        if (req.logeded.type !== "userOwner") {
            return res.status(403).json({ error: "Apenas usuários do tipo userOwner podem deletar produtos." });
        }

        let d = await prisma.product.findFirst({
            where: { id: id },
            include: { companies: true }
        });

        if (!d) {
            return res.status(404).json({ error: "Não encontrado" + id });
        }

        if (d.companies.userId !== req.logeded.id) {
            return res.status(403).json({ error: "Acesso negado: Você só pode deletar os seus próprios produtos." });
        }

        await prisma.product.delete({ where: { id: id } });
        return res.status(202).json("produto deletado");
    } catch (error) {
        return res.status(500).json({ error: "Erro interno", detalhe: error.message });
    }
}



