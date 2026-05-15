export interface Competition {
  _id: string;
  name: string;
  paragraph?: string;
  timeLimit: number;
  status: "Draft" | "Waiting" | "Active" | "Ended";
  participantCount: number;
  startTime?: string;
  createdBy?: { name: string; email: string };
  createdAt: string;
}

export interface GameResult {
  wpm: number;
  accuracy: number;
  mistakes: number;
  chars: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  userId: string;
  wpm: number;
  accuracy: number;
  mistakes?: number;
  timeTaken?: number;
  timeTakenFormatted?: string;
  completed?: boolean;
}

export interface MyResult {
  _id: string;
  competition: { _id: string; name: string; timeLimit: number };
  wpm: number;
  accuracy: number;
  mistakes: number;
  rank: number | null;
  completed: boolean;
  createdAt: string;
}

export interface AdminResult {
  _id: string;
  rank: number;
  name: string;
  email: string;
  competition: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  timeTakenFormatted: string;
  completed: boolean;
  submittedAt: string;
}
