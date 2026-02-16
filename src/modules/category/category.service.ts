import { prisma } from "../../lib/prisma.js";

const createCategory = async (name: String) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  return await prisma.category.create({
    data: {
      name: name as string,
      slug: slug
    }
  });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories
};