import { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import styles from "./GamePage.module.css";

type Props = {
    onWin: () => void;
    onLose: () => void;
    onBack: () => void; // 返回首頁的回調函數
    targetFrogName: string; // 目標青蛙名稱
    targetFrogSound: string; // 目標青蛙音效
};

// 確保在文件頂部有正確的接口定義
interface FrogPosition {
    id: number;
    x: number; // CSS百分比
    y: number; // CSS百分比
    type: string; // 青蛙類型
    sound: string; // 音效文件路徑
}

// 首先定義青蛙類型的介面
interface FrogType {
    type: string;
    sound: string;
}

export default function GamePage({
    onWin,
    onLose,
    onBack,
    targetFrogName,
    targetFrogSound,
}: Props) {
    const [timeLeft, setTimeLeft] = useState(20);
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

    // 修正青蛙生成邏輯
    const [frogs] = useState<FrogPosition[]>(() => {
        // 明確指定 frogTypes 的型別
        const frogTypes: FrogType[] = [
            { type: "黑眶蟾蜍", sound: "/frog_sound/黑眶蟾蜍.mp3" },
            { type: "諸羅樹蛙", sound: "/frog_sound/諸羅樹蛙.mp3" },
            { type: "小雨樹蛙", sound: "/frog_sound/小雨樹蛙.mp3" },
            { type: "太田樹蛙", sound: "/frog_sound/太田樹蛙.mp3" },
            { type: "斑腿樹蛙", sound: "/frog_sound/斑腿樹蛙.mp3" },
        ];

        // 過濾掉目標青蛙類型，確保隨機生成的青蛙中不會包含目標青蛙
        const nonTargetFrogTypes: FrogType[] = frogTypes.filter(
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
            const randomFrogIndex = Math.floor(
                Math.random() * nonTargetFrogTypes.length
            );
            const randomFrog: FrogType = nonTargetFrogTypes[randomFrogIndex];

            // 嘗試找到合適的位置（最多嘗試20次）
            let x: number, y: number;
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
        let targetX: number, targetY: number;
        let attempts = 0;
        const MAX_ATTEMPTS = 20;

        do {
            targetX = Math.floor(Math.random() * 80) + 10;
            targetY = Math.floor(Math.random() * 70) + 15;
            attempts++;
        } while (isTooClose(targetX, targetY) && attempts < MAX_ATTEMPTS);

        // 添加一隻目標青蛙
        const targetFrogPosition: FrogPosition = {
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
    const endGame = useCallback(
        (win: boolean) => {
            setGameOver(true);

            if (win) {
                setMessage("太棒了！你找到了目標青蛙！");
            } else {
                setMessage("遊戲結束！");
            }

            // 停止所有音頻
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setPlayingSound(null);
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
            }, 10000); // 給玩家10秒查看青蛙位置
        },
        [onWin, onLose]
    );

    // 計算音量的函數
    const calculateVolume = useCallback((distance: number, threshold: number) => {
        // 使用更陡的曲線，提高靈敏度
        return Math.max(0.2, Math.pow(1 - distance / threshold, 1.5));
    }, []);

    // 檢查青蛙接近性函數，使用 useCallback 以避免依賴問題
    const checkFrogProximity = useCallback(
        (mouseX: number, mouseY: number) => {
            if (!containerRef.current || gameOver) return;

            const rect = containerRef.current.getBoundingClientRect();

            // 鼠標在容器內的相對位置（百分比）
            const relativeX = ((mouseX - rect.left) / rect.width) * 100;
            const relativeY = ((mouseY - rect.top) / rect.height) * 100;

            // 找到最接近的青蛙
            let nearestFrog: FrogPosition | null = null;
            let minDistance = Infinity;

            // 使用類型斷言確保 TypeScript 認識 frogs 的類型
            (frogs as FrogPosition[]).forEach((frog: FrogPosition) => {
                const distance = Math.sqrt(
                    Math.pow(frog.x - relativeX, 2) +
                        Math.pow(frog.y - relativeY, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    nearestFrog = frog;
                }
            });

            // 小範圍提高靈敏度
            const soundThreshold = 15;

            // 如果夠近，播放聲音 - 即使在移動中
            if (nearestFrog && minDistance < soundThreshold) {
                if (audioRef.current) {
                    // 使用類型斷言確保 TypeScript 認識 nearestFrog 的類型
                    const frog = nearestFrog as FrogPosition;
                    
                    // 簡化條件判斷，直接使用 nearestFrog
                    if (playingSound !== frog.sound) {
                        console.log(
                            `嘗試播放: ${frog.type} - ${frog.sound}`
                        );

                        // 立即設置音源並播放
                        audioRef.current.src = frog.sound;
                        audioRef.current.loop = true;
                        audioRef.current.volume = calculateVolume(minDistance, soundThreshold);

                        // 直接播放 - 不要等待
                        const playPromise = audioRef.current.play();

                        if (playPromise !== undefined) {
                            // 保存當前的 nearestFrog 到本地變數避免閉包問題
                            const currentFrog = frog;
                            playPromise
                                .then(() => {
                                    setPlayingSound(currentFrog.sound);
                                })
                                .catch((err) => {
                                    console.error("播放失敗:", err);
                                    // 嘗試使用互動事件觸發播放
                                    document.addEventListener(
                                        "click",
                                        function playOnClick() {
                                            if (audioRef.current) {
                                                audioRef.current
                                                    .play()
                                                    .catch((e) =>
                                                        console.error("二次播放失敗:", e)
                                                    );
                                            }
                                            document.removeEventListener(
                                                "click",
                                                playOnClick
                                            );
                                        },
                                        { once: true }
                                    );
                                });
                        }
                    } else {
                        // 已經播放同一個聲音，立即更新音量
                        audioRef.current.volume = calculateVolume(minDistance, soundThreshold);
                    }
                }
            } else if (
                (minDistance >= soundThreshold || !nearestFrog) &&
                playingSound !== null
            ) {
                // 遠離青蛙，立即停止聲音
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    setPlayingSound(null);
                }
            }
        },
        [frogs, gameOver, playingSound, calculateVolume]
    );

    // 計時器
    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft <= 0 && !gameOver) {
            endGame(false);
        }
    }, [timeLeft, gameOver, endGame]);

    // 處理游標移動 - 使用全局事件
    useEffect(() => {
        // 處理鼠標移動
        const handleMouseMove = (e: MouseEvent) => {
            setCursorPosition({ x: e.clientX, y: e.clientY });
            if (!gameOver) {
                // 只在遊戲進行中檢查接近性
                checkFrogProximity(e.clientX, e.clientY);
            }
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
    }, [gameOver, checkFrogProximity]);

    // 添加音頻文件預加載機制
    useEffect(() => {
        // 預加載所有聲音文件
        (frogs as FrogPosition[]).forEach((frog: FrogPosition) => {
            const audio = new Audio();
            audio.src = frog.sound;
            audio.preload = "auto";
            audio.load();
            console.log(`預加載聲音: ${frog.type} - ${frog.sound}`);
        });

        // 修正文件路徑問題 - 確保黑眶蟾蜍的音頻路徑正確
        (frogs as FrogPosition[]).forEach((frog: FrogPosition) => {
            if (frog.type === targetFrogName) {
                console.log("目標青蛙聲音路徑：", frog.sound);
            }
        });

        // 遊戲結束時停止所有音頻
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [frogs, targetFrogName]);

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

        // 使用類型斷言
        (frogs as FrogPosition[]).forEach((frog: FrogPosition) => {
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
            // 使用類型斷言
            const frog = clickedFrog as FrogPosition;
            
            // 如果點擊到目標青蛙
            if (frog.type === targetFrogName) {
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
                <button 
                    className={styles.backButton}
                    onClick={onBack}
                    disabled={gameOver}
                >
                    返回首頁
                </button>
                <div className={styles.timer}>倒數: {timeLeft}秒</div>
                <div className={styles.attempts}>剩餘機會: {attempts}</div>
                <div className={styles.target}>目標: 找到{targetFrogName}</div>
            </div>
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
            {showFrogPositions &&
                ReactDOM.createPortal(
                    <div
                        className={styles.frogPositionsOverlay}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className={styles.frogPositionsTitle}>
                            所有青蛙位置
                        </h3>
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
                                        {frog.type === targetFrogName &&
                                            " (目標)"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>,
                    document.body
                )}
            {/* 隱藏的音頻元素 */}
            <audio ref={audioRef} preload="auto" />
        </div>
    );
}
