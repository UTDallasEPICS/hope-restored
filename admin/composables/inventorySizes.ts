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
