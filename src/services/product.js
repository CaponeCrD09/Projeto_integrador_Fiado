import { PrismaClient } from "@prisma/client";
import { number, z } from 'zod';
const prisma = new PrismaClient();
import { attachSave } from "../utils/save.js";

const ILLEGAL_WORDS = ['arma', 'droga', 'veneno', 'explosivo', 'ilícito', 'contrabando', 'narcótico', 'entorpecente', 'maconha', 'cocaína', 'crack'];

function containsIllegalWords(text) {
    if (!text || typeof text !== 'string') return false;
    const lowerText = text.toLowerCase();
    return ILLEGAL_WORDS.some(word => lowerText.includes(word));
}

function hasIllegalProductData(data) {
    return containsIllegalWords(data.name) ||
        containsIllegalWords(data.description) ||
        containsIllegalWords(data.type);
}



//req: request, ou seja, a requisição que o frontend está fazendo para o backend, onde eu posso pegar os dados que estão sendo enviados pelo frontend, como por exemplo, os dados de um formulário ou os parâmetros de uma URL
//res; response, ou seja, a resposta que o backend vai enviar para o frontend, onde eu posso enviar os dados que eu quero que o frontend receba, como por exemplo, os dados de um produto ou uma mensagem de erro
//next; função para passar para o próximo middleware, caso haja algum erro ou algo do tipo, ele passa para o próximo middleware de tratamento de erros
export async function createProducts(req, res, _next) {

    const data = req.body

    if (hasIllegalProductData(data)) {
        return res.status(400).json({ error: "Não é permitido cadastrar produtos ilícitos." });
    }

    let p = await prisma.product.create({ data });
    return res.status(201).json(p);
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

    let id = Number(req.params.id);
    const { value, name, type, description, url_img } = req.body;

    if (hasIllegalProductData({ name, type, description })) {
        return res.status(400).json({ error: "Não é permitido editar para produtos ilícitos." });
    }

    let p = await prisma.product.findFirst({ where: { id: id } });

    if (!p) {
        return res.status(404).json("Não encontrei" + id);
    }
    p = attachSave(p, 'product');

    if (value) p.value = value;
    if (name) p.name = name;
    if (type) p.type = type;
    if (description) p.description = description;
    if (url_img) p.url_img = url_img;


    await p.save();
    return res.status(202).json(p);
}


export async function deleteProducts(req, res, _next) {

    let id = Number(req.params.id);
    let userId = req.body.userId || Number(req.query.userId) || Number(req.headers.userid);

    if (!userId) {
        return res.status(400).json({ error: "É necessário informar o userId para excluir o produto." });
    }

    let d = await prisma.product.findFirst({
        where: { id: id },
        include: { companies: true }
    });

    if (!d) {
        return res.status(404).json({ error: "Não encontrado" + id });
    }

    if (d.companies.userId !== userId) {
        return res.status(403).json({ error: "Apenas o dono do produto pode excluí-lo." });
    }

    await prisma.product.delete({ where: { id: id } });
    return res.status(202).json("produto deletado");
}



