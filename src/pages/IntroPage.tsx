import styles from "./IntroPage.module.css";

type Props = {
    onBack: () => void;
};

export default function IntroPage({ onBack }: Props) {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>青蛙聲探 - 遊戲介紹</h1>

            <div className={styles.card}>
                <p className={styles.description}>
                    歡迎來到「青蛙聲探」，這是一款有趣且具教育意義的遊戲，旨在幫助玩家辨識不同種類青蛙的叫聲。
                    台灣擁有豐富的青蛙資源，每種青蛙都有獨特的叫聲。透過這個遊戲，你將學會辨識這些美妙的自然之聲！
                </p>

                <div className={styles.rulesSection}>
                    <h2 className={styles.rulesTitle}>遊戲規則</h2>
                    <ul className={styles.rulesList}>
                        <li className={styles.ruleItem}>
                            首先，你會聽到一隻「目標青蛙」的叫聲
                        </li>
                        <li className={styles.ruleItem}>
                            接著，系統會呈現多個選項，每個選項都有一種青蛙的叫聲
                        </li>
                        <li className={styles.ruleItem}>
                            仔細聆聽並找出與目標青蛙叫聲相符的選項
                        </li>
                        <li className={styles.ruleItem}>
                            選對了會獲得分數，選錯了會失去一條生命
                        </li>
                        <li className={styles.ruleItem}>
                            遊戲中共有三條生命，用完即遊戲結束
                        </li>
                    </ul>
                </div>

                <h2 className={styles.rulesTitle}>青蛙種類介紹</h2>
                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <img
                            src='/src/assets/frog-1.png'
                            alt='黑眶蟾蜍'
                            className={styles.frogImage}
                        />
                        <h3 className={styles.featureName}>黑眶蟾蜍</h3>
                        <p className={styles.featureDescription}>
                            體型較大，皮膚粗糙多疣。叫聲為低沉持續的「嘎—嘎—嘎」。
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <img
                            src='/src/assets/frog-2.png'
                            alt='台北樹蛙'
                            className={styles.frogImage}
                        />
                        <h3 className={styles.featureName}>台北樹蛙</h3>
                        <p className={styles.featureDescription}>
                            體型較小，顏色鮮豔。叫聲為清脆的「嘰—嘰—嘰」。
                        </p>
                    </div>

                    <div className={styles.featureCard}>
                        <img
                            src='/src/assets/frog-3.png'
                            alt='澤蛙'
                            className={styles.frogImage}
                        />
                        <h3 className={styles.featureName}>澤蛙</h3>
                        <p className={styles.featureDescription}>
                            中等體型，身體有條紋。叫聲為節奏分明的「呱—呱—呱」。
                        </p>
                    </div>
                </div>

                <p className={styles.description}>
                    這個遊戲不僅能夠訓練你的聽覺識別能力，還能增加對台灣青蛙生態的了解。
                    準備好接受挑戰了嗎？祝你在青蛙聲探的旅程中獲得樂趣！
                </p>
            </div>

            <div className={styles.buttonContainer}>
                <button className={styles.backButton} onClick={onBack}>
                    返回首頁
                </button>
            </div>
        </div>
    );
}
