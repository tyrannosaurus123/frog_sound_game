// src/App.tsx
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import IntroPage from "./pages/IntroPage";
import TargetFrogPage from "./pages/TargetFrogPage";
import GamePage from "./pages/GamePage";
import "./App.css";

export default function App() {
    const [currentPage, setCurrentPage] = useState("home");

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
                    onStart={() => setCurrentPage("game1")}
                    onIntro={() => setCurrentPage("intro")}
                />
            )}
            {currentPage === "intro" && (
                <IntroPage onBack={() => setCurrentPage("home")} />
            )}
            {currentPage === "game1" && (
                <TargetFrogPage onContinue={() => setCurrentPage("game2")} />
            )}
            {currentPage === "game2" && (
                <GamePage
                    targetFrogName='黑眶蟾蜍'
                    targetFrogSound='/frog_sound/黑眶蟾蜍.mp3'
                    onWin={() => setCurrentPage("home")}
                    onLose={() => setCurrentPage("home")}
                    onBack={() => setCurrentPage("home")}
                />
            )}
        </div>
    );
}
