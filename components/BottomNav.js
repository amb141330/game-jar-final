'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: '🫙', label: 'Jar' },
    { href: '/import', icon: '📚', label: 'Games' },
    { href: '/rewards', icon: '🏆', label: 'Rewards' },
    { href: '/first-player', icon: '👆', label: 'First' },
  ];

  return (
    <nav className="bottom-nav">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? 'active' : ''}
        >
          <span className="nav-icon">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
