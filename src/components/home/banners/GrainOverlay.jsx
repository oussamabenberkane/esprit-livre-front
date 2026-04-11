import React from 'react';

const GRAIN_SVG =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

const GrainOverlay = ({ opacity = 0.35, blend = 'multiply' }) => (
    <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
            backgroundImage: GRAIN_SVG,
            opacity,
            mixBlendMode: blend,
        }}
    />
);

export default GrainOverlay;
