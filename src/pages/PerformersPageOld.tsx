import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Trash2, Play, Pause } from 'lucide-react';

interface Performer {
  id: string;
  name: string;
  position: string;
  color: string;
}

interface PerformanceAction {
  timeSeconds: number;
  time: string;
  action: string;
  actionDetail: string;
  formation: string;
  lyrics: string;
}

const PerformersPage: React.FC = () => {
  const [performers, setPerformers] = useState<Performer[]>([
    { id: '1', name: '演技者A', position: '前列中央', color: 'bg-red-500' },
    { id: '2', name: '演技者B', position: '前列左', color: 'bg-blue-500' },
    { id: '3', name: '演技者C', position: '前列右', color: 'bg-green-500' },
    { id: '4', name: '演技者D', position: '後列中央', color: 'bg-yellow-500' },
  ]);
  
  const [selectedPerformer, setSelectedPerformer] = useState<string>('1');
  const [isEditing, setIsEditing] = useState(false);
  const [newPerformer, setNewPerformer] = useState({ name: '', position: '', color: 'bg-purple-500' });

  // サンプルの演技データ（実際には外部から取得）
  const [performanceData, setPerformanceData] = useState<PerformanceAction[]>([
    { timeSeconds: 0, time: '0:00', action: '中央側にトーチをおいてしゃがみ待機', actionDetail: '中央側にトーチをおいてしゃがみ待機', formation: '①', lyrics: '尺八独奏' },
    { timeSeconds: 21, time: '0:21', action: '前列から順番に左右に開いて立ち上がり', actionDetail: '前列から順番に左右に開いて立ち上がる→上で待機', formation: '①', lyrics: '琴の演奏' },
    { timeSeconds: 32, time: '0:32', action: '上から下へ両手下げる', actionDetail: 'ベースのスラップ音に合わせて上から下へ移動', formation: '①', lyrics: 'ベースのスラップ' },
    { timeSeconds: 66, time: '1:06', action: '4拍車輪を4回', actionDetail: '4拍車輪×4', formation: '②', lyrics: '青い時間~(16拍)' },
    { timeSeconds: 74, time: '1:14', action: '4拍車輪ずらしを4回', actionDetail: '4拍車輪ずらし×4', formation: '②', lyrics: '訪れてた~(16拍)' },
  ]);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 演技者の追加
  const addPerformer = () => {
    if (newPerformer.name && newPerformer.position) {
      const id = Date.now().toString();
      setPerformers([...performers, { ...newPerformer, id }]);
      setNewPerformer({ name: '', position: '', color: 'bg-purple-500' });
      setIsEditing(false);
    }
  };

  // 演技者の削除
  const deletePerformer = (id: string) => {
    if (window.confirm('この演技者を削除しますか？')) {
      setPerformers(performers.filter(p => p.id !== id));
      if (selectedPerformer === id) {
        setSelectedPerformer(performers[0]?.id || '');
      }
    }
  };

  // 選択された演技者を取得
  const currentPerformer = performers.find(p => p.id === selectedPerformer);

  // 演技者別のアクションフィルタリング（実際にはサーバーサイドで処理）
  const getPerformerActions = (performerId: string): PerformanceAction[] => {
    // デモ用：演技者によって異なるアクションを表示
    switch (performerId) {
      case '1': // 前列中央
        return performanceData.filter(action => 
          action.action.includes('中央') || action.action.includes('車輪') || action.action.includes('立ち上が')
        );
      case '2': // 前列左
        return performanceData.filter(action => 
          action.action.includes('左') || action.action.includes('開いて') || action.action.includes('両手')
        );
      case '3': // 前列右
        return performanceData.filter(action => 
          action.action.includes('右') || action.action.includes('開いて') || action.action.includes('両手')
        );
      default:
        return performanceData.slice(0, 3); // 後列は最初の3つのアクション
    }
  };

  const performerActions = getPerformerActions(selectedPerformer);

  const colorOptions = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Users className="mr-3" size={24} />
          <h2 className="text-2xl font-bold">演技者別タイムライン</h2>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Plus size={16} className="mr-2" />
          演技者追加
        </button>
      </div>

      {/* 演技者追加フォーム */}
      {isEditing && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">新しい演技者を追加</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">演技者名</label>
              <input
                type="text"
                value={newPerformer.name}
                onChange={(e) => setNewPerformer({ ...newPerformer, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="例: 演技者E"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ポジション</label>
              <input
                type="text"
                value={newPerformer.position}
                onChange={(e) => setNewPerformer({ ...newPerformer, position: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                placeholder="例: 中列左"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">カラー</label>
              <div className="flex space-x-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewPerformer({ ...newPerformer, color })}
                    className={`w-8 h-8 rounded ${color} ${newPerformer.color === color ? 'ring-2 ring-white' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={addPerformer}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
            >
              追加
            </button>
          </div>
        </div>
      )}

      {/* 演技者リストと選択 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">演技者一覧</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {performers.map((performer) => (
            <div
              key={performer.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                selectedPerformer === performer.id 
                  ? 'border-blue-400 bg-gray-700' 
                  : 'border-transparent bg-gray-700 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedPerformer(performer.id)}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full ${performer.color} mr-2`} />
                <div>
                  <div className="font-medium">{performer.name}</div>
                  <div className="text-xs text-gray-400">{performer.position}</div>
                </div>
              </div>
              <div className="flex justify-end mt-2 space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePerformer(performer.id);
                  }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 選択された演技者の詳細 */}
      {currentPerformer && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <div className={`w-6 h-6 rounded-full ${currentPerformer.color} mr-3`} />
            <h3 className="text-xl font-semibold">{currentPerformer.name}</h3>
            <span className="ml-2 text-sm text-gray-400">({currentPerformer.position})</span>
          </div>

          {/* 演技者別タイムライン */}
          <div className="space-y-3">
            <h4 className="text-lg font-medium">個人タイムライン</h4>
            {performerActions.length > 0 ? (
              performerActions.map((action, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-700 rounded-lg border-l-4"
                  style={{ borderLeftColor: currentPerformer.color.replace('bg-', '') === 'red-500' ? '#ef4444' : 
                    currentPerformer.color.replace('bg-', '') === 'blue-500' ? '#3b82f6' : 
                    currentPerformer.color.replace('bg-', '') === 'green-500' ? '#10b981' : '#eab308' }}
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
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">
                この演技者には割り当てられた動作がありません
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformersPage;