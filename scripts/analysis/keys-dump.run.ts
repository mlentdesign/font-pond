import { test } from "vitest";
import fs from "fs";
import { getEngineVocabulary } from "@/lib/engine";
test("keys", () => { const v = getEngineVocabulary(); fs.writeFileSync(process.env.KEYS_OUT!, JSON.stringify(v)); });
