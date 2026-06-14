import { ObjectId } from "mongodb";

export function parseObjectId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid MongoDB object id.");
  }

  return new ObjectId(id);
}
