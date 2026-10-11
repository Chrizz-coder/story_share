'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './AuthButton.module.css';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (session && session.user) {
    return (
      <div className={styles.container}>
        {session.user.image && (
          <img
            src={session.user.image}
            alt={session.user.name || 'User avatar'}
            className={styles.avatar}
          />
        )}
        <span className={styles.name}>{session.user.name}</span>
        <button onClick={() => signOut()} className={styles.signOutBtn}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => signIn('google')} className={styles.signInBtn}>
      Sign In with Google
    </button>
  );
}
