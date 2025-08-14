import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Clock, Music } from 'lucide-react';

const App = () => {
  // 演技データ（最新のExcelファイルから抽出、動き名列を表示名として使用）
  const performanceData = [
    { time: '0:00', timeSeconds: 0, lyrics: '尺八独奏', formation: '①', action: '中央側にトーチをおいてしゃがみ待機', actionDetail: '中央側にトーチをおいてしゃがみ待機' },
    { time: '0:21', timeSeconds: 21, lyrics: '琴の演奏', formation: '①', action: '前列から順番に左右に開いて立ち上がり、上で待機', actionDetail: '前列から順番に左右に開いて立ち上がる→上で待機' },
    { time: '0:32', timeSeconds: 32, lyrics: 'ベースのスラップ', formation: '①', action: '上から下へ両手下げる', actionDetail: 'ベースのスラップ音に合わせて上から下へ移動' },
    { time: '0:36', timeSeconds: 36, lyrics: 'ベースのスラップ', formation: '①', action: '下から上へ両手あげる', actionDetail: 'ベースのスラップ音に合わせて下から上へ移動' },
    { time: '0:40', timeSeconds: 40, lyrics: 'ベースのスラップ', formation: '①', action: '上から下へ片手下げる', actionDetail: 'ベースのスラップ音に合わせて上から下へ移動(片手だけ)' },
    { time: '0:44', timeSeconds: 44, lyrics: 'ベースのスラップ', formation: '①', action: '下から上へ片手あげる', actionDetail: 'ベースのスラップ音に合わせて上から下へ移動(片手だけ)' },
    { time: '0:49', timeSeconds: 49, lyrics: '前奏(16拍)', formation: '①→②', action: '前回し移動', actionDetail: '移動' },
    { time: '0:53', timeSeconds: 53, lyrics: '前奏(16拍)', formation: '①→②', action: '待機', actionDetail: '待機' },
    { time: '1:06', timeSeconds: 66, lyrics: '青い時間~(16拍)', formation: '②', action: '4拍車輪を4回', actionDetail: '4拍車輪×4' },
    { time: '1:14', timeSeconds: 74, lyrics: '訪れてた~(16拍)', formation: '②', action: '4拍車輪ずらしを4回', actionDetail: '4拍車輪ずらし×4' },
    { time: '1:22', timeSeconds: 82, lyrics: '間奏(16拍)', formation: '②', action: 'シャギ, ダブルひまわり,止め', actionDetail: 'シャギ→ダブルひまわり→止め' },
    { time: '1:30', timeSeconds: 90, lyrics: '終わりが無いと～(16拍)', formation: '②', action: '小メガネ 4回, NTTからミッキー を2回', actionDetail: '小メガネ×4、NTT→ミッキー×2' },
    { time: '1:38', timeSeconds: 98, lyrics: '自分で築いた～(16拍)', formation: '②', action: '門ずらしを4回', actionDetail: '門ずらし×4' },
    { time: '1:47', timeSeconds: 107, lyrics: 'なぜ歩き～(32拍)', formation: '②', action: 'ゆっくり片門2回, 門,NTT,止め', actionDetail: '片門×2(左右合わせて)→門→NTT→止め' },
    { time: '2:03', timeSeconds: 123, lyrics: 'そうして何も～(16拍)', formation: '②', action: 'チキンウェーブ\n2拍目、15拍目', actionDetail: 'チキン 2/16\nチキン15/16' },
    { time: '2:11', timeSeconds: 131, lyrics: '超え～(8拍)', formation: '②', action: '2,3,4,5拍チキン', actionDetail: '止\nチキン\nチキン\nチキン\nチキン\n止\n止\n止' },
    { time: '2:15', timeSeconds: 135, lyrics: '今打ち鳴らす～(16拍)', formation: '②', action: '大車輪2回, 小車輪2回, 4拍車輪ずらし2回', actionDetail: '大車輪×2→小車輪×2→4拍車輪ずらし×2' },
    { time: '2:24', timeSeconds: 144, lyrics: '朝焼けが～(8拍)', formation: '②', action: '8拍車輪ずらし', actionDetail: '8拍車輪ずらし' },
    { time: '2:28', timeSeconds: 148, lyrics: 'ぐしゃぐしゃに～', formation: '②', action: '大車輪→左で止める\nゆっくり上へ', actionDetail: '大車輪→左で止める\n止\nゆっくり上へ' },
    { time: '2:35', timeSeconds: 155, lyrics: '天樂を~間奏(32拍)', formation: '②→③', action: 'シャギ, ダブルひまわり,前回し移動', actionDetail: 'シャギ→ダブルひまわり→前まわしに移行して移動' },
    { time: '2:53', timeSeconds: 173, lyrics: '削れたピック～(16拍)', formation: '③', action: 'しゃがみ待機', actionDetail: 'しゃがみ待機' },
    { time: '3:01', timeSeconds: 181, lyrics: '通り過ぎた~(16拍)', formation: '③', action: '大車輪2回, 小車輪2回, 4拍車輪ずらし2回', actionDetail: '大車輪×2→4拍車輪→8拍車輪' },
    { time: '3:09', timeSeconds: 189, lyrics: '間奏(16拍)', formation: '③', action: 'チキン,止め,トーチで音を鳴らす  を4回', actionDetail: 'チキン→止め→トーチで音を鳴らす×4' },
    { time: '3:18', timeSeconds: 198, lyrics: '尺八ソロ(16拍)', formation: '③', action: '希望者ソロパート(2人)', actionDetail: '希望者ソロパート(2人)' },
    { time: '3:26', timeSeconds: 206, lyrics: 'ギターソロ(16拍)', formation: '③', action: '待機', actionDetail: '' },
    { time: '3:34', timeSeconds: 214, lyrics: 'なぜ立ち止まり～(32拍)', formation: '③', action: 'ゆっくり片門2回, 門,NTT,止め', actionDetail: '片門×2(左右合わせて)→門→NTT→止め' },
    { time: '3:50', timeSeconds: 230, lyrics: 'そうして悩み～(8拍)', formation: '③', action: '2,6拍シャギ', actionDetail: '止\nシャギ\n止\n止\n止\nシャギ\n止\n止' },
    { time: '3:54', timeSeconds: 234, lyrics: '芽生え狂い咲く~(16拍)', formation: '③→④', action: '2,6拍シャギ, 8拍待機', actionDetail: '止\nシャギ\n止\n止\n止\nシャギ\n止\n止\n待機(8泊)' },
    { time: '4:03', timeSeconds: 243, lyrics: '今打ち鳴らす～(16拍)', formation: '④', action: '大車輪2回, 小車輪2回, 4拍車輪ずらし2回', actionDetail: '大車輪×2→小車輪×2→4拍車輪ずらし×2' },
    { time: '4:11', timeSeconds: 251, lyrics: '眼が眩むほど～(8拍)', formation: '④', action: '8拍車輪ずらし', actionDetail: '8拍車輪ずらし' },
    { time: '4:15', timeSeconds: 255, lyrics: '泡沫に～', formation: '④', action: '大車輪→左で止める\nゆっくり上へ', actionDetail: '大車輪→左で止める\n止\nゆっくり上へ' },
    { time: '4:23', timeSeconds: 263, lyrics: '天樂を～(8拍)', formation: '④', action: 'お好きに8拍', actionDetail: '好きな技をやろう！' },
    { time: '4:27', timeSeconds: 267, lyrics: '今咲き誇る～(16拍)', formation: '④', action: '大車輪2回, 小車輪2回, 4拍車輪ずらし2回', actionDetail: '大車輪×2→小車輪×2→4拍車輪ずらし×2' },
    { time: '4:36', timeSeconds: 276, lyrics: '朝焼けが～(8拍)', formation: '④', action: '8拍車輪ずらし', actionDetail: '8拍車輪ずらし' },
    { time: '4:40', timeSeconds: 280, lyrics: 'その核に~', formation: '④', action: '大車輪→左で止める\nゆっくり上へ', actionDetail: '大車輪→左で止める\n止\nゆっくり上へ' },
    { time: '4:50', timeSeconds: 290, lyrics: '天樂を～', formation: '④', action: '高速小車輪', actionDetail: '一回大車輪して可能な限り高速で小車輪ドラムの音を聞いてゆっくり上へ' },
    { time: '5:02', timeSeconds: 302, lyrics: '掛け声', formation: '④', action: '目の前を切るイメージで〆', actionDetail: '目の前を切るイメージで〆' }
  ];

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcedMoves, setAnnouncedMoves] = useState(new Set());
  const intervalRef = useRef(null);

  // 音声読み上げ機能
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // 既存の読み上げを停止
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 1.2; // 少し早めに読み上げ
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // 次の振り付けの3秒前チェック
  const checkUpcomingMove = (currentTime) => {
    const nextMove = performanceData.find(move => 
      move.timeSeconds > currentTime && 
      move.timeSeconds - currentTime <= 3 &&
      !announcedMoves.has(move.timeSeconds)
    );

    if (nextMove) {
      setAnnouncedMoves(prev => new Set([...prev, nextMove.timeSeconds]));
      const announcement = `次は、${nextMove.action}`;
      speakText(announcement);
    }
  };

  // 現在の時間に基づいて適切な演技を見つける
  const findCurrentPerformance = (time) => {
    for (let i = performanceData.length - 1; i >= 0; i--) {
      if (time >= performanceData[i].timeSeconds) {
        return i;
      }
    }
    return 0;
  };

  // タイマー処理
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const newIndex = findCurrentPerformance(newTime);
          setCurrentIndex(newIndex);
          
          // 次の振り付けの3秒前チェック
          checkUpcomingMove(newTime);
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, announcedMoves]);

  // 時間を mm:ss 形式に変換
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 再生/一時停止
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // リセット
  const reset = () => {
    setCurrentTime(0);
    setCurrentIndex(0);
    setIsPlaying(false);
    setAnnouncedMoves(new Set()); // 読み上げ履歴もリセット
    window.speechSynthesis.cancel(); // 音声読み上げを停止
  };

  // 前の振り付けに移動
  const previousMove = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentTime(performanceData[newIndex].timeSeconds);
    }
  };

  // 次の振り付けに移動
  const nextMove = () => {
    if (currentIndex < performanceData.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentTime(performanceData[newIndex].timeSeconds);
    }
  };

  // 特定の時間に移動
  const jumpToTime = (index) => {
    setCurrentIndex(index);
    setCurrentTime(performanceData[index].timeSeconds);
    setIsPlaying(false);
    // ジャンプ時は、その時点より前の読み上げ履歴をクリア
    const currentTimeSeconds = performanceData[index].timeSeconds;
    setAnnouncedMoves(prev => {
      const newSet = new Set();
      prev.forEach(time => {
        if (time <= currentTimeSeconds) {
          newSet.add(time);
        }
      });
      return newSet;
    });
    window.speechSynthesis.cancel(); // 音声読み上げを停止
  };

  const currentPerformance = performanceData[currentIndex];
  const nextPerformance = currentIndex < performanceData.length - 1 ? performanceData[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      {/* タイトル */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-400">演技練習サポート</h1>
      </div>

      {/* 時間表示とコントロールボタンを同じ行に */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* タイマー表示 */}
          <div className="flex items-center">
            <Clock className="mr-2 text-blue-400" />
            <span className="text-4xl font-mono font-bold text-blue-400">{formatTime(currentTime)}</span>
          </div>
          
          {/* コントロールボタン */}
          <div className="flex space-x-4">
            <button
              onClick={previousMove}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
              disabled={currentIndex === 0}
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={nextMove}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
              disabled={currentIndex === performanceData.length - 1}
            >
              <SkipForward size={20} />
            </button>
            <button
              onClick={reset}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 現在の演技情報 - 左右並べて表示 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 現在の振り付け */}
        <div className="bg-green-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <Music className="mr-2" size={18} />
            現在の振り付け
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-green-300 font-semibold text-sm">時間:</span>
              <span className="ml-2 text-xl font-mono">{currentPerformance.time}</span>
            </div>
            <div>
              <span className="text-green-300 font-semibold text-sm">歌詞:</span>
              <span className="ml-2 text-sm">{currentPerformance.lyrics}</span>
            </div>
            <div>
              <span className="text-green-300 font-semibold text-sm">隊形:</span>
              <span className="ml-2 text-lg font-bold">{currentPerformance.formation}</span>
            </div>
            <div>
              <span className="text-green-300 font-semibold text-sm">動き:</span>
              <div className="ml-2 p-2 bg-green-900 rounded mt-2">
                <div className="text-lg font-bold text-yellow-400 mb-1">{currentPerformance.action}</div>
                <div className="text-xs whitespace-pre-line">{currentPerformance.actionDetail}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 次の振り付け */}
        <div className="bg-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3">次の振り付け</h3>
          {nextPerformance ? (
            <div className="space-y-2">
              <div>
                <span className="text-blue-300 font-semibold text-sm">時間:</span>
                <span className="ml-2 text-xl font-mono">{nextPerformance.time}</span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold text-sm">歌詞:</span>
                <span className="ml-2 text-sm">{nextPerformance.lyrics}</span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold text-sm">隊形:</span>
                <span className="ml-2 text-lg font-bold">{nextPerformance.formation}</span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold text-sm">動き:</span>
                <div className="ml-2 p-2 bg-blue-900 rounded mt-2">
                  <div className="text-lg font-bold text-yellow-300 mb-1">{nextPerformance.action}</div>
                  <div className="text-xs whitespace-pre-line opacity-75">{nextPerformance.actionDetail}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-blue-300 py-6">
              <div className="text-base font-semibold">演技終了</div>
              <div className="text-xs mt-1">お疲れ様でした！</div>
            </div>
          )}
        </div>
      </div>

      {/* 演技タイムライン */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">演技タイムライン</h3>
        <div className="space-y-2">
          {performanceData.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded cursor-pointer transition-colors ${
                index === currentIndex 
                  ? 'bg-green-700 border-l-4 border-green-400' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => jumpToTime(index)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="font-mono text-sm text-blue-300">{item.time}</span>
                  <span className="ml-4 text-sm">{item.lyrics}</span>
                  <span className="ml-4 text-xs text-gray-400">隊形: {item.formation}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-yellow-400">{item.action}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 使い方の説明 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-bold mb-2 text-gray-300">使い方:</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• 再生ボタンで音楽に合わせたタイマーを開始</li>
          <li>• タイムラインをクリックして特定の振り付けに移動</li>
          <li>• 現在の振り付けが緑色で、次の振り付けが青色で表示されます</li>
          <li>• 矢印ボタンで前後の振り付けに移動できます</li>
          <li>• 🔊 次の振り付けの3秒前に音声で動きを読み上げます</li>
        </ul>
      </div>
    </div>
  );
};

export default App;→前まわしに移行して移動' },
    { time: '2:53', timeSeconds: 173, lyrics: '削れたピック～(16拍)', formation: '③', action: 'しゃがみ待機', actionDetail: 'しゃがみ待機' },
    { time: '3:01', timeSeconds: 181, lyrics: '通り過ぎた~(16拍)', formation: '③', action: '大車輪2回, 小車輪2回, 4拍車輪ずらし2回', actionDetail: '大車輪×2→4拍車輪→8拍車輪' },
    { time: '3:09', timeSeconds: 189, lyrics: '間奏(16拍)', formation: '③', action: 'チキン,止め,トーチで音を鳴らす  を4回', actionDetail: 'チキン→止め→トーチで音を鳴らす×4' },
    { time: '3:18', timeSeconds: 198, lyrics: '尺八ソロ(16拍)', formation: '③', action: '希望者ソロパート(2人)', actionDetail: '希望者ソロパート(2人)' },
    { time: '3:26', timeSeconds: 206, lyrics: 'ギターソロ(16拍)', formation: '③', action: '待機', actionDetail: '' },
    { time: '3:34', timeSeconds: 214, lyrics: 'なぜ立ち止まり～(32拍)', formation: '③', action: 'ゆっくり片門2回, 門,NTT,止め', actionDetail: '片門×2(左右合わせて)→門→NTT→止め' },
    { time: '3:50', timeSeconds: 230, lyrics: 'そうして悩み～(8拍)', formation: '③', action: '2,6拍シャギ', actionDetail: '止\nシャギ\n止\n止\n止\nシャギ\n止\n止' },
    { time: '3:54', timeSeconds: 234, lyrics: '芽生え狂い咲く~(16拍)', formation: '③→④', action: '2,6拍シャギ, 8拍待機', actionDetail: '止\nシャギ\n止\n止\n止\nシャギ\n止\n止\n待機(8泊)' },
    { time: '4:03', timeSeconds: 243, lyrics: '今打ち鳴らす～(16拍)', formation: '④', action: '大車輪2回, 小車輪2回, 4拍車輪ずらし2回', actionDetail: '大車輪×2→小車輪×2→4拍車輪ずらし×2' },
    { time: '4:11', timeSeconds: 251, lyrics: '眼が眩むほど～(8拍)', formation: '④', action: '8拍車輪ずらし', actionDetail: '8拍車輪ずらし' },
    { time: '4:15', timeSeconds: 255, lyrics: '泡沫に～', formation: '④', action: '大車輪→左で止める\nゆっくり上へ', actionDetail: '大車輪→左で止める\n止\nゆっくり上へ' },
    { time: '4:23', timeSeconds: 263, lyrics: '天樂を～(8拍)', formation: '④', action: 'お好きに8拍', actionDetail: '好きな技をやろう！' },
    { time: '4:27', timeSeconds: 267, lyrics: '今咲き誇る～(16拍)', formation: '④', action: '大車輪2回, 小車輪2回, 4拍車輪ずらし2回', actionDetail: '大車輪×2→小車輪×2→4拍車輪ずらし×2' },
    { time: '4:36', timeSeconds: 276, lyrics: '朝焼けが～(8拍)', formation: '④', action: '8拍車輪ずらし', actionDetail: '8拍車輪ずらし' },
    { time: '4:40', timeSeconds: 280, lyrics: 'その核に~', formation: '④', action: '大車輪→左で止める\nゆっくり上へ', actionDetail: '大車輪→左で止める\n止\nゆっくり上へ' },
    { time: '4:50', timeSeconds: 290, lyrics: '天樂を～', formation: '④', action: '高速小車輪', actionDetail: '一回大車輪して可能な限り高速で小車輪ドラムの音を聞いてゆっくり上へ' },
    { time: '5:02', timeSeconds: 302, lyrics: '掛け声', formation: '④', action: '目の前を切るイメージで〆', actionDetail: '目の前を切るイメージで〆' }
  ];

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [announcedMoves, setAnnouncedMoves] = useState(new Set());
  const intervalRef = useRef(null);

  // 音声読み上げ機能
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // 既存の読み上げを停止
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 1.2; // 少し早めに読み上げ
      utterance.volume = 0.8;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // 次の振り付けの3秒前チェック
  const checkUpcomingMove = (currentTime) => {
    const nextMove = performanceData.find(move => 
      move.timeSeconds > currentTime && 
      move.timeSeconds - currentTime <= 3 &&
      !announcedMoves.has(move.timeSeconds)
    );

    if (nextMove) {
      setAnnouncedMoves(prev => new Set([...prev, nextMove.timeSeconds]));
      const announcement = `次は、${nextMove.action}`;
      speakText(announcement);
    }
  };

  // 現在の時間に基づいて適切な演技を見つける
  const findCurrentPerformance = (time) => {
    for (let i = performanceData.length - 1; i >= 0; i--) {
      if (time >= performanceData[i].timeSeconds) {
        return i;
      }
    }
    return 0;
  };

  // タイマー処理
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          const newIndex = findCurrentPerformance(newTime);
          setCurrentIndex(newIndex);
          
          // 次の振り付けの3秒前チェック
          checkUpcomingMove(newTime);
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, announcedMoves]);

  // 時間を mm:ss 形式に変換
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 再生/一時停止
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // リセット
  const reset = () => {
    setCurrentTime(0);
    setCurrentIndex(0);
    setIsPlaying(false);
    setAnnouncedMoves(new Set()); // 読み上げ履歴もリセット
    window.speechSynthesis.cancel(); // 音声読み上げを停止
  };

  // 前の振り付けに移動
  const previousMove = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentTime(performanceData[newIndex].timeSeconds);
    }
  };

  // 次の振り付けに移動
  const nextMove = () => {
    if (currentIndex < performanceData.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentTime(performanceData[newIndex].timeSeconds);
    }
  };

  // 特定の時間に移動
  const jumpToTime = (index) => {
    setCurrentIndex(index);
    setCurrentTime(performanceData[index].timeSeconds);
    setIsPlaying(false);
    // ジャンプ時は、その時点より前の読み上げ履歴をクリア
    const currentTimeSeconds = performanceData[index].timeSeconds;
    setAnnouncedMoves(prev => {
      const newSet = new Set();
      prev.forEach(time => {
        if (time <= currentTimeSeconds) {
          newSet.add(time);
        }
      });
      return newSet;
    });
    window.speechSynthesis.cancel(); // 音声読み上げを停止
  };

  const currentPerformance = performanceData[currentIndex];
  const nextPerformance = currentIndex < performanceData.length - 1 ? performanceData[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white min-h-screen">
      {/* タイトル */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-400">演技練習サポート</h1>
      </div>

      {/* 時間表示とコントロールボタンを同じ行に */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* タイマー表示 */}
          <div className="flex items-center">
            <Clock className="mr-2 text-blue-400" />
            <span className="text-4xl font-mono font-bold text-blue-400">{formatTime(currentTime)}</span>
          </div>
          
          {/* コントロールボタン */}
          <div className="flex space-x-4">
            <button
              onClick={previousMove}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
              disabled={currentIndex === 0}
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={nextMove}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
              disabled={currentIndex === performanceData.length - 1}
            >
              <SkipForward size={20} />
            </button>
            <button
              onClick={reset}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 現在の演技情報 - 左右並べて表示 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 現在の振り付け */}
        <div className="bg-green-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3 flex items-center">
            <Music className="mr-2" size={18} />
            現在の振り付け
          </h3>
          <div className="space-y-2">
            <div>
              <span className="text-green-300 font-semibold text-sm">時間:</span>
              <span className="ml-2 text-xl font-mono">{currentPerformance.time}</span>
            </div>
            <div>
              <span className="text-green-300 font-semibold text-sm">歌詞:</span>
              <span className="ml-2 text-sm">{currentPerformance.lyrics}</span>
            </div>
            <div>
              <span className="text-green-300 font-semibold text-sm">隊形:</span>
              <span className="ml-2 text-lg font-bold">{currentPerformance.formation}</span>
            </div>
            <div>
              <span className="text-green-300 font-semibold text-sm">動き:</span>
              <div className="ml-2 p-2 bg-green-900 rounded mt-2">
                <div className="text-lg font-bold text-yellow-400 mb-1">{currentPerformance.action}</div>
                <div className="text-xs whitespace-pre-line">{currentPerformance.actionDetail}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 次の振り付け */}
        <div className="bg-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3">次の振り付け</h3>
          {nextPerformance ? (
            <div className="space-y-2">
              <div>
                <span className="text-blue-300 font-semibold text-sm">時間:</span>
                <span className="ml-2 text-xl font-mono">{nextPerformance.time}</span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold text-sm">歌詞:</span>
                <span className="ml-2 text-sm">{nextPerformance.lyrics}</span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold text-sm">隊形:</span>
                <span className="ml-2 text-lg font-bold">{nextPerformance.formation}</span>
              </div>
              <div>
                <span className="text-blue-300 font-semibold text-sm">動き:</span>
                <div className="ml-2 p-2 bg-blue-900 rounded mt-2">
                  <div className="text-lg font-bold text-yellow-300 mb-1">{nextPerformance.action}</div>
                  <div className="text-xs whitespace-pre-line opacity-75">{nextPerformance.actionDetail}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-blue-300 py-6">
              <div className="text-base font-semibold">演技終了</div>
              <div className="text-xs mt-1">お疲れ様でした！</div>
            </div>
          )}
        </div>
      </div>

      {/* 演技タイムライン */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">演技タイムライン</h3>
        <div className="space-y-2">
          {performanceData.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded cursor-pointer transition-colors ${
                index === currentIndex 
                  ? 'bg-green-700 border-l-4 border-green-400' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => jumpToTime(index)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className="font-mono text-sm text-blue-300">{item.time}</span>
                  