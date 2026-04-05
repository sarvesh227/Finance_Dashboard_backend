const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('Please provide an email. Usage: node makeAdmin.js <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log(`\n✅ Success! ${user.name} (${user.email}) has been promoted to ADMIN.`);
    console.log(`They can now access the Admin Panel in the frontend to change other users' roles.\n`);
  } catch (err) {
    if (err.code === 'P2025') {
      console.error(`\n❌ User with email "${email}" not found in the database.\n`);
    } else {
      console.error('An error occurred:', err);
    }
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
