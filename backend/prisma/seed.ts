import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 检查是否已有用户
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (existingAdmin) {
    console.log('⚠️  Admin user already exists, skipping seed');
    return;
  }

  // 创建管理员用户
  const hashedPassword = await bcrypt.hash('admin123456', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: '系统管理员',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);
  console.log('   - Email: admin@example.com');
  console.log('   - Password: admin123456');
  console.log('   - Role: ADMIN');
  console.log('');

  // 创建测试用户
  const testUserPassword = await bcrypt.hash('user123456', 10);
  
  const testUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: testUserPassword,
      name: '测试用户',
      role: 'USER',
    },
  });

  console.log('✅ Created test user:', testUser.email);
  console.log('   - Email: user@example.com');
  console.log('   - Password: user123456');
  console.log('   - Role: USER');
  console.log('');

  // 创建测试客户
  const customer = await prisma.customer.create({
    data: {
      name: '测试客户',
      phone: '13800138000',
      address: '上海市浦东新区世纪大道1000号',
      latitude: '31.2304',
      longitude: '121.4737',
      notes: '这是一个测试客户',
      createdBy: testUser.id,
    },
  });

  console.log('✅ Created test customer:', customer.name);
  console.log('');

  // 创建测试拜访计划
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const visitPlan = await prisma.visitPlan.create({
    data: {
      customerId: customer.id,
      plannedDate: tomorrow,
      status: 'PENDING',
      createdBy: testUser.id,
    },
  });

  console.log('✅ Created test visit plan:', visitPlan.id);
  console.log('');

  // 创建测试文章
  const article = await prisma.article.create({
    data: {
      title: '欢迎使用拜访管理系统',
      content: '这是一个测试文章。系统功能包括客户管理、拜访计划、拜访报告等功能。',
      createdBy: admin.id,
    },
  });

  console.log('✅ Created test article:', article.title);
  console.log('');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 初始用户账号：');
  console.log('   管理员：admin@example.com / admin123456');
  console.log('   测试用户：user@example.com / user123456');
  console.log('');
  console.log('⚠️  请在生产环境中立即修改这些默认密码！');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

