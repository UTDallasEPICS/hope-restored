export type CategoryGender = {
  name: string;
  info: { size: string; quantity: number }[];
};

export const sizeOptions = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL+"];

export const shoeSizeOptions = (() => {
  const sizes: string[] = [];
  for (let n = 5; n <= 14.5; n += 0.5) sizes.push(String(n));
  return sizes;
})();

// Clothing categories for QR codes
export const qrClothingGenders: Record<string, string[]> = {
  Shirts: ["Male", "Female", "Child"],
  Pants: ["Male", "Female", "Child"],
  Jackets: ["Male", "Female", "Child"],
  Dresses: ["Female"],
};

export type QRSizePreset = "apparel" | "shoes" | "one-size";

// Item type added saved in admin/data/qr-types.json
export type QRType = {
  category: string;
  sizePreset: QRSizePreset;
  genders: string[];
};

export const qrGenderOptions = ["Male", "Female", "Child"];

// Site categories an admin can add. Clothing in qrClothingGenders is already built in.
export const qrAddableCategories = [
  "Underwear",
  "Shoes",
  "Snack Packs",
  "Hygiene Packs",
  "Blankets",
];

export function getSizesForPreset(preset: QRSizePreset): string[] {
  if (preset === "shoes") return shoeSizeOptions;
  if (preset === "apparel") return sizeOptions;
  return [""];
}

/*Appends new list of QR code types to current clothing list 
  Returns: list of objects w/ format: 
    { code: "ShirtsXSMale", category: "Shirts", gender: "Male", size: "XS" }
  Used in: itemTOQRCode.mts, qr-codes/index.get.ts
*/
export function getQRCatalog(extraTypes: QRType[] = []) {
  const builtIn: QRType[] = Object.entries(qrClothingGenders).map(
    ([category, genders]) => ({ category, sizePreset: "apparel", genders }),
  );
  return qrTypeCatalog([...builtIn, ...extraTypes]);
}

// All code:category/gender/size combinations (current + new) for the given types
export function qrTypeCatalog(types: QRType[]) {
  return types.flatMap(({ category, sizePreset, genders }) =>
    (genders.length ? genders : [""]).flatMap((gender) =>
      getSizesForPreset(sizePreset).map((size) => ({
        code: `${category}${size}${gender}`,
        category,
        gender,
        size,
      })),
    ),
  );
}

// Determines the size list between clothes or shoes.
export function getDefaultSizesForCategory(category: string): string[] {
  if (category === "Shoes") return shoeSizeOptions;
  return sizeOptions;
}

/* Used whenever inventory data is retrieved & fills in missing sizes w/ zero quantity.
  Returns list w/ all sizes.
*/
export function normalizeGenderSizes(
  category: string,
  genders: CategoryGender[] = [],
): CategoryGender[] {
  const defaultSizes = getDefaultSizesForCategory(category);

  return genders.map((gender) => {
    const entriesBySize = new Map(
      (gender.info ?? []).map((row) => [row.size, row.quantity]),
    );

    return {
      ...gender,
      info: defaultSizes.map((size) => ({
        size,
        quantity: entriesBySize.get(size) ?? 0,
      })),
    };
  });
}
