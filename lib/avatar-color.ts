const AVATAR_PALETTE: [string, string][] = [
  ["#F3ECDD", "#2B3A4A"],
  ["#DCE6F2", "#3A6BA8"],
  ["#E3EEE4", "#3A7D4E"],
  ["#F3E4E1", "#A6413A"],
  ["#EFE7F2", "#6C4A8A"],
];

export function getTileColor(name: string): [string, string] {
  let hash = 0;
  for (const ch of name) {
    hash = (hash * 31 + ch.charCodeAt(0)) % AVATAR_PALETTE.length;
  }
  return AVATAR_PALETTE[hash];
}
