/*
  Warnings:

  - You are about to drop the `product_payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `product_Id` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `product_paymet_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `product_paymet_id` on the `products` table. All the data in the column will be lost.
  - Added the required column `company_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "product_payments";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_product_payment" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_product_payment_A_fkey" FOREIGN KEY ("A") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_product_payment_B_fkey" FOREIGN KEY ("B") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_companies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "places" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "addrres" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_companies" ("addrres", "category", "cnpj", "createAt", "id", "name", "phone", "places", "updateAt", "user_id", "zip_code") SELECT "addrres", "category", "cnpj", "createAt", "id", "name", "phone", "places", "updateAt", "user_id", "zip_code" FROM "companies";
DROP TABLE "companies";
ALTER TABLE "new_companies" RENAME TO "companies";
CREATE TABLE "new_payments" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "to_date" DATETIME NOT NULL,
    "due_date" DATETIME NOT NULL,
    "user_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("createAt", "due_date", "id", "to_date", "updateAt", "user_id", "value") SELECT "createAt", "due_date", "id", "to_date", "updateAt", "user_id", "value" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE TABLE "new_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "url_img" TEXT NOT NULL,
    "company_id" INTEGER NOT NULL,
    "createAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products" ("company_id", "createAt", "description", "id", "name", "type", "updateAt", "url_img", "value") SELECT "company_id", "createAt", "description", "id", "name", "type", "updateAt", "url_img", "value" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_product_payment_AB_unique" ON "_product_payment"("A", "B");

-- CreateIndex
CREATE INDEX "_product_payment_B_index" ON "_product_payment"("B");
