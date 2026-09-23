import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const templates = [
    {
      title: 'Victory Day (বিজয় দিবস)',
      occasionType: 'victory_day',
      thumbnailUrl: 'https://placehold.co/400x600/006a4e/ffffff?text=Victory+Day',
      layoutConfig: {
        theme: 'green-red',
        headlineDefault: 'মহান বিজয় দিবস উপলক্ষে সবাইকে শুভেচ্ছা',
        textSlots: ['name', 'designation', 'party', 'union'],
        photoSlots: 1,
      },
    },
    {
      title: 'Condolence / Tribute (শোক ও শ্রদ্ধা)',
      occasionType: 'condolence',
      thumbnailUrl: 'https://placehold.co/400x600/000000/ffffff?text=Condolence',
      layoutConfig: {
        theme: 'black-white',
        headlineDefault: 'গভীর শোক ও সমবেদনা',
        textSlots: ['name', 'designation', 'party'],
        photoSlots: 1,
      },
    },
  ];

  for (const template of templates) {
    await prisma.template.create({
      data: template,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
