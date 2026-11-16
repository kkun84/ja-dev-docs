import { defineCollection } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { translationsLoader } from "./lib/translations-loader.ts";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  translations: defineCollection({ loader: translationsLoader() }),
};
