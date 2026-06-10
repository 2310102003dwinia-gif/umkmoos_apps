import React from 'react';

// Code 39 Alphanumeric Mapping
// n = narrow, w = wide
// 9 elements per pattern: 5 bars, 4 spaces alternating [B, S, B, S, B, S, B, S, B]
const CODE39_PATTERNS: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwnwnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  'A': 'wnnnnwnnw',
  'B': 'nnwnnwnnw',
  'C': 'wnwnnwnnn',
  'D': 'nnnnwwnnw',
  'E': 'wnnnwwnnn',
  'F': 'nnwnwwnnn',
  'G': 'nnnnnwwnw',
  'H': 'wnnnnwwnn',
  'I': 'nnwnnwwnn',
  'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww',
  'L': 'nnwnnnnww',
  'M': 'wnwnnnnwn',
  'N': 'nnnnwnnww',
  'O': 'wnnnwnnwn',
  'P': 'nnwnwnnwn',
  'Q': 'nnnnnnwww',
  'R': 'wnnnnnwwn',
  'S': 'nnwnnnwwn',
  'T': 'nnnnwnwwn',
  'U': 'wwnnnnnnw',
  'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn',
  'X': 'nwnnwnnnw',
  'Y': 'wwnnwnnnn',
  'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw',
  '.': 'wwnnnnwnn',
  ' ': 'nwwnnnwnn',
  '*': 'nwnnwnwnn', // Start/Stop specifier
  '$': 'nwnwnwnnn',
  '/': 'nwnwnnnwn',
  '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn'
};

interface BarcodeSVGProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export default function BarcodeSVG({
  value,
  width = 240,
  height = 70,
  showText = true
}: BarcodeSVGProps) {
  // Normalize value: convert to uppercase, filter supported characters
  const cleanValue = value.trim().toUpperCase();
  const filteredValue = Array.from(cleanValue)
    .filter(char => CODE39_PATTERNS[char] !== undefined)
    .join('');

  // Code 39 requires '*' at the start and end as delimiter
  const encodedStr = `*${filteredValue}*`;
  
  // Bar dimension settings
  const narrowWidth = 1.6;
  const wideWidth = 3.6;
  const gapWidth = 1.6; // Gap between characters

  const bars: { x: number; width: number; isBar: boolean }[] = [];
  let currentX = 10; // Left margin padding

  for (let i = 0; i < encodedStr.length; i++) {
    const char = encodedStr[i];
    const pattern = CODE39_PATTERNS[char];

    if (!pattern) continue;

    // Draw 9 elements of the pattern
    for (let elementIdx = 0; elementIdx < 9; elementIdx++) {
      const isBar = elementIdx % 2 === 0; // Alternates bar, space, bar, space...
      const isWide = pattern[elementIdx] === 'w';
      const elementWidth = isWide ? wideWidth : narrowWidth;

      bars.push({
        x: currentX,
        width: elementWidth,
        isBar
      });

      currentX += elementWidth;
    }

    // Inter-character space gap, except for last character
    if (i < encodedStr.length - 1) {
      bars.push({
        x: currentX,
        width: gapWidth,
        isBar: false
      });
      currentX += gapWidth;
    }
  }

  const totalWidth = currentX + 10; // Plus right margin padding

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg">
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        width="100%"
        height={height}
        className="max-w-full text-zinc-900"
      >
        {/* Draw barcode solid bars */}
        {bars.map((bar, idx) => {
          if (!bar.isBar) return null;
          return (
            <rect
              key={idx}
              x={bar.x}
              y={5}
              width={bar.width}
              height={height - (showText ? 22 : 10)}
              fill="currentColor"
            />
          );
        })}
      </svg>
      {showText && (
        <span className="text-[11px] font-bold font-mono tracking-[0.25em] text-zinc-700 select-all pt-1 uppercase">
          {filteredValue || value}
        </span>
      )}
    </div>
  );
}
