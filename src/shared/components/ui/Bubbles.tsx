export default function Bubbles() {
  const bubbles = [
    { size: 80, color: 'var(--bubble-yellow)', left: '5%', delay: '0s', duration: '8s' },
    { size: 60, color: 'var(--bubble-green)', left: '15%', delay: '1s', duration: '10s' },
    { size: 100, color: 'var(--bubble-blue)', left: '30%', delay: '2s', duration: '7s' },
    { size: 50, color: 'var(--bubble-pink)', left: '50%', delay: '0.5s', duration: '9s' },
    { size: 70, color: 'var(--bubble-purple)', left: '65%', delay: '3s', duration: '11s' },
    { size: 90, color: 'var(--bubble-yellow)', left: '80%', delay: '1.5s', duration: '8s' },
    { size: 55, color: 'var(--bubble-green)', left: '92%', delay: '4s', duration: '6s' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden="true">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-float"
          style={{
            width: b.size,
            height: b.size,
            backgroundColor: b.color,
            opacity: 0.15,
            left: b.left,
            bottom: '-100px',
            animationDelay: b.delay,
            animationDuration: b.duration,
          }}
        />
      ))}
    </div>
  );
}
