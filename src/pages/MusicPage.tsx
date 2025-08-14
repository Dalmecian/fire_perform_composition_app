import React, { useState, useRef } from 'react';
import { Music, Upload, Play, Pause, Volume2, VolumeX, Trash2, Download, Clock, FileAudio } from 'lucide-react';

interface MusicTrack {
  id: string;
  name: string;
  duration: number;
  file: File;
  url: string;
  uploadDate: Date;
}

interface Marker {
  id: string;
  time: number;
  label: string;
  color: string;
}

const MusicPage: React.FC = () => {
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [newMarkerLabel, setNewMarkerLabel] = useState('');
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 音楽ファイルのアップロード
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name}: サポートされていないファイル形式です。MP3、WAV、OGGファイルのみサポートしています。`);
        return;
      }

      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      
      audio.addEventListener('loadedmetadata', () => {
        const newTrack: MusicTrack = {
          id: Date.now().toString() + Math.random().toString(36),
          name: file.name,
          duration: audio.duration,
          file: file,
          url: url,
          uploadDate: new Date()
        };
        
        setMusicTracks(prev => [...prev, newTrack]);
      });
    });

    // ファイル入力をリセット
    if (event.target) {
      event.target.value = '';
    }
  };

  // トラックの選択
  const selectTrack = (track: MusicTrack) => {
    if (currentTrack && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setCurrentTrack(track);
    setCurrentTime(0);
    
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.volume = volume;
    }
  };

  // 再生/停止
  const togglePlayback = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 音量調整
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ファイルサイズフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // トラックの削除
  const deleteTrack = (trackId: string) => {
    if (window.confirm('この楽曲を削除しますか？')) {
      const track = musicTracks.find(t => t.id === trackId);
      if (track) {
        URL.revokeObjectURL(track.url);
        setMusicTracks(prev => prev.filter(t => t.id !== trackId));
        
        if (currentTrack?.id === trackId) {
          setCurrentTrack(null);
          setIsPlaying(false);
          setCurrentTime(0);
        }
      }
    }
  };

  // マーカーの追加
  const addMarker = () => {
    if (newMarkerLabel.trim() && currentTrack) {
      const newMarker: Marker = {
        id: Date.now().toString(),
        time: currentTime,
        label: newMarkerLabel.trim(),
        color: '#3b82f6'
      };
      setMarkers(prev => [...prev, newMarker].sort((a, b) => a.time - b.time));
      setNewMarkerLabel('');
    }
  };

  // マーカーへのジャンプ
  const jumpToMarker = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Music className="mr-3" size={24} />
          <h2 className="text-2xl font-bold">楽曲管理</h2>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
        >
          <Upload size={16} className="mr-2" />
          楽曲アップロード
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* 現在の再生情報 */}
      {currentTrack && (
        <div className="bg-purple-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileAudio className="mr-3 text-purple-300" size={20} />
              <div>
                <h3 className="text-lg font-semibold">{currentTrack.name}</h3>
                <p className="text-sm text-purple-300">
                  {formatTime(duration)} • {formatFileSize(currentTrack.file.size)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 音量調整 */}
              <div className="flex items-center space-x-2">
                {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20"
                />
                <span className="text-sm w-10">{Math.round(volume * 100)}%</span>
              </div>
              
              {/* 再生制御 */}
              <button
                onClick={togglePlayback}
                className="p-3 bg-purple-600 hover:bg-purple-500 rounded-full transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
          </div>

          {/* 再生バー */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                setCurrentTime(time);
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                }
              }}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-purple-300">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* マーカー */}
          {markers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">マーカー</h4>
              <div className="flex flex-wrap gap-2">
                {markers.map(marker => (
                  <button
                    key={marker.id}
                    onClick={() => jumpToMarker(marker.time)}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
                  >
                    {formatTime(marker.time)} - {marker.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* マーカー追加 */}
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="text"
              value={newMarkerLabel}
              onChange={(e) => setNewMarkerLabel(e.target.value)}
              placeholder="マーカー名を入力"
              className="flex-1 px-3 py-1 bg-purple-900 border border-purple-600 rounded text-white text-sm"
            />
            <button
              onClick={addMarker}
              className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm transition-colors"
            >
              現在位置にマーカー追加
            </button>
          </div>

          <audio
            ref={audioRef}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
              }
            }}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* 楽曲一覧 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">楽曲ライブラリ</h3>
        
        {musicTracks.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Music size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">楽曲がありません</p>
            <p className="text-sm">「楽曲アップロード」ボタンから楽曲を追加してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {musicTracks.map((track) => (
              <div
                key={track.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors border-2 ${
                  currentTrack?.id === track.id
                    ? 'border-purple-400 bg-purple-800/50'
                    : 'border-transparent bg-gray-700 hover:bg-gray-600'
                }`}
                onClick={() => selectTrack(track)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{track.name}</h4>
                    <p className="text-sm text-gray-400">
                      {formatTime(track.duration)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatFileSize(track.file.size)} • {track.uploadDate.toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTrack(track.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPage;