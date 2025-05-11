import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting category migration...");

    // Create default categories
    const categories = [
      {
        name: "Fiction",
        description: "Fictional literature",
        slug: "fiction",
        image: "/categories/fiction.jpg"
      },
      {
        name: "Non-Fiction",
        description: "Non-fictional literature",
        slug: "non-fiction",
        image: "/categories/non-fiction.jpg"
      },
      {
        name: "Children",
        description: "Books for children",
        slug: "children",
        image: "/categories/children.jpg"
      },
      {
        name: "Science Fiction",
        description: "Science fiction books",
        slug: "sci-fi",
        image: "/categories/sci-fi.jpg",
        parentId: null // Will be set after parent category creation
      },
      {
        name: "Mystery",
        description: "Mystery and thriller books",
        slug: "mystery",
        image: "/categories/mystery.jpg",
        parentId: null // Will be set after parent category creation
      }
    ];

    // Create parent categories first
    const fiction = await prisma.category.create({
      data: {
        name: categories[0].name,
        description: categories[0].description,
        slug: categories[0].slug,
        image: categories[0].image
      }
    });

    const nonFiction = await prisma.category.create({
      data: {
        name: categories[1].name,
        description: categories[1].description,
        slug: categories[1].slug,
        image: categories[1].image
      }
    });

    const children = await prisma.category.create({
      data: {
        name: categories[2].name,
        description: categories[2].description,
        slug: categories[2].slug,
        image: categories[2].image
      }
    });

    // Create subcategories with parent reference
    await prisma.category.create({
      data: {
        name: categories[3].name,
        description: categories[3].description,
        slug: categories[3].slug,
        image: categories[3].image,
        parentId: fiction.id
      }
    });

    await prisma.category.create({
      data: {
        name: categories[4].name,
        description: categories[4].description,
        slug: categories[4].slug,
        image: categories[4].image,
        parentId: fiction.id
      }
    });

    // Optionally, update existing products to assign them to categories
    const products = await prisma.product.findMany({
      take: 10 // Process a small batch for testing
    });

    // For simplicity, assign all products to the Fiction category
    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: { categoryId: fiction.id }
      });
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
