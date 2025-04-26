import "./IntroPage.module.css";

type Props = {
    onBack: () => void;
};

export default function IntroPage({ onBack }: Props) {
    return (
        <div className='container'>
            <h2>遊戲介紹</h2>
            <p>這是一個關於青蛙聲音辨識的有趣遊戲...</p>
            <button className='button' onClick={onBack}>
                返回首頁
            </button>
        </div>
    );
}
