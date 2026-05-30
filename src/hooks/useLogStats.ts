import { useMemo } from 'react';
import { useTimeLogStore } from '../store/timeLogStore';
import { CategoryStat, DailyStat } from '../types';
import {
  getDayStart,
  getDayEnd,
  getWeekStart,
  getMonthStart,
} from '../utils/dateFormatter';

export type TimeRange = 'day' | 'week' | 'month';

export function useLogStats(range: TimeRange) {
  const logs = useTimeLogStore((s) => s.logs);
  const categories = useTimeLogStore((s) => s.categories);

  const now = new Date();

  // 计算时间区间
  const { startTime, endTime } = useMemo(() => {
    switch (range) {
      case 'day':
        return { startTime: getDayStart(now), endTime: getDayEnd(now) };
      case 'week':
        return {
          startTime: getWeekStart(now),
          endTime: getDayEnd(now),
        };
      case 'month':
        return {
          startTime: getMonthStart(now),
          endTime: getDayEnd(now),
        };
    }
  }, [range]);

  // 筛选当前区间的日志
  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) => log.startTime >= startTime && log.startTime <= endTime
    );
  }, [logs, startTime, endTime]);

  // 按分类汇总 → 饼图数据
  const categoryStats: CategoryStat[] = useMemo(() => {
    const map = new Map<string, { name: string; color: string; duration: number }>();

    filteredLogs.forEach((log) => {
      const cid = log.category.id;
      const existing = map.get(cid);
      if (existing) {
        existing.duration += log.duration;
      } else {
        map.set(cid, {
          name: log.category.name,
          color: log.category.color,
          duration: log.duration,
        });
      }
    });

    const totalDuration = filteredLogs.reduce((sum, l) => sum + l.duration, 0);

    const result: CategoryStat[] = [];
    map.forEach((v) => {
      result.push({
        categoryName: v.name,
        color: v.color,
        duration: v.duration,
        percentage: totalDuration > 0 ? (v.duration / totalDuration) * 100 : 0,
      });
    });

    // 按 duration 降序
    result.sort((a, b) => b.duration - a.duration);
    return result;
  }, [filteredLogs]);

  // 按自然日汇总 → 柱状图数据
  const dailyStats: DailyStat[] = useMemo(() => {
    const map = new Map<string, number>();

    // 生成区间内全部日期
    const days: string[] = [];
    const cursor = new Date(startTime);
    while (cursor.getTime() <= endTime) {
      const key = `${cursor.getFullYear()}-${(cursor.getMonth() + 1).toString().padStart(2, '0')}-${cursor.getDate().toString().padStart(2, '0')}`;
      days.push(key);
      map.set(key, 0);
      cursor.setDate(cursor.getDate() + 1);
    }

    // 汇总每天时长
    filteredLogs.forEach((log) => {
      const key = `${new Date(log.startTime).getFullYear()}-${(new Date(log.startTime).getMonth() + 1).toString().padStart(2, '0')}-${new Date(log.startTime).getDate().toString().padStart(2, '0')}`;
      const existing = map.get(key);
      if (existing !== undefined) {
        map.set(key, existing + log.duration);
      }
    });

    return days.map((date) => ({
      date,
      totalDuration: map.get(date) ?? 0,
    }));
  }, [filteredLogs, startTime, endTime]);

  // 总时长
  const totalDuration = useMemo(
    () => filteredLogs.reduce((sum, l) => sum + l.duration, 0),
    [filteredLogs]
  );

  return {
    filteredLogs,
    categoryStats,
    dailyStats,
    totalDuration,
    startTime,
    endTime,
  };
}

export default useLogStats;
