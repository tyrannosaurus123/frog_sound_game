import { useEffect, useState, useRef } from "react";
import styles from "./GamePage.module.css";

type Props = {
    onWin: () => void;
    onLose: () => void;
    onBack: () => void; // 返回首頁的回調函數
    targetFrogName: string; // 目標青蛙名稱
    targetFrogSound: string; // 目標青蛙音效
};

interface FrogPosition {
    id: number;
    x: number; // CSS百分比，例如 "25%"
    y: number; // CSS百分比，例如 "60%"
    type: string; // 青蛙類型
    sound: string; // 音效文件路徑
}

export default function GamePage({
    onWin,
    onLose,
    onBack,
    targetFrogName,
    targetFrogSound,
}: Props) {
    const [timeLeft, setTimeLeft] = useState(20000);
    const [attempts, setAttempts] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");

    // 游標狀態
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [playingSound, setPlayingSound] = useState<string | null>(null);

    // refs
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    // 隨機生成青蛙位置
    const [frogs] = useState<FrogPosition[]>(() => {
        // 預設青蛙類型和音效
        const frogTypes = [
            { type: "黑眶蟾蜍", sound: "/frog_sound/黑眶蟾蜍叫聲.mp3" },
            { type: "澤蛙", sound: "/frog_sound/澤蛙叫聲.mp3" },
            { type: "台北樹蛙", sound: "/frog_sound/台北樹蛙叫聲.mp3" },
            { type: "面天樹蛙", sound: "/frog_sound/面天樹蛙叫聲.mp3" },
        ];

        // 隨機生成5-7個青蛙位置
        const count = Math.floor(Math.random() * 3) + 5;
        const positions: FrogPosition[] = [];

        for (let i = 0; i < count; i++) {
            const randomFrog =
                frogTypes[Math.floor(Math.random() * frogTypes.length)];
            positions.push({
                id: i,
                x: Math.floor(Math.random() * 80) + 10, // 10% - 90% 水平位置
                y: Math.floor(Math.random() * 70) + 15, // 15% - 85% 垂直位置
                type: randomFrog.type,
                sound: randomFrog.sound,
            });
        }

        // 確保有一隻是目標青蛙
        const hasTarget = positions.some(
            (frog) => frog.type === targetFrogName
        );
        if (!hasTarget) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            positions[randomIndex] = {
                id: positions[randomIndex].id,
                x: positions[randomIndex].x,
                y: positions[randomIndex].y,
                type: targetFrogName,
                sound: targetFrogSound,
            };
        }

        return positions;
    });

    // 計時器
    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !gameOver) {
            setGameOver(true);
            setMessage("時間到！遊戲結束");
            setTimeout(() => onLose(), 2000);
        }
    }, [timeLeft, gameOver, onLose]);

    // 處理游標移動 - 使用全局事件
    useEffect(() => {
        // 處理鼠標移動
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPosition({ x: e.clientX, y: e.clientY });
            checkFrogProximity(e.clientX, e.clientY);
        };

        // 滑鼠離開頁面時隱藏游標
        const handleMouseLeave = () => {
            if (cursorRef.current) {
                cursorRef.current.style.display = "none";
            }
        };

        // 滑鼠進入頁面時顯示游標
        const handleMouseEnter = () => {
            if (cursorRef.current) {
                cursorRef.current.style.display = "block";
            }
        };

        // 全局添加事件監聽
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);
        document.addEventListener("mouseenter", handleMouseEnter);

        // 清理函數
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
            document.removeEventListener("mouseenter", handleMouseEnter);
        };
    }, []); // 空依賴數組，只執行一次

    // 檢查是否接近青蛙的函數
    const checkFrogProximity = (mouseX: number, mouseY: number) => {
        if (!containerRef.current || gameOver) return;

        const rect = containerRef.current.getBoundingClientRect();

        // 鼠標在容器內的相對位置（百分比）
        const relativeX = ((mouseX - rect.left) / rect.width) * 100;
        const relativeY = ((mouseY - rect.top) / rect.height) * 100;

        // 找到最接近的青蛙
        let nearestFrog: FrogPosition | null = null;
        let minDistance = Infinity;

        frogs.forEach((frog) => {
            const distance = Math.sqrt(
                Math.pow(frog.x - relativeX, 2) +
                    Math.pow(frog.y - relativeY, 2)
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearestFrog = frog;
            }
        });

        // 調整觸發距離和音量
        const soundThreshold = 25;

        // 如果夠近，播放聲音
        if (nearestFrog && minDistance < soundThreshold) {
            if (audioRef.current) {
                // 如果是新的聲音，或者當前沒有播放
                if (playingSound !== nearestFrog.sound) {
                    // 設置音源
                    audioRef.current.src = nearestFrog.sound;

                    // 根據距離計算音量 (越近音量越大)
                    const volume = Math.max(
                        0.3,
                        1 - minDistance / soundThreshold
                    );
                    audioRef.current.volume = volume;

                    console.log(
                        `嘗試播放 ${nearestFrog.type} 的聲音，距離: ${minDistance}，音量: ${volume}`
                    );

                    // 播放音效
                    const playPromise = audioRef.current.play();

                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log("播放成功:", nearestFrog?.sound);
                                setPlayingSound(nearestFrog.sound);
                            })
                            .catch((err) => {
                                console.error("播放失敗:", err);
                            });
                    }
                } else {
                    // 已經播放同一個聲音，只更新音量
                    const volume = Math.max(
                        0.3,
                        1 - minDistance / soundThreshold
                    );
                    audioRef.current.volume = volume;
                }
            }
        } else if (minDistance >= soundThreshold && playingSound !== null) {
            // 遠離青蛙，停止聲音
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingSound(null);
            }
        }
    };

    // 點擊處理
    const handleClick = (e: React.MouseEvent) => {
        if (gameOver || attempts <= 0) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // 點擊位置的百分比坐標
        const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
        const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

        // 檢查是否點擊到青蛙
        let clickedFrog: FrogPosition | null = null;

        frogs.forEach((frog) => {
            const distance = Math.sqrt(
                Math.pow(frog.x - relativeX, 2) +
                    Math.pow(frog.y - relativeY, 2)
            );

            // 判定點擊到青蛙的距離閾值
            if (distance < 10) {
                clickedFrog = frog;
            }
        });

        if (clickedFrog) {
            // 如果點擊到目標青蛙
            if (clickedFrog.type === targetFrogName) {
                setGameOver(true);
                setMessage("太棒了！你找到了目標青蛙！");
                setTimeout(() => onWin(), 2000);
            } else {
                // 點擊到錯誤的青蛙
                const newAttempts = attempts - 1;
                setAttempts(newAttempts);

                if (newAttempts <= 0) {
                    setGameOver(true);
                    setMessage("機會用完了！遊戲結束");
                    setTimeout(() => onLose(), 2000);
                } else {
                    setMessage(
                        `這不是${targetFrogName}，還剩${newAttempts}次機會`
                    );
                    setTimeout(() => setMessage(""), 2000);
                }
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className={styles.container}
            onClick={handleClick}
        >
            {/* 頂部欄 */}
            <div className={styles.gameHeader}>
                <div className={styles.timer}>倒數: {timeLeft}秒</div>
                <div className={styles.attempts}>剩餘機會: {attempts}</div>
                <div className={styles.target}>目標: 找到{targetFrogName}</div>
            </div>

            {/* 返回按鈕 */}
            <button
                className={styles.button}
                onClick={onBack}
                style={{
                    position: "absolute",
                    top: "15px",
                    right: "15px",
                }}
            >
                返回
            </button>

            {/* 消息顯示區 */}
            {message && <div className={styles.message}>{message}</div>}

            {/* 自定義游標 */}
            <div
                ref={cursorRef}
                className={styles.customCursor}
                style={{
                    left: `${cursorPosition.x}px`,
                    top: `${cursorPosition.y}px`,
                }}
            />

            {/* 創建一個完全透明的層來捕獲所有事件 */}
            <div className={styles.cursorTracker} />

            {/* 隱藏的音頻元素 */}
            <audio ref={audioRef} preload='auto' />
        </div>
    );
}
