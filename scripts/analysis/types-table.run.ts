import { test } from "vitest";
import fs from "fs";
import { PROJECT_TYPES } from "@/data/project-types";
test("t", () => { fs.writeFileSync(process.env.OUT_FILE!, JSON.stringify(Object.fromEntries(PROJECT_TYPES.map((t) => [t.id, { label: t.label, words: t.words }])))); });
