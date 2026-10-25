/**
 * Evolution GO Design System - Central Design Tokens & Icon Dictionary
 * Theme: Default Dark (sleek, high-contrast, professional)
 */
import {
  Smartphone,
  LayoutDashboard,
  Terminal,
  BookOpen,
  Send,
  Plus,
  Power,
  Trash2,
  Settings,
  QrCode,
  ExternalLink,
  RefreshCw,
  Search,
  Server,
  Activity,
  Cpu,
  Database,
  Clock,
  Globe,
  Key,
  LogOut,
  Sun,
  Moon,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Percent,
} from "lucide-react";

export const SystemIcons = {
  // Navigation & Core Sections
  dashboard: LayoutDashboard,
  instances: Smartphone,
  apiTester: Terminal,
  documentation: BookOpen,

  // Actions
  create: Plus,
  sendTest: Send,
  connect: QrCode,
  disconnect: Power,
  settings: Settings,
  delete: Trash2,
  refresh: RefreshCw,
  search: Search,
  externalLink: ExternalLink,
  logout: LogOut,

  // System & Telemetry Metrics
  server: Server,
  latency: Activity,
  database: Database,
  version: Cpu,
  uptime: Clock,
  apiUrl: Globe,
  apiKey: Key,
  percent: Percent,
  warning: AlertTriangle,
  success: CheckCircle2,
  danger: XCircle,

  // Theme
  themeLight: Sun,
  themeDark: Moon,
} as const;

export const SystemColors = {
  brand: {
    primary: "#10b981",
    primaryHover: "#059669",
    glow: "rgba(16, 185, 129, 0.2)",
  },
  status: {
    connected: {
      dot: "#22c55e",
      text: "#4ade80",
      bg: "rgba(34, 197, 94, 0.18)",
      border: "rgba(34, 197, 94, 0.45)",
      label: "Conectado",
    },
    connecting: {
      dot: "#eab308",
      text: "#facc15",
      bg: "rgba(234, 179, 8, 0.18)",
      border: "rgba(234, 179, 8, 0.45)",
      label: "Conectando...",
    },
    disconnected: {
      dot: "#ef4444",
      text: "#f87171",
      bg: "rgba(239, 68, 68, 0.18)",
      border: "rgba(239, 68, 68, 0.45)",
      label: "Desconectado",
    },
  },
} as const;
