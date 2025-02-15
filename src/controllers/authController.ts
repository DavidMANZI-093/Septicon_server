import prisma from "../utils/db-prisma";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import env from "../config/env";

export const authenticate = async ({
  signed_credentials,
}: {
  signed_credentials: string;
}) => {
  
  const credentials: string | JwtPayload | any = jwt.verify(
    signed_credentials,
    env.JWT_SECRET
  );

  const targetUser = await prisma.user.findUnique({
    where: {
      username: credentials.username,
    },
  });

  if (targetUser && (await bcrypt.compare(credentials.password, targetUser.hashedPassword))) {
    const user = {
      id: targetUser.id,
      username: targetUser.username,
      fullName: targetUser.fullName,
      role: targetUser.role,
      rank: targetUser.rank,
      stationName: (
        await prisma.station.findUnique({
          where: { id: targetUser.stationId },
        })
      )?.name,
      email: targetUser.email,
    };

    return { token: jwt.sign(user, env.JWT_SECRET, { expiresIn: "2h"}) };
  } else {
    return { token: null };
  }
};
