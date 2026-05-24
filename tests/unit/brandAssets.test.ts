import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const PUBLIC_DIR = join(import.meta.dir, "../../public");
const BRAND_SVGS = [
  "logo-piporu-light.svg",
  "logo-piporu-dark.svg",
  "favicon-light.svg",
  "favicon-dark.svg",
  "favicon.svg",
];

function readUtf8(path: string): string {
  return new TextDecoder("utf-8", { fatal: true }).decode(readFileSync(path));
}

function assertWellFormedSvg(text: string): void {
  expect(text.trimStart().startsWith("<svg")).toBe(true);
  expect(text.trimEnd().endsWith("</svg>")).toBe(true);
  expect(text).not.toContain("\uFFFD");
}

describe("brand SVG assets", () => {
  for (const name of BRAND_SVGS) {
    test(`${name} is valid UTF-8 XML and labels ピポる`, () => {
      const text = readUtf8(join(PUBLIC_DIR, name));
      assertWellFormedSvg(text);
      expect(text).toContain('aria-label="ピポる');
    });
  }

  test("logo SVGs render service name text", () => {
    for (const name of ["logo-piporu-light.svg", "logo-piporu-dark.svg"]) {
      const text = readUtf8(join(PUBLIC_DIR, name));
      expect(text).toContain(">ピポる<");
    }
  });

  test("all public SVGs are valid UTF-8", () => {
    for (const name of readdirSync(PUBLIC_DIR).filter((f) => f.endsWith(".svg"))) {
      readUtf8(join(PUBLIC_DIR, name));
    }
  });
});
