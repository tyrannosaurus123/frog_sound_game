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
                <div className={styles.step}>
                    <div className={styles.stepNumber}>1</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>注意內容</h2>
                        <p className={styles.stepDescription}>
                            我們會先聽先檢查有腰迹
                        </p>
                    </div>
                    <div className={styles.demoContainer}>
                        <div className={styles.demoTop}>
                            <img
                                src='/src/assets/intro-frog.png'
                                alt='目標青蛙'
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.stepNumber}>2</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>注意內容</h2>
                        <p className={styles.stepDescription}>隨取其族瑗先</p>
                    </div>
                    <div className={styles.demoContainer}>
                        <div className={styles.demoMiddle}>
                            <div className={styles.micIcon}>🎤</div>
                        </div>
                    </div>
                </div>

                <div className={styles.step}>
                    <div className={styles.stepNumber}>3</div>
                    <div className={styles.stepContent}>
                        <h2 className={styles.stepTitle}>後後內容</h2>
                        <p className={styles.stepDescription}>確後再聽答</p>
                        <span className={styles.sprout}>🌱</span>
                    </div>
                    <div className={styles.demoContainer}>
                        <div className={styles.demoBottom}>
                            <div className={styles.frogGroup}>
                                <span>🐸</span>
                                <span>🐸</span>
                                <span>🐸</span>
                            </div>
                            <button className={styles.confirmButton}>
                                確認
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <table className={styles.imageTable}>
                <tbody>
                    <tr>
                        <td className={styles.imageCell}>
                            <img
                                src='/src/assets/intro-frog.png'
                                alt='目標青蛙'
                                className={styles.tableImage}
                            />
                            <div className={styles.imageCaption}>
                                圖片一說明
                            </div>
                        </td>

                        <td className={styles.imageCell}>
                            <img
                                src='/src/assets/intro-frog.png'
                                alt='目標青蛙'
                                className={styles.tableImage}
                            />
                            <div className={styles.imageCaption}>
                                圖片二說明
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className={styles.buttonContainer}>
                <button className={styles.backButton} onClick={onBack}>
                    返回首頁
                </button>
            </div>
        </div>
    );
}
