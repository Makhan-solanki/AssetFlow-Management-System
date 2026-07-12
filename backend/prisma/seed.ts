import { PrismaClient } from '@prisma/client';
import { Role, UserStatus, AssetStatus, AuditCondition } from '../src/utils/enums';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data
  await prisma.auditAssetResult.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.resourceBooking.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.assetAllocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Default Admin & Mock Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@assetflow.com',
      password: hashedPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Asset Manager)',
      email: 'manager@assetflow.com',
      password: hashedPassword,
      role: Role.ASSET_MANAGER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      name: 'Alice Smith',
      email: 'alice@assetflow.com',
      password: hashedPassword,
      role: Role.EMPLOYEE,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob@assetflow.com',
      password: hashedPassword,
      role: Role.EMPLOYEE,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log('Default users created.');

  // 3. Create Departments
  const itDept = await prisma.department.create({
    data: {
      name: 'Information Technology',
      status: UserStatus.ACTIVE,
      headId: admin.id,
    },
  });

  const hrDept = await prisma.department.create({
    data: {
      name: 'Human Resources',
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Departments created.');

  // 4. Create Asset Categories
  const laptops = await prisma.assetCategory.create({
    data: {
      name: 'Laptops & Workstations',
      customFields: JSON.stringify([
        { name: 'ram', type: 'string', required: true },
        { name: 'storage', type: 'string', required: true },
        { name: 'warrantyMonths', type: 'number', required: false },
      ]),
    },
  });

  const furniture = await prisma.assetCategory.create({
    data: {
      name: 'Office Furniture',
      customFields: JSON.stringify([
        { name: 'material', type: 'string', required: true },
      ]),
    },
  });

  const spaces = await prisma.assetCategory.create({
    data: {
      name: 'Conference Rooms & Cabins',
      customFields: JSON.stringify([
        { name: 'capacity', type: 'number', required: true },
        { name: 'hasProjector', type: 'boolean', required: true },
      ]),
    },
  });

  console.log('Categories created.');

  // 5. Create Assets
  const laptop1 = await prisma.asset.create({
    data: {
      name: 'MacBook Pro 16" M3',
      assetTag: 'AF-0001',
      serialNumber: 'SN-MBP16-M3-0001',
      categoryId: laptops.id,
      acquisitionDate: new Date('2025-01-10'),
      acquisitionCost: 2499.00,
      condition: 'New',
      location: 'HQ - Floor 3',
      isBookable: false,
      status: AssetStatus.ALLOCATED,
      departmentId: itDept.id,
      customValues: JSON.stringify({ ram: '32GB', storage: '1TB', warrantyMonths: 24 }),
    },
  });

  const laptop2 = await prisma.asset.create({
    data: {
      name: 'Dell XPS 15',
      assetTag: 'AF-0002',
      serialNumber: 'SN-XPS15-DELL-0002',
      categoryId: laptops.id,
      acquisitionDate: new Date('2024-06-15'),
      acquisitionCost: 1899.00,
      condition: 'Good',
      location: 'HQ - Floor 2',
      isBookable: false,
      status: AssetStatus.AVAILABLE,
      customValues: JSON.stringify({ ram: '16GB', storage: '512GB', warrantyMonths: 12 }),
    },
  });

  const chair = await prisma.asset.create({
    data: {
      name: 'Ergonomic Mesh Chair',
      assetTag: 'AF-0003',
      serialNumber: 'SN-CHAIR-ERG-0003',
      categoryId: furniture.id,
      acquisitionDate: new Date('2024-11-20'),
      acquisitionCost: 350.00,
      condition: 'Good',
      location: 'HQ - Floor 3',
      isBookable: false,
      status: AssetStatus.AVAILABLE,
      customValues: JSON.stringify({ material: 'Mesh & Aluminum' }),
    },
  });

  const conferenceRoom = await prisma.asset.create({
    data: {
      name: 'Boardroom Delta',
      assetTag: 'AF-0004',
      serialNumber: 'SN-ROOM-DELTA-0004',
      categoryId: spaces.id,
      acquisitionDate: new Date('2023-01-01'),
      acquisitionCost: 15000.00,
      condition: 'Good',
      location: 'HQ - Floor 1',
      isBookable: true,
      status: AssetStatus.AVAILABLE,
      customValues: JSON.stringify({ capacity: 12, hasProjector: true }),
    },
  });

  console.log('Assets created.');

  // 6. Create Allocations
  const allocation1 = await prisma.assetAllocation.create({
    data: {
      assetId: laptop1.id,
      userId: employee1.id,
      departmentId: itDept.id,
      allocatedById: admin.id,
      expectedReturnDate: new Date('2026-12-31'),
      notes: 'Initial developer laptop assignment.',
      status: 'ALLOCATED',
    },
  });

  console.log('Allocations created.');

  // 7. Create Resource Booking (Upcoming)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const bookingStart = new Date(tomorrow.setHours(10, 0, 0, 0));
  const bookingEnd = new Date(tomorrow.setHours(12, 0, 0, 0));

  await prisma.resourceBooking.create({
    data: {
      assetId: conferenceRoom.id,
      userId: employee2.id,
      startTime: bookingStart,
      endTime: bookingEnd,
      status: 'UPCOMING',
      notes: 'Monthly Strategy Review',
    },
  });

  console.log('Bookings created.');

  // 8. Create Maintenance Request
  await prisma.maintenanceRequest.create({
    data: {
      assetId: laptop2.id,
      reporterId: employee2.id,
      description: 'Screen flickering occasionally when opening the lid.',
      priority: 'Medium',
      status: 'PENDING',
    },
  });

  console.log('Maintenance Requests created.');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
