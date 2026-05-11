import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface NetworkEntry {
  id: string;
  ssid: string;
  channel: number;
  rssi: number;
  security: string;
  timestamp: number;
}

export interface AnomalyResult {
  id: string;
  type: string;
  score: number;
  description: string;
  timestamp: number;
  severity: "low" | "medium" | "high" | "critical";
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  progress: number;
}

export interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  solved: boolean;
  hint: string;
  flag?: string;
}

export interface SystemStatus {
  service: boolean;
  maintenance: boolean;
  training: boolean;
  ai: boolean;
  frequency: boolean;
  ctf: boolean;
}

interface AppContextType {
  status: SystemStatus;
  networks: NetworkEntry[];
  anomalies: AnomalyResult[];
  modules: TrainingModule[];
  challenges: CTFChallenge[];
  ctfScore: number;
  isScanning: boolean;
  isRunningAI: boolean;
  startScan: () => void;
  stopScan: () => void;
  startAI: () => void;
  completeModule: (id: string) => void;
  solveChallenge: (id: string, flag: string) => boolean;
  toggleService: () => void;
  runMaintenance: () => Promise<void>;
  maintenanceRunning: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_SCORE = "ctf_score";
const STORAGE_KEY_CHALLENGES = "ctf_challenges";
const STORAGE_KEY_MODULES = "training_modules";

const INITIAL_MODULES: TrainingModule[] = [
  {
    id: "m1",
    title: "Network Fundamentals",
    description: "OSI model, TCP/IP stack, and packet anatomy",
    duration: 15,
    completed: false,
    progress: 0,
  },
  {
    id: "m2",
    title: "Man-in-the-Middle Attacks",
    description: "ARP poisoning, MITM techniques, and defenses",
    duration: 20,
    completed: false,
    progress: 0,
  },
  {
    id: "m3",
    title: "Packet Analysis",
    description: "Wireshark basics, frame inspection, protocol dissection",
    duration: 25,
    completed: false,
    progress: 0,
  },
  {
    id: "m4",
    title: "Encryption & WPA2",
    description: "WPA2 handshake, PBKDF2, CCMP encryption internals",
    duration: 30,
    completed: false,
    progress: 0,
  },
  {
    id: "m5",
    title: "Deauth Attacks",
    description: "802.11 management frames, deauthentication floods",
    duration: 18,
    completed: false,
    progress: 0,
  },
  {
    id: "m6",
    title: "Evil Twin APs",
    description: "Rogue access point setup, SSID spoofing, captive portals",
    duration: 22,
    completed: false,
    progress: 0,
  },
];

const INITIAL_CHALLENGES: CTFChallenge[] = [
  {
    id: "c1",
    title: "Base64 Decode",
    description: "Decode the hidden message: T21uaVdpRmlYX1NlY3VyZQ==",
    difficulty: "easy",
    points: 50,
    solved: false,
    hint: "Standard Base64 encoding",
    flag: "OmniWiFiX_Secure",
  },
  {
    id: "c2",
    title: "Hidden Password",
    description: "The SSID 'OMNIWIFI_HIDDENNET' broadcasts on ch 6. Find the key hidden in plain sight: 57494649_58 (hex decode)",
    difficulty: "easy",
    points: 75,
    solved: false,
    hint: "Convert hex pairs to ASCII",
    flag: "WIFI_X",
  },
  {
    id: "c3",
    title: "WPA2 Handshake",
    description: "Analyze the 4-way handshake. EAPOL nonce (hex): 41452d48414e44534841 — what protocol phase is this?",
    difficulty: "medium",
    points: 150,
    solved: false,
    hint: "Think ANonce vs SNonce",
    flag: "ANonce",
  },
  {
    id: "c4",
    title: "XSS Vector",
    description: "A captive portal sanitizes inputs. Which payload bypasses their filter: <img src=x onerror=alert(1)>",
    difficulty: "medium",
    points: 200,
    solved: false,
    hint: "Event handler injection without script tags",
    flag: "onerror",
  },
  {
    id: "c5",
    title: "SSH Brute Force",
    description: "The target SSH server allows 3 attempts. User: admin. Wordlist hint: default router passwords",
    difficulty: "hard",
    points: 350,
    solved: false,
    hint: "Try common router admin defaults",
    flag: "admin123",
  },
  {
    id: "c6",
    title: "Zero-Day Analysis",
    description: "CVE-2017-13077 targets WPA2 via KRACK. What specific frame type is replayed?",
    difficulty: "hard",
    points: 500,
    solved: false,
    hint: "KRACK = Key Reinstallation Attack",
    flag: "EAPOL",
  },
];

function generateNetworks(channel: number): NetworkEntry[] {
  const ssids = [
    `HOME_NET_${channel}`,
    `OFFICE_${channel}_5G`,
    `XFINITY_${channel}`,
    `AndroidAP_${channel}`,
  ];
  return ssids.slice(0, 2 + Math.floor(Math.random() * 2)).map((ssid, i) => ({
    id: `${channel}_${i}_${Date.now()}`,
    ssid,
    channel,
    rssi: -40 - Math.floor(Math.random() * 50),
    security: ["WPA2", "WPA3", "Open", "WEP"][Math.floor(Math.random() * 4)],
    timestamp: Date.now(),
  }));
}

function generateAnomalies(): AnomalyResult[] {
  const types = [
    {
      type: "Deauth Flood",
      description: "Excessive deauthentication frames detected on ch 6",
      severity: "high" as const,
    },
    {
      type: "Evil Twin AP",
      description: "Duplicate SSID with different BSSID observed",
      severity: "critical" as const,
    },
    {
      type: "ARP Spoof",
      description: "ARP cache poisoning attempt from 192.168.1.77",
      severity: "high" as const,
    },
    {
      type: "Beacon Flood",
      description: "High rate of probe/beacon frames detected",
      severity: "medium" as const,
    },
    {
      type: "WPS Attack",
      description: "Repeated WPS PIN attempts from unknown device",
      severity: "medium" as const,
    },
    {
      type: "Normal Traffic",
      description: "No anomalies detected in current sample",
      severity: "low" as const,
    },
  ];
  const count = 2 + Math.floor(Math.random() * 3);
  return Array.from({ length: count }, (_, i) => {
    const t = types[Math.floor(Math.random() * types.length)];
    return {
      id: `a_${Date.now()}_${i}`,
      type: t.type,
      score: 0.3 + Math.random() * 0.7,
      description: t.description,
      timestamp: Date.now() - i * 30000,
      severity: t.severity,
    };
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SystemStatus>({
    service: false,
    maintenance: false,
    training: false,
    ai: false,
    frequency: false,
    ctf: false,
  });
  const [networks, setNetworks] = useState<NetworkEntry[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [modules, setModules] = useState<TrainingModule[]>(INITIAL_MODULES);
  const [challenges, setChallenges] = useState<CTFChallenge[]>(INITIAL_CHALLENGES);
  const [ctfScore, setCtfScore] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [isRunningAI, setIsRunningAI] = useState(false);
  const [maintenanceRunning, setMaintenanceRunning] = useState(false);
  const scanInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const savedScore = await AsyncStorage.getItem(STORAGE_KEY_SCORE);
        if (savedScore) setCtfScore(parseInt(savedScore, 10));
        const savedChallenges = await AsyncStorage.getItem(STORAGE_KEY_CHALLENGES);
        if (savedChallenges) setChallenges(JSON.parse(savedChallenges));
        const savedModules = await AsyncStorage.getItem(STORAGE_KEY_MODULES);
        if (savedModules) setModules(JSON.parse(savedModules));
      } catch (_) {}
    })();
    setStatus((s) => ({ ...s, service: true }));
  }, []);

  const startScan = useCallback(() => {
    if (isScanning) return;
    setIsScanning(true);
    setStatus((s) => ({ ...s, frequency: true }));
    const channels = [1, 6, 11];
    let idx = 0;
    scanInterval.current = setInterval(() => {
      const ch = channels[idx % channels.length];
      setNetworks((prev) => {
        const fresh = generateNetworks(ch);
        const existing = prev.filter((n) => n.channel !== ch);
        return [...existing, ...fresh].slice(-30);
      });
      idx++;
    }, 2000);
  }, [isScanning]);

  const stopScan = useCallback(() => {
    if (scanInterval.current) {
      clearInterval(scanInterval.current);
      scanInterval.current = null;
    }
    setIsScanning(false);
    setStatus((s) => ({ ...s, frequency: false }));
  }, []);

  const startAI = useCallback(async () => {
    if (isRunningAI) return;
    setIsRunningAI(true);
    setStatus((s) => ({ ...s, ai: true }));
    await new Promise((r) => setTimeout(r, 2500));
    setAnomalies(generateAnomalies());
    setIsRunningAI(false);
    setStatus((s) => ({ ...s, ai: false }));
  }, [isRunningAI]);

  const completeModule = useCallback(
    async (id: string) => {
      const updated = modules.map((m) =>
        m.id === id ? { ...m, completed: true, progress: 100 } : m
      );
      setModules(updated);
      setStatus((s) => ({ ...s, training: true }));
      await AsyncStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(updated));
      setTimeout(
        () => setStatus((s) => ({ ...s, training: false })),
        1000
      );
    },
    [modules]
  );

  const solveChallenge = useCallback(
    (id: string, flag: string): boolean => {
      const challenge = challenges.find((c) => c.id === id);
      if (!challenge || challenge.solved) return false;
      const correct =
        challenge.flag?.toLowerCase() === flag.trim().toLowerCase();
      if (correct) {
        const newScore = ctfScore + challenge.points;
        const updated = challenges.map((c) =>
          c.id === id ? { ...c, solved: true } : c
        );
        setChallenges(updated);
        setCtfScore(newScore);
        AsyncStorage.setItem(STORAGE_KEY_SCORE, String(newScore));
        AsyncStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(updated));
        setStatus((s) => ({ ...s, ctf: true }));
        setTimeout(() => setStatus((s) => ({ ...s, ctf: false })), 1000);
      }
      return correct;
    },
    [challenges, ctfScore]
  );

  const toggleService = useCallback(() => {
    setStatus((s) => ({ ...s, service: !s.service }));
  }, []);

  const runMaintenance = useCallback(async () => {
    if (maintenanceRunning) return;
    setMaintenanceRunning(true);
    setStatus((s) => ({ ...s, maintenance: true }));
    await new Promise((r) => setTimeout(r, 3000));
    setMaintenanceRunning(false);
    setStatus((s) => ({ ...s, maintenance: false }));
  }, [maintenanceRunning]);

  return (
    <AppContext.Provider
      value={{
        status,
        networks,
        anomalies,
        modules,
        challenges,
        ctfScore,
        isScanning,
        isRunningAI,
        startScan,
        stopScan,
        startAI,
        completeModule,
        solveChallenge,
        toggleService,
        runMaintenance,
        maintenanceRunning,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
