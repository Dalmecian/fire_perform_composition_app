import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Clock, Music, Download, Volume2, VolumeX, Edit3, Plus, Save, X, Trash2, Settings, Palette } from 'lucide-react';

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
  const [performanceDataState, setPerformanceDataState] = useState(performanceData);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicDuration, setMusicDuration] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingData, setEditingData] = useState({
    time: '',
    timeSeconds: 0,
    lyrics: '',
    formation: '',
    action: '',
    actionDetail: ''
  });
  const [showSettings, setShowSettings] = useState(false);
  const [displaySettings, setDisplaySettings] = useState({
    fontSize: 'normal', // small, normal, large
    theme: 'dark', // dark, blue, purple
    showFormation: true,
    showDetails: true,
    compactMode: false
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 音声読み上げ機能
  const speakText = (text: string) => {
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

  // CSVエクスポート機能
  const exportToCSV = (): void => {
    const csvHeaders = ['時間', '時間（秒）', '歌詞', '隊形', '動き', '動き詳細'];
    const csvData = [csvHeaders];
    
    performanceDataState.forEach(item => {
      csvData.push([
        item.time,
        item.timeSeconds.toString(),
        item.lyrics,
        item.formation,
        item.action,
        item.actionDetail
      ]);
    });
    
    const csvContent = csvData.map(row => 
      row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '演技タイムライン.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSVインポート機能
  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target && typeof e.target.result === 'string' ? e.target.result : '';
        const lines = csvText ? csvText.split('\n') : [];
        const headers = lines[0]?.split(',').map((h: string) => h.replace(/"/g, '').trim());
        
        // ヘッダーの確認
        const expectedHeaders = ['時間', '時間（秒）', '歌詞', '隊形', '動き', '動き詳細'];
        const isValidFormat = expectedHeaders.every(header => 
          headers.some((h: string) => h === header)
        );
        
        if (!isValidFormat) {
          alert('CSVファイルの形式が正しくありません。正しいヘッダーが必要です。');
          return;
        }
        
        const newData = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());
          
          if (values.length >= 6) {
            const timeSeconds = parseInt(values[1]) || 0;
            newData.push({
              time: values[0].replace(/"/g, ''),
              timeSeconds: timeSeconds,
              lyrics: values[2].replace(/"/g, ''),
              formation: values[3].replace(/"/g, ''),
              action: values[4].replace(/"/g, ''),
              actionDetail: values[5].replace(/"/g, '')
            });
          }
        }
        
        if (newData.length > 0) {
          // データを時間順にソート
          newData.sort((a, b) => a.timeSeconds - b.timeSeconds);
          setPerformanceDataState(newData);
          
          // 状態をリセット
          setCurrentTime(0);
          setCurrentIndex(0);
          setIsPlaying(false);
          setAnnouncedMoves(new Set());
          window.speechSynthesis.cancel();
          
          alert(`${newData.length}件のデータをインポートしました。`);
        } else {
          alert('有効なデータが見つかりませんでした。');
        }
      } catch (error) {
        alert('CSVファイルの読み込みに失敗しました。ファイル形式を確認してください。');
        console.error('CSV import error:', error);
      }
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // ファイル選択ダイアログを開く
  const triggerFileInput = (): void => {
  if (fileInputRef.current) fileInputRef.current.click();
  };

  // 音楽ファイル選択ダイアログを開く
  const triggerAudioInput = (): void => {
  if (audioInputRef.current) audioInputRef.current.click();
  };

  // 音楽ファイルのアップロード処理
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files && event.target.files[0] ? event.target.files[0] : null;
    if (!file) return;
    
    // 音楽ファイルの形式チェック
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      alert('MP3、WAV、OGGファイルのみサポートしています。');
      return;
    }
    
    // 既存の音楽を停止
    if (audioRef.current) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
    
    // 前のURLを解放
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    const url = URL.createObjectURL(file);
    setAudioFile(file);
  setAudioUrl(url as string | null);
    setIsMusicPlaying(false);
    
    // 音楽の情報を取得
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => {
      setMusicDuration(audio.duration);
    });
    
    alert(`音楽ファイル "${file.name}" をアップロードしました。`);
  };

  // 音楽の再生/停止
  const toggleMusic = () => {
    const audioEl = audioRef.current as HTMLAudioElement | null;
    if (!audioEl || !audioUrl) return;
    if (isMusicPlaying) {
      audioEl.pause();
    } else {
      audioEl.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  // 音量調整
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    setMusicVolume(volume);
    const audioEl = audioRef.current as HTMLAudioElement | null;
    if (audioEl) {
      audioEl.volume = volume;
    }
  };

  // 音楽の時間同期
  const syncMusicTime = (time: number) => {
    const audioEl = audioRef.current as HTMLAudioElement | null;
    if (audioEl && audioUrl) {
      audioEl.currentTime = time;
    }
  };

  // 編集モードの切り替え
  const toggleEditMode = () => {
    setIsEditMode((prev) => {
      if (!prev) {
        setIsPlaying(false);
        setIsMusicPlaying(false);
        const audioEl = audioRef.current as HTMLAudioElement | null;
        if (audioEl) {
          audioEl.pause();
        }
      }
      return !prev;
    });
    setEditingIndex(-1);
  };

  // 新しい演技項目を追加
  const addNewItem = () => {
    const newItem = {
      time: '0:00',
      timeSeconds: 0,
      lyrics: '新しい項目',
      formation: '①',
      action: '動作を入力',
      actionDetail: '詳細を入力'
    };
    setPerformanceDataState([...performanceDataState, newItem]);
    setEditingIndex(performanceDataState.length);
    setEditingData(newItem);
  };

  // 編集開始
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditingData({...performanceDataState[index]});
  };

  // 編集保存
  const saveEdit = () => {
    if (editingIndex >= 0) {
      const newData = [...performanceDataState];
      // 時間文字列から秒数を計算
      const timeParts = editingData.time.split(':');
      const timeSeconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1] || '0');
      
      newData[editingIndex] = {
        ...editingData,
        timeSeconds: timeSeconds
      };
      
      // 時間順にソート
      newData.sort((a, b) => a.timeSeconds - b.timeSeconds);
      setPerformanceDataState(newData);
    }
    setEditingIndex(-1);
  };

  // 編集キャンセル
  const cancelEdit = () => {
    setEditingIndex(-1);
  };

  // 項目削除
  const deleteItem = (index: number) => {
    if (window.confirm('この項目を削除しますか？')) {
      const newData = performanceDataState.filter((_, i) => i !== index);
      setPerformanceDataState(newData);
    }
  };

  // テーマクラスの取得
  const getThemeClasses = () => {
    switch (displaySettings.theme) {
      case 'blue':
        return {
          bg: 'bg-blue-900',
          primary: 'bg-blue-800',
          secondary: 'bg-blue-700',
          accent: 'text-blue-300',
          current: 'bg-blue-700 border-l-4 border-blue-400'
        };
      case 'purple':
        return {
          bg: 'bg-purple-900',
          primary: 'bg-purple-800', 
          secondary: 'bg-purple-700',
          accent: 'text-purple-300',
          current: 'bg-purple-700 border-l-4 border-purple-400'
        };
      default: // dark
        return {
          bg: 'bg-gray-900',
          primary: 'bg-gray-800',
          secondary: 'bg-gray-700',
          accent: 'text-blue-300',
          current: 'bg-green-700 border-l-4 border-green-400'
        };
    }
  };

  // フォントサイズクラスの取得
  const getFontSizeClass = () => {
    switch (displaySettings.fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const themeClasses = getThemeClasses();
  const fontSizeClass = getFontSizeClass();

  // 次の振り付けの3秒前チェック
  const checkUpcomingMove = (currentTime) => {
    const nextMove = performanceDataState.find(move => 
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
    for (let i = performanceDataState.length - 1; i >= 0; i--) {
      if (time >= performanceDataState[i].timeSeconds) {
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
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 再生/一時停止
  const togglePlay = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    // 音楽も同期して再生/停止
    if (audioRef.current && audioUrl) {
      if (newIsPlaying) {
        if (audioRef.current) {
          audioRef.current.currentTime = currentTime;
          audioRef.current.play();
        }
        setIsMusicPlaying(true);
      } else {
  if (audioRef.current) audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    }
  };

  // リセット
  const reset = () => {
    setCurrentTime(0);
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsMusicPlaying(false);
    setAnnouncedMoves(new Set()); // 読み上げ履歴もリセット
    window.speechSynthesis.cancel(); // 音声読み上げを停止
    
    // 音楽もリセット
    if (audioRef.current) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  // 前の振り付けに移動
  const previousMove = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentTime(performanceDataState[newIndex].timeSeconds);
    }
  };

  // 次の振り付けに移動
  const nextMove = () => {
    if (currentIndex < performanceDataState.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentTime(performanceDataState[newIndex].timeSeconds);
    }
  };

  // 特定の時間に移動
  const jumpToTime = (index: number) => {
    const newTime = performanceDataState[index].timeSeconds;
    setCurrentIndex(index);
    setCurrentTime(newTime);
    setIsPlaying(false);
    setIsMusicPlaying(false);
    
    // 音楽の時間も同期
    syncMusicTime(newTime);
    
    // ジャンプ時は、その時点より前の読み上げ履歴をクリア
    setAnnouncedMoves(prev => {
      const newSet = new Set();
      prev.forEach(time => {
  if (typeof time === 'number' && time <= newTime) {
          newSet.add(time);
        }
      });
      return newSet;
    });
    window.speechSynthesis.cancel(); // 音声読み上げを停止
    
    // 音楽を停止
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const currentPerformance = performanceDataState[currentIndex];
  const nextPerformance = currentIndex < performanceDataState.length - 1 ? performanceDataState[currentIndex + 1] : null;

  // displaySettingsの更新関数
  const updateDisplaySettings = (
    field: keyof typeof displaySettings,
    value: string | boolean
  ) => {
    setDisplaySettings((prev) => ({ ...prev, [field]: value }));
  };

  // editingDataの更新関数
  const updateEditingData = (
    field: keyof typeof editingData,
    value: string | number
  ) => {
    setEditingData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`text-white ${getFontSizeClass()}`}>
      {/* タイトル */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${themeClasses.accent}`}>全体タイムライン</h1>
      </div>

      {/* 設定パネル */}
      {showSettings && (
        <div className={`${themeClasses.primary} rounded-lg p-4 mb-6`}>
          <div className="flex items-center mb-4">
            <Palette className="mr-2" size={20} />
            <h3 className="text-lg font-bold">表示設定</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* フォントサイズ */}
            <div>
              <label className="block text-sm font-semibold mb-2">フォントサイズ</label>
              <select
                value={displaySettings.fontSize}
                onChange={(e) => updateDisplaySettings('fontSize', e.target.value)}
                className={`w-full px-3 py-2 ${themeClasses.secondary} border border-gray-600 rounded text-white`}
                title="フォントサイズ選択"
              >
                <option value="small">小</option>
                <option value="normal">標準</option>
                <option value="large">大</option>
              </select>
            </div>
            
            {/* テーマ */}
            <div>
              <label className="block text-sm font-semibold mb-2">カラーテーマ</label>
              <select
                value={displaySettings.theme}
                onChange={(e) => updateDisplaySettings('theme', e.target.value)}
                className={`w-full px-3 py-2 ${themeClasses.secondary} border border-gray-600 rounded text-white`}
                title="テーマ選択"
              >
                <option value="dark">ダーク</option>
                <option value="blue">ブルー</option>
                <option value="purple">パープル</option>
              </select>
            </div>
            
            {/* 表示オプション */}
            <div>
              <label className="block text-sm font-semibold mb-2">表示項目</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={displaySettings.showFormation}
                    onChange={(e) => updateDisplaySettings('showFormation', e.target.checked)}
                    className="mr-2"
                  />
                  隊形表示
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={displaySettings.showDetails}
                    onChange={(e) => updateDisplaySettings('showDetails', e.target.checked)}
                    className="mr-2"
                  />
                  詳細表示
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={displaySettings.compactMode}
                    onChange={(e) => updateDisplaySettings('compactMode', e.target.checked)}
                    className="mr-2"
                  />
                  コンパクトモード
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

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
              disabled={currentIndex === 0 || isEditMode}
              title="前の振り付け"
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
              disabled={isEditMode}
              title={isPlaying ? "一時停止" : "再生"}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={nextMove}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
              disabled={currentIndex === performanceDataState.length - 1 || isEditMode}
              title="次の振り付け"
            >
              <SkipForward size={20} />
            </button>
            <button
              onClick={reset}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
              disabled={isEditMode}
              title="リセット"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleEditMode}
              className={`p-2 rounded-full transition-colors ${
                isEditMode 
                  ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title={isEditMode ? "編集モード終了" : "編集モード開始"}
            >
              <Edit3 size={20} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${
                showSettings 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              title="表示設定"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 音楽コントロール */}
      {audioUrl && (
        <div className="bg-purple-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Music className="text-purple-300" size={20} />
              <div>
                <h3 className="font-semibold text-purple-200">音楽再生</h3>
                <p className="text-xs text-purple-400">{audioFile?.name || '音楽ファイル'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 音量調整 */}
              <div className="flex items-center space-x-2">
                {musicVolume === 0 ? <VolumeX size={16} className="text-purple-300" /> : <Volume2 size={16} className="text-purple-300" />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={musicVolume}
                  onChange={handleVolumeChange}
                  className="w-16 h-2 bg-purple-600 rounded-lg appearance-none cursor-pointer"
                  title="音量調整"
                />
                <span className="text-xs text-purple-300 w-8">{Math.round(musicVolume * 100)}%</span>
              </div>
              
              {/* 音楽再生ボタン */}
              <button
           onClick={toggleMusic}
           className="p-2 bg-purple-600 hover:bg-purple-500 rounded-full transition-colors"
           disabled={!audioUrl}
           title={isMusicPlaying ? "音楽一時停止" : "音楽再生"}
          >
            {isMusicPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
            </div>
          </div>
          
          {/* 隠しオーディオ要素 */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onPlay={() => setIsMusicPlaying(true)}
            onPause={() => setIsMusicPlaying(false)}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setMusicDuration(audioRef.current.duration);
                audioRef.current.volume = musicVolume;
              }
            }}
          />
        </div>
      )}

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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">演技タイムライン</h3>
          {isEditMode && (
            <button
              onClick={addNewItem}
              className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              <Plus size={16} className="mr-1" />
              新規追加
            </button>
          )}
        </div>
        <div className="space-y-2">
          {performanceDataState.map((item, index) => (
            <div key={index}>
              {editingIndex === index ? (
                <div className="p-4 bg-orange-800 rounded-lg border-l-4 border-orange-400">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-orange-300 mb-1">時間</label>
                      <input
                        type="text"
                        value={editingData.time}
                        onChange={(e) => updateEditingData('time', e.target.value)}
                        className="w-full px-2 py-1 bg-orange-900 border border-orange-600 rounded text-white text-sm"
                        placeholder="例: 1:30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-orange-300 mb-1">隊形</label>
                      <input
                        type="text"
                        value={editingData.formation}
                        onChange={(e) => updateEditingData('formation', e.target.value)}
                        className="w-full px-2 py-1 bg-orange-900 border border-orange-600 rounded text-white text-sm"
                        placeholder="例: ①"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-orange-300 mb-1">歌詞・セクション</label>
                      <input
                        type="text"
                        value={editingData.lyrics}
                        onChange={(e) => updateEditingData('lyrics', e.target.value)}
                        className="w-full px-2 py-1 bg-orange-900 border border-orange-600 rounded text-white text-sm"
                        placeholder="例: 青い時間~(16拍)"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-orange-300 mb-1">動き</label>
                      <input
                        type="text"
                        value={editingData.action}
                        onChange={(e) => updateEditingData('action', e.target.value)}
                        className="w-full px-2 py-1 bg-orange-900 border border-orange-600 rounded text-white text-sm"
                        placeholder="例: 4拍車輪を4回"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-orange-300 mb-1">動き詳細</label>
                      <textarea
                        value={editingData.actionDetail}
                        onChange={(e) => updateEditingData('actionDetail', e.target.value)}
                        className="w-full px-2 py-1 bg-orange-900 border border-orange-600 rounded text-white text-sm h-16 resize-none"
                        placeholder="例: 4拍車輪×4"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    >
                      <X size={14} className="mr-1" />
                      キャンセル
                    </button>
                    <button
                      onClick={saveEdit}
                      className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-3 rounded transition-colors ${
                    index === currentIndex 
                      ? 'bg-green-700 border-l-4 border-green-400' 
                      : isEditMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                  }`}
                  onClick={() => !isEditMode && jumpToTime(index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-mono text-sm text-blue-300">{item.time}</span>
                      <span className="ml-4 text-sm">{item.lyrics}</span>
                      <span className="ml-4 text-xs text-gray-400">隊形: {item.formation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="font-semibold text-yellow-400">{item.action}</div>
                      </div>
                      {isEditMode && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(index);
                            }}
                            className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                            title="編集"
                          >
                            <Edit3 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(index);
                            }}
                            className="p-1 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                            title="削除"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;