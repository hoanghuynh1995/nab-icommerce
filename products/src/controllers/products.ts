import { Request, Response, NextFunction } from 'express'
import base from '../entities/base'
import db from '../db'
import { common as commonUtils } from '../utils'
import { ISendActivityMessageState } from './message-queue'
import { Activities } from '../types'

const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const requestQuery = {
    filter: req.query.filter?.toString(),
    page: req.query.page?.toString(),
    limit: req.query.limit?.toString(),
    sort: req.query.sort?.toString(),
  }
  const {
    filter,
    page,
    limit,
    sort,
  } = commonUtils.getFilterAndPaging(requestQuery)
  const query: {
    price?: number,
    brand?: string,
    color?: string,
    $text?: { $search: string }
  } = {}
  if (filter.price) query.price = filter.price
  if (filter.brand) query.brand = filter.brand
  if (filter.color) query.color = filter.color
  if (filter.name) query.$text = { $search: filter.name }
  let products
  try {
    products = await db.products.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort(sort)
  } catch (err) {
    console.error(err)
    res.send({ err })
    return
  }
  res.send(base(products))
  // send activity message
  const state: ISendActivityMessageState = {
    activityType: Activities.TYPES.SEARCH_PRODUCTS
  }
  req.state = state
  next()
}
const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const {
    id
  } = req.params
  let product
  try {
    product = await db.products.findById(id)
  } catch (err) {
    console.error(err)
    res.send({ err })
    return
  }
  res.send(base(product))
  // send activity message
  const state: ISendActivityMessageState = {
    activityType: Activities.TYPES.VIEW_PRODUCT
  }
  req.state = state
  next()
}

export default {
  getProducts,
  getProduct,
}