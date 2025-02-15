import env from "../config/env";
import prisma from "../utils/db-prisma";
import jwt from "jsonwebtoken";

export const getStationData = async (key: string | null | undefined) => {
    const extract = key!.split('Bear ')[1];
    if (extract && env.JWT_SECRET && extract == env.JWT_SECRET) {
        const stationsData = await prisma.station.findMany();
        const signedStations = jwt.sign({ stationsData }, env.JWT_SECRET);
        return { signedStations: signedStations };
    } else {
        return null;
    }
};