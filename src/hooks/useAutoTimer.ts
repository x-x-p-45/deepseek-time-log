import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useTimeLogStore } from '../store/timeLogStore';
import { generateUUID } from '../utils/uuid';
import { TimeLog } from '../types';

/**
 * 页面自动计时 Hook
 *
 * 行为：
 * - 页面挂载 → 若 autoTimerEnabled 开启则启动计时
 * - App 切后台 → 暂停计时（保留已累计毫秒）
 * - App 切前台 → 恢复计时
 * - 页面卸载 → 停止计时，时长 ≥ 1s 则保存日志
 * - 单例约束：同一时间仅一条运行计时，新计时自动结束上一条
 *
 * @param categoryId - 关联的分类 ID
 * @param sourcePage - 来源页面标识 chat/code/doc/search/custom
 * @param title - 日志标题
 */
export function useAutoTimer(
  categoryId: string,
  sourcePage: string,
  title: string
) {
  const {
    settings,
    categories,
    runningCache,
    startTimer,
    stopTimer,
    addLog,
  } = useTimeLogStore();

  const pausedMsRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const timerIdRef = useRef<string | null>(null);

  // 保存当前计时日志
  const saveCurrentLog = useCallback(() => {
    const cache = stopTimer();
    if (!cache) return;

    const totalElapsed = Date.now() - cache.startTime + pausedMsRef.current;
    if (totalElapsed < 1000) return; // 不足 1 秒不记录

    const category = categories.find((c) => c.id === cache.categoryId) ?? categories[0];
    if (!category) return;

    const log: TimeLog = {
      id: cache.id,
      title: cache.title,
      category,
      startTime: cache.startTime,
      endTime: Date.now(),
      duration: totalElapsed,
      note: '',
      isAuto: true,
      sourcePage: cache.sourcePage,
      createdAt: cache.startTime,
      updatedAt: Date.now(),
    };
    addLog(log);
  }, [stopTimer, categories, addLog]);

  useEffect(() => {
    // 首次挂载时，AppState 可能不是 active（如从后台恢复），设置监听器
    if (!settings.autoTimerEnabled) return;

    const timerId = generateUUID();
    timerIdRef.current = timerId;

    // 启动计时器
    startTimer({
      id: timerId,
      title,
      categoryId,
      startTime: Date.now(),
      sourcePage,
    });

    // 监听 App 前后台切换
    const handleAppStateChange = (nextState: AppStateStatus) => {
      const prevState = appStateRef.current;

      // 前台 → 后台：暂停
      if (prevState === 'active' && nextState.match(/inactive|background/)) {
        const cache = useTimeLogStore.getState().runningCache;
        if (cache && cache.id === timerId) {
          pausedMsRef.current += Date.now() - cache.startTime;
        }
      }

      // 后台 → 前台：恢复
      if (prevState.match(/inactive|background/) && nextState === 'active') {
        const cache = useTimeLogStore.getState().runningCache;
        if (cache && cache.id === timerId) {
          // 更新 startTime 以继续计时
          useTimeLogStore.setState({
            runningCache: { ...cache, startTime: Date.now() },
          });
        }
      }

      appStateRef.current = nextState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 页面卸载：停止计时并保存
    return () => {
      subscription.remove();

      // 若当前后台状态，不保存（下次前台再恢复也可，但卸载说明离开页面了）
      // 检查 runningCache 是否仍是当前计时
      const currentCache = useTimeLogStore.getState().runningCache;
      if (currentCache && currentCache.id === timerId) {
        const totalElapsed =
          Date.now() - currentCache.startTime + pausedMsRef.current;
        stopTimer();

        if (totalElapsed >= 1000) {
          const cats = useTimeLogStore.getState().categories;
          const cat = cats.find((c) => c.id === categoryId) ?? cats[0];
          if (cat) {
            const log: TimeLog = {
              id: currentCache.id,
              title,
              category: cat,
              startTime: currentCache.startTime - pausedMsRef.current, // 还原真实开始时间
              endTime: Date.now(),
              duration: totalElapsed,
              note: '',
              isAuto: true,
              sourcePage,
              createdAt: currentCache.startTime - pausedMsRef.current,
              updatedAt: Date.now(),
            };
            useTimeLogStore.getState().addLog(log);
          }
        }
      }
    };
  }, [settings.autoTimerEnabled]);

  return {
    isRunning: runningCache !== null && runningCache.id === timerIdRef.current,
  };
}

export default useAutoTimer;
