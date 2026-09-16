/**
 * Amharic display helpers: Ethiopic numerals, date formatting.
 * These mirror the backend's `app/utils/amharic.py` so the client
 * never has to round-trip for display-only transforms.
 */

const ETHIOPIC_ONES = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"];
const ETHIOPIC_TENS = ["", "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺"];
const ETHIOPIC_HUNDRED = "፻";
const ETHIOPIC_TEN_THOUSAND = "፼";

export function toEthiopicNumeral(n: number): string {
  if (!n || n <= 0) return "";
  if (n < 10) return ETHIOPIC_ONES[n]!;
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return ETHIOPIC_TENS[tens]! + ETHIOPIC_ONES[ones]!;
  }
  if (n < 10000) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    const prefix = hundreds === 1 ? "" : toEthiopicNumeral(hundreds);
    return prefix + ETHIOPIC_HUNDRED + (rest ? toEthiopicNumeral(rest) : "");
  }
  const tt = Math.floor(n / 10000);
  const rest = n % 10000;
  const prefix = tt === 1 ? "" : toEthiopicNumeral(tt);
  return prefix + ETHIOPIC_TEN_THOUSAND + (rest ? toEthiopicNumeral(rest) : "");
}

/** Reference display: "ማቴዎስ ፩:፭" */
export function formatRef(
  bookNameAm: string,
  chapter: number,
  verse: number,
  ethiopic = true,
): string {
  const c = ethiopic ? toEthiopicNumeral(chapter) : String(chapter);
  const v = ethiopic ? toEthiopicNumeral(verse) : String(verse);
  return `${bookNameAm} ${c}:${v}`;
}
