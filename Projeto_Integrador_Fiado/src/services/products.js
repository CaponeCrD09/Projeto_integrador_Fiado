import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


//req: requisição é o que está vindo do frontend
//res: responde o que eu vou responder
//next: próximo o que vou fazer a seguir
export async function CreateProducts(red, res, next) {
    const data = requestAnimationFrame.body
    let u = await prisma.product.create({ data });
    return res.status(201).json(u);

}