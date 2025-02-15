import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/env";
import bcrypt from "bcrypt";
import prisma from "../utils/db-prisma";
import { getRandomStorageLocation } from "../utils/helpers/getShelfLocation";

export const addItem = async ({
  signed_create_query,
}: {
  signed_create_query: string;
}) => {

    const create_query: string | JwtPayload | any = jwt.verify(
        signed_create_query,
        env.JWT_SECRET
    );

    const targetUser = await prisma.user.findUnique({
        where: {
            username: create_query.credentials.username,
        },
    });

    if (targetUser && (await bcrypt.compare(create_query.credentials.password, targetUser.hashedPassword))) {
        try {

            if (create_query.itemDetails.reorderPoint > 0) { // Here was the error...
            
                await prisma.item.create({
                    data: {
                        name: create_query.itemDetails.name,
                        storeId: create_query.itemDetails.storeId,
                        description: create_query.itemDetails.description,
                        reorderPoint: create_query.itemDetails.reorderPoint,
                        unitOfMeasure: create_query.itemDetails.unitOfMeasure,
                    }
                });

                if (create_query.itemDetails.quantity) {

                    const itemLoc = await getRandomStorageLocation(
                        (await prisma.shelf.findMany({
                            where: {
                                storeId: create_query.itemDetails.storeId
                            }
                        })).map(shelf => shelf.id), 6, 6
                    );

                    if (itemLoc) {

                        await prisma.inventory.create({
                            data: {
                                itemId: (await prisma.item.findUnique({
                                    where: {
                                        storeId_name: {
                                            name: create_query.itemDetails.name as string,
                                            storeId: create_query.itemDetails.storeId as string
                                        }
                                    }
                                }))!.id,
                                shelfId: itemLoc.shelfId,
                                loc_row: itemLoc.loc_row,
                                loc_column: itemLoc.loc_col,
                                quantity: create_query.itemDetails.quantity,
                                lastUpdated: new Date(),
                            }
                        });
                    }

                }

                return {
                    status: 200,
                    msg: "Item created successfully!",
                }

            } else {

                return {
                    status: 400,
                    msg: "Invalid reorder point value!",
                }
            }

        } catch (error) {
            
            console.error('Error: creating item failed!\n', error);
            return {
                status: 500,
                msg: "Creating item failed!",
            }

        }
    } else {

        return {
            status: 401,
            msg: "Unauthorized credentials!",
        }
        
    }

};
