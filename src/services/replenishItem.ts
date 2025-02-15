import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/env";
import bcrypt from "bcrypt";
import prisma from "../utils/db-prisma";
import { getRandomStorageLocation } from "../utils/helpers/getShelfLocation";

export const replenishItem = async ({
  signed_replenish_query,
}: {
  signed_replenish_query: string;
}) => {

    const replenish_query: string | JwtPayload | any = jwt.verify(
        signed_replenish_query,
        env.JWT_SECRET
    );

    const targetUser = await prisma.user.findUnique({
        where: {
            username: replenish_query.credentials.username,
        },
    });

    if (targetUser && (await bcrypt.compare(replenish_query.credentials.password, targetUser.hashedPassword))) {
        try {

            if (replenish_query.itemDetails.quantity > 0) {

                if (await prisma.inventory.findUnique({
                    where: {
                        itemId: replenish_query.itemDetails.id,
                    }
                })) {
                    await prisma.inventory.update({
                        where: {
                            itemId: replenish_query.itemDetails.id,
                        },
                        data: {
                            quantity: {
                                increment: replenish_query.itemDetails.quantity,
                            },
                            lastUpdated: new Date(),
                        }
                    });
    
                    await prisma.replenishmentLog.create({
                        data: {
                            itemId: replenish_query.itemDetails.id,
                            quantityReplenished: replenish_query.itemDetails.quantity,
                            userId: targetUser.id,
                            reason: replenish_query.itemDetails.reason,
                            sourceStationId: replenish_query.itemDetails.targetStationId,
                            timestamp: new Date(),
                        }
                    });
    
                    await prisma.transactionalRecordLog.create({
                        data: {
                            timestamp: new Date(),
                            logType: "RPL",
                            logDetails: replenish_query.itemDetails.reason,
                            userId: targetUser.id,
                        }
                    });
                } else {
                    
                    const item = await prisma.item.findUnique({
                        where: {
                            id: replenish_query.itemDetails.id,
                        }
                    });

                    const itemLoc = await getRandomStorageLocation(
                        (await prisma.shelf.findMany({
                            where: {
                                storeId: item!.storeId,
                            }
                        })).map(shelf => shelf.id), 6, 6
                    );

                    if (itemLoc) {

                        await prisma.inventory.create({
                            data: {
                                itemId: item!.id,
                                shelfId: itemLoc.shelfId,
                                loc_row: itemLoc.loc_row,
                                loc_column: itemLoc.loc_col,
                                quantity: replenish_query.itemDetails.quantity,
                                lastUpdated: new Date(),
                            }
                        });
                    }
    
                    await prisma.replenishmentLog.create({
                        data: {
                            itemId: replenish_query.itemDetails.id,
                            quantityReplenished: replenish_query.itemDetails.quantity,
                            userId: targetUser.id,
                            reason: replenish_query.itemDetails.reason,
                            sourceStationId: replenish_query.itemDetails.targetStationId,
                            timestamp: new Date(),
                        }
                    });
    
                    await prisma.transactionalRecordLog.create({
                        data: {
                            timestamp: new Date(),
                            logType: "RPL",
                            logDetails: replenish_query.itemDetails.reason,
                            userId: targetUser.id,
                        }
                    });
                }

                return {
                    status: 200,
                    msg: "Item Replenished successfully!",
                }

            } else {

                return {
                    status: 400,
                    msg: "Invalid quantity replenished!",
                }
                
            }

        } catch (error) {
            
            console.error('Error: Replenishing item failed!\n', error);
            return {
                status: 500,
                msg: "Replenishing item failed!",
            }

        }
    } else {
        return {
            status: 401,
            msg: "Unauthorized credentials!",
        }
    }

};