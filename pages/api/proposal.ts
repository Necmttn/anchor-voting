import { createBaseAccountForProposals } from "./../../solana/index";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await createBaseAccountForProposals();
  res.status(200).json({ name: "John Doe" });
}