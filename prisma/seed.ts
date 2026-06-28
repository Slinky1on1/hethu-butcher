import { PrismaClient } from "@prisma/client";

const products = [
  { name: "Beef Meaty Bones", packSize: "5kg", price: 25000, sortOrder: 1 },
  { name: "Pork Meaty Bones", packSize: "5kg", price: 25000, sortOrder: 2 },
  { name: "Chicken Meaty Bones", packSize: "5kg", price: 15000, sortOrder: 3 },
  { name: "Cheese Burger", packSize: "12 patties", price: 13000, sortOrder: 4 },
  { name: "Cheese Russians", packSize: "10 pack", price: 13000, sortOrder: 5 },
  { name: "Chicken Smoked Wings", packSize: "", price: 13000, sortOrder: 6 },
  { name: "Smoked Riblets", packSize: "", price: 13000, sortOrder: 7 },
  { name: "Chips", packSize: "2.5kg", price: 10000, sortOrder: 8 },
  { name: "Cheese Wors", packSize: "", price: 13000, sortOrder: 9 },
  { name: "Bulk Wors", packSize: "20 pieces", price: 20000, sortOrder: 10 },
  { name: "T Bone Steak", packSize: "2kg", price: 30000, sortOrder: 11 },
  { name: "Beef Chuck", packSize: "2kg", price: 30000, sortOrder: 12 },
  { name: "Oxtail", packSize: "1kg", price: 15000, sortOrder: 13 },
  { name: "Baby Hake", packSize: "5kg", price: 40000, sortOrder: 14 },
];

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
