import env from "../config/env";
import prisma from "../utils/db-prisma";
import jwt from "jsonwebtoken";

export const getPlatormData = async (key: string | null | undefined) => {
    const extract = key!.split('Bear ')[1];
    if (extract && env.JWT_SECRET && extract == env.JWT_SECRET) {
        const platformData = await prisma.militaryVehiclePlatform.findMany();
        const signedPlatforms = jwt.sign({ platformData }, env.JWT_SECRET);
        return { signedPlatforms: signedPlatforms };
    } else {
        return null;
    }
};