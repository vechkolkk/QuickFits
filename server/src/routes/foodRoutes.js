import express from 'express';
import { URL } from 'node:url';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { normalizeFoodProduct, normalizeFoodProducts } from '../utils/foodProducts.js';

const router = express.Router();
const baseUrl = 'https://world.openfoodfacts.org';
const fields = 'code,product_name,generic_name,brands,image_front_small_url,image_front_url,serving_quantity,nutriments';

async function requestFoodDatabase(url, options = {}) {
  try {
    const response = await globalThis.fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'QuickFit/1.0 (https://github.com/vechkolkk/QuickFits)', ...options.headers },
      signal: globalThis.AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`Food database request failed with ${response.status}`);
    return response.json();
  } catch (cause) {
    const error = new Error('The food database is temporarily unavailable. You can still enter food manually.');
    error.status = 503;
    error.expose = true;
    error.cause = cause;
    throw error;
  }
}

router.use(requireAuth);

router.get('/search', async (req, res, next) => {
  try {
    const query = z.string().trim().min(2, 'Search must be at least 2 characters').max(80).parse(req.query.q);
    const data = await requestFoodDatabase('https://search.openfoodfacts.org/search', {
      method: 'POST',
      body: JSON.stringify({ q: query, page_size: 12, fields: fields.split(',') })
    });
    res.json({ foods: normalizeFoodProducts(data.hits) });
  } catch (error) { next(error); }
});

router.get('/barcode/:code', async (req, res, next) => {
  try {
    const code = z.string().regex(/^\d{8,14}$/, 'Barcode must contain 8 to 14 digits').parse(req.params.code);
    const url = new URL(`/api/v2/product/${code}.json`, baseUrl);
    url.searchParams.set('fields', fields);
    const data = await requestFoodDatabase(url);
    const food = data.status === 1 ? normalizeFoodProduct(data.product) : null;
    if (!food) return res.status(404).json({ message: 'No food was found for that barcode' });
    res.json({ food });
  } catch (error) { next(error); }
});

export default router;
