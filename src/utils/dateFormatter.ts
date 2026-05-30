/**
 * 格式化毫秒时间戳为可读日期时间字符串
 * 格式：YYYY-MM-DD HH:mm
 */
export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 格式化毫秒时间戳为日期字符串
 * 格式：YYYY-MM-DD
 */
export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * 格式化毫秒时间戳为时间字符串
 * 格式：HH:mm
 */
export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * 格式化毫秒时长为可读字符串
 * 输出示例：2h30m、45m、1h、30s、1h15m30s
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && hours === 0) parts.push(`${seconds}s`);
  if (parts.length === 0 && seconds === 0 && (hours > 0 || minutes > 0)) {
    // 整小时/整分钟的情况，不需要额外显示
  }

  return parts.join('') || '0s';
}

/**
 * 格式化毫秒时长为短格式（用于图表等空间有限的地方）
 * 输出示例：2.5h、0.5h、1.0h
 */
export function formatDurationShort(ms: number): string {
  if (ms <= 0) return '0h';
  const hours = ms / 3600000;
  if (hours < 1) {
    const minutes = Math.floor(ms / 60000);
    return `${minutes}m`;
  }
  return `${hours.toFixed(1)}h`;
}

/**
 * 格式化秒数为可读时长（用于 CSV 导出）
 */
export function formatDurationSeconds(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * 获取某天零点时间戳
 */
export function getDayStart(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * 获取某天结束时间戳（次日零点 - 1ms）
 */
export function getDayEnd(date: Date): number {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * 获取本周一零点
 */
export function getWeekStart(date: Date): number {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1; // 周一为一周开始
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * 获取本月第一天零点
 */
export function getMonthStart(date: Date): number {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * 获取时间范围标签文本
 */
export function getRangeLabel(range: 'day' | 'week' | 'month'): string {
  switch (range) {
    case 'day': return '今天';
    case 'week': return '本周';
    case 'month': return '本月';
  }
}
