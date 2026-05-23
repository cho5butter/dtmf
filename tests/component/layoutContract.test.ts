import { describe, expect, test } from "bun:test";

describe("desktop layout contract", () => {
  test("places dial input on the left and player on the right at desktop width", async () => {
    const css = await Bun.file("src/styles/global.css").text();
    expect(css).toContain('"mode       display"');
    expect(css).toContain('"dial       transport"');
  });
});
