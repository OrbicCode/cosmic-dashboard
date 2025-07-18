import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p>Beaming down information from the cosmos...</p>
    </div>
  );
}
