import styles from "./TargetFrogPage.module.css";

type Props = {
    onContinue: () => void;
};

export default function TargetFrogPage({ onContinue }: Props) {
    return (
        <div className={styles.container}>
            <p className={styles.instruction}>請先聆聽青蛙的叫聲……</p>
            <div className={styles["target-box"]}>
                <div className={styles.info}>
                    <h3 className={styles.heading}>目標青蛙 : 黑眶蟾蜍</h3>
                    <div className={styles.icon}>🔊</div>
                    <p className={styles.description}>
                        我們首先會向玩家介紹
                        <br />
                        一隻目標青蛙，
                        <br />
                        並提供其叫聲
                    </p>
                </div>
                <div className={styles["frog-section"]}>
                    {/* 包含青蛙圖片和音頻的區域 */}
                    <img
                        src='/src/assets/frog-1.png'
                        // alt='target frog'
                        className={styles["frog-img"]}
                    />
                    <audio
                        controls
                        controlsList='nodownload'
                        className={styles["frog-audio"]}
                    >
                        {/* 音頻播放器，允許播放控制 */}
                        <source
                            src='/黑眶蟾蜍叫聲.mp3'
                            type='audio/mpeg'
                        />{" "}
                        {/* 音頻文件的來源和格式 */}
                        Your browser does not support the audio element.{" "}
                        {/* 瀏覽器不支持音頻元素時顯示的提示文字 */}
                    </audio>
                </div>
            </div>
            <button
                className={`${styles.button} ${styles.continue}`}
                onClick={onContinue}
            >
                繼續
            </button>
        </div>
    );
}
