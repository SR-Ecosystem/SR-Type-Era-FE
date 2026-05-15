import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface Player {
  userId: string;
  userName: string;
  wpm: number;
  accuracy: number;
  progress: number;
  finished?: boolean;
}

interface UseSocketOptions {
  competitionId: string | null;
  userId: string | null;
  userName: string | null;
  onRoomPlayers:      (players: Player[]) => void;
  onPlayerJoined:     (p: { userId: string; userName: string }) => void;
  onPlayerLeft:       (p: { userId: string }) => void;
  onPlayerProgress:   (p: { userId: string; wpm: number; accuracy: number; progress: number }) => void;
  onPlayerFinished:   (p: { userId: string; wpm: number; accuracy: number }) => void;
  onCompetitionEnded: () => void;
  onCompetitionStarted?: () => void;
}

// In production use the Render backend URL; in dev fallback to localhost:5000
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const useSocket = ({
  competitionId, userId, userName,
  onRoomPlayers, onPlayerJoined, onPlayerLeft,
  onPlayerProgress, onPlayerFinished, onCompetitionEnded, onCompetitionStarted
}: UseSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const lastEmit  = useRef(0);

  useEffect(() => {
    if (!competitionId || !userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_competition", { competitionId, userId, userName });
    });

    socket.on("room_players",      onRoomPlayers);
    socket.on("player_joined",     onPlayerJoined);
    socket.on("player_left",       onPlayerLeft);
    socket.on("player_progress",   onPlayerProgress);
    socket.on("player_finished",   onPlayerFinished);
    socket.on("competition_ended", onCompetitionEnded);
    if (onCompetitionStarted) {
      socket.on("competition_started", onCompetitionStarted);
    }

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    return () => {
      socket.emit("leave_competition", { competitionId, userId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [competitionId, userId]); // eslint-disable-line

  // Throttled progress emit — max once per 400ms
  const emitProgress = useCallback((wpm: number, accuracy: number, progress: number) => {
    const now = Date.now();
    if (now - lastEmit.current < 400) return;
    lastEmit.current = now;
    socketRef.current?.emit("progress_update", { competitionId, userId, wpm, accuracy, progress });
  }, [competitionId, userId]);

  const emitFinished = useCallback((wpm: number, accuracy: number) => {
    socketRef.current?.emit("player_finished", { competitionId, userId, wpm, accuracy });
  }, [competitionId, userId]);

  const emitEndCompetition = useCallback((cid: string) => {
    socketRef.current?.emit("end_competition", { competitionId: cid });
  }, []);

  return { emitProgress, emitFinished, emitEndCompetition };
};
