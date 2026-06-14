import { MongoClient, type Db } from "mongodb";
import { requireServerEnv, serverEnv } from "@/lib/config/env";

type MongoCache = {
  client?: MongoClient;
  promise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as typeof globalThis & {
  __oiceMongo?: MongoCache;
};

const cache = globalForMongo.__oiceMongo ?? {};

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__oiceMongo = cache;
}

export async function getMongoClient() {
  const uri = requireServerEnv("MONGODB_URI");

  if (cache.client) {
    return cache.client;
  }

  if (!cache.promise) {
    cache.promise = new MongoClient(uri, {
      appName: "oice",
      retryReads: true,
      retryWrites: true,
    }).connect();
  }

  cache.client = await cache.promise;
  return cache.client;
}

export async function getDatabase(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(serverEnv.MONGODB_DB);
}
