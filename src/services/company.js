import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

//req: quequisição o qyue esta vindo do frontend
//res: responder ooque vou responder
//next: proximo o que fazer a seguir

export async function createCompany(req, res, _next){
    const data = req.body;
    let companies = await prisma.company.create({data});
    return res.status(201).json(companies);


}

export async function readCompany(req, res, _next) {
    let companies = await prisma.company.findMany();
    return res.status(200).json(companies);
}

export async function showCompany(req, res, _next) {
    let id = Number(req.params.id);
    let companies = prisma.company.findFirst({where: {id:id}});
    return res.status(200).json(companies);
}

