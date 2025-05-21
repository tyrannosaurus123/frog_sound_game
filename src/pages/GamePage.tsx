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
            { type: "黑眶蟾蜍", sound: "/frog_sound/黑眶蟾蜍.mp3" },
            { type: "澤蛙", sound: "/frog_sound/澤蛙.mp3" },
            { type: "台北樹蛙", sound: "/frog_sound/台北樹蛙.mp3" },
            // { type: "面天樹蛙", sound: "/frog_sound/面天樹蛙叫聲.mp3" },
        ];

        // 過濾掉目標青蛙類型，確保隨機生成的青蛙中不會包含目標青蛙
        const nonTargetFrogTypes = frogTypes.filter(
            (frog) => frog.type !== targetFrogName
        );

        // 隨機生成5-7個非目標青蛙位置
        const count = Math.floor(Math.random() * 3) + 5;
        const positions: FrogPosition[] = [];

        // 設定青蛙之間的最小距離（以百分比表示）
        const MIN_DISTANCE_BETWEEN_FROGS = 20;

        // 檢查新位置是否離現有青蛙太近
        const isTooClose = (x: number, y: number): boolean => {
            for (const frog of positions) {
                const distance = Math.sqrt(
                    Math.pow(frog.x - x, 2) + Math.pow(frog.y - y, 2)
                );
                if (distance < MIN_DISTANCE_BETWEEN_FROGS) {
                    return true; // 太近了
                }
            }
            return false; // 距離合適
        };

        // 生成符合距離要求的青蛙位置
        for (let i = 0; i < count; i++) {
            const randomFrog =
                nonTargetFrogTypes[
                    Math.floor(Math.random() * nonTargetFrogTypes.length)
                ];

            // 嘗試找到合適的位置（最多嘗試20次）
            let x, y;
            let attempts = 0;
            const MAX_ATTEMPTS = 20;

            do {
                x = Math.floor(Math.random() * 80) + 10; // 10% - 90% 水平位置
                y = Math.floor(Math.random() * 70) + 15; // 15% - 85% 垂直位置
                attempts++;
            } while (isTooClose(x, y) && attempts < MAX_ATTEMPTS);

            // 如果嘗試多次仍找不到合適位置，就適當減小要求
            if (attempts >= MAX_ATTEMPTS) {
                console.log("無法找到完全符合距離要求的位置，減小距離要求");
                // 重新生成一次，接受較近的距離
                x = Math.floor(Math.random() * 80) + 10;
                y = Math.floor(Math.random() * 70) + 15;
            }

            positions.push({
                id: i,
                x: x,
                y: y,
                type: randomFrog.type,
                sound: randomFrog.sound,
            });
        }

        // 添加目標青蛙，同樣確保距離要求
        let targetX, targetY;
        let attempts = 0;
        const MAX_ATTEMPTS = 20;

        do {
            targetX = Math.floor(Math.random() * 80) + 10;
            targetY = Math.floor(Math.random() * 70) + 15;
            attempts++;
        } while (isTooClose(targetX, targetY) && attempts < MAX_ATTEMPTS);

        // 添加一隻目標青蛙
        const targetFrogPosition = {
            id: count, // 使用下一個 ID
            x: targetX,
            y: targetY,
            type: targetFrogName,
            sound: targetFrogSound,
        };

        positions.push(targetFrogPosition);

        console.log("青蛙位置生成完成:", positions);
        return positions;
    });

    // 新增狀態：控制是否顯示青蛙位置
    const [showFrogPositions, setShowFrogPositions] = useState(false);

    // 結束遊戲的處理函數
    const endGame = (win: boolean) => {
        setGameOver(true);

        if (win) {
            setMessage("太棒了！你找到了目標青蛙！");
        } else {
            setMessage("遊戲結束！");
        }

        // 先顯示消息，然後顯示所有青蛙位置
        setTimeout(() => {
            setShowFrogPositions(true);
        }, 1500);

        // 最後跳轉到結果頁面
        setTimeout(() => {
            if (win) {
                onWin();
            } else {
                onLose();
            }
        }, 10000); // 給玩家時間查看青蛙位置
    };

    // 計時器
    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !gameOver) {
            endGame(false);
        }
    }, [timeLeft, gameOver]);

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

        // 調整觸發距離和音量 - 縮小範圍
        const soundThreshold = 15; // 從25降低到15，縮小了40%的聽力範圍

        // 更快的音量衰減曲線
        const calculateVolume = (distance: number) => {
            // 使用二次方曲線，距離越遠音量衰減越快
            return Math.max(0.1, Math.pow(1 - distance / soundThreshold, 2));
        };

        // 如果夠近，播放聲音
        if (nearestFrog && minDistance < soundThreshold) {
            if (audioRef.current) {
                // 如果是新的聲音，需要切換
                if (playingSound !== nearestFrog.sound) {
                    // 設置音源
                    audioRef.current.src = nearestFrog.sound;

                    // 設置循環播放
                    audioRef.current.loop = true;

                    // 根據距離計算音量 (越近音量越大)，使用新的音量計算函數
                    const volume = calculateVolume(minDistance);
                    audioRef.current.volume = volume;

                    console.log(
                        `切換到 ${nearestFrog.type} 的聲音，距離: ${minDistance}，音量: ${volume}`
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
                    // 已經播放同一個聲音，只更新音量而不重新開始
                    const volume = calculateVolume(minDistance);

                    // 平滑過渡音量變化，避免聲音突變
                    const currentVolume = audioRef.current.volume;
                    const volumeDiff = volume - currentVolume;

                    // 如果音量差異太小，直接設置
                    if (Math.abs(volumeDiff) < 0.05) {
                        audioRef.current.volume = volume;
                    } else {
                        // 更快速地調整音量，提高反應速度
                        audioRef.current.volume += volumeDiff * 0.15;
                    }
                }
            }
        } else if (minDistance >= soundThreshold && playingSound !== null) {
            // 遠離青蛙，更快淡出並停止聲音
            if (audioRef.current) {
                // 平滑降低音量直到靜音，但速度更快
                const fadeOutInterval = setInterval(() => {
                    if (audioRef.current) {
                        if (audioRef.current.volume > 0.1) {
                            // 更大的步長，更快淡出
                            audioRef.current.volume -= 0.15;
                        } else {
                            audioRef.current.pause();
                            clearInterval(fadeOutInterval);
                            setPlayingSound(null);
                        }
                    } else {
                        clearInterval(fadeOutInterval);
                    }
                }, 30); // 更短的間隔，更快的反應
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
                endGame(true);
            } else {
                // 點擊到錯誤的青蛙
                const newAttempts = attempts - 1;
                setAttempts(newAttempts);

                if (newAttempts <= 0) {
                    endGame(false);
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

            {/* 顯示青蛙位置 */}
            {showFrogPositions && (
                <div className={styles.frogPositionsOverlay}>
                    <h3 className={styles.frogPositionsTitle}>所有青蛙位置</h3>
                    <div className={styles.frogPositionsContainer}>
                        {/* 渲染青蛙標記 */}
                        {frogs.map((frog) => (
                            <div
                                key={frog.id}
                                className={`${styles.frogMarker} ${
                                    frog.type === targetFrogName
                                        ? styles.targetFrog
                                        : ""
                                }`}
                                style={{
                                    left: `${frog.x}%`,
                                    top: `${frog.y}%`,
                                }}
                            >
                                <div className={styles.frogIndicator}></div>
                                <div className={styles.frogLabel}>
                                    {frog.type}
                                    {frog.type === targetFrogName && " (目標)"}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 隱藏的音頻元素 */}
            <audio ref={audioRef} preload='auto' />
        </div>
    );
}
