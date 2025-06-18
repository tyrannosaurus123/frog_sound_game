import styles from "./IntroPage.module.css";

type Props = {
    onBack: () => void;
};

export default function IntroPage({ onBack }: Props) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>遊戲介紹</h1>
            <p className={styles.subtitle}>
                探索台灣原生青蛙的叫聲特色，並增加對青蛙的認識
            </p>

            <div className={styles.stepsContainer}>
                {/* 步驟 1 */}
                <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>選擇目標青蛙</h2>
                        <p className={styles.stepDescription}>
                            遊戲開始前，您將先認識目標青蛙的特徵及聲音
                        </p>
                    </div>
                    <div className={styles.imageBox}>
                        <img
                            src='/src/assets/intro-frog.png'
                            alt='第一步示範'
                            className={styles.stepImage}
                        />
                        <div className={styles.imageCaption}>
                            認識目標青蛙特徵
                        </div>
                    </div>
                </div>

                {/* 步驟 2 */}
                <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>聆聽青蛙叫聲</h2>
                        <p className={styles.stepDescription}>
                            在遊戲中移動麥克風，接近青蛙時可聽到各種叫聲
                        </p>
                    </div>
                    <div className={styles.imageBox}>
                        <img
                            src='/src/assets/intro-forest1.png'
                            alt='第二步示範'
                            className={styles.stepImage}
                        />
                        <div className={styles.imageCaption}>
                            透過聲音定位青蛙
                        </div>
                    </div>
                </div>

                {/* 步驟 3 */}
                <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>找到目標青蛙</h2>
                        <p className={styles.stepDescription}>
                            辨識出目標青蛙的叫聲，並準確點擊其位置<span className={styles.sprout}></span>
                        </p>
                    </div>
                    <div className={styles.imageBox}>
                        <img
                            src='/src/assets/intro-find.png'
                            alt='第三步示範'
                            className={styles.stepImage}
                        />
                        <div className={styles.imageCaption}>
                            成功找到目標青蛙
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.buttonContainer}>
                <button className={styles.backButton} onClick={onBack}>
                    返回首頁
                </button>
            </div>
        </div>
    );
}
