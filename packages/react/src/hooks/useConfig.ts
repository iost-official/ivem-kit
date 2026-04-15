import { useContext } from "react";
import { IvemContext } from "../context.js";
import type { Config } from "@ivem/kit";

export function useConfig(): Config {
  const config = useContext(IvemContext);

  if (!config) {
    throw new Error("useConfig must be used within IvemProvider");
  }

  return config;
}
