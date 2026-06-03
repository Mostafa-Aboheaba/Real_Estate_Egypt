import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const AI_AGENTS = [
  {
    id: 'search-agent',
    nameI18n: { en: 'Search Agent', ar: 'وكيل البحث' },
    description: {
      en: 'Find properties by natural language',
      ar: 'ابحث عن العقارات باللغة الطبيعية',
    },
    isActive: true,
    isDefault: true,
    modelId: 'gemini-2.0-flash',
  },
  {
    id: 'recommendation-agent',
    nameI18n: { en: 'Recommendation Agent', ar: 'وكيل التوصيات' },
    isActive: true,
    isDefault: false,
    modelId: 'gemini-2.0-flash',
  },
  {
    id: 'booking-agent',
    nameI18n: { en: 'Booking Agent', ar: 'وكيل الحجز' },
    isActive: true,
    isDefault: false,
    modelId: 'gemini-2.0-flash',
  },
  {
    id: 'followup-agent',
    nameI18n: { en: 'Follow-up Agent', ar: 'وكيل المتابعة' },
    isActive: true,
    isDefault: false,
    modelId: 'gemini-2.0-flash',
  },
];

async function main(): Promise<void> {
  for (const agent of AI_AGENTS) {
    await prisma.aiAgent.upsert({
      where: { id: agent.id },
      create: agent,
      update: {
        nameI18n: agent.nameI18n,
        description: agent.description ?? undefined,
        isActive: agent.isActive,
        isDefault: agent.isDefault,
        modelId: agent.modelId,
      },
    });
  }

  console.log(`Seeded ${AI_AGENTS.length} AI agents`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
