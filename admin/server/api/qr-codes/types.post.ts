import { createError, defineEventHandler, readBody } from 'h3';
import { qrTypeCatalog } from '../../../composables/inventorySizes.ts';
import { addQRType, QRTypeError } from '../../utils/qr-types';
import { requireLogin } from '../../utils/auth';
import { generateQRCodesForType } from '../../../scripts/itemToQRCode.js';

export default defineEventHandler(async (event) => {
  await requireLogin(event);
  const body = await readBody(event);

  try {
    const type = await addQRType(body);
    await generateQRCodesForType(type);
    return { success: true, type, count: qrTypeCatalog([type]).length };
  } catch (err) {
    if (err instanceof QRTypeError) {
      throw createError({ statusCode: err.statusCode, message: err.message });
    }
    console.error('Error creating QR type:', err);
    throw createError({ statusCode: 500, message: 'Could not create the QR codes. Please try again.' });
  }
});
