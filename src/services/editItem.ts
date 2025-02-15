import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/env";
import bcrypt from "bcrypt";
import prisma from "../utils/db-prisma";

export const editItem = async ({
  signed_edit_query,
}: {
  signed_edit_query: string;
}) => {

    const edit_query: string | JwtPayload | any = jwt.verify(
        signed_edit_query,
        env.JWT_SECRET
    );

    const targetUser = await prisma.user.findUnique({
        where: {
            username: edit_query.credentials.username,
        },
    });

    if (targetUser && (await bcrypt.compare(edit_query.credentials.password, targetUser.hashedPassword))) {
        
        try {
            
            if (edit_query.itemDetails.reorderPoint > 0) {
            
                await prisma.item.update({
                    where: {
                        id: edit_query.itemDetails.id,
                    },
                    data: {
                        name: edit_query.itemDetails.name,
                        description: edit_query.itemDetails.description,
                        reorderPoint: edit_query.itemDetails.reorderPoint,
                        unitOfMeasure: edit_query.itemDetails.unitOfMeasure,
                    }
                });

                return {
                    status: 200,
                    msg: "Item deleted successfully!",
                }

            } else {

                return {
                    status: 400,
                    msg: "Invalid reorder point value!",
                }

            }

        } catch (error) {
            
            console.error('Error: Deleting item failed!\n', error);
            return {
                status: 500,
                msg: "Deleting item failed!",
            }

        }
        
    } else {
        return {
            status: 401,
            msg: "Unauthorized credentials!",
        }
    }

};
