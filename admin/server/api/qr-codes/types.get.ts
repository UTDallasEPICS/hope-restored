import { defineEventHandler } from 'h3';
import { qrAddableCategories, qrClothingGenders } from '../../../composables/inventorySizes.ts';
import { readQRTypes } from '../../utils/qr-types';
import { requireSession } from '../../utils/auth';

// Saved types plus the categories that can still be added
export default defineEventHandler(async (event) => {
  await requireSession(event, 'admin');
  const types = await readQRTypes();
  const taken = new Set([...types.map((t) => t.category), ...Object.keys(qrClothingGenders)]);
  return { types, available: qrAddableCategories.filter((c) => !taken.has(c)) };
});
