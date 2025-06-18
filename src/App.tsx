// src/App.tsx
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import IntroPage from "./pages/IntroPage";
import TargetFrogPage from "./pages/TargetFrogPage";
import GamePage from "./pages/GamePage";
import "./App.css";

export default function App() {
    const [currentPage, setCurrentPage] = useState("home");
    
    // 可用的青蛙種類與其對應的音頻檔案
    const frogTypesWithAudio = [
        { name: "黑眶蟾蜍", audioFile: "黑眶蟾蜍.mp3" },
        { name: "諸羅樹蛙", audioFile: "諸羅樹蛙.mp3" },
        { name: "小雨樹蛙", audioFile: "小雨樹蛙.mp3" },
        { name: "太田樹蛙", audioFile: "太田樹蛙.mp3" },
        { name: "斑腿樹蛙", audioFile: "斑腿樹蛙.mp3" }
    ];
    
    // 隨機選擇的目標青蛙
    const [targetFrog, setTargetFrog] = useState(() => {
        const randomIndex = Math.floor(Math.random() * frogTypesWithAudio.length);
        return frogTypesWithAudio[randomIndex];
    });

    // 隨機選擇新的目標青蛙的函數
    const selectRandomFrog = () => {
        const randomIndex = Math.floor(Math.random() * frogTypesWithAudio.length);
        setTargetFrog(frogTypesWithAudio[randomIndex]);
    };

    // 開始遊戲時選擇新的隨機青蛙
    const handleStartGame = () => {
        selectRandomFrog();
        setCurrentPage("game1");
    };

    useEffect(() => {
        // 如果當前頁面是 game2，不創建/顯示全局游標
        if (currentPage === "game2") {
            // 找到現有的游標元素並隱藏它
            const existingCursor = document.querySelector(
                ".custom-cursor"
            ) as HTMLElement;
            if (existingCursor) {
                existingCursor.style.display = "none";
            }
            return;
        }

        // 對其他頁面，正常顯示游標
        const cursor =
            (document.querySelector(".custom-cursor") as HTMLElement) ||
            document.createElement("div");

        if (!document.querySelector(".custom-cursor")) {
            cursor.classList.add("custom-cursor");
            document.body.appendChild(cursor);
        } else {
            // 確保游標顯示
            cursor.style.display = "block";
        }

        const moveCursor = (e: MouseEvent): void => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        };

        const clickEffect = (): void => {
            cursor.classList.add("clicking");
            setTimeout(() => {
                cursor.classList.remove("clicking");
            }, 300);
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mousedown", clickEffect);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mousedown", clickEffect);
        };
    }, [currentPage]); // 依賴於 currentPage，頁面變化時重新執行

    return (
        // use className to determine the page style by CSS
        <div className={`${currentPage}-page`}>
            {currentPage === "home" && (
                <HomePage
                    onStart={handleStartGame}
                    onIntro={() => setCurrentPage("intro")}
                />
            )}
            {currentPage === "intro" && (
                <IntroPage onBack={() => setCurrentPage("home")} />
            )}
            {currentPage === "game1" && (
                <TargetFrogPage 
                    targetFrog={targetFrog.name}
                    onContinue={() => setCurrentPage("game2")} 
                />
            )}
            {currentPage === "game2" && (
                <GamePage
                    targetFrogName={targetFrog.name}
                    targetFrogSound={`frog_sound/${targetFrog.audioFile}`}
                    onWin={() => {
                        // 不要立即導航，讓 GamePage 處理遊戲結束邏輯
                        console.log('遊戲勝利');
                    }}
                    onLose={() => {
                        // 不要立即導航，讓 GamePage 處理遊戲結束邏輯
                        console.log('遊戲失敗');
                    }}
                    onBack={() => setCurrentPage("home")}
                />
            )}
        </div>
    );
}
