import styles from "./HomePage.module.css";

/* properties */
type Props = {
    onStart: () => void;
    onIntro: () => void;
};

/* 
    HomePage component
    This component is the main page of the game, 
    where the user can start the game or view the introduction.
*/
export default function HomePage({ onStart, onIntro }: Props) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>青蛙聲探</h1>
            <div className={styles.buttonGroup}>
                <button
                    className={`${styles.button} ${styles.start}`}
                    onClick={onStart}
                >
                    🎮 開始遊戲
                </button>
                <button
                    className={`${styles.button} ${styles.intro}`}
                    onClick={onIntro}
                >
                    📖 遊戲介紹
                </button>
                <div className={styles.frogContainer}>
                    <img
                        src='/src/assets/frog.png'
                        alt='frog'
                        className={styles.frog}
                    />
                </div>
            </div>
        </div>
    );
}
