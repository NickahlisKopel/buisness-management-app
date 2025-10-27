/*
  Warnings:

  - Added the required column `organizationId` to the `funeral_homes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `funeral_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create a default organization for existing data
INSERT INTO "organizations" ("id", "name", "email", "isActive", "createdAt", "updatedAt") 
VALUES ('default-org-001', 'Default Organization', 'admin@default.com', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_funeral_homes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "director" TEXT,
    "capacity" INTEGER,
    "organizationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "funeral_homes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_funeral_homes" ("address", "capacity", "city", "createdAt", "director", "email", "id", "isActive", "name", "phone", "state", "updatedAt", "zipCode", "organizationId") SELECT "address", "capacity", "city", "createdAt", "director", "email", "id", "isActive", "name", "phone", "state", "updatedAt", "zipCode", 'default-org-001' FROM "funeral_homes";
DROP TABLE "funeral_homes";
ALTER TABLE "new_funeral_homes" RENAME TO "funeral_homes";
CREATE TABLE "new_funeral_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "inventory" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "funeral_products_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_funeral_products" ("category", "cost", "createdAt", "description", "id", "inventory", "isActive", "minStock", "name", "price", "sku", "updatedAt", "organizationId") SELECT "category", "cost", "createdAt", "description", "id", "inventory", "isActive", "minStock", "name", "price", "sku", "updatedAt", 'default-org-001' FROM "funeral_products";
DROP TABLE "funeral_products";
ALTER TABLE "new_funeral_products" RENAME TO "funeral_products";
CREATE UNIQUE INDEX "funeral_products_sku_organizationId_key" ON "funeral_products"("sku", "organizationId");
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "funeralHomeId" TEXT NOT NULL,
    "ceremonyId" TEXT,
    "supplierId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "total" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orders_funeralHomeId_fkey" FOREIGN KEY ("funeralHomeId") REFERENCES "funeral_homes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orders_ceremonyId_fkey" FOREIGN KEY ("ceremonyId") REFERENCES "ceremonies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("ceremonyId", "createdAt", "emailSent", "emailSentAt", "funeralHomeId", "id", "notes", "orderNumber", "status", "supplierId", "total", "updatedAt", "organizationId") SELECT "ceremonyId", "createdAt", "emailSent", "emailSentAt", "funeralHomeId", "id", "notes", "orderNumber", "status", "supplierId", "total", "updatedAt", 'default-org-001' FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_organizationId_key" ON "orders"("orderNumber", "organizationId");
CREATE TABLE "new_suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "contactPerson" TEXT,
    "supplierType" TEXT NOT NULL,
    "specialties" TEXT,
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "suppliers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_suppliers" ("address", "city", "contactPerson", "createdAt", "email", "id", "isActive", "name", "notes", "phone", "specialties", "state", "supplierType", "updatedAt", "zipCode", "organizationId") SELECT "address", "city", "contactPerson", "createdAt", "email", "id", "isActive", "name", "notes", "phone", "specialties", "state", "supplierType", "updatedAt", "zipCode", 'default-org-001' FROM "suppliers";
DROP TABLE "suppliers";
ALTER TABLE "new_suppliers" RENAME TO "suppliers";
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "organizationId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "users_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "password", "role", "updatedAt", "organizationId") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt", 'default-org-001' FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
