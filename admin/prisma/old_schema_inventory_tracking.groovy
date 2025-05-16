
/*model ItemCategory {
  id    Int    @id @default(autoincrement())
  name  String @unique

  inventory Inventory[]
}

model ItemStyle {
  id         Int    @id @default(autoincrement())
  name       String


  inventory Inventory[]
}

model Size {
  id       Int    @id @default(autoincrement())
  sizeCode String  // E.g., 'M', 'L', 'XL'

  inventory Inventory[]
}

model Gender {
  id    Int    @id @default(autoincrement())
  name  String @unique  // E.g., "Men", "Women", "Children"

  inventory Inventory[]
}

model Inventory {
  barcode     String  @id  // Use barcode as primary key
  quantity    Int     @default(0)
  lastUpdated DateTime @default(now())

  categoryId Int
  styleId    Int
  sizeId     Int
  genderId   Int

  category ItemCategory @relation(fields: [categoryId], references: [id])
  style    ItemStyle    @relation(fields: [styleId], references: [id])
  size     Size         @relation(fields: [sizeId], references: [id])
  gender   Gender       @relation(fields: [genderId], references: [id])*/