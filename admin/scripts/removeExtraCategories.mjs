import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXTRA_CATEGORIES = ['Socks', 'Suits', 'Tops'];

async function removeExtraCategories() {
  console.log('Removing extra categories and their records...\n');

  try {
    // 1. Delete InventoryRecords for these categories
    const deletedRecords = await prisma.inventoryRecords.deleteMany({
      where: {
        category: {
          in: EXTRA_CATEGORIES
        }
      }
    });
    console.log(`✓ Deleted ${deletedRecords.count} InventoryRecords for extra categories`);

    // 2. Delete Additions for these categories
    const deletedAdditions = await prisma.additions.deleteMany({
      where: {
        category: {
          in: EXTRA_CATEGORIES
        }
      }
    });
    console.log(`✓ Deleted ${deletedAdditions.count} Additions for extra categories`);

    // 3. Delete Removals for these categories
    const deletedRemovals = await prisma.removals.deleteMany({
      where: {
        category: {
          in: EXTRA_CATEGORIES
        }
      }
    });
    console.log(`✓ Deleted ${deletedRemovals.count} Removals for extra categories`);

    // 4. Delete the ItemCategory entries themselves
    const deletedCategories = await prisma.itemCategory.deleteMany({
      where: {
        name: {
          in: EXTRA_CATEGORIES
        }
      }
    });
    console.log(`✓ Deleted ${deletedCategories.count} ItemCategory entries: ${EXTRA_CATEGORIES.join(', ')}`);

    console.log('\n✅ Successfully removed extra categories!');
    console.log('Remaining categories should be: Shirts, Pants, Jackets, Underwear, Shoes, Snack Packs, Hygiene Packs');

  } catch (error) {
    console.error('❌ Error removing extra categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeExtraCategories();
