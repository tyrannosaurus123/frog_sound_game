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
    const [timeLeft, setTimeLeft] = useState(10000000);
    const [attempts, setAttempts] = useState(3);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [playingSound, setPlayingSound] = useState<string | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // 隨機生成青蛙位置
    const [frogs] = useState<FrogPosition[]>(() => {
        // 預設青蛙類型和音效
        const frogTypes = [
            { type: "黑眶蟾蜍", sound: "/黑眶蟾蜍叫聲.mp3" },
            { type: "澤蛙", sound: "/澤蛙叫聲.mp3" },
            { type: "台北樹蛙", sound: "/台北樹蛙叫聲.mp3" },
            { type: "面天樹蛙", sound: "/面天樹蛙叫聲.mp3" },
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

    // 鼠標移動處理
    const handleMouseMove = (e: React.MouseEvent) => {
        if (gameOver) return;

        if (gameAreaRef.current) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setCursorPosition({ x, y });

            // 檢查是否接近任何青蛙，播放相應聲音
            const relativeX = (x / rect.width) * 100;
            const relativeY = (y / rect.height) * 100;

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

            // 如果夠近，播放聲音
            if (
                nearestFrog &&
                minDistance < 20 &&
                playingSound !== nearestFrog.sound
            ) {
                if (audioRef.current) {
                    audioRef.current.src = nearestFrog.sound;
                    audioRef.current
                        .play()
                        .catch((err) => console.log("播放受限:", err));
                    setPlayingSound(nearestFrog.sound);
                }
            } else if (minDistance >= 20 && playingSound !== null) {
                if (audioRef.current) {
                    audioRef.current.pause();
                    setPlayingSound(null);
                }
            }
        }
    };

    // 點擊處理
    const handleClick = (e: React.MouseEvent) => {
        if (gameOver || attempts <= 0) return;

        if (gameAreaRef.current) {
            const rect = gameAreaRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const relativeX = (x / rect.width) * 100;
            const relativeY = (y / rect.height) * 100;

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
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.gameHeader}>
                <div className={styles.timer}>倒數: {timeLeft}秒</div>
                <div className={styles.attempts}>剩餘機會: {attempts}</div>
                <div className={styles.target}>目標: 找到{targetFrogName}</div>
            </div>

            {message && <div className={styles.message}>{message}</div>}

            <div
                ref={gameAreaRef}
                className={styles.gameArea}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                style={{
                    cursor: "none",
                }}
            >
                {/* 自定義遊標 */}
                <div
                    className={styles.customCursor}
                    style={{
                        left: `${cursorPosition.x}px`,
                        top: `${cursorPosition.y}px`,
                    }}
                />

                {/* 隱藏的音頻元素 */}
                <audio ref={audioRef} />
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.backButton} onClick={onBack}>
                    返回首頁
                </button>
            </div>
        </div>
    );
}
