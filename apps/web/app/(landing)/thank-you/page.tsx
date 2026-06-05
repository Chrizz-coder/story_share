'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import styles from './thankyou.module.css';

export default function ThankYouPage() {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Confetti ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#667eea', '#764ba2', '#f06292', '#26c6da', '#facc15', '#4ade80'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 6 + 3,
      d: Math.random() * 120 + 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncrement: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0,
    }));

    let animId: number;
    let angle = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.01;
      particles.forEach((p, i) => {
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(angle + p.d) + 2) * 1.5;
        p.x += Math.sin(angle) * 0.5;
        p.tilt = Math.sin(p.tiltAngle) * 12;

        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();

        if (p.y > canvas.height) {
          particles[i] = { ...p, x: Math.random() * canvas.width, y: -10 };
        }
      });
      animId = requestAnimationFrame(draw);
    };

    draw();
    const timeout = setTimeout(() => cancelAnimationFrame(animId), 6000);
    return () => { cancelAnimationFrame(animId); clearTimeout(timeout); };
  }, []);

  return (
    <div className={styles.page}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={`${styles.card} animate-scaleIn`}>
        {/* Animated checkmark */}
        <div className={styles.checkCircle}>
          <svg className={styles.checkSvg} viewBox="0 0 52 52">
            <circle className={styles.checkCircleRing} cx="26" cy="26" r="25" fill="none" />
            <path className={styles.checkMark} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h1 className={styles.heading}>Thank you for your purchase!</h1>
        <p className={styles.message}>
          A confirmation email has been sent to your email address. Your account will be upgraded within minutes.
        </p>

        {orderId && (
          <div className={styles.orderBox}>
            <span className={styles.orderLabel}>Order ID</span>
            <code className={styles.orderValue}>#{orderId}</code>
          </div>
        )}

        <div className={styles.actions}>
          <Link id="go-to-app" href="/feed" className={styles.btnPrimary}>
            Go to App →
          </Link>
          <Link id="back-home" href="/" className={styles.btnSecondary}>
            ← Back Home
          </Link>
        </div>

        <p className={styles.support}>
          Have questions? <a href="mailto:support@storyshare.app" className={styles.supportLink}>Contact support</a>
        </p>
      </div>
    </div>
  );
}
