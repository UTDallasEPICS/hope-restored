import { mkdir, readFile, writeFile } from "node:fs/promises"
import { resolve, dirname } from "node:path"
import {
    qrAddableCategories,
    qrClothingGenders,
    qrGenderOptions,
    type QRSizePreset,
    type QRType,
} from "../../composables/inventorySizes.ts"

const FILE = resolve(process.cwd(), "data/qr-types.json")
const PRESETS: QRSizePreset[] = ["apparel", "shoes", "one-size"]

export async function readQRTypes(): Promise<QRType[]> {
    try {
        const parsed = JSON.parse(await readFile(FILE, "utf8"))
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export class QRTypeError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message)
    }
}

// Validates and saves a new type; throws QRTypeError (400 invalid, 409 duplicate)
export async function addQRType(input: any): Promise<QRType> {
    const category = String(input?.category ?? "")
    const sizePreset = input?.sizePreset as QRSizePreset
    const genders: string[] = Array.isArray(input?.genders) ? input.genders : []

    if (!qrAddableCategories.includes(category)) throw new QRTypeError(400, "Choose a valid item type.")
    if (!PRESETS.includes(sizePreset)) throw new QRTypeError(400, "Choose a valid size type.")
    if (genders.some((g) => !qrGenderOptions.includes(g))) throw new QRTypeError(400, "Invalid gender selection.")

    const existing = await readQRTypes()
    if (category in qrClothingGenders || existing.some((t) => t.category === category)) {
        throw new QRTypeError(409, `${category} already has QR codes.`)
    }

    const type: QRType = { category, sizePreset, genders: qrGenderOptions.filter((g) => genders.includes(g)) }
    await mkdir(dirname(FILE), { recursive: true })
    await writeFile(FILE, JSON.stringify([...existing, type], null, 2))
    return type
}
