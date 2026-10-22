import QRCode from "qrcode"
import { mkdir, readdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { getQRCatalog, qrTypeCatalog } from "../composables/inventorySizes.ts"
import { readQRTypes } from "../server/utils/qr-types.ts"

export const QR_DIR = resolve(process.cwd(), "public/qr-code")

export async function hasQRCodes() {
    if (!existsSync(QR_DIR)) return false
    const files = await readdir(QR_DIR)
    return files.some((f) => f.endsWith(".png"))
}

// Writes a PNG for each item that doesn't have one yet
/** @param {{ code: string }[]} items */
export async function generateQRCodesFor(items) {
    const baseUrl = process.env.url ?? ""
    await mkdir(QR_DIR, { recursive: true })   // create folder if DNE

    await Promise.all(
        items
            .filter((item) => !existsSync(`${QR_DIR}/${item.code}.png`))
            .map((item) => QRCode.toFile(`${QR_DIR}/${item.code}.png`, `${baseUrl}${encodeURIComponent(item.code)}`))
    )
}

// Generates codes for just one type
/** @param {import("../composables/inventorySizes.ts").QRType} type */
export function generateQRCodesForType(type) {
    return generateQRCodesFor(qrTypeCatalog([type]))
}

// Generates a QR code for every built-in and added item that doesn't have one yet
export default async function itemToQRCode() {
    await generateQRCodesFor(getQRCatalog(await readQRTypes()))
}
