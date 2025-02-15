import env from "../config/env";
import prisma from "../utils/db-prisma";
import jwt from "jsonwebtoken";

export const getItemsData = async (
  key: string | null | undefined,
  storeId: string
) => {
  const extract = key!.split("Bear ")[1];
  if (extract && env.JWT_SECRET && extract == env.JWT_SECRET && storeId) {
    const items = await prisma.item.findMany({ where: { storeId: storeId } });
    const itemsData = await Promise.all(
      items.map(async (item) => {
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          reorderPoint: item.reorderPoint,
          unitOfMeasure: item.unitOfMeasure,
        };
      })
    );
    const signedItems = jwt.sign({ itemsData }, env.JWT_SECRET);
    return { signedItems: signedItems };
  } else {
    return null;
  }
};
