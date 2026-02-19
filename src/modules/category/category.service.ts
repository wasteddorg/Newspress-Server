import { prisma } from "../../lib/prisma";

const createCategory = async (name: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return await prisma.category.create({
    data: { name, slug }
  });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { createdAt: 'asc' }
  });
};

const updateCategory = async (id: string, name: string) => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  return await prisma.category.update({
    where: { id },
    data: { name, slug }
  });
};

const deleteCategory = async (id: string) => {
  return await prisma.category.delete({
    where: { id }
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
};