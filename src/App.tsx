// src/App.tsx
import { useState } from "react";
import { useEffect } from "react";
import HomePage from "./pages/HomePage";
import IntroPage from "./pages/IntroPage";
import TargetFrogPage from "./pages/TargetFrogPage";
import GamePage from "./pages/GamePage";
import "./App.css";

export default function App() {
    const [currentPage, setCurrentPage] = useState("home");
    useEffect(() => {
        const cursor =
            (document.querySelector(".custom-cursor") as HTMLElement) ||
            document.createElement("div");
        if (!document.querySelector(".custom-cursor")) {
            cursor.classList.add("custom-cursor");
            document.body.appendChild(cursor);
        }

        const moveCursor = (e: MouseEvent): void => {
            (cursor as HTMLElement).style.left = `${e.clientX}px`;
            (cursor as HTMLElement).style.top = `${e.clientY}px`;
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
    }, []);
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
                    targetFrogName='default'
                    targetFrogSound='default'
                    onWin={() => setCurrentPage("home")}
                    onLose={() => setCurrentPage("home")}
                    onBack={() => setCurrentPage("home")}
                />
            )}
        </div>
    );
}
