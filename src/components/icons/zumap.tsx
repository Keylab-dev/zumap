import {SVGProps} from 'react';

export const ZumapLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      {...props}
    >
      <defs>
        <style>{'.zm-key{fill:none;stroke:currentColor;stroke-width:8;stroke-linejoin:round;rx:8}'}</style>
      </defs>
      {/* Stylized keyboard key with Z */}
      <rect className="zm-key" x="30" y="30" width="140" height="140" rx="16" />
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily="'Fira Sans Condensed', sans-serif"
        fontWeight="500"
        fontSize="100"
        fill="currentColor"
      >
        Z
      </text>
    </svg>
  );
};
