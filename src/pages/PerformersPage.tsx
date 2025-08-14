import React, { useState } from 'react';
import { Users, Plus, Trash2 } from 'lucide-react';
import { usePerformers } from '../contexts/PerformersContext';

const PerformersPage: React.FC = () => {
  const { performers, addPerformer, deletePerformer, getPerformerActions } = usePerformers();
  
  const [selectedPerformer, setSelectedPerformer] = useState<string>(performers[0]?.id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [newPerformer, setNewPerformer] = useState({ name: '', position: '', color: '#8b5cf6' });

  // 演技者の追加
  const handleAddPerformer = () => {
    if (newPerformer.name && newPerformer.position) {
      addPerformer(newPerformer);
      setNewPerformer({ name: '', position: '', color: '#8b5cf6' });
      setIsEditing(false);
    }
  };

  // 演技者の削除
  const handleDeletePerformer = (id: string) => {
    if (window.confirm('この演技者を削除しますか？')) {
      deletePerformer(id);
      if (selectedPerformer === id) {
        setSelectedPerformer(performers[0]?.id || '');
      }
    }
  };

  // 選択された演技者を取得
  const currentPerformer = performers.find(p => p.id === selectedPerformer);
  const performerActions = getPerformerActions(selectedPerformer);

  const colorOptions = [
    '#ef4444', '#3b82f6', '#10b981', '#eab308', 
    '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
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
              onClick={() => setIsEditing(false)}
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
                <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: performer.color }} />
                <div>
                  <div className="font-medium">{performer.name}</div>
                  <div className="text-xs text-gray-400">{performer.position}</div>
                </div>
              </div>
              <div className="flex justify-end mt-2 space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePerformer(performer.id);
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
            <div className="w-6 h-6 rounded-full mr-3" style={{ backgroundColor: currentPerformer.color }} />
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
                  style={{ borderLeftColor: currentPerformer.color }}
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