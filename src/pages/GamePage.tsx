import { useEffect, useState, useRef, useCallback } from "react";
import styles from "./GamePage.module.css";
import confetti from 'canvas-confetti';

// 用於處理音頻上下文的全局變數
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioContext: AudioContext | null = null;

// 用於預加載音頻的全局變數
const preloadedAudios: Record<string, HTMLAudioElement> = {};

// 音頻預加載狀態跟踪
let totalAudioFiles = 5; // 基本有5個音頻文件，如果目標是 Keroro 則會是6個
let loadedAudioFiles = 0;

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
    const [timeLeft, setTimeLeft] = useState(60);
    const [attempts, setAttempts] = useState(3);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");
    const [userInteracted, setUserInteracted] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // 追踪音频文件预加载状态
    
    // 游標狀態
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const [playingSound, setPlayingSound] = useState<string | null>(null);

    // refs
    const audioRef = useRef<HTMLAudioElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    // 自定義鼠標點擊處理函數，確保音頻可以播放
    const handleUserInteraction = useCallback(() => {
        if (!userInteracted) {
            setUserInteracted(true);
            
            // 初始化全局 AudioContext（如果尚未創建）
            if (!audioContext) {
                try {
                    audioContext = new AudioContext();
                    console.log("創建 AudioContext 成功");
                } catch (e) {
                    console.error("創建 AudioContext 失敗:", e);
                }
            }
            
            // 確保音頻上下文已解鎖（用於 Chrome 等瀏覽器）
            if (audioContext && audioContext.state === "suspended") {
                audioContext.resume().then(() => {
                    console.log("AudioContext 已恢復");
                }).catch(err => {
                    console.error("無法恢復 AudioContext:", err);
                });
            }
            
            // 嘗試播放一個空白/短暫的音頻來解鎖音頻上下文
            const unlockAudio = new Audio();
            unlockAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
            unlockAudio.load();
            
            // 播放和立即暫停，這應該足以解鎖大多數瀏覽器的音頻上下文
            const playPromise = unlockAudio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        unlockAudio.pause();
                        unlockAudio.currentTime = 0;
                        console.log('音頻上下文已成功解鎖');
                    })
                    .catch(err => {
                        console.error("無法解鎖音頻上下文:", err);
                    });
            }
        }
    }, [userInteracted]);

    // 預加載所有青蛙聲音的函數
    const preloadAudios = useCallback(() => {
        console.log("開始預加載所有青蛙音頻...");
        setIsLoading(true); // 設置加載狀態為true
        
        // 所有青蛙音頻路徑（不包括 Keroro，除非它是目標青蛙）
        const regularAudioFiles = [
            "/frog_sound/黑眶蟾蜍.mp3",
            "/frog_sound/諸羅樹蛙.mp3", 
            "/frog_sound/小雨樹蛙.mp3",
            "/frog_sound/太田樹蛙.mp3",
            "/frog_sound/斑腿樹蛙.mp3"
        ];
        
        // 確定最終的音頻文件列表（包括目標青蛙，如果它是 Keroro）
        const audioFiles = targetFrogSound.includes("Keroro")
            ? [...regularAudioFiles, targetFrogSound]
            : regularAudioFiles;
            
        // 更新總音頻文件數
        totalAudioFiles = audioFiles.length;
        
        // 確保目標青蛙音頻也被預加載
        if (!audioFiles.includes(targetFrogSound) && targetFrogSound) {
            audioFiles.push(targetFrogSound);
            console.log(`添加目標青蛙音頻到預加載列表: ${targetFrogSound}`);
            totalAudioFiles = audioFiles.length; // 更新總數
        } else {
            totalAudioFiles = audioFiles.length;
        }
        
        // 重置加載計數器
        loadedAudioFiles = 0;
        
        // 為每個音頻創建一個預加載
        audioFiles.forEach(audioPath => {
            // 如果已經預加載過這個音頻，跳過
            if (preloadedAudios[audioPath]) {
                loadedAudioFiles++;
                console.log(`音頻已預加載: ${audioPath} (${loadedAudioFiles}/${totalAudioFiles})`);
                
                // 檢查是否全部加載完成
                if (loadedAudioFiles === totalAudioFiles) {
                    setIsLoading(false);
                    console.log("所有音頻加載完成！");
                    // 啟動所有音頻的靜音播放
                    startSilentPlayback();
                }
                return;
            }
            
            // 創建新的音頻元素進行預加載
            const audio = new Audio(audioPath);
            audio.preload = 'auto';
            audio.loop = true; // 設置循環播放
            audio.volume = 0; // 初始音量設為0（靜音）
            
            // 監聽音頻加載事件
            audio.addEventListener('canplaythrough', () => {
                loadedAudioFiles++;
                console.log(`音頻加載完成: ${audioPath} (${loadedAudioFiles}/${totalAudioFiles})`);
                
                // 檢查是否全部加載完成
                if (loadedAudioFiles === totalAudioFiles) {
                    setIsLoading(false);
                    console.log("所有音頻加載完成！");
                    // 啟動所有音頻的靜音播放
                    startSilentPlayback();
                }
            }, { once: true });
            
            // 為了確保音頻加載，我們顯式調用load方法
            audio.load();
            
            console.log(`開始預加載音頻: ${audioPath}`);
            
            // 保存到預加載對象中
            preloadedAudios[audioPath] = audio;
        });
        
        // 輸出預加載的音頻和目標青蛙聲音以進行調試
        console.log("預加載音頻列表:", audioFiles);
        console.log("目標青蛙聲音:", targetFrogSound);
    }, [targetFrogSound]);
    
    // 在組件掛載時預加載所有音頻
    useEffect(() => {
        preloadAudios();
    }, [preloadAudios]);

    // 修正青蛙生成邏輯
    const [frogs] = useState<FrogPosition[]>(() => {
        // 明確指定基本的青蛙類型（不包括 Keroro）
        const regularFrogTypes: FrogType[] = [
            { type: "黑眶蟾蜍", sound: "/frog_sound/黑眶蟾蜍.mp3" },
            { type: "諸羅樹蛙", sound: "/frog_sound/諸羅樹蛙.mp3" },
            { type: "小雨樹蛙", sound: "/frog_sound/小雨樹蛙.mp3" },
            { type: "太田樹蛙", sound: "/frog_sound/太田樹蛙.mp3" },
            { type: "斑腿樹蛙", sound: "/frog_sound/斑腿樹蛙.mp3" },
        ];
        
        // 目標青蛙是 Keroro 時，使用標準青蛙集；否則，不考慮 Keroro
        // 確保 Keroro 只有在作為目標時才會出現在遊戲中
        const nonTargetFrogTypes: FrogType[] = regularFrogTypes.filter(
            (frog) => frog.type !== targetFrogName
        );

        // 隨機生成5-7個非目標青蛙位置
        const count = Math.floor(Math.random() * 3) + 5;
        const positions: FrogPosition[] = [];

        // 設定青蛙之間的最小距離（以百分比表示）
        const MIN_DISTANCE_BETWEEN_FROGS = 20;

        // 檢查新位置是否離現有青蛙太近，或是否在按鈕區域
        const isTooClose = (x: number, y: number): boolean => {
            // 檢查是否在中央按鈕區域（避免與遊戲結束按鈕重疊）
            const isInButtonArea = (x >= 35 && x <= 65 && y >= 40 && y <= 60);
            if (isInButtonArea) {
                return true; // 在按鈕區域，不能放置青蛙
            }
            
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

    // 彩帶動畫函數 - 從兩側發射彩帶
    const shootConfetti = useCallback(() => {
        // 從左側發射彩帶
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.1, y: 0.5 },
            angle: 60,
            startVelocity: 45,
            gravity: 0.8,
            colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
        });
        
        // 從右側發射彩帶
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x: 0.9, y: 0.5 },
                angle: 120,
                startVelocity: 45,
                gravity: 0.8,
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            });
        }, 250);
        
        // 從中間額外發射一次
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { x: 0.5, y: 0.5 },
                gravity: 0.7,
                colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
            });
        }, 500);
    }, []);

    // 結束遊戲的處理函數
    const endGame = useCallback(
        (win: boolean) => {
            // 先設定消息，再設置遊戲結束狀態，確保消息內容不會丟失
            if (win) {
                setMessage("太棒了！你找到了目標青蛙！");
                console.log('顯示勝利消息');
            } else {
                setMessage("失敗了！下次再接再厲。");
                console.log('顯示失敗消息');
            }
            
            // 確保消息設置後再設置遊戲結束狀態
            setGameOver(true);
            console.log('遊戲結束，勝利狀態:', win);

            if (win) {
                // 顯示勝利彩帶動畫
                shootConfetti();
                
                // 調用 onWin 只是用於記錄，不會導致頁面跳轉
                onWin();
                
                // 延遲顯示青蛙位置 (2秒後)
                console.log('設置 2 秒後顯示青蛙位置');
                setTimeout(() => {
                    console.log('現在顯示青蛙位置');
                    setShowFrogPositions(true);
                }, 2000);
            } else {
                // 調用 onLose 只是用於記錄，不會導致頁面跳轉
                onLose();
                
                // 失敗時不顯示彩帶，但也有短暫延遲再顯示青蛙位置
                console.log('設置 1 秒後顯示青蛙位置');
                setTimeout(() => {
                    console.log('現在顯示青蛙位置');
                    setShowFrogPositions(true);
                }, 1000);
            }

            // 停止所有音頻
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setPlayingSound(null);
            }
        },
        [shootConfetti, onWin, onLose]
    );

    // 開始所有音頻的靜音播放
    const startSilentPlayback = useCallback(() => {
        if (!userInteracted) {
            console.log("等待用戶互動後才能啟動靜音播放");
            return; // 如果用戶尚未互動，則不播放（瀏覽器政策限制）
        }
        
        console.log("開始所有音頻的靜音播放");
        console.log("目標青蛙聲音路徑:", targetFrogSound);
        console.log("已預加載的音頻:", Object.keys(preloadedAudios));
        
        // 確保目標青蛙的聲音也被預加載
        if (targetFrogSound && !preloadedAudios[targetFrogSound]) {
            console.log(`目標青蛙的聲音尚未預加載，嘗試加載: ${targetFrogSound}`);
            const targetAudio = new Audio(targetFrogSound);
            targetAudio.preload = 'auto';
            targetAudio.loop = true;
            targetAudio.volume = 0;
            targetAudio.load();
            preloadedAudios[targetFrogSound] = targetAudio;
        }
        
        // 遍歷所有預加載的音頻
        Object.entries(preloadedAudios).forEach(([path, audio]) => {
            audio.volume = 0; // 確保音量為0
            audio.loop = true; // 確保循環播放
            
            // 嘗試播放音頻
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log(`成功開始靜音播放: ${path}`);
                    })
                    .catch((err) => {
                        console.error(`無法開始靜音播放 ${path}:`, err);
                    });
            }
        });
    }, [userInteracted, targetFrogSound]);
    
    // 當用戶互動狀態變化時啟動靜音播放
    useEffect(() => {
        if (userInteracted && loadedAudioFiles === totalAudioFiles) {
            startSilentPlayback();
        }
    }, [userInteracted, startSilentPlayback]);

    // 計算音量的函數
    const calculateVolume = useCallback((distance: number, threshold: number) => {
        // 使用更陡的曲線，提高靈敏度
        return Math.max(0.2, Math.pow(1 - distance / threshold, 1.5));
    }, []);

    // 檢查青蛙接近性函數，使用 useCallback 以避免依賴問題
    const checkFrogProximity = useCallback(
        (mouseX: number, mouseY: number) => {
            if (!containerRef.current) return;

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

            // 如果尚未解鎖音頻，嘗試解鎖
            if (!userInteracted) {
                handleUserInteraction();
                
                // 模擬一次點擊以解鎖音頻
                const simulatedClick = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                document.dispatchEvent(simulatedClick);
                return; // 等待用戶互動後再繼續
            }

            // 遍歷所有預加載的音頻並調整音量
            Object.entries(preloadedAudios).forEach(([path, audio]) => {
                // 調試輸出
                if (nearestFrog && nearestFrog.sound === targetFrogSound) {
                    console.log(`接近目標青蛙: ${targetFrogName}, 聲音路徑: ${targetFrogSound}`);
                    console.log(`比較路徑: 青蛙聲音=${nearestFrog.sound}, 音頻路徑=${path}`);
                }
                
                // 如果是最近的青蛙且距離小於閾值
                if (nearestFrog && path === nearestFrog.sound && minDistance < soundThreshold) {
                    // 調整音量 - 距離越近音量越大
                    const newVolume = calculateVolume(minDistance, soundThreshold);
                    audio.volume = newVolume;
                    
                    // 更新當前播放的聲音
                    if (playingSound !== path) {
                        console.log(`切換到新的聲音: ${path} (音量: ${newVolume.toFixed(2)})`);
                        setPlayingSound(path);
                    }
                } else {
                    // 不是最近的青蛙或距離太遠，將音量設置為0
                    audio.volume = 0;
                    
                    // 如果這是當前播放的聲音，但現在不是最近的，重置當前播放狀態
                    if (playingSound === path && (nearestFrog?.sound !== path || minDistance >= soundThreshold)) {
                        console.log(`靜音: ${path}`);
                        // 不需要設置為 null，因為我們只是調整音量而不停止播放
                    }
                }
            });
        },
        [frogs, playingSound, calculateVolume, handleUserInteraction, userInteracted]
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
            // 檢查接近性，無論遊戲是否結束
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
    }, [checkFrogProximity]);

    // 組件卸載時停止所有音頻
    useEffect(() => {
        return () => {
            // 停止所有預加載的音頻
            Object.values(preloadedAudios).forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
            
            // 也停止當前的 audioRef
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            
            console.log("已停止所有音頻播放");
        };
    }, []);

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

    // 計時器
    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft <= 0 && !gameOver) {
            endGame(false);
        }
    }, [timeLeft, gameOver, endGame]);

    // 在進入遊戲頁面時，自動模擬一次點擊以解鎖音頻
    useEffect(() => {
        // 頁面加載後，延遲一段時間，模擬用戶點擊
        const autoUnlockTimer = setTimeout(() => {
            // 創建一個點擊事件並觸發
            const simulatedClick = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            document.dispatchEvent(simulatedClick);
        }, 1000);

        return () => clearTimeout(autoUnlockTimer);
    }, [handleUserInteraction]);  // 依賴 handleUserInteraction 函數

    // 初始音頻設置和頁面可見性變化處理
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && !userInteracted) {
                // 如果頁面變為可見且用戶尚未互動，嘗試自動解鎖音頻
                handleUserInteraction();
            }
        };

        // 添加額外的互動事件監聽器來解鎖音頻
        const unlockAudioOnUserGesture = () => {
            if (!userInteracted) {
                handleUserInteraction();
            }
        };

        // 添加各種互動事件監聽器來更好地捕獲第一次互動
        document.addEventListener('click', unlockAudioOnUserGesture);
        document.addEventListener('touchstart', unlockAudioOnUserGesture);
        document.addEventListener('touchend', unlockAudioOnUserGesture);
        document.addEventListener('mousedown', unlockAudioOnUserGesture);
        document.addEventListener('keydown', unlockAudioOnUserGesture);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // 頁面首次加載時嘗試自動解鎖音頻（大多數情況下會失敗，但值得一試）
        setTimeout(() => {
            if (!userInteracted) {
                handleUserInteraction();
            }
        }, 500);
        
        return () => {
            document.removeEventListener('click', unlockAudioOnUserGesture);
            document.removeEventListener('touchstart', unlockAudioOnUserGesture);
            document.removeEventListener('touchend', unlockAudioOnUserGesture);
            document.removeEventListener('mousedown', unlockAudioOnUserGesture);
            document.removeEventListener('keydown', unlockAudioOnUserGesture);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userInteracted, handleUserInteraction]);

    // 確保遊戲結束後青蛙位置一定會顯示
    useEffect(() => {
        if (gameOver) {
            // 如果遊戲結束但 showFrogPositions 沒有在 3 秒內設置為 true，強制設置
            const forceShowTimer = setTimeout(() => {
                if (!showFrogPositions) {
                    console.log('強制顯示青蛙位置');
                    setShowFrogPositions(true);
                }
            }, 3000);
            
            return () => clearTimeout(forceShowTimer);
        }
    }, [gameOver, showFrogPositions]);

    return (
        <div
            ref={containerRef}
            className={styles.container}
            onClick={(e) => {
                handleClick(e);
                handleUserInteraction(); // 確保處理用戶互動
            }}
            onMouseMove={() => {
                // 滑鼠移動也視為互動（解鎖音頻）
                if (!userInteracted) {
                    handleUserInteraction();
                }
            }}
        >
            {/* 頂部欄 */}
            <div className={styles.gameHeader}>
                <div className={styles.timer}>倒數: {timeLeft}秒</div>
                <div className={styles.attempts}>剩餘機會: {attempts}</div>
                <div className={styles.target}>目標: 找到{targetFrogName}</div>
            </div>
            {/* 消息顯示區 */}
            {message && !gameOver && <div className={styles.message}>{message}</div>}
            
            {/* 遊戲結束消息 - 短暫顯示後被青蛙位置覆蓋 */}
            {gameOver && !showFrogPositions && message && (
                <div className={`${styles.gameOverMessage} ${message.includes("太棒了") ? styles.winMessage : styles.loseMessage}`}>
                    {message}
                </div>
            )}
            
            {/* 音頻加載指示器 */}
            {isLoading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}></div>
                    <div className={styles.loadingText}>加載音頻中...</div>
                </div>
            )}

            {/* 青蛙位置覆蓋層 - 遊戲結束時顯示 */}
            {showFrogPositions && (
                <div className={styles.frogPositionsOverlay} style={{ pointerEvents: 'auto' }}>
                    {/* 頂部控制欄 - 與資訊欄相同位置和樣式 */}
                    <div className={styles.frogPositionsHeader} style={{ pointerEvents: 'auto' }}>
                        <div className={styles.headerLeft}></div>
                        <div className={styles.frogPositionsTitle}>
                            所有青蛙位置 : 共有 {frogs.length} 隻青蛙
                        </div>
                        <div className={styles.headerRight} style={{ pointerEvents: 'auto' }}>
                            <button 
                                className={styles.backToHomeButton}
                                onClick={onBack}
                                style={{ pointerEvents: 'auto', cursor: 'pointer' }}  // 確保按鈕可以點擊
                            >
                                返回首頁
                            </button>
                        </div>
                    </div>
                    
                    {/* 青蛙位置容器 - 用於定位青蛙標記 */}
                    <div className={styles.frogPositionsContainer} style={{ pointerEvents: 'auto' }}>
                        {frogs.map((frog) => (
                            <div
                                key={frog.id}
                                className={`${styles.frogMarker} ${
                                    frog.type === targetFrogName
                                        ? styles.targetFrog
                                        : ""
                                }`}
                                style={{
                                    position: 'absolute',
                                    left: `${frog.x}%`,
                                    top: `${frog.y}%`,
                                    transform: 'translate(-50%, -50%)'
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
            {/* 隱藏的音頻元素 - 作為備用播放器 */}
            <audio ref={audioRef} preload="auto" />
        </div>
    );
}

