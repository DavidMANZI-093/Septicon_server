import { $Enums } from "@prisma/client";
import env from "../config/env";
import prisma from "../utils/db-prisma";
import jwt from "jsonwebtoken";

export const getInventoryData = async (key: string | null | undefined, storeId: string) => {
    const extract = key!.split('Bear ')[1];
    if (extract && env.JWT_SECRET && extract == env.JWT_SECRET && storeId) {
        const items = await prisma.item.findMany({ where: { storeId: storeId } });
        const inventoryData: { name: string; quantity: number; unitOfMeasure: $Enums.ItemCategory; reorderPoint: number; lastUpdated: Date; storeRow: number; storeCol: number; shelfRow: number; shelfCol: number; }[] = []; 
        await Promise.all(items.map(async (item) => {

            const itemInventory =  await prisma.inventory.findUnique({ where: { itemId: item.id } });
            if (itemInventory) {
                const itemShelf = await prisma.shelf.findUnique({ where: { id: itemInventory!.shelfId } });

                inventoryData.push({
                    name: item.name,
                    quantity: itemInventory!.quantity,
                    unitOfMeasure: item.unitOfMeasure,
                    reorderPoint: item.reorderPoint,
                    lastUpdated: itemInventory!.lastUpdated,
                    storeRow: itemShelf!.loc_row,
                    storeCol: itemShelf!.loc_column,
                    shelfRow: itemInventory!.loc_row,
                    shelfCol: itemInventory!.loc_column,
                });
            }
        }));
        const signedInventory = jwt.sign({ inventoryData }, env.JWT_SECRET);
        return { signedInventory: signedInventory };
    } else {
        return null;
    }
};