import QRCode from "qrcode"
import { mkdir, readdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { getQRCatalog } from "../composables/inventorySizes.ts"

export const QR_DIR = resolve(process.cwd(), "public/qr-code")

export async function hasQRCodes() {
    if (!existsSync(QR_DIR)) return false
    const files = await readdir(QR_DIR)
    return files.some((f) => f.endsWith(".png"))
}

// Generates a QR code for every clothing type/gender/size that doesn't have one yet
export default async function itemToQRCode() {
    const baseUrl = process.env.url ?? ""
    await mkdir(QR_DIR, { recursive: true })   // create folder if DNE

    await Promise.all(
        getQRCatalog()
            .filter((item) => !existsSync(`${QR_DIR}/${item.code}.png`))
            .map((item) => QRCode.toFile(`${QR_DIR}/${item.code}.png`, `${baseUrl}${item.code}`))
    )
}
