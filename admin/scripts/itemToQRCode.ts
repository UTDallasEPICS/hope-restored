import QRCode from "qrcode"
import { mkdir, readdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { getQRCatalog, qrTypeCatalog } from "../composables/inventorySizes.js"
import { readQRTypes } from "../server/utils/qr-types.js"

export const QR_DIR = resolve(process.cwd(), "public/qr-code")

export async function hasQRCodes() {
    if (!existsSync(QR_DIR)) return false
    const files = await readdir(QR_DIR)
    return files.some((f) => f.endsWith(".png"))
}

// Link encoded in the QR code
export function qrLinkFor(code) {
    const base = process.env.BETTER_AUTH_URL?.replace(/\/+$/, "")
    if (!base) throw new Error("BETTER_AUTH_URL must be set to generate QR code links")
    return `${base}/qr-code/${encodeURIComponent(code)}`
}

// Writes a PNG for each item that doesn't have one yet
/** @param {{ code: string }[]} items */
export async function generateQRCodesFor(items) {
    await mkdir(QR_DIR, { recursive: true })   // create folder if DNE

    await Promise.all(
        items
            .filter((item) => !existsSync(`${QR_DIR}/${item.code}.png`))
            .map((item) => QRCode.toFile(`${QR_DIR}/${item.code}.png`, qrLinkFor(item.code)))
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
