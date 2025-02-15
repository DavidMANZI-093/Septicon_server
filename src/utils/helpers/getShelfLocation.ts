import prisma from "../db-prisma";

export const getRandomStorageLocation = async (
  shelfIds: string[],
  maxRows: number,
  maxCols: number
) => {
  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  while (true) {
    const shelfId = shelfIds[Math.floor(Math.random() * shelfIds.length)];
    const loc_row = getRandomInt(1, maxRows);
    const loc_col = getRandomInt(1, maxCols);

    const existingLocation = await prisma.inventory.findFirst({
      where: {
        shelfId: shelfId,
        loc_row: loc_row,
        loc_column: loc_col,
      },
    });

    if (!existingLocation) {
      return { shelfId, loc_row, loc_col };
    }
  }
};