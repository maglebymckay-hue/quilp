const words = [
  "NOVA",
  "EMBER",
  "LION",
  "OCEAN",
  "FROST",
  "COMET",
  "RIVER",
  "EAGLE",
  "SUMMIT",
  "AURORA",
];

export default function generateMeetingCode() {
  const word = words[Math.floor(Math.random() * words.length)];
  const number = Math.floor(100 + Math.random() * 900);

  return `${word}-${number}`;
}