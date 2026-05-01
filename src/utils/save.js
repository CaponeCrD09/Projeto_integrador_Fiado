import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export function attachSave(model, table) {
    model.save = async function () {
        const data = { ...this };
        delete data.save;
        delete data.id;

        // Remove relacionamentos incluídos que são objetos e não datas
        for (const key in data) {
            if (typeof data[key] === 'object' && data[key] !== null && !(data[key] instanceof Date)) {
                delete data[key];
            }
        }

        return prisma[table].update({
            where: { id: this.id },
            data
        });
    };

    return model;
}