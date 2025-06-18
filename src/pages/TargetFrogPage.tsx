import { useEffect, useRef, useState } from "react";
import styles from "./TargetFrogPage.module.css";

type Props = {
    targetFrog: string;
    onContinue: () => void;
};

export default function TargetFrogPage({ targetFrog, onContinue }: Props) {
    // 使用 useRef 取得音頻元素的參考
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // 隨機選擇青蛙圖片
    const [frogImage, setFrogImage] = useState<string>("");
    // 青蛙介紹文字
    const [frogDescription, setFrogDescription] = useState<string>("");
    
    // 初始化隨機圖片和載入介紹文字
    useEffect(() => {
        const frogType = targetFrog;
        // 根據青蛙類型設定圖片總數
        const imageCountMap: { [key: string]: number } = {
            "黑眶蟾蜍": 6,
            "諸羅樹蛙": 5,
            "小雨樹蛙": 5,
            "太田樹蛙": 5,
            "斑腿樹蛙": 5
        };
        const totalImages = imageCountMap[frogType] || 5;
        const randomNumber = Math.floor(Math.random() * totalImages) + 1;
        setFrogImage(`/frog_image/${frogType}/${randomNumber}.jpg`);
        
        // 載入青蛙介紹文字
        fetch(`/frog_intro/${frogType}.txt`)
            .then(response => response.text())
            .then(text => setFrogDescription(text))
            .catch(error => {
                console.error('載入青蛙介紹失敗:', error);
                setFrogDescription("我們首先會向玩家介紹一隻目標青蛙，並提供其叫聲");
            });
    }, [targetFrog]);

    // 切換播放/暫停的函數
    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                // 如果正在播放，則暫停
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                // 如果已暫停，則播放
                const playPromise = audioRef.current.play();

                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch((error) => {
                            console.log("播放受到瀏覽器政策限制:", error);
                            setIsPlaying(false);
                        });
                }
            }
        }
    };

    // 監聽音頻結束事件
    useEffect(() => {
        const audioElement = audioRef.current;

        const handleEnded = () => {
            setIsPlaying(false);
        };

        if (audioElement) {
            audioElement.addEventListener("ended", handleEnded);
        }

        return () => {
            if (audioElement) {
                audioElement.removeEventListener("ended", handleEnded);
            }
        };
    }, []);

    // 組件掛載時自動播放音頻
    useEffect(() => {
        // 延遲一小段時間後播放，確保頁面已載入
        const timeoutId = setTimeout(() => {
            if (audioRef.current) {
                // 嘗試播放音效
                const playPromise = audioRef.current.play();

                // 處理自動播放政策限制
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch((error) => {
                            console.log("自動播放受到瀏覽器政策限制:", error);
                            setIsPlaying(false);
                            // 這裡不再添加視覺提示，因為我們已經有了播放按鈕
                        });
                }
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className={styles.container}>
            <p className={styles.instruction}>請先聆聽青蛙的叫聲……</p>
            <div className={styles["target-box"]}>
                <div className={styles.info}>
                    <div className={styles.headingContainer}>
                        <h3 className={styles.heading}>目標青蛙 : {targetFrog}</h3>
                        <div
                            className={`${styles.icon} ${styles.playButton} ${
                                isPlaying ? styles.playing : ""
                            }`}
                            onClick={toggleAudio}
                            title={isPlaying ? "點擊暫停聲音" : "點擊播放聲音"}
                        >
                            {isPlaying ? "🔊" : "🔈"}
                        </div>
                    </div>
                    <p className={styles.description}>
                        {frogDescription || "載入中..."}
                    </p>
                </div>
                <div className={styles["frog-section"]}>
                    {/* 包含青蛙圖片的區域 */}
                    <img
                        src={frogImage}
                        alt={targetFrog}
                        className={styles["frog-img"]}
                    />
                    {/* 隱藏的音頻元素，自動播放 */}
                    <audio
                        ref={audioRef}
                        src={`/frog_sound/${targetFrog}.mp3`}
                        preload='auto'
                    />
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
