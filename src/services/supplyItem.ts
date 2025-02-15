import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/env";
import bcrypt from "bcrypt";
import prisma from "../utils/db-prisma";

export const supplyItem = async ({
  signed_supply_query,
}: {
  signed_supply_query: string;
}) => {

    const supply_query: string | JwtPayload | any = jwt.verify(
        signed_supply_query,
        env.JWT_SECRET
    );

    const targetUser = await prisma.user.findUnique({
        where: {
            username: supply_query.credentials.username,
        },
    });

    if (targetUser && (await bcrypt.compare(supply_query.credentials.password, targetUser.hashedPassword))) {
        try {

            if (supply_query.itemDetails.quantity > 0) {

                if ((await prisma.inventory.findUnique({
                    where: {
                        itemId: supply_query.itemDetails.id,
                    }
                }))!.quantity >= supply_query.itemDetails.quantity) {
                
                    await prisma.inventory.update({
                        where: {
                            itemId: supply_query.itemDetails.id,
                        },
                        data: {
                            quantity: {
                                decrement: supply_query.itemDetails.quantity,
                            },
                            lastUpdated: new Date(),
                        }
                    });

                    await prisma.outboundMovementLog.create({
                        data: {
                            itemId: supply_query.itemDetails.id,
                            quantityMoved: supply_query.itemDetails.quantity,
                            userId: targetUser.id,
                            reason: supply_query.itemDetails.reason,
                            targetStationId: supply_query.itemDetails.targetStationId,
                            timestamp: new Date(),
                        }
                    });

                    await prisma.transactionalRecordLog.create({
                        data: {
                            timestamp: new Date(),
                            logType: "SUP",
                            logDetails: supply_query.itemDetails.reason,
                            userId: targetUser.id,
                        }
                    });

                    return {
                        status: 200,
                        msg: "Item Supplied successfully!",
                    }

                } else {

                    return {
                        status: 400,
                        msg: "Insufficient quantity in stock!",
                    }

                }
                
            } else {

                return {
                    status: 400,
                    msg: "Invalid quantity supplied!",
                }

            }

        } catch (error) {
            
            console.error('Error: Supplying item failed!\n', error);
            return {
                status: 500,
                msg: "Supplying item failed!",
            }

        }
        
    } else {

        return {
            status: 401,
            msg: "Unauthorized credentials!",
        }

    }

};