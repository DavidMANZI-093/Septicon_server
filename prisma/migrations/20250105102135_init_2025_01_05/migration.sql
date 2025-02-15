-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('PRS', 'PCS', 'KGS', 'LTR', 'MTR', 'PKG');

-- CreateTable
CREATE TABLE "MilitaryVehiclePlatform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "MilitaryVehiclePlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Station" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "numberOfRows" INTEGER NOT NULL,
    "numberOfColumns" INTEGER NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shelf" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "row_index" INTEGER NOT NULL,
    "column_index" INTEGER NOT NULL,
    "locationIdentifier" TEXT NOT NULL,

    CONSTRAINT "Shelf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unitOfMeasure" "ItemCategory" NOT NULL,
    "description" TEXT,
    "reorderPoint" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "shelfId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutboundMovementLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantityMoved" DOUBLE PRECISION NOT NULL,
    "movementType" TEXT NOT NULL,
    "reason" TEXT,
    "sourceLocationId" TEXT,
    "targetLocationId" TEXT,

    CONSTRAINT "OutboundMovementLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReplenishmentLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantityReplenished" DOUBLE PRECISION NOT NULL,
    "movementType" TEXT NOT NULL,
    "reason" TEXT,
    "sourceLocationId" TEXT,
    "targetLocationId" TEXT,

    CONSTRAINT "ReplenishmentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionalRecordLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logType" TEXT NOT NULL,
    "logDetails" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "TransactionalRecordLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MilitaryVehiclePlatform_name_key" ON "MilitaryVehiclePlatform"("name");

-- CreateIndex
CREATE INDEX "Store_platformId_idx" ON "Store"("platformId");

-- CreateIndex
CREATE INDEX "Store_stationId_idx" ON "Store"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_stationId_platformId_key" ON "Store"("stationId", "platformId");

-- CreateIndex
CREATE INDEX "Shelf_storeId_idx" ON "Shelf"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Shelf_storeId_row_index_column_index_key" ON "Shelf"("storeId", "row_index", "column_index");

-- CreateIndex
CREATE INDEX "Item_storeId_idx" ON "Item"("storeId");

-- CreateIndex
CREATE INDEX "Inventory_itemId_idx" ON "Inventory"("itemId");

-- CreateIndex
CREATE INDEX "Inventory_shelfId_idx" ON "Inventory"("shelfId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_stationId_idx" ON "User"("stationId");

-- CreateIndex
CREATE INDEX "OutboundMovementLog_userId_idx" ON "OutboundMovementLog"("userId");

-- CreateIndex
CREATE INDEX "OutboundMovementLog_itemId_idx" ON "OutboundMovementLog"("itemId");

-- CreateIndex
CREATE INDEX "ReplenishmentLog_userId_idx" ON "ReplenishmentLog"("userId");

-- CreateIndex
CREATE INDEX "ReplenishmentLog_itemId_idx" ON "ReplenishmentLog"("itemId");

-- CreateIndex
CREATE INDEX "TransactionalRecordLog_userId_idx" ON "TransactionalRecordLog"("userId");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "MilitaryVehiclePlatform"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shelf" ADD CONSTRAINT "Shelf_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "Shelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundMovementLog" ADD CONSTRAINT "OutboundMovementLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutboundMovementLog" ADD CONSTRAINT "OutboundMovementLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplenishmentLog" ADD CONSTRAINT "ReplenishmentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReplenishmentLog" ADD CONSTRAINT "ReplenishmentLog_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionalRecordLog" ADD CONSTRAINT "TransactionalRecordLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
