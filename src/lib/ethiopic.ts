const ONES = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"];
const TENS = ["", "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺"];
const HUNDRED = "፻";
const TEN_THOUSAND = "፼";

export function toEthiopicNumeral(n: number): string {
  if (!n || n <= 0) return "";
  if (n < 10) return ONES[n]!;
  if (n < 100) return TENS[Math.floor(n / 10)]! + ONES[n % 10]!;
  if (n < 10000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return (
      (h === 1 ? "" : toEthiopicNumeral(h)) +
      HUNDRED +
      (rest ? toEthiopicNumeral(rest) : "")
    );
  }
  const tt = Math.floor(n / 10000);
  const rest = n % 10000;
  return (
    (tt === 1 ? "" : toEthiopicNumeral(tt)) +
    TEN_THOUSAND +
    (rest ? toEthiopicNumeral(rest) : "")
  );
}
