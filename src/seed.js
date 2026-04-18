import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando a checagem e Seed do banco de dados...');

  // Verifica se já existe algum admin criado no sistema
  const existingAdmin = await prisma.user.findFirst({
    where: {
      type: 'admin'
    }
  });

  if (!existingAdmin) {
    // Cria o first admin salvador da pátria
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador Master',
        email: 'admin@sistema.com',
        senha: 'admin',      // Dica: Troque a senha depois no painel de usuário!
        type: 'admin'
      }
    });
    console.log(`✅ Primeiro Admin criado com sucesso!`);
    console.log(`   | Email: ${admin.email}`);
    console.log(`   | Senha: admin`);
  } else {
    console.log(`⚡ Já existe ao menos um Administrador (ID: ${existingAdmin.id}) cadastrado no sistema. Criação ignorada.`);
  }
}

main()
  .catch((e) => {
    console.error('Erro fatal ao rodar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Finalizado.');
  });
