export interface PerformanceData {
  time: string;
  timeSeconds: number;
  lyrics: string;
  formation: string;
  action: string;
  actionDetail: string;
}

export interface AudioState {
  isLoaded: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isPlaying: boolean;
}

export interface AppState {
  currentTime: number;
  isPlaying: boolean;
  currentIndex: number;
  announcedMoves: Set<number>;
  performanceData: PerformanceData[];
  audioFile: File | null;
  audioState: AudioState;
}