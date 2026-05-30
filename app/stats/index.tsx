import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieStatChart } from '../../src/components/PieStatChart';
import { BarStatChart } from '../../src/components/BarStatChart';
import { EmptyState } from '../../src/components/EmptyState';
import { useLogStats, TimeRange } from '../../src/hooks/useLogStats';
import { formatDuration } from '../../src/utils/dateFormatter';

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: 'day', label: '日' },
  { key: 'week', label: '周' },
  { key: 'month', label: '月' },
];

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [range, setRange] = useState<TimeRange>('day');

  const { categoryStats, dailyStats, totalDuration, filteredLogs } = useLogStats(range);

  const handleRangeChange = useCallback((r: TimeRange) => {
    setRange(r);
  }, []);

  const bgColor = isDark ? '#1A1A2E' : '#F8F9FA';
  const cardBg = isDark ? '#2D2D44' : '#FFFFFF';
  const textColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const subColor = isDark ? '#ADB5BD' : '#6C757D';
  const borderColor = isDark ? '#3D3D5C' : '#E9ECEF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 标题 */}
        <Text style={[styles.title, { color: textColor }]}>数据统计</Text>

        {/* 时间范围切换 */}
        <View style={[styles.segment, { backgroundColor: isDark ? '#1A1A2E' : '#F0F0F0' }]}>
          {TIME_RANGES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[
                styles.segmentItem,
                range === r.key && { backgroundColor: '#4A90D9' },
              ]}
              onPress={() => handleRangeChange(r.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.segmentText,
                  range === r.key
                    ? { color: '#FFFFFF' }
                    : { color: subColor },
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 总时长卡片 */}
        <View style={[styles.totalCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.totalLabel, { color: subColor }]}>
            {range === 'day' ? '今日' : range === 'week' ? '本周' : '本月'}使用总时长
          </Text>
          <Text style={[styles.totalValue, { color: '#4A90D9' }]}>
            {formatDuration(totalDuration)}
          </Text>
          <Text style={[styles.totalLogs, { color: subColor }]}>
            {filteredLogs.length} 条记录
          </Text>
        </View>

        {filteredLogs.length === 0 ? (
          <EmptyState
            icon="📊"
            title="暂无统计数据"
            subtitle="开始使用后这里将展示你的时间使用分析"
          />
        ) : (
          <>
            {/* 饼图 —— 分类占比 */}
            <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.chartTitle, { color: textColor }]}>分类时长占比</Text>
              <PieStatChart data={categoryStats} />
            </View>

            {/* 柱状图 —— 每日时长 */}
            <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor }]}>
              <Text style={[styles.chartTitle, { color: textColor }]}>
                {range === 'day' ? '今日' : '每日'}使用时长
              </Text>
              <BarStatChart data={dailyStats} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  totalLogs: {
    fontSize: 12,
  },
  chartCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});
