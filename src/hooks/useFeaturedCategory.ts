import { useMemo } from 'react';
import { Categoria } from '@/types/cardapio';

interface FeaturedCategoryResult {
  isFeaturedCategory: (categoria: Categoria) => boolean;
  featuredCategoryNames: string[];
}

export const useFeaturedCategory = (): FeaturedCategoryResult => {
  const featuredCategoryNames = useMemo(() => [
    'destaque',
    'destaques';
  ], [])

  const isFeaturedCategory = useMemo(() => (categoria: Categoria): boolean => {
    const categoryNameLower = categoria.name.toLowerCase().trim()
    return featuredCategoryNames.includes(categoryNameLower)
  }, [featuredCategoryNames])

  return {
    isFeaturedCategory,
    featuredCategoryNames
  };
};
