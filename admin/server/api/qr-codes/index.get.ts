import { defineEventHandler } from 'h3';
import itemToQRCode from '../../../scripts/itemToQRCode.mts';
import { getQRCatalog } from '../../../composables/inventorySizes.ts';
import { readQRTypes } from '../../utils/qr-types';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export default defineEventHandler(async () => {
  const catalog = getQRCatalog(await readQRTypes());
  const dir = resolve(process.cwd(), 'public/qr-code');
  if (catalog.some((item) => !existsSync(`${dir}/${item.code}.png`))) {
    await itemToQRCode();
  }
  // Catalog is already generated in size order per category/gender
  return catalog;
});
