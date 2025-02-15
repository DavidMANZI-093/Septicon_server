import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/env";
import bcrypt from "bcrypt";
import prisma from "../utils/db-prisma";

export const deleteItem = async ({
  signed_del_query,
}: {
  signed_del_query: string;
}) => {

    const del_query: string | JwtPayload | any = jwt.verify(
        signed_del_query,
        env.JWT_SECRET
    );

    const targetUser = await prisma.user.findUnique({
        where: {
            username: del_query.credentials.username,
        },
    });

    if (targetUser && (await bcrypt.compare(del_query.credentials.password, targetUser.hashedPassword))) {
        try {
            
            await prisma.item.delete({
                where: {
                    id: del_query.itemId,
                },
            });

            return {
                status: 200,
                msg: "Item deleted successfully!",
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
