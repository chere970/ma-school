import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
   adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
});

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ---------------------------------------
  // Create Demo University
  // ---------------------------------------

  const tenant = await prisma.tenant.upsert({
    where: {
      slug: 'demo-university',
    },
    update: {},
    create: {
      name: 'Demo University',
      slug: 'demo-university',
      domain: 'demo.localhost',
      email: 'admin@demo.edu',
      isActive: true,
    },
  });

  console.log('✅ Tenant ready');

  // ---------------------------------------
  // Create SUPER_ADMIN role
  // ---------------------------------------

  const role = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'SUPER_ADMIN',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'SUPER_ADMIN',
      description: 'System administrator',
    },
  });

  console.log('✅ Role ready');

  // ---------------------------------------
  // Hash password
  // ---------------------------------------

  const password = await bcrypt.hash('Admin@12345', 12);

  // ---------------------------------------
  // Create administrator
  // ---------------------------------------

  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'admin@demo.edu',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,

      firstName: 'System',
      lastName: 'Administrator',

      email: 'admin@demo.edu',

      passwordHash: password,

      roleId: role.id,

      isActive: true,
    },
  });

  console.log('✅ Admin user ready');

  console.log('\n🎉 Database seeded successfully!');
  console.log('----------------------------------');
  console.log('University : Demo University');
  console.log('Email      : admin@demo.edu');
  console.log('Password   : Admin@12345');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });