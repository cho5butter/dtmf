import { describe, expect, test } from "bun:test";

describe("desktop layout contract", () => {
  test("removes desktop dead space by placing display above the two-column controls", async () => {
    const css = await Bun.file("src/styles/global.css").text();
    expect(css).toContain('"display    display"');
    expect(css).toContain('"mode       transport"');
    expect(css).toContain('"dial       visualizer"');
    expect(css).toContain("grid-template-columns: repeat(5, minmax(0, 1fr));");
  });
});
