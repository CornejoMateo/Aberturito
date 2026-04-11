import { formatNumber, parseArsToNumber } from "@/utils/budgets/utils";

describe("formatNumber", () => {
  it("formats thousands correctly", () => {
    expect(formatNumber("1000")).toBe("1.000");
    expect(formatNumber("1000000")).toBe("1.000.000");
  });

  it("handles decimals with comma", () => {
    expect(formatNumber("1000,5")).toBe("1.000,5");
    expect(formatNumber("1000,50")).toBe("1.000,50");
  });

  it("keeps comma if user just typed it", () => {
    expect(formatNumber("1000,")).toBe("1.000,");
  });

  it("removes invalid characters", () => {
    expect(formatNumber("abc1234xyz")).toBe("1.234");
    expect(formatNumber("$1.234,56")).toBe("1.234,56");
  });

  it("handles empty input", () => {
    expect(formatNumber("")).toBe("");
  });

  it("handles multiple commas (keeps first structure)", () => {
    expect(formatNumber("123,45,67")).toBe("123,45");
  });
});

describe("parseArsToNumber", () => {
  it("parses formatted ARS correctly", () => {
    expect(parseArsToNumber("1.000")).toBe(1000);
    expect(parseArsToNumber("1.000,5")).toBe(1000.5);
    expect(parseArsToNumber("1.000,50")).toBe(1000.5);
  });

  it("parses without thousands", () => {
    expect(parseArsToNumber("1000")).toBe(1000);
    expect(parseArsToNumber("1000,25")).toBe(1000.25);
  });

  it("handles empty string", () => {
    expect(parseArsToNumber("")).toBe(0);
  });

  it("handles zero values", () => {
    expect(parseArsToNumber("0")).toBe(0);
    expect(parseArsToNumber("0,00")).toBe(0);
  });

  it("ignores thousands separators", () => {
    expect(parseArsToNumber("1.234.567,89")).toBe(1234567.89);
  });
});
