import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimeLog, LogCategory, TimerSettings, StorageVersion } from '../types';

// ============================================================
// Storage Keys
// ============================================================
const KEYS = {
  TIME_LOGS: '@deepseek/time_logs',
  CATEGORIES: '@deepseek/log_categories',
  SETTINGS: '@deepseek/timer_settings',
  DATA_VERSION: '@deepseek/data_version',
} as const;

const CURRENT_DATA_VERSION = 1;

// ============================================================
// 默认数据
// ============================================================

export const DEFAULT_CATEGORIES: LogCategory[] = [
  { id: 'default_ai_chat', name: 'AI 对话', color: '#4A90D9', isDefault: true },
  { id: 'default_code_gen', name: '代码生成', color: '#50C878', isDefault: true },
  { id: 'default_doc', name: '文档创作', color: '#F5A623', isDefault: true },
  { id: 'default_search', name: '智能搜索', color: '#9B59B6', isDefault: true },
];

export const DEFAULT_SETTINGS: TimerSettings = {
  autoTimerEnabled: true,
};

// ============================================================
// 版本迁移
// ============================================================

async function getStoredVersion(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DATA_VERSION);
    if (raw === null) return null;
    const parsed: StorageVersion = JSON.parse(raw);
    return parsed.version;
  } catch {
    return null;
  }
}

async function setStoredVersion(): Promise<void> {
  const version: StorageVersion = { version: CURRENT_DATA_VERSION };
  await AsyncStorage.setItem(KEYS.DATA_VERSION, JSON.stringify(version));
}

// ============================================================
// 读写方法
// ============================================================

/**
 * 保存日志列表
 */
export async function saveLogs(logs: TimeLog[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TIME_LOGS, JSON.stringify(logs));
}

/**
 * 读取日志列表
 */
export async function loadLogs(): Promise<TimeLog[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TIME_LOGS);
    if (raw === null) return [];
    return JSON.parse(raw) as TimeLog[];
  } catch {
    return [];
  }
}

/**
 * 保存分类列表
 */
export async function saveCategories(categories: LogCategory[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
}

/**
 * 读取分类列表
 */
export async function loadCategories(): Promise<LogCategory[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CATEGORIES);
    if (raw === null) return [];
    return JSON.parse(raw) as LogCategory[];
  } catch {
    return [];
  }
}

/**
 * 保存设置
 */
export async function saveSettings(settings: TimerSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

/**
 * 读取设置
 */
export async function loadSettings(): Promise<TimerSettings | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (raw === null) return null;
    return JSON.parse(raw) as TimerSettings;
  } catch {
    return null;
  }
}

// ============================================================
// 初始化（含迁移）
// ============================================================

export interface AllData {
  logs: TimeLog[];
  categories: LogCategory[];
  settings: TimerSettings;
}

/**
 * App 启动时调用：读取全部数据并初始化
 * 首次使用时自动初始化默认分类和默认设置
 * 版本变更时执行对应迁移逻辑
 */
export async function initializeStorage(): Promise<AllData> {
  const storedVersion = await getStoredVersion();

  // 首次使用：初始化默认数据
  if (storedVersion === null) {
    const defaultData: AllData = {
      logs: [],
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
    };
    await saveLogs(defaultData.logs);
    await saveCategories(defaultData.categories);
    await saveSettings(defaultData.settings);
    await setStoredVersion();
    return defaultData;
  }

  // 版本 1 → 当前版本：直接读取（暂无迁移需求）
  if (storedVersion === CURRENT_DATA_VERSION) {
    const [logs, categories, settings] = await Promise.all([
      loadLogs(),
      loadCategories(),
      loadSettings(),
    ]);

    return {
      logs,
      categories: categories.length === 0 ? DEFAULT_CATEGORIES : categories,
      settings: settings ?? DEFAULT_SETTINGS,
    };
  }

  // 未来版本：尝试兼容读取
  const [logs, categories, settings] = await Promise.all([
    loadLogs(),
    loadCategories(),
    loadSettings(),
  ]);

  return {
    logs,
    categories: categories.length === 0 ? DEFAULT_CATEGORIES : categories,
    settings: settings ?? DEFAULT_SETTINGS,
  };
}

/**
 * 清空全部日志
 */
export async function clearAllLogs(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.TIME_LOGS);
}
