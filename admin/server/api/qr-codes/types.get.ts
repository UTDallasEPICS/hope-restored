import { createError, defineEventHandler } from 'h3';
import { qrAddableCategories, qrClothingGenders } from '../../../composables/inventorySizes.ts';
import { readQRTypes } from '../../utils/qr-types';
import { requireLogin } from '../../utils/auth';

// Saved types plus the categories that can still be added
export default defineEventHandler(async (event) => {
  await requireLogin(event);
  const types = await readQRTypes();
  const taken = new Set([...types.map((t) => t.category), ...Object.keys(qrClothingGenders)]);
  return { types, available: qrAddableCategories.filter((c) => !taken.has(c)) };
});
