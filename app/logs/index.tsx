import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimeLogStore } from '../../src/store/timeLogStore';
import { LogListItem } from '../../src/components/LogListItem';
import { CategorySelect } from '../../src/components/CategorySelect';
import { EmptyState } from '../../src/components/EmptyState';
import { TimeLog } from '../../src/types';
import { getDayStart, getDayEnd } from '../../src/utils/dateFormatter';

type TimeFilter = 'all' | 'today' | '7days' | '30days';

export default function LogListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const logs = useTimeLogStore((s) => s.logs);
  const categories = useTimeLogStore((s) => s.categories);
  const deleteLog = useTimeLogStore((s) => s.deleteLog);

  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  // 计算时间过滤范围
  const getTimeRange = useCallback((filter: TimeFilter): { start?: number; end?: number } => {
    const now = new Date();
    switch (filter) {
      case 'today':
        return { start: getDayStart(now), end: getDayEnd(now) };
      case '7days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        return { start: getDayStart(start), end: getDayEnd(now) };
      }
      case '30days': {
        const start = new Date(now);
        start.setDate(start.getDate() - 29);
        return { start: getDayStart(start), end: getDayEnd(now) };
      }
      default:
        return {};
    }
  }, []);

  // 筛选 + 排序
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // 时间范围过滤
    const { start, end } = getTimeRange(timeFilter);
    if (start !== undefined && end !== undefined) {
      result = result.filter((log) => log.startTime >= start && log.startTime <= end);
    }

    // 搜索过滤
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (log) =>
          log.title.toLowerCase().includes(keyword) ||
          log.note.toLowerCase().includes(keyword)
      );
    }

    // 分类过滤
    if (selectedCategoryId) {
      result = result.filter((log) => log.category.id === selectedCategoryId);
    }

    // 倒序排列
    result.sort((a, b) => b.startTime - a.startTime);

    return result;
  }, [logs, searchText, selectedCategoryId, timeFilter, getTimeRange]);

  // 删除处理
  const handleDelete = useCallback(
    async (log: TimeLog) => {
      await deleteLog(log.id);
    },
    [deleteLog]
  );

  // 点击日志 → 编辑页
  const handlePress = useCallback(
    (log: TimeLog) => {
      router.push(`/logs/${log.id}` as any);
    },
    [router]
  );

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // 重新从存储加载（可扩展）
    await new Promise((r) => setTimeout(r, 300));
    setRefreshing(false);
  }, []);

  const bgColor = isDark ? '#1A1A2E' : '#F8F9FA';
  const cardBg = isDark ? '#2D2D44' : '#FFFFFF';
  const textColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const subColor = isDark ? '#ADB5BD' : '#6C757D';
  const borderColor = isDark ? '#3D3D5C' : '#E9ECEF';
  const inputBg = isDark ? '#2D2D44' : '#F0F0F0';

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'today', label: '今天' },
    { key: '7days', label: '7天' },
    { key: '30days', label: '30天' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* 搜索栏 */}
      <View style={[styles.searchBar, { backgroundColor: cardBg }]}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: inputBg, color: textColor }]}
          placeholder="搜索日志标题或备注..."
          placeholderTextColor={subColor}
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText('')}
            style={styles.clearBtn}
            accessibilityLabel="清除搜索"
          >
            <Text style={[styles.clearBtnText, { color: subColor }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 时间筛选 */}
      <View style={styles.timeFilterRow}>
        {timeFilters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.timeChip,
              timeFilter === f.key && { backgroundColor: '#4A90D9' },
            ]}
            onPress={() => setTimeFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.timeChipText,
                timeFilter === f.key
                  ? { color: '#FFFFFF' }
                  : { color: subColor },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 分类筛选 */}
      <CategorySelect
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
        showAllOption={true}
      />

      {/* 列表 */}
      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LogListItem log={item} onPress={handlePress} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        windowSize={10}
        ListEmptyComponent={
          <EmptyState
            icon="📭"
            title="暂无日志记录"
            subtitle={searchText || selectedCategoryId || timeFilter !== 'all'
              ? '尝试调整筛选条件'
              : '返回首页开始自动计时，或点击右上角新增日志'}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      />

      {/* 新增按钮（FAB） */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/logs/new' as any)}
        activeOpacity={0.8}
        accessibilityLabel="新增日志"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* 底部统计信息 */}
      <View style={[styles.statsBar, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
        <Text style={[styles.statsText, { color: subColor }]}>
          共 {filteredLogs.length} 条记录
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 10,
    paddingRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  clearBtn: {
    padding: 6,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#E9ECEF',
  },
  timeChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 52,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 30,
  },
  statsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
  },
});
