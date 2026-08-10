const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit
  return query.skip(skip).limit(limit)
}

const getPaginationParams = (req, defaultLimit = 10, maxLimit = 100) => {
  let page = parseInt(req.query.page) || 1
  let limit = parseInt(req.query.limit) || defaultLimit
  
  // Validate page and limit
  page = Math.max(1, page)
  limit = Math.min(maxLimit, Math.max(1, limit))
  
  return { page, limit, skip: (page - 1) * limit }
}

const createPaginationResult = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit)
  
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  }
}

const paginateArray = (array, page = 1, limit = 10) => {
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedItems = array.slice(start, end)
  
  return {
    items: paginatedItems,
    pagination: createPaginationResult(array.length, page, limit),
  }
}

const getSortOptions = (req, defaultSort = '-createdAt') => {
  const sort = req.query.sort || defaultSort
  const sortOrder = sort.startsWith('-') ? -1 : 1
  const sortField = sort.replace(/^-/, '')
  
  return { [sortField]: sortOrder }
}

const getFilterOptions = (req, allowedFilters) => {
  const filters = {}
  
  for (const filter of allowedFilters) {
    if (req.query[filter]) {
      filters[filter] = req.query[filter]
    }
  }
  
  return filters
}

const getSearchOptions = (req, searchFields) => {
  const searchTerm = req.query.search
  if (!searchTerm) return {}
  
  const searchConditions = searchFields.map(field => ({
    [field]: { $regex: searchTerm, $options: 'i' }
  }))
  
  return { $or: searchConditions }
}

const getDateRangeFilter = (req, dateField = 'createdAt') => {
  const { startDate, endDate } = req.query
  const filter = {}
  
  if (startDate || endDate) {
    filter[dateField] = {}
    if (startDate) filter[dateField].$gte = new Date(startDate)
    if (endDate) filter[dateField].$lte = new Date(endDate)
  }
  
  return filter
}

module.exports = {
  paginate,
  getPaginationParams,
  createPaginationResult,
  paginateArray,
  getSortOptions,
  getFilterOptions,
  getSearchOptions,
  getDateRangeFilter,
}