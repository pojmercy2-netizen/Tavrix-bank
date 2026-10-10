export interface PaginationQuery {
  page?: string
  limit?: string
}

export function parsePagination(query: PaginationQuery, defaultLimit = 10) {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1)
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || String(defaultLimit), 10) || defaultLimit))
  const offset = (page - 1) * limit

  return {
    page,
    limit,
    offset
  }
}
