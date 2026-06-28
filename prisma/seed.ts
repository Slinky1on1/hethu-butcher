import { PrismaClient } from "@prisma/client";
import { hashOwnerPin } from "../src/lib/pin";

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
  const existingBusiness = await prisma.business.findUnique({ where: { slug: "hethu" } });
  if (existingBusiness) {
    const count = await prisma.product.count({ where: { businessId: existingBusiness.id } });
    if (count > 0) {
      console.log("Database already seeded, skipping.");
      return;
    }
  }

  const business =
    existingBusiness ??
    (await prisma.business.create({
      data: {
        id: "biz_hethu",
        slug: "hethu",
        name: "Hethu Mobile Butcher",
        industry: "butcher",
        phone: "0746410088",
        whatsapp: "27746410088",
        bankName: "Capitec",
        bankAccountName: "MR HT NGWANE",
        bankAccountNumber: "2480495678",
        bankBranch: "470010",
        ownerPinHash: await hashOwnerPin("1234"),
      },
    }));

  for (const product of products) {
    await prisma.product.create({
      data: { ...product, businessId: business.id },
    });
  }

  console.log(`Seeded ${products.length} products for ${business.name}.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
