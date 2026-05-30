// 分类实体
export interface LogCategory {
  id: string;
  name: string;
  color: string;
  isDefault: boolean; // true=系统预设，不可删除
}

// 单条时间日志实体
export interface TimeLog {
  id: string;
  title: string;
  category: LogCategory;
  startTime: number; // 毫秒时间戳
  endTime: number;
  duration: number; // 总时长 毫秒
  note: string;
  isAuto: boolean; // true页面自动记录，false用户手动新增
  sourcePage: string; // 来源页面标识 chat/code/doc/search/custom
  createdAt: number;
  updatedAt: number;
}

// 计时全局配置
export interface TimerSettings {
  autoTimerEnabled: boolean; // 自动计时总开关
}

// 前台临时计时缓存（页面运行中存储）
export interface RunningTimerCache {
  id: string;
  title: string;
  categoryId: string;
  startTime: number;
  sourcePage: string;
}

// 统计数据
export interface CategoryStat {
  categoryName: string;
  color: string;
  duration: number;
  percentage: number;
}

export interface DailyStat {
  date: string; // 'YYYY-MM-DD'
  totalDuration: number;
}

// 数据版本
export interface StorageVersion {
  version: number;
}
