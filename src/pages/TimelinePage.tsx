import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Users, User, Eye, EyeOff, Clock, Volume2 } from 'lucide-react';
import { usePerformers } from '../contexts/PerformersContext';

const TimelinePage: React.FC = () => {
  const { performers, performanceActions, uploadedMusic } = usePerformers();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPerformers, setSelectedPerformers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'selected'>('all');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastSpokenIndexRef = useRef<number>(-1);

  // 音声読み上げ設定
  const speakText = (text: string) => {
    if (!speechEnabled) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = volume;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 表示する演技者を決定
  const displayedPerformers = viewMode === 'all' 
    ? performers 
    : performers.filter(p => selectedPerformers.includes(p.id));

  // 表示する演技者に関連するアクションのみをフィルタリング
  const getFilteredActions = () => {
    if (viewMode === 'all') {
      return performanceActions;
    }
    return performanceActions.filter(action => 
      displayedPerformers.some(performer => 
        action.action.includes(performer.name) || 
        action.actionDetail.includes(performer.name)
      )
    );
  };

  const filteredActions = getFilteredActions();
  const currentAction = filteredActions[currentIndex] || null;
  const nextAction = filteredActions[currentIndex + 1] || null;

  // 音楽制御
  useEffect(() => {
    if (uploadedMusic && audioRef.current) {
      audioRef.current.src = uploadedMusic.url;
      audioRef.current.volume = volume;
    }
  }, [uploadedMusic, volume]);

  // 再生制御
  const togglePlayPause = () => {
    if (isPlaying) {
      // 停止
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // 再生開始
      if (currentAction && audioRef.current) {
        audioRef.current.currentTime = currentAction.timeSeconds;
        audioRef.current.play();
      }
      
      setIsPlaying(true);
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
  };

  // タイマーリセット
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentIndex(0);
    lastSpokenIndexRef.current = -1;
  };

  // 前の動作
  const previousAction = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentTime(filteredActions[newIndex].timeSeconds);
      
      if (audioRef.current) {
        audioRef.current.currentTime = filteredActions[newIndex].timeSeconds;
      }
    }
  };

  // 次の動作
  const nextAction = () => {
    if (currentIndex < filteredActions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentTime(filteredActions[newIndex].timeSeconds);
      
      if (audioRef.current) {
        audioRef.current.currentTime = filteredActions[newIndex].timeSeconds;
      }
    }
  };

  // 演技者選択の切り替え
  const togglePerformerSelection = (performerId: string) => {
    setSelectedPerformers(prev => 
      prev.includes(performerId)
        ? prev.filter(id => id !== performerId)
        : [...prev, performerId]
    );
  };

  // 全演技者選択/解除
  const toggleAllPerformers = () => {
    setSelectedPerformers(prev => 
      prev.length === performers.length ? [] : performers.map(p => p.id)
    );
  };

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 自動進行チェック
  useEffect(() => {
    if (isPlaying && currentAction) {
      // 次の動作の3秒前に音声告知
      const timeUntilNext = nextAction ? nextAction.timeSeconds - currentTime : Infinity;
      
      if (timeUntilNext === 3 && lastSpokenIndexRef.current !== currentIndex + 1) {
        const announcement = `次は、${nextAction?.action}`;
        speakText(announcement);
        lastSpokenIndexRef.current = currentIndex + 1;
      }
      
      // 現在の動作時間を過ぎたら次に進む
      if (nextAction && currentTime >= nextAction.timeSeconds) {
        setCurrentIndex(prev => prev + 1);
      }
    }
  }, [currentTime, isPlaying, currentAction, nextAction, currentIndex]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* ページタイトルと表示切り替え */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="mr-3" size={24} />
          <h2 className="text-2xl font-bold">演技タイムライン</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* 表示モード切り替え */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center px-3 py-2 rounded text-sm transition-colors ${
                viewMode === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <Users size={16} className="mr-1" />
              全体表示
            </button>
            <button
              onClick={() => setViewMode('selected')}
              className={`flex items-center px-3 py-2 rounded text-sm transition-colors ${
                viewMode === 'selected' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <User size={16} className="mr-1" />
              選択表示 ({selectedPerformers.length})
            </button>
          </div>
        </div>
      </div>

      {/* 演技者選択パネル */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">演技者選択</h3>
          <button
            onClick={toggleAllPerformers}
            className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
          >
            {selectedPerformers.length === performers.length ? (
              <>
                <EyeOff size={14} className="mr-1" />
                全て解除
              </>
            ) : (
              <>
                <Eye size={14} className="mr-1" />
                全て選択
              </>
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {performers.map((performer) => (
            <button
              key={performer.id}
              onClick={() => togglePerformerSelection(performer.id)}
              className={`p-2 rounded-lg border-2 transition-colors ${
                selectedPerformers.includes(performer.id)
                  ? 'border-blue-400 bg-blue-900/30'
                  : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: performer.color }} // Tailwindで表現できない場合はCSS変数で対応
                />
                <div className="text-left">
                  <div className="text-sm font-medium">{performer.name}</div>
                  <div className="text-xs text-gray-400">{performer.position}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-3 text-sm text-gray-400">
          {viewMode === 'selected' && selectedPerformers.length === 0 && (
            <p className="text-yellow-400">⚠️ 演技者を選択してください</p>
          )}
          {viewMode === 'selected' && selectedPerformers.length > 0 && (
            <p>{selectedPerformers.length}人の演技者のタイムラインを表示中</p>
          )}
          {viewMode === 'all' && (
            <p>全演技者のタイムラインを表示中</p>
          )}
        </div>
      </div>

      {/* 再生制御 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button 
                onClick={previousAction}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                disabled={currentIndex === 0}
              >
                <SkipBack size={20} />
              </button>
              <button 
                onClick={togglePlayPause}
                className={`p-2 rounded transition-colors ${
                  isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                onClick={nextAction}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                disabled={currentIndex === filteredActions.length - 1}
              >
                <SkipForward size={20} />
              </button>
            </div>
            
            <div className="text-blue-300 font-mono text-lg">
              {formatTime(currentTime)}
            </div>
          </div>
          
          {/* 音声制御 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Volume2 size={16} className="text-gray-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20"
              />
            </div>
            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                speechEnabled 
                  ? 'bg-green-700 text-green-100' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              音声{speechEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 mb-2">
          {filteredActions.length > 0 ? (
            <>動作 {currentIndex + 1} / {filteredActions.length}</>
          ) : (
            <>表示する動作がありません</>
          )}
        </div>
      </div>

      {/* タイムライン表示 */}
      {filteredActions.length > 0 ? (
        <div className="space-y-4">
          {/* 現在の動作 */}
          {currentAction && (
            <div className="bg-blue-900 border-l-4 border-blue-400 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-blue-100">現在の動作</h3>
                <span className="text-blue-300 font-mono text-lg">{currentAction.time}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-100">
                <div>
                  <span className="text-blue-300 text-sm">楽曲・セクション:</span>
                  <p className="font-medium">{currentAction.lyrics}</p>
                </div>
                <div>
                  <span className="text-blue-300 text-sm">隊形:</span>
                  <p className="font-medium">{currentAction.formation}</p>
                </div>
                <div>
                  <span className="text-blue-300 text-sm">動作:</span>
                  <p className="font-medium text-yellow-300">{currentAction.action}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-blue-300 text-sm">詳細:</span>
                <p className="text-blue-100">{currentAction.actionDetail}</p>
              </div>
            </div>
          )}

          {/* 次の動作 */}
          {nextAction && (
            <div className="bg-gray-800 border-l-4 border-yellow-400 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-yellow-100">次の動作</h3>
                <span className="text-yellow-300 font-mono">{nextAction.time}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300">
                <div>
                  <span className="text-yellow-300 text-sm">楽曲・セクション:</span>
                  <p>{nextAction.lyrics}</p>
                </div>
                <div>
                  <span className="text-yellow-300 text-sm">隊形:</span>
                  <p>{nextAction.formation}</p>
                </div>
                <div>
                  <span className="text-yellow-300 text-sm">動作:</span>
                  <p className="font-medium text-yellow-200">{nextAction.action}</p>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-yellow-300 text-sm">詳細:</span>
                <p className="text-gray-300">{nextAction.actionDetail}</p>
              </div>
            </div>
          )}

          {/* 全タイムライン */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              {viewMode === 'all' ? '全体タイムライン' : '選択演技者タイムライン'}
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredActions.map((action, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border-l-4 ${
                    index === currentIndex
                      ? 'bg-blue-800 border-blue-400'
                      : index === currentIndex + 1
                        ? 'bg-yellow-800 border-yellow-400'
                        : 'bg-gray-700 border-transparent hover:bg-gray-600'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentTime(action.timeSeconds);
                    if (audioRef.current) {
                      audioRef.current.currentTime = action.timeSeconds;
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-mono text-sm text-blue-300">{action.time}</span>
                        <span className="text-sm text-gray-400">{action.lyrics}</span>
                        <span className="text-xs text-gray-500">隊形: {action.formation}</span>
                      </div>
                      <div className="font-semibold text-yellow-400">{action.action}</div>
                      <div className="text-sm text-gray-300 mt-1">{action.actionDetail}</div>
                    </div>
                    {index === currentIndex && (
                      <div className="text-blue-300 text-sm font-bold">現在</div>
                    )}
                    {index === currentIndex + 1 && (
                      <div className="text-yellow-300 text-sm font-bold">次</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-lg">
            {viewMode === 'selected' && selectedPerformers.length === 0
              ? '演技者を選択してください'
              : '表示するタイムラインがありません'
            }
          </div>
        </div>
      )}

      {/* 音楽プレーヤー（非表示） */}
      <audio ref={audioRef} />
    </div>
  );
};

export default TimelinePage;