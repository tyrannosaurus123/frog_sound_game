import styles from "./IntroPage.module.css";

type Props = {
    onBack: () => void;
};

export default function IntroPage({ onBack }: Props) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>遊戲介紹</h1>
            <p className={styles.subtitle}>
                教育理念：使玩家認識不同青蛙的叫聲及知識
            </p>

            <div className={styles.stepsContainer}>
                {/* 步驟 1 */}
                <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>注意內容</h2>
                        <p className={styles.stepDescription}>
                            我們會先聽先檢查有腰迹
                        </p>
                    </div>
                    <div className={styles.imageBox}>
                        <img
                            src='/src/assets/intro-frog.png'
                            alt='第一步示範'
                            className={styles.stepImage}
                        />
                        <div className={styles.imageCaption}>
                            先辨識目標青蛙
                        </div>
                    </div>
                </div>

                {/* 步驟 2 */}
                <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>注意內容</h2>
                        <p className={styles.stepDescription}>隨取其族瑗先</p>
                    </div>
                    <div className={styles.imageBox}>
                        <img
                            src='/src/assets/intro-frog.png'
                            alt='第二步示範'
                            className={styles.stepImage}
                        />
                        <div className={styles.imageCaption}>
                            仔細聆聽叫聲
                        </div>
                    </div>
                </div>

                {/* 步驟 3 */}
                <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>後後內容</h2>
                        <p className={styles.stepDescription}>確後再聽答</p>
                        <span className={styles.sprout}>🌱</span>
                    </div>
                    <div className={styles.imageBox}>
                        <img
                            src='/src/assets/intro-frog.png'
                            alt='第三步示範'
                            className={styles.stepImage}
                        />
                        <div className={styles.imageCaption}>
                            選擇正確的青蛙
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
