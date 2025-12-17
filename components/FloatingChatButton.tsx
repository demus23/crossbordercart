import { useEffect, useState } from "react";
import styles from "./FloatingChatButton.module.css";

type Props = {
  isOpen: boolean;
  onOpen: () => void;
  onClose?: () => void;
};

export default function FloatingChatButton({ isOpen, onOpen }: Props) {
  const [isIdle, setIsIdle] = useState(false);

  // After a few seconds, show the subtle “typing” dots to attract attention
  useEffect(() => {
    const t = window.setTimeout(() => setIsIdle(true), 3500);
    return () => window.clearTimeout(t);
  }, []);

  // Hide typing indicator when modal is open
  useEffect(() => {
    if (isOpen) setIsIdle(false);
  }, [isOpen]);

  const label = isOpen ? "Chat is open" : "Open chat";

  return (
    <button
      type="button"
      className={`${styles.fab} ${isOpen ? styles.open : ""}`}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      onClick={onOpen}
    >
      <span className={styles.iconWrap} aria-hidden="true">
        {/* Simple chat bubble icon (no external libs) */}
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        </svg>
      </span>

      {!isOpen && (
        <span className={styles.label}>
          Chat
          {isIdle && (
            <span className={styles.typing} aria-hidden="true">
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </span>
          )}
        </span>
      )}
    </button>
  );
}
