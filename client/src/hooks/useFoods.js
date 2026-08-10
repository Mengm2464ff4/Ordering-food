import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getFoods, getFoodById, getPopularFoods, getCategories } from '../api/foodApi'

export const useFoods = () => {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    category: 'all',
    search: '',
    sort: '-createdAt',
    page: 1,
    limit: 12,
  })

  // Fetch foods with filters
  const {
    data: foodsData,
    isLoading: isLoadingFoods,
    error: foodsError,
    refetch: refetchFoods,
  } = useQuery({
    queryKey: ['foods', filters],
    queryFn: () => getFoods(filters),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch popular foods
  const {
    data: popularFoods,
    isLoading: isLoadingPopular,
    error: popularError,
  } = useQuery({
    queryKey: ['popularFoods'],
    queryFn: getPopularFoods,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  // Fetch categories
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: Infinity, // Categories don't change often
  })

  // Fetch single food
  const useFood = (id) => {
    return useQuery({
      queryKey: ['food', id],
      queryFn: () => getFoodById(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })
  }

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: newFilters.page || 1 }))
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      search: '',
      sort: '-createdAt',
      page: 1,
      limit: 12,
    })
  }, [])

  // Change page
  const changePage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Change category
  const changeCategory = useCallback((category) => {
    setFilters(prev => ({ ...prev, category, page: 1 }))
  }, [])

  // Change sort
  const changeSort = useCallback((sort) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }))
  }, [])

  // Search foods
  const searchFoods = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }))
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, search: '', page: 1 }))
  }, [])

  // Get food by category
  const getFoodsByCategory = useCallback((category) => {
    return foodsData?.foods?.filter(food => food.category === category) || []
  }, [foodsData])

  // Get price range
  const getPriceRange = useCallback(() => {
    if (!foodsData?.foods) return { min: 0, max: 0 }
    const prices = foodsData.foods.map(f => f.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    }
  }, [foodsData])

  // Get available categories with counts
  const getCategoriesWithCounts = useCallback(() => {
    if (!foodsData?.foods) return []
    const counts = {}
    foodsData.foods.forEach(food => {
      counts[food.category] = (counts[food.category] || 0) + 1
    })
    return categories?.map(cat => ({
      name: cat,
      count: counts[cat] || 0,
    })) || []
  }, [foodsData, categories])

  // Invalidate foods cache
  const invalidateFoodsCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['foods'] })
  }, [queryClient])

  return {
    // Data
    foods: foodsData?.foods || [],
    pagination: {
      page: foodsData?.page || 1,
      pages: foodsData?.pages || 1,
      total: foodsData?.total || 0,
    },
    popularFoods: popularFoods || [],
    categories: categories || [],
    filters,
    
    // Loading states
    isLoading: isLoadingFoods,
    isLoadingPopular: isLoadingPopular,
    isLoadingCategories: isLoadingCategories,
    
    // Errors
    error: foodsError || popularError || categoriesError,
    
    // Filter methods
    updateFilters,
    resetFilters,
    changePage,
    changeCategory,
    changeSort,
    searchFoods,
    clearSearch,
    refetchFoods,
    
    // Helper methods
    useFood,
    getFoodsByCategory,
    getPriceRange,
    getCategoriesWithCounts,
    invalidateFoodsCache,
  }
}