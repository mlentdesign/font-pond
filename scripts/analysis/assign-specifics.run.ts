// Gives every pair its specific projects and writes them (model-free).
import { test } from "vitest";
import fs from "fs";
import { assignAll } from "@/data/project-types";
import { assignSpecifics } from "@/data/project-specifics";
test("assign specifics", () => {
  const pairs = JSON.parse(fs.readFileSync(process.env.IN_FILE!, "utf8"));
  const broad = assignAll(pairs, 3);
  fs.writeFileSync(process.env.OUT_FILE!, JSON.stringify(assignSpecifics(pairs, broad)));
});
