import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Users, User, Eye, EyeOff, Clock, Volume2, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { usePerformers } from '../contexts/PerformersContext';

const TimelinePage: React.FC = () => {
  const { performers, performanceActions, addPerformer, deletePerformer, updatePerformer, addPerformanceAction, updatePerformanceAction, deletePerformanceAction } = usePerformers();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPerformers, setSelectedPerformers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'selected'>('all');
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [editingPerformer, setEditingPerformer] = useState<string | null>(null);
  const [showAddPerformer, setShowAddPerformer] = useState(false);
  const [newPerformer, setNewPerformer] = useState({ name: '', position: '', color: '#8b5cf6' });
  const [editFormData, setEditFormData] = useState({ name: '', position: '', color: '#8b5cf6' });
  const [editingAction, setEditingAction] = useState<number | null>(null);
  const [showAddAction, setShowAddAction] = useState(false);
  const [newAction, setNewAction] = useState({
    timeSeconds: 0,
    time: '0:00',
    action: '',
    actionDetail: '',
    formation: '',
    lyrics: '',
    performerIds: [] as string[]
  });
  const [actionEditData, setActionEditData] = useState({
    timeSeconds: 0,
    time: '0:00',
    action: '',
    actionDetail: '',
    formation: '',
    lyrics: '',
    performerIds: [] as string[]
  });
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
        action.performerIds?.includes(performer.id) ||
        action.action.includes(performer.name) || 
        action.actionDetail.includes(performer.name)
      )
    );
  };

  // 演技者別のアクションを取得
  const getPerformerSpecificActions = (performerId: string) => {
    const performer = performers.find(p => p.id === performerId);
    if (!performer) return [];
    
    return performanceActions.filter(action => 
      action.performerIds?.includes(performerId) ||
      action.action.includes(performer.name) || 
      action.actionDetail.includes(performer.name)
    );
  };

  const filteredActions = getFilteredActions();
  const currentAction = filteredActions[currentIndex] || null;
  const nextAction = filteredActions[currentIndex + 1] || null;

  // 音楽制御
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
  const goToNextAction = () => {
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

  // 演技者追加
  const handleAddPerformer = () => {
    if (newPerformer.name && newPerformer.position) {
      addPerformer(newPerformer);
      setNewPerformer({ name: '', position: '', color: '#8b5cf6' });
      setShowAddPerformer(false);
    }
  };

  // 演技者削除
  const handleDeletePerformer = (performerId: string) => {
    if (window.confirm('この演技者を削除しますか？関連するタイムライン情報も削除されます。')) {
      deletePerformer(performerId);
      setSelectedPerformers(prev => prev.filter(id => id !== performerId));
    }
  };

  // 編集開始
  const startEditPerformer = (performer: any) => {
    setEditingPerformer(performer.id);
    setEditFormData({
      name: performer.name,
      position: performer.position,
      color: performer.color
    });
  };

  // 編集保存
  const saveEditPerformer = () => {
    if (editingPerformer && editFormData.name && editFormData.position) {
      updatePerformer(editingPerformer, editFormData);
      setEditingPerformer(null);
      setEditFormData({ name: '', position: '', color: '#8b5cf6' });
    }
  };

  // 編集キャンセル
  const cancelEditPerformer = () => {
    setEditingPerformer(null);
    setEditFormData({ name: '', position: '', color: '#8b5cf6' });
  };

  // 時間を秒数から文字列に変換
  const formatTimeFromSeconds = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 時間を文字列から秒数に変換
  const parseTimeToSeconds = (timeString: string): number => {
    const [mins, secs] = timeString.split(':').map(Number);
    return mins * 60 + secs;
  };

  // アクション追加
  const handleAddAction = () => {
    if (newAction.action && newAction.time) {
      const timeSeconds = parseTimeToSeconds(newAction.time);
      addPerformanceAction({
        ...newAction,
        timeSeconds,
        performerIds: viewMode === 'selected' ? selectedPerformers : []
      });
      setNewAction({
        timeSeconds: 0,
        time: '0:00',
        action: '',
        actionDetail: '',
        formation: '',
        lyrics: '',
        performerIds: []
      });
      setShowAddAction(false);
    }
  };

  // アクション編集開始
  const startEditAction = (index: number) => {
    const action = filteredActions[index];
    setEditingAction(index);
    setActionEditData({
      timeSeconds: action.timeSeconds,
      time: action.time,
      action: action.action,
      actionDetail: action.actionDetail,
      formation: action.formation,
      lyrics: action.lyrics,
      performerIds: action.performerIds || []
    });
  };

  // アクション編集保存
  const saveEditAction = () => {
    if (editingAction !== null && actionEditData.action && actionEditData.time) {
      const timeSeconds = parseTimeToSeconds(actionEditData.time);
      const originalIndex = performanceActions.findIndex(action => 
        action === filteredActions[editingAction]
      );
      
      if (originalIndex !== -1) {
        updatePerformanceAction(originalIndex, {
          ...actionEditData,
          timeSeconds
        });
      }
      
      setEditingAction(null);
      setActionEditData({
        timeSeconds: 0,
        time: '0:00',
        action: '',
        actionDetail: '',
        formation: '',
        lyrics: '',
        performerIds: []
      });
    }
  };

  // アクション編集キャンセル
  const cancelEditAction = () => {
    setEditingAction(null);
    setActionEditData({
      timeSeconds: 0,
      time: '0:00',
      action: '',
      actionDetail: '',
      formation: '',
      lyrics: '',
      performerIds: []
    });
  };

  // アクション削除
  const handleDeleteAction = (index: number) => {
    if (window.confirm('このアクションを削除しますか？')) {
      const originalIndex = performanceActions.findIndex(action => 
        action === filteredActions[index]
      );
      
      if (originalIndex !== -1) {
        deletePerformanceAction(originalIndex);
      }
    }
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
          <h3 className="text-lg font-semibold">演技者管理</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddPerformer(!showAddPerformer)}
              className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors"
            >
              <Plus size={14} className="mr-1" />
              演技者追加
            </button>
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
        </div>

        {/* 演技者追加フォーム */}
        {showAddPerformer && (
          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-md font-semibold mb-3">新しい演技者を追加</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">演技者名</label>
                <input
                  type="text"
                  value={newPerformer.name}
                  onChange={(e) => setNewPerformer({ ...newPerformer, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                  placeholder="例: 演技者E"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ポジション</label>
                <input
                  type="text"
                  value={newPerformer.position}
                  onChange={(e) => setNewPerformer({ ...newPerformer, position: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                  placeholder="例: 中列左"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">カラー</label>
                <div className="flex space-x-2">
                  {['#ef4444', '#3b82f6', '#10b981', '#eab308', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'].map(color => (
                    <button
                      key={color}
                      onClick={() => setNewPerformer({ ...newPerformer, color })}
                      className="w-8 h-8 rounded"
                      style={{ 
                        backgroundColor: color,
                        border: newPerformer.color === color ? '2px solid white' : '1px solid gray'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowAddPerformer(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddPerformer}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {performers.map((performer) => (
            <div
              key={performer.id}
              className={`p-3 rounded-lg border-2 transition-colors ${
                selectedPerformers.includes(performer.id)
                  ? 'border-blue-400 bg-blue-900/30'
                  : 'border-gray-600 bg-gray-700'
              }`}
            >
              {editingPerformer === performer.id ? (
                // 編集モード
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    placeholder="演技者名"
                  />
                  <input
                    type="text"
                    value={editFormData.position}
                    onChange={(e) => setEditFormData({ ...editFormData, position: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    placeholder="ポジション"
                  />
                  <div className="flex flex-wrap gap-1">
                    {['#ef4444', '#3b82f6', '#10b981', '#eab308', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'].map(color => (
                      <button
                        key={color}
                        onClick={() => setEditFormData({ ...editFormData, color })}
                        className="w-6 h-6 rounded"
                        style={{ 
                          backgroundColor: color,
                          border: editFormData.color === color ? '2px solid white' : '1px solid gray'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end space-x-1">
                    <button
                      onClick={cancelEditPerformer}
                      className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={saveEditPerformer}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                    >
                      <Save size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <>
                  <div 
                    className="cursor-pointer"
                    onClick={() => togglePerformerSelection(performer.id)}
                  >
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-4 h-4 rounded-full mr-2"
                        style={{ backgroundColor: performer.color }}
                      />
                      <div className="text-left flex-1">
                        <div className="text-sm font-medium">{performer.name}</div>
                        <div className="text-xs text-gray-400">{performer.position}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {selectedPerformers.includes(performer.id) ? '選択中' : ''}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditPerformer(performer)}
                        className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        title="編集"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeletePerformer(performer.id)}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        title="削除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
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
                type="button"
                title="前の動作"
                onClick={previousAction}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                disabled={currentIndex === 0}
              >
                <SkipBack size={20} />
              </button>
              <button 
                type="button"
                title={isPlaying ? "一時停止" : "再生"}
                onClick={togglePlayPause}
                className={`p-2 rounded transition-colors ${
                  isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                }`}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button 
                type="button"
                title="タイマーリセット"
                onClick={resetTimer}
                className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
              >
                <RotateCcw size={20} />
              </button>
              <button 
                type="button"
                title="次の動作"
                onClick={goToNextAction}
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
                title="音量調整"
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
          {/* 現在の動作・次の動作（1人選択時のみ表示） */}
          {selectedPerformers.length === 1 && (
            <>
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
            </>
          )}

          {/* タイムライン表示 */}
          {viewMode === 'all' ? (
            // 全体表示：全演技者のタイムラインを水平並列表示
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">全体タイムライン - 全演技者</h3>
                <button
                  onClick={() => setShowAddAction(!showAddAction)}
                  className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors"
                >
                  <Plus size={14} className="mr-1" />
                  アクション追加
                </button>
              </div>

              {/* アクション追加フォーム */}
              {showAddAction && (
                <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-md font-semibold mb-3">新しいアクションを追加</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">時間</label>
                      <input
                        type="text"
                        value={newAction.time}
                        onChange={(e) => setNewAction({ ...newAction, time: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="例: 1:30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">楽曲・セクション</label>
                      <input
                        type="text"
                        value={newAction.lyrics}
                        onChange={(e) => setNewAction({ ...newAction, lyrics: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="例: サビ部分"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">隊形</label>
                      <input
                        type="text"
                        value={newAction.formation}
                        onChange={(e) => setNewAction({ ...newAction, formation: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="例: ①"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">動作</label>
                      <input
                        type="text"
                        value={newAction.action}
                        onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="例: トーチを回転"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">動作詳細</label>
                      <textarea
                        value={newAction.actionDetail}
                        onChange={(e) => setNewAction({ ...newAction, actionDetail: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        rows={2}
                        placeholder="詳細な動作の説明"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setShowAddAction(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleAddAction}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                    >
                      追加
                    </button>
                  </div>
                </div>
              )}

              {/* 全演技者のタイムラインを水平並列表示 */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                {performers.map((performer) => {
                  const performerActions = getPerformerSpecificActions(performer.id);
                  return (
                    <div key={performer.id} className="bg-gray-800 rounded-lg p-3 flex-shrink-0 w-80">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: performer.color }}
                          />
                          <span className="font-medium text-sm">{performer.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {performerActions.length > 0 ? performerActions.map((action, actionIndex) => (
                          <div
                            key={actionIndex}
                            className={`p-2 rounded text-sm border-l-2 ${
                              actionIndex === currentIndex && filteredActions.includes(action)
                                ? 'bg-blue-800 border-blue-400 text-blue-100'
                                : actionIndex === currentIndex + 1 && filteredActions.includes(action)
                                  ? 'bg-yellow-800 border-yellow-400 text-yellow-100'
                                  : 'bg-gray-700 border-transparent text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium">{action.time}</span>
                              <span className="text-xs text-gray-400">隊形{action.formation}</span>
                            </div>
                            <div className="font-medium mb-1 truncate">{action.action}</div>
                            <div className="text-xs text-gray-400 mb-1 truncate">{action.actionDetail}</div>
                            <div className="text-xs text-gray-500 truncate">{action.lyrics}</div>
                          </div>
                        )) : (
                          <div className="p-2 text-gray-500 text-sm text-center">
                            このタイムラインにはアクションがありません
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // 個別演技者タイムライン表示（水平並列）
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {displayedPerformers.map((performer) => {
                const performerActions = getPerformerSpecificActions(performer.id);
                return (
                  <div key={performer.id} className="bg-gray-800 rounded-lg p-3 flex-shrink-0 w-80">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: performer.color }}
                        />
                        <h3 className="text-md font-semibold">{performer.name}</h3>
                        <span className="ml-1 text-xs text-gray-400">({performer.position})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                          {performerActions.length}件
                        </span>
                        <button
                          onClick={() => {
                            setNewAction({ ...newAction, performerIds: [performer.id] });
                            setShowAddAction(!showAddAction);
                          }}
                          className="flex items-center px-1 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-1 max-h-80 overflow-y-auto">
                      {performerActions.length > 0 ? (
                        performerActions.map((action, actionIndex) => {
                          const globalIndex = filteredActions.findIndex(a => a === action);
                          return (
                            <div
                              key={actionIndex}
                              className={`p-2 rounded border-l-2 transition-colors text-xs ${
                                globalIndex === currentIndex
                                  ? 'bg-blue-800 border-blue-400'
                                  : globalIndex === currentIndex + 1
                                    ? 'bg-yellow-800 border-yellow-400'
                                    : 'bg-gray-700 hover:bg-gray-600'
                              }`}
                              style={{ borderLeftColor: performer.color }}
                            >
                              <div className="flex justify-between items-start">
                                <div 
                                  className="flex-1 cursor-pointer min-w-0"
                                  onClick={() => {
                                    if (globalIndex !== -1) {
                                      setCurrentIndex(globalIndex);
                                      setCurrentTime(action.timeSeconds);
                                      if (audioRef.current) {
                                        audioRef.current.currentTime = action.timeSeconds;
                                      }
                                    }
                                  }}
                                >
                                  <div className="flex items-center space-x-1 mb-1">
                                    <span className="font-mono text-xs text-blue-300">{action.time}</span>
                                    <span className="text-xs text-gray-400 truncate">{action.lyrics}</span>
                                  </div>
                                  <div className="font-medium text-yellow-400 text-xs mb-1 line-clamp-2">{action.action}</div>
                                  <div className="text-xs text-gray-300 line-clamp-2">{action.actionDetail}</div>
                                </div>
                                <div className="flex flex-col items-end space-y-1 ml-2">
                                  {globalIndex === currentIndex && (
                                    <div className="text-blue-300 text-xs font-bold">現在</div>
                                  )}
                                  {globalIndex === currentIndex + 1 && (
                                    <div className="text-yellow-300 text-xs font-bold">次</div>
                                  )}
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => startEditAction(globalIndex)}
                                      className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                      title="編集"
                                    >
                                      <Edit3 size={10} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAction(globalIndex)}
                                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                                      title="削除"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-400 py-4 text-xs">
                          アクションなし
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* アクション追加フォーム（選択モード用） */}
              {showAddAction && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-semibold mb-3">新しいアクションを追加</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">時間</label>
                      <input
                        type="text"
                        value={newAction.time}
                        onChange={(e) => setNewAction({ ...newAction, time: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="例: 1:30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">楽曲・セクション</label>
                      <input
                        type="text"
                        value={newAction.lyrics}
                        onChange={(e) => setNewAction({ ...newAction, lyrics: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="例: サビ部分"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">隊形</label>
                      <input
                        type="text"
                        value={newAction.formation}
                        onChange={(e) => setNewAction({ ...newAction, formation: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="例: ①"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">動作</label>
                      <input
                        type="text"
                        value={newAction.action}
                        onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        placeholder="例: トーチを回転"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">動作詳細</label>
                      <textarea
                        value={newAction.actionDetail}
                        onChange={(e) => setNewAction({ ...newAction, actionDetail: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                        rows={2}
                        placeholder="詳細な動作の説明"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setShowAddAction(false)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleAddAction}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                    >
                      追加
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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