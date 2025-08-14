import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Performer {
  id: string;
  name: string;
  position: string;
  color: string;
}

export interface PerformanceAction {
  timeSeconds: number;
  time: string;
  action: string;
  actionDetail: string;
  formation: string;
  lyrics: string;
  performerIds?: string[]; // どの演技者がこのアクションを実行するか
}

export interface Formation {
  id: string;
  name: string;
  timeSeconds: number;
  time: string;
  positions: { [key: string]: { x: number; y: number; color: string; name: string } };
  description: string;
}

interface PerformersContextType {
  performers: Performer[];
  formations: Formation[];
  performanceActions: PerformanceAction[];
  addPerformer: (performer: Omit<Performer, 'id'>) => void;
  updatePerformer: (id: string, updates: Partial<Performer>) => void;
  deletePerformer: (id: string) => void;
  updateFormation: (id: string, updates: Partial<Formation>) => void;
  addPerformerToFormations: (performer: Performer) => void;
  removePerformerFromFormations: (performerId: string) => void;
  getPerformerActions: (performerId: string) => PerformanceAction[];
}

const PerformersContext = createContext<PerformersContextType | undefined>(undefined);

// デフォルトデータ
const defaultPerformers: Performer[] = [
  { id: '1', name: '演技者A', position: '前列中央', color: '#ef4444' },
  { id: '2', name: '演技者B', position: '前列左', color: '#3b82f6' },
  { id: '3', name: '演技者C', position: '前列右', color: '#10b981' },
  { id: '4', name: '演技者D', position: '後列中央', color: '#eab308' },
];

const defaultFormations: Formation[] = [
  {
    id: '1',
    name: '隊形①',
    timeSeconds: 0,
    time: '0:00',
    description: '開始位置：中央集合',
    positions: {
      '1': { x: 50, y: 70, color: '#ef4444', name: '演技者A' },
      '2': { x: 30, y: 70, color: '#3b82f6', name: '演技者B' },
      '3': { x: 70, y: 70, color: '#10b981', name: '演技者C' },
      '4': { x: 50, y: 50, color: '#eab308', name: '演技者D' },
    }
  },
  {
    id: '2', 
    name: '隊形②',
    timeSeconds: 49,
    time: '0:49',
    description: '展開後：横一列',
    positions: {
      '1': { x: 50, y: 60, color: '#ef4444', name: '演技者A' },
      '2': { x: 20, y: 60, color: '#3b82f6', name: '演技者B' },
      '3': { x: 80, y: 60, color: '#10b981', name: '演技者C' },
      '4': { x: 50, y: 40, color: '#eab308', name: '演技者D' },
    }
  },
  {
    id: '3',
    name: '隊形③',
    timeSeconds: 155,
    time: '2:35',
    description: '移動中：V字形',
    positions: {
      '1': { x: 50, y: 30, color: '#ef4444', name: '演技者A' },
      '2': { x: 30, y: 60, color: '#3b82f6', name: '演技者B' },
      '3': { x: 70, y: 60, color: '#10b981', name: '演技者C' },
      '4': { x: 50, y: 80, color: '#eab308', name: '演技者D' },
    }
  },
  {
    id: '4',
    name: '隊形④',
    timeSeconds: 243,
    time: '4:03',
    description: '最終：円形',
    positions: {
      '1': { x: 50, y: 20, color: '#ef4444', name: '演技者A' },
      '2': { x: 20, y: 50, color: '#3b82f6', name: '演技者B' },
      '3': { x: 80, y: 50, color: '#10b981', name: '演技者C' },
      '4': { x: 50, y: 80, color: '#eab308', name: '演技者D' },
    }
  }
];

const defaultPerformanceActions: PerformanceAction[] = [
  { timeSeconds: 0, time: '0:00', action: '中央側にトーチをおいてしゃがみ待機', actionDetail: '中央側にトーチをおいてしゃがみ待機', formation: '①', lyrics: '尺八独奏', performerIds: ['1', '2', '3', '4'] },
  { timeSeconds: 21, time: '0:21', action: '前列から順番に左右に開いて立ち上がり', actionDetail: '前列から順番に左右に開いて立ち上がる→上で待機', formation: '①', lyrics: '琴の演奏', performerIds: ['1', '2', '3'] },
  { timeSeconds: 32, time: '0:32', action: '上から下へ両手下げる', actionDetail: 'ベースのスラップ音に合わせて上から下へ移動', formation: '①', lyrics: 'ベースのスラップ', performerIds: ['2', '3'] },
  { timeSeconds: 66, time: '1:06', action: '4拍車輪を4回', actionDetail: '4拍車輪×4', formation: '②', lyrics: '青い時間~(16拍)', performerIds: ['1', '2', '3', '4'] },
  { timeSeconds: 74, time: '1:14', action: '4拍車輪ずらしを4回', actionDetail: '4拍車輪ずらし×4', formation: '②', lyrics: '訪れてた~(16拍)', performerIds: ['1', '2', '3'] },
];

