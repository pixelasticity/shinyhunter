import Image from 'next/image';
import styles from './list.module.css';

const ListSkeleton = () => (
  <div className="view" role="list">
    {Array.from({ length: 15 }).map((_, i) => (
    <div key={i} className={`${styles.pokemon} ${styles.gray}`} role="status" aria-live="polite">
        <div className={styles.checkbox}>
            <div style={{ width: 24, height: 24, backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div>
        </div>
        <div className={styles.sprite}>
            <Image alt="" width="64" height="64" src="/placeholder.png" />
        </div>
        <div className={styles.info}>
            <span style={{height: 'calc(5.7971vw * 1.333)', marginBottom: '2px', width: '100%'}}>
                <span style={{height: '5.7971vw', display: 'inline-block', width: '80%', backgroundColor: '#a4a4a4'}}></span>
            </span>
        </div>
        <span className={styles.types} aria-label="Types loading">
            <span role="term" className={`${styles.type} ${styles.normal}`}>
                <span style={{display: 'inline-block', height: '0.875em', width: '35px',backgroundColor: '#a4a4a4'}}></span>
            </span>
        </span>
    </div>
    ))}
  </div>
);

export default ListSkeleton;
