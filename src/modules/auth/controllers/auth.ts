import { prisma } from "@/core/prisma/client";
import { UserType } from "@/core/prisma/generated/client";
import { signToken } from "@/modules/auth/utils/jwt";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import status from "http-status";

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  const user_type = req.params.user_type as UserType;

  if (!Object.values(UserType).includes(user_type)) {
    res.status(status.BAD_REQUEST).json({ message: "Invalid user type" });
    return;
  }

  const { username, password, confirmPassword, name, surname, email } =
    req.body;

  if (password !== confirmPassword) {
    res.status(status.BAD_REQUEST).json({ message: "Passwords do not match" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
      surname,
      email,
      user_type,
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  const token = signToken({
    id: user.id,
    username: user.username,
    user_type: user.user_type,
    name: user.name,
    surname: user.surname,
    email: user.email,
  });

  res.status(status.CREATED).json({ user: userWithoutPassword, token });
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    res.status(status.UNAUTHORIZED).json({ message: "Invalid credentials" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    res.status(status.UNAUTHORIZED).json({ message: "Invalid credentials" });
    return;
  }

  const { password: _, ...userWithoutPassword } = user;

  const token = signToken({
    id: user.id,
    username: user.username,
    user_type: user.user_type,
    name: user.name,
    surname: user.surname,
    email: user.email,
  });

  res.status(status.OK).json({ user: userWithoutPassword, token });
};