export const PerformersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ローカルストレージからデータを読み込み
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [performers, setPerformers] = useState<Performer[]>(() => 
    loadFromStorage('performers', defaultPerformers)
  );
  
  const [formations, setFormations] = useState<Formation[]>(() => 
    loadFromStorage('formations', defaultFormations)
  );
  
  const [performanceActions, setPerformanceActions] = useState<PerformanceAction[]>(() => 
    loadFromStorage('performanceActions', defaultPerformanceActions)
  );

  // ローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('performers', JSON.stringify(performers));
  }, [performers]);

  useEffect(() => {
    localStorage.setItem('formations', JSON.stringify(formations));
  }, [formations]);

  useEffect(() => {
    localStorage.setItem('performanceActions', JSON.stringify(performanceActions));
  }, [performanceActions]);

  // 演技者の追加
  const addPerformer = (performerData: Omit<Performer, 'id'>) => {
    const newPerformer: Performer = {
      ...performerData,
      id: Date.now().toString() + Math.random().toString(36)
    };
    setPerformers(prev => [...prev, newPerformer]);
    addPerformerToFormations(newPerformer);
  };

  // 演技者の更新
  const updatePerformer = (id: string, updates: Partial<Performer>) => {
    setPerformers(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
    
    // 隊形データも更新
    if (updates.name || updates.color) {
      setFormations(prev => prev.map(formation => ({
        ...formation,
        positions: Object.keys(formation.positions).reduce((acc, key) => {
          if (key === id) {
            acc[key] = {
              ...formation.positions[key],
              name: updates.name || formation.positions[key].name,
              color: updates.color || formation.positions[key].color
            };
          } else {
            acc[key] = formation.positions[key];
          }
          return acc;
        }, {} as { [key: string]: { x: number; y: number; color: string; name: string } })
      })));
    }
  };

  // 演技者の削除
  const deletePerformer = (id: string) => {
    setPerformers(prev => prev.filter(p => p.id !== id));
    removePerformerFromFormations(id);
  };

  // 隊形の更新
  const updateFormation = (id: string, updates: Partial<Formation>) => {
    setFormations(prev => prev.map(f => 
      f.id === id ? { ...f, ...updates } : f
    ));
  };

  // 新しい演技者を全ての隊形に追加
  const addPerformerToFormations = (performer: Performer) => {
    setFormations(prev => prev.map(formation => ({
      ...formation,
      positions: {
        ...formation.positions,
        [performer.id]: {
          x: 50 + (Math.random() - 0.5) * 20, // ランダムな位置（中央付近）
          y: 50 + (Math.random() - 0.5) * 20,
          color: performer.color,
          name: performer.name
        }
      }
    })));
  };

  // 演技者を全ての隊形から削除
  const removePerformerFromFormations = (performerId: string) => {
    setFormations(prev => prev.map(formation => {
      const { [performerId]: removed, ...remainingPositions } = formation.positions;
      return {
        ...formation,
        positions: remainingPositions
      };
    }));
  };

  // 演技者別のアクションを取得
  const getPerformerActions = (performerId: string): PerformanceAction[] => {
    return performanceActions.filter(action => 
      action.performerIds?.includes(performerId)
    );
  };

  const value: PerformersContextType = {
    performers,
    formations,
    performanceActions,
    addPerformer,
    updatePerformer,
    deletePerformer,
    updateFormation,
    addPerformerToFormations,
    removePerformerFromFormations,
    getPerformerActions
  };

  return (
    <PerformersContext.Provider value={value}>
      {children}
    </PerformersContext.Provider>
  );
};

export const usePerformers = (): PerformersContextType => {
  const context = useContext(PerformersContext);
  if (!context) {
    throw new Error('usePerformers must be used within a PerformersProvider');
  }
  return context;
};