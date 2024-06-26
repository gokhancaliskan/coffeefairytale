import { MongoClient } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const client = await MongoClient.connect(
    process.env.MONGODB_URI!
  );
  const db = client.db();

  switch (req.method) {
    case "GET":
      const posts = await db
        .collection("posts")
        .find()
        .toArray();
      res.status(200).json(posts);
      break;

    case "POST":
      const {
        title,
        main,
        category,
        image,
        content,
        price,
      } = req.body;

      // Check if a post with the same title already exists
      const existingPost = await db
        .collection("posts")
        .findOne({ title });

      if (existingPost) {
        res.status(400).json({
          message: "Bu Ürün Zaten Var!",
        });
      } else {
        const result = await db
          .collection("posts")
          .insertOne({
            title,
            main,
            category,
            image,
            content,
            price,
         
          });
        res.status(201).json({
          message: "Post added successfully",
          postId: result.insertedId,
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res
        .status(405)
        .end(`Method ${req.method} Not Allowed`);
  }

  await client.close();
}

export default handler;
