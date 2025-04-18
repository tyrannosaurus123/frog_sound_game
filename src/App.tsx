import { useState } from "react";
import "./App.css";

function App() {
    const [currentPage, setCurrentPage] = useState("home");

    const renderHomePage = () => {
        return (
            <div className='container'>
                <h1 className='title'>青蛙聲探</h1>

                <button
                    className='button start'
                    onClick={() => setCurrentPage("game")}
                >
                    🎮 開始遊戲
                </button>

                <button
                    className='button intro'
                    onClick={() => setCurrentPage("intro")}
                >
                    📖 遊戲介紹
                </button>

                <img src='/frog.png' alt='frog' className='frog-img' />
            </div>
        );
    };

    const renderGamePage = () => {
        return (
            <div className='container'>
                <h2>遊戲頁面</h2>
                {/* 此處可加入遊戲邏輯 */}
                <button
                    className='button'
                    onClick={() => setCurrentPage("home")}
                >
                    返回首頁
                </button>
            </div>
        );
    };

    const renderIntroPage = () => {
        return (
            <div className='container'>
                <h2>遊戲介紹</h2>
                <p>這是一個關於青蛙聲音辨識的有趣遊戲...</p>
                <button
                    className='button'
                    onClick={() => setCurrentPage("home")}
                >
                    返回首頁
                </button>
            </div>
        );
    };

    // 根據當前頁面狀態渲染不同內容
    return (
        <>
            {currentPage === "home" && renderHomePage()}
            {currentPage === "game" && renderGamePage()}
            {currentPage === "intro" && renderIntroPage()}
        </>
    );
}

export default App;
