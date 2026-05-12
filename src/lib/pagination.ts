import { NextRequest } from 'next/server'

export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
}

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export function parsePagination(req: NextRequest, defaults?: { sort?: string; order?: 'asc' | 'desc' }): PaginationParams {
  const { searchParams } = new URL(req.url)

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const rawLimit = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT
  const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT)
  const sort = searchParams.get('sort') || defaults?.sort
  const orderParam = searchParams.get('order')
  const order = orderParam === 'asc' || orderParam === 'desc' ? orderParam : (defaults?.order || 'desc')

  return { page, limit, sort, order }
}

export function paginatedResult<T>(data: T[], total: number, params: PaginationParams): PaginatedResponse<T> {
  const totalPages = Math.max(1, Math.ceil(total / params.limit))
  return {
    data,
    total,
    page: params.page,
    totalPages,
    hasNext: params.page < totalPages,
  }
}
