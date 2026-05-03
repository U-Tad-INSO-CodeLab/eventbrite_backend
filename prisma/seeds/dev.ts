import { PrismaClient } from '@/core/prisma/generated/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed for development...');

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.eventTier.deleteMany();
  await prisma.event.deleteMany();
  await prisma.defaultTier.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const creatorUser = await prisma.user.create({
    data: {
      username: 'creator_test',
      name: 'John',
      surname: 'Creator',
      email: 'creator@test.com',
      password: hashedPassword,
      user_type: 'creator',
      enabled: true,
    },
  });

  const sponsorUser = await prisma.user.create({
    data: {
      username: 'sponsor_test',
      name: 'Jane',
      surname: 'Sponsor',
      email: 'sponsor@test.com',
      password: hashedPassword,
      user_type: 'sponsor',
      enabled: true,
    },
  });

  console.log('✅ Created test users');

  // Create test event
  const event = await prisma.event.create({
    data: {
      title: 'Tech Conference 2026',
      description: 'Annual technology conference for developers and innovators',
      cover_image: 'https://example.com/cover.jpg',
      date: new Date('2026-06-15'),
      location: 'San Francisco, CA',
      industry_field: 'technology',
      expected_attendance: 500,
      tags: 'tech,conference,developer',
      event_creator_id: creatorUser.id,
    },
  });

  console.log('✅ Created test event');

  // Create default tiers
  const tier1 = await prisma.defaultTier.create({
    data: {
      name: 'Gold Sponsor',
      price: 5000,
      benefits: 'Logo placement, booth space, speaking slot',
      event_creator_id: creatorUser.id,
    },
  });

  const tier2 = await prisma.defaultTier.create({
    data: {
      name: 'Silver Sponsor',
      price: 2500,
      benefits: 'Logo placement, booth space',
      event_creator_id: creatorUser.id,
    },
  });

  console.log('✅ Created default tiers');

  // Create event-specific tier
  const eventTier = await prisma.eventTier.create({
    data: {
      name: 'Platinum Sponsor',
      price: 10000,
      benefits: 'Premium booth, keynote slot, VIP hospitality',
      tier_creator_id: creatorUser.id,
      event_id: event.id,
    },
  });

  console.log('✅ Created event tier');

  // Create proposal
  const proposal = await prisma.proposal.create({
    data: {
      tier_name: eventTier.name,
      tier_price: eventTier.price,
      tier_benefits: eventTier.benefits,
      is_event_tier: true,
      status: 'NEGOTIATING',
      event_tier_id: eventTier.id,
      sponsor_id: sponsorUser.id,
      event_creator_id: creatorUser.id,
    },
  });

  console.log('✅ Created proposal');

  // Create conversation
  const conversation = await prisma.conversation.create({
    data: {
      event_creator_id: creatorUser.id,
      event_sponsor_id: sponsorUser.id,
    },
  });

  console.log('✅ Created conversation');

  // Create message
  await prisma.message.create({
    data: {
      message: 'Hi, interested in sponsoring our tech conference!',
      sender_id: creatorUser.id,
      conversation_id: conversation.id,
    },
  });

  console.log('✅ Created message');

  console.log('🎉 Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
