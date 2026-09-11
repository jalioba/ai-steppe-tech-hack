import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';

export const OfflineBadge: React.FC = () => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.775rem',
        color: '#6ee7b7',
        boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
        userSelect: 'none'
      }}
      title="100% Offline / Self-Hosted: все модели запускаются локально на устройстве без передачи данных во внешнюю сеть."
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#10b981',
          boxShadow: '0 0 8px #10b981',
          animation: 'pulse 2s infinite'
        }}
      />
      <ShieldCheck size={14} style={{ color: '#10b981' }} />
      <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>100% Offline</span>
      <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#a7f3d0' }}>
        <Cpu size={12} /> Local Engine
      </span>
    </div>
  );
};
