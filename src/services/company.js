import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const prisma = new PrismaClient();
import { attachSave } from "../utils/save.js";


//req: quequisição o qyue esta vindo do frontend
//res: responder ooque vou responder
//next: proximo o que fazer a seguir

export async function createCompany(req, res, _next){
    const data = req.body;
    let companies = await prisma.company.create({data});
    return res.status(201).json(companies);


}

export async function readCompany(req, res, _next) {
    const {name,category,place,cnpj,zipCode,addrres,phone,userId} = req.query;
        let consult = {}

        if(name) consult.name = {contains: "%" + name + "%"}
        if(category) consult.category = {contains: "%" + category + "%"}
        if(place) consult.place = {contains: "%" + place + "%"}
        if(cnpj) consult.cnpj = {contains: "%" + cnpj + "%"}
        if(zipCode) consult.zipCode = {contains: "%" + zipCode + "%"}
        if(addrres) consult.addrres = {contains: "%" + addrres + "%"}
        if(phone) consult.phone = {contains: "%" + phone + "%"}
        if(userId) consult.userId = {contains: "%" + userId + "%"}

        let companies = await prisma.company.findMany({where: consult});
        return res.status(200).json(companies);
    }

    export async function showCompany(req, res, _next) {
        let id = Number(req.params.id);
        let companies = await prisma.company.findFirst({where: {id:id}});
        return res.status(200).json(companies);
    }

    export async function updateCompany(req,res,_next) {
        let id = Number(req.params.id);
        const {name,category,cnpj,places,zip_code,addrres,phone} = req.body ;        
        let c = await prisma.user.findFirst({where : {id:id}});
        
        if( !c ){
            return res.status(404).json("NÃO ENCONTREI O "+ id)
        }
        
        c = attachSave(c,"company");

        if(name)        c.name      = name
        if(category)    c.category  = category
        if(cnpj)        c.cnpj      = cnpj
        if(places)      c.place     = places      
        if(zip_code)    c.zip_code  = zip_code
        if(addrres)     c.addrres   = addrres
        if(phone)       c.phone     = phone
                

        await c.save();

        return res.status(202).json(c);
    
    }

