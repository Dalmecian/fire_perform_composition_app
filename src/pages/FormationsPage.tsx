import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Eye, Users, RotateCcw, Play, Pause, Save, Edit3, Lock, SkipBack, SkipForward, Clock, Plus, Trash2 } from 'lucide-react';
import { usePerformers } from '../contexts/PerformersContext';

const FormationsPage: React.FC = () => {
  const [selectedFormation, setSelectedFormation] = useState<string>('1');
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggedPerformer, setDraggedPerformer] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef<number | null>(null);
  const [transitionDuration, setTransitionDuration] = useState(2000);
  const [showPerformerManagement, setShowPerformerManagement] = useState(false);
  const [newPerformer, setNewPerformer] = useState({ name: '', position: '', color: '#8b5cf6' });
  
  const { performers, formations, addPerformer, deletePerformer, updateFormation } = usePerformers();
  
  // ローカル状態をグローバル状態と同期
  const [localFormations, setLocalFormations] = useState(formations);
  
  useEffect(() => {
    setLocalFormations(formations);
  }, [formations]);
  
  // 使用する隊形データを切り替え
  const activeFormations = hasUnsavedChanges ? localFormations : formations;

  const currentFormation = activeFormations.find(f => f.id === selectedFormation) || activeFormations[0];

  // ドラッグ開始
  const handleMouseDown = useCallback((e: React.MouseEvent, performerId: string) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    setDraggedPerformer(performerId);
    setIsDragging(true);
    
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    });
  }, [isEditMode]);

  // ドラッグ中
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !draggedPerformer || !stageRef.current) return;
    
    const stageRect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - dragOffset.x - stageRect.left) / stageRect.width) * 100;
    const y = ((e.clientY - dragOffset.y - stageRect.top) / stageRect.height) * 100;
    
    // ステージ境界内に制限
    const boundedX = Math.max(5, Math.min(95, x));
    const boundedY = Math.max(10, Math.min(90, y));
    
    // リアルタイムで位置を更新
    setLocalFormations(prev => prev.map(formation => {
      if (formation.id === selectedFormation) {
        return {
          ...formation,
          positions: {
            ...formation.positions,
            [draggedPerformer]: {
              ...formation.positions[draggedPerformer],
              x: boundedX,
              y: boundedY
            }
          }
        };
      }
      return formation;
    }));
    
    setHasUnsavedChanges(true);
  }, [isDragging, draggedPerformer, dragOffset, selectedFormation]);

  // ドラッグ終了
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedPerformer(null);
  }, []);

  // 編集モードの切り替え
  const toggleEditMode = () => {
    if (isEditMode && hasUnsavedChanges) {
      if (window.confirm('変更が保存されていません。編集を終了しますか？')) {
        setIsEditMode(false);
        setHasUnsavedChanges(false);
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  // 変更を保存
  const saveChanges = () => {
    localFormations.forEach(formation => {
      updateFormation(formation.id, formation);
    });
    setHasUnsavedChanges(false);
    alert('隊形の変更を保存しました！');
  };

  // 変更をリセット
  const resetChanges = () => {
    if (window.confirm('変更をリセットしますか？')) {
      setLocalFormations(formations);
      setHasUnsavedChanges(false);
    }
  };

  // 現在の時間に基づいて適切な隊形を見つける
  const findCurrentFormation = (time: number) => {
    for (let i = activeFormations.length - 1; i >= 0; i--) {
      if (time >= activeFormations[i].timeSeconds) {
        return activeFormations[i];
      }
    }
    return activeFormations[0];
  };

  // 次の隊形を見つける
  const findNextFormation = (currentFormation: any) => {
    const currentIndex = activeFormations.findIndex(f => f.id === currentFormation.id);
    return currentIndex < activeFormations.length - 1 ? activeFormations[currentIndex + 1] : null;
  };

  // 演技者の位置を補間する
  const interpolatePosition = (start: {x: number, y: number}, end: {x: number, y: number}, progress: number) => {
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress
    };
  };

  // 自動再生の開始/停止
  const toggleAutoPlay = () => {
    if (isAutoPlaying) {
      // 停止
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsAutoPlaying(false);
    } else {
      // 開始
      setIsAutoPlaying(true);
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const maxTime = Math.max(...activeFormations.map(f => f.timeSeconds));
          const newTime = prev + (1 * playbackSpeed);
          
          if (newTime > maxTime + 5) {
            // 終了したらリセット
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
  };

  // 自動再生のリセット
  const resetAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsAutoPlaying(false);
    setCurrentTime(0);
  };

  // 前の隊形に移動
  const previousFormation = () => {
    const currentIndex = activeFormations.findIndex(f => f.id === selectedFormation);
    if (currentIndex > 0) {
      const prevFormation = activeFormations[currentIndex - 1];
      setSelectedFormation(prevFormation.id);
      setCurrentTime(prevFormation.timeSeconds);
    }
  };

  // 次の隊形に移動
  const nextFormation = () => {
    const currentIndex = activeFormations.findIndex(f => f.id === selectedFormation);
    if (currentIndex < activeFormations.length - 1) {
      const nextFormation = activeFormations[currentIndex + 1];
      setSelectedFormation(nextFormation.id);
      setCurrentTime(nextFormation.timeSeconds);
    }
  };

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 自動再生時の隊形選択更新
  useEffect(() => {
    if (isAutoPlaying) {
      const currentFormation = findCurrentFormation(currentTime);
      if (currentFormation.id !== selectedFormation) {
        setSelectedFormation(currentFormation.id);
      }
    }
  }, [currentTime, isAutoPlaying, selectedFormation]);

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 自動再生中の演技者位置を計算
  const getAnimatedPositions = () => {
    if (!isAutoPlaying) return currentFormation.positions;
    
    const currentFormationData = findCurrentFormation(currentTime);
    const nextFormationData = findNextFormation(currentFormationData);
    
    if (!nextFormationData) return currentFormationData.positions;
    
    // 現在の隊形の開始時間から次の隊形までの進行度を計算
    const startTime = currentFormationData.timeSeconds;
    const endTime = nextFormationData.timeSeconds;
    const progress = Math.max(0, Math.min(1, (currentTime - startTime) / (endTime - startTime)));
    
    // 補間された位置を計算
    const animatedPositions: { [key: string]: { x: number; y: number; color: string; name: string } } = {};
    
    Object.keys(currentFormationData.positions).forEach(performerId => {
      const startPos = currentFormationData.positions[performerId];
      const endPos = nextFormationData.positions[performerId];
      
      if (startPos && endPos) {
        const interpolatedPos = interpolatePosition(startPos, endPos, progress);
        animatedPositions[performerId] = {
          ...startPos,
          x: interpolatedPos.x,
          y: interpolatedPos.y
        };
      } else {
        animatedPositions[performerId] = startPos;
      }
    });
    
    return animatedPositions;
  };

  const animatedPositions = getAnimatedPositions();
  
  // 演技者管理関数
  const handleAddPerformer = () => {
    if (newPerformer.name && newPerformer.position) {
      addPerformer(newPerformer);
      setNewPerformer({ name: '', position: '', color: '#8b5cf6' });
      setShowPerformerManagement(false);
    }
  };

  const handleDeletePerformer = (id: string) => {
    if (window.confirm('この演技者を削除しますか？隊形からも削除されます。')) {
      deletePerformer(id);
    }
  };
  
  const colorOptions = [
    '#ef4444', '#3b82f6', '#10b981', '#eab308', 
    '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
  ];

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Eye className="mr-3" size={24} />
          <h2 className="text-2xl font-bold">隊形</h2>
          {isEditMode && (
            <span className="ml-3 px-2 py-1 bg-orange-600 text-white text-sm rounded">
              編集モード
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isEditMode && hasUnsavedChanges && (
            <>
              <button
                onClick={resetChanges}
                className="flex items-center px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <RotateCcw size={16} className="mr-1" />
                リセット
              </button>
              <button
                onClick={saveChanges}
                className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                <Save size={16} className="mr-1" />
                保存
              </button>
            </>
          )}
          <button
            onClick={toggleEditMode}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isEditMode 
                ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isEditMode ? <Lock size={16} className="mr-2" /> : <Edit3 size={16} className="mr-2" />}
            {isEditMode ? '編集終了' : '編集開始'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 隊形リスト */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="mr-2" size={18} />
              隊形一覧
            </h3>
            <div className="space-y-2">
              {formations.map((formation) => (
                <div
                  key={formation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                    selectedFormation === formation.id
                      ? 'border-blue-400 bg-gray-700'
                      : 'border-transparent bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setSelectedFormation(formation.id)}
                >
                  <div className="font-medium">{formation.name}</div>
                  <div className="text-sm text-gray-400">{formation.time}</div>
                  <div className="text-xs text-gray-500 mt-1">{formation.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 演技者管理 */}
          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-semibold">演技者管理</h4>
              <button
                onClick={() => setShowPerformerManagement(!showPerformerManagement)}
                className="flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
              >
                <Plus size={12} className="mr-1" />
                追加
              </button>
            </div>
            
            {/* 演技者追加フォーム */}
            {showPerformerManagement && (
              <div className="mb-4 p-3 bg-gray-700 rounded">
                <h5 className="text-sm font-medium mb-2">新しい演技者</h5>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="演技者名"
                    value={newPerformer.name}
                    onChange={(e) => setNewPerformer({ ...newPerformer, name: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <input
                    type="text"
                    placeholder="ポジション"
                    value={newPerformer.position}
                    onChange={(e) => setNewPerformer({ ...newPerformer, position: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                  />
                  <div className="flex flex-wrap gap-1 mb-2">
                    {colorOptions.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewPerformer({ ...newPerformer, color })}
                        className="w-6 h-6 rounded"
                        style={{ 
                          backgroundColor: color,
                          border: newPerformer.color === color ? '2px solid white' : '1px solid gray'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowPerformerManagement(false)}
                      className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white text-xs rounded transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleAddPerformer}
                      className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors"
                    >
                      追加
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 演技者一覧 */}
            <div className="space-y-2">
              {performers.map((performer) => (
                <div key={performer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2"
                      style={{ backgroundColor: performer.color }}
                    />
                    <span className="text-sm">{performer.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeletePerformer(performer.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 隊形可視化エリア */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{currentFormation.name}</h3>
              <div className="text-sm text-gray-400">
                {currentFormation.time} - {currentFormation.description}
              </div>
            </div>

            {/* ステージエリア */}
            <div 
              ref={stageRef}
              className={`relative bg-gray-900 rounded-lg border-2 aspect-video transition-colors ${
                isEditMode ? 'border-orange-500' : 'border-gray-600'
              }`}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {isEditMode && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-orange-600 text-white text-xs px-2 py-1 rounded">
                    ドラッグで移動
                  </div>
                </div>
              )}
              {/* ステージ前方インジケーター */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                  観客席
                </div>
              </div>

              {/* グリッドライン（オプション） */}
              <div className="absolute inset-0 opacity-20">
                {/* 縦のグリッドライン */}
                <div className="absolute left-1/4 top-0 h-full w-px bg-gray-600" />
                <div className="absolute left-1/2 top-0 h-full w-px bg-gray-600" />
                <div className="absolute left-3/4 top-0 h-full w-px bg-gray-600" />
                {/* 横のグリッドライン */}
                <div className="absolute top-1/4 left-0 w-full h-px bg-gray-600" />
                <div className="absolute top-1/2 left-0 w-full h-px bg-gray-600" />
                <div className="absolute top-3/4 left-0 w-full h-px bg-gray-600" />
              </div>

              {/* 演技者の位置 */}
              {Object.entries(animatedPositions).map(([id, performer]) => (
                <div
                  key={id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all ${
                    isEditMode 
                      ? 'cursor-grab active:cursor-grabbing' 
                      : 'cursor-pointer'
                  } ${
                    draggedPerformer === id ? 'z-20 scale-110' : 'z-10'
                  }`}
                  style={{ 
                    left: `${performer.x}%`, 
                    top: `${performer.y}%`,
                  }}
                  onMouseDown={(e) => handleMouseDown(e, id)}
                >
                  {/* 演技者アイコン */}
                  <div
                    className={`w-8 h-8 rounded-full border-2 shadow-lg ${
                      isAutoPlaying ? 'transition-all duration-1000 ease-in-out' : 'transition-all'
                    } ${
                      isEditMode 
                        ? 'border-white hover:border-orange-300' 
                        : 'border-white group-hover:scale-110'
                    } ${
                      draggedPerformer === id ? 'border-orange-400 shadow-xl' : ''
                    } ${
                      isAutoPlaying ? 'border-green-400' : ''
                    }`}
                    style={{ backgroundColor: performer.color }}
                  >
                    {isEditMode && (
                      <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full" />
                    )}
                  </div>
                  
                  {/* ラベル */}
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
                    <div className={`text-white text-xs px-2 py-1 rounded whitespace-nowrap ${
                      isEditMode ? 'bg-orange-800 bg-opacity-90' : 'bg-black bg-opacity-75'
                    }`}>
                      {performer.name}
                    </div>
                  </div>
                  
                  {/* ホバー時の詳細情報 */}
                  <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                      {isEditMode 
                        ? `位置: (${Math.round(performer.x)}%, ${Math.round(performer.y)}%) - ドラッグで移動` 
                        : `位置: (${Math.round(performer.x)}%, ${Math.round(performer.y)}%)`}
                    </div>
                  </div>
                  
                  {/* 編集モード時の移動ガイド */}
                  {isEditMode && draggedPerformer === id && (
                    <div className="absolute -inset-2 border-2 border-orange-400 border-dashed rounded-full animate-pulse" />
                  )}
                </div>
              ))}

              {/* ステージ後方インジケーター */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                  ステージ後方
                </div>
              </div>
            </div>

            {/* タイムライン制御 */}
            <div className="mt-4 bg-gray-700 rounded-lg p-4">
              {/* 再生制御 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={previousFormation}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                      disabled={formations.findIndex(f => f.id === selectedFormation) === 0}
                    >
                      <SkipBack size={16} />
                    </button>
                    <button 
                      onClick={toggleAutoPlay}
                      className={`p-2 rounded transition-colors ${
                        isAutoPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                      }`}
                    >
                      {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button 
                      onClick={resetAutoPlay}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button 
                      onClick={nextFormation}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                      disabled={formations.findIndex(f => f.id === selectedFormation) === formations.length - 1}
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>
                  
                  {/* 現在時間表示 */}
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="font-mono text-blue-400">{formatTime(currentTime)}</span>
                  </div>
                </div>
                
                {/* 再生速度調整 */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">速度:</span>
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    disabled={isAutoPlaying}
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>
              
              {/* タイムラインバー */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>0:00</span>
                  <span>{formatTime(Math.max(...formations.map(f => f.timeSeconds)) + 5)}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(...formations.map(f => f.timeSeconds)) + 5}
                    value={currentTime}
                    onChange={(e) => {
                      const time = parseFloat(e.target.value);
                      setCurrentTime(time);
                      const formation = findCurrentFormation(time);
                      setSelectedFormation(formation.id);
                    }}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    disabled={isAutoPlaying}
                  />
                  
                  {/* 隊形マーカー */}
                  {formations.map((formation, index) => {
                    const maxTime = Math.max(...formations.map(f => f.timeSeconds)) + 5;
                    const position = (formation.timeSeconds / maxTime) * 100;
                    return (
                      <div
                        key={formation.id}
                        className="absolute top-0 transform -translate-x-1/2"
                        style={{ left: `${position}%` }}
                      >
                        <div className="w-3 h-6 bg-blue-500 rounded-sm cursor-pointer hover:bg-blue-400 transition-colors"
                             title={`${formation.name} - ${formation.time}`}
                             onClick={() => {
                               if (!isAutoPlaying) {
                                 setCurrentTime(formation.timeSeconds);
                                 setSelectedFormation(formation.id);
                               }
                             }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 隊形遷移リスト */}
              <div className="mb-4">
                <h5 className="text-sm font-semibold text-gray-300 mb-2">隊形遷移</h5>
                <div className="flex flex-wrap gap-2">
                  {formations.map((formation) => (
                    <button
                      key={formation.id}
                      onClick={() => {
                        if (!isAutoPlaying) {
                          setCurrentTime(formation.timeSeconds);
                          setSelectedFormation(formation.id);
                        }
                      }}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        formation.id === selectedFormation
                          ? 'bg-blue-600 text-white'
                          : isAutoPlaying
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      }`}
                      disabled={isAutoPlaying}
                    >
                      {formation.name} ({formation.time})
                    </button>
                  ))}
                </div>
              </div>

              {/* 状態表示 */}
              {isAutoPlaying && (
                <div className="p-2 bg-green-800 rounded text-sm">
                  <span className="text-green-300">🟢 自動再生中:</span>
                  <span className="ml-2">{currentFormation.name} → </span>
                  <span>{findNextFormation(currentFormation)?.name || '終了'}</span>
                </div>
              )}
            </div>

            {/* 隊形の説明 */}
            <div className={`mt-4 p-3 rounded-lg ${
              isEditMode ? 'bg-orange-800' : 'bg-gray-700'
            }`}>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-300">{currentFormation.description}</p>
                {isEditMode && (
                  <div className="text-xs text-orange-300">
                    演技者をドラッグして位置を調整できます
                  </div>
                )}
              </div>
              {hasUnsavedChanges && (
                <div className="mt-2 text-xs text-yellow-400">
                  ⚠️ 変更が保存されていません
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FormationsPage;