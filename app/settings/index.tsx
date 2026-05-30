import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimeLogStore } from '../../src/store/timeLogStore';
import { useLogExport } from '../../src/hooks/useLogExport';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const settings = useTimeLogStore((s) => s.settings);
  const toggleAutoTimer = useTimeLogStore((s) => s.toggleAutoTimer);
  const clearAllLogs = useTimeLogStore((s) => s.clearAllLogs);
  const logs = useTimeLogStore((s) => s.logs);

  const { exportCSV, isExporting } = useLogExport();

  const [isToggling, setIsToggling] = useState(false);

  // 自动计时开关
  const handleToggle = useCallback(
    async (value: boolean) => {
      setIsToggling(true);
      await toggleAutoTimer(value);
      setIsToggling(false);
    },
    [toggleAutoTimer]
  );

  // 导出 CSV
  const handleExport = useCallback(async () => {
    await exportCSV();
  }, [exportCSV]);

  // 一键清空
  const handleClearAll = useCallback(() => {
    Alert.alert(
      '⚠️ 确认清空',
      '此操作将永久删除全部日志数据，且不可撤销。\n\n确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认清空',
          style: 'destructive',
          onPress: async () => {
            await clearAllLogs();
            Alert.alert('已清空', '所有日志数据已清除。');
          },
        },
      ]
    );
  }, [clearAllLogs]);

  const bgColor = isDark ? '#1A1A2E' : '#F8F9FA';
  const cardBg = isDark ? '#2D2D44' : '#FFFFFF';
  const textColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const subColor = isDark ? '#ADB5BD' : '#6C757D';
  const borderColor = isDark ? '#3D3D5C' : '#E9ECEF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>设置</Text>

        {/* 自动计时开关 */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingIcon]}>⏱️</Text>
              <View style={styles.settingTextGroup}>
                <Text style={[styles.settingLabel, { color: textColor }]}>自动计时</Text>
                <Text style={[styles.settingDesc, { color: subColor }]}>
                  进入页面时自动开始记录时间
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoTimerEnabled}
              onValueChange={handleToggle}
              trackColor={{ false: '#DEE2E6', true: '#4A90D9' }}
              thumbColor="#FFFFFF"
              disabled={isToggling}
            />
          </View>
        </View>

        {/* 数据导出 */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleExport}
            activeOpacity={0.6}
            disabled={isExporting || logs.length === 0}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📤</Text>
              <View style={styles.settingTextGroup}>
                <Text style={[styles.settingLabel, { color: textColor }]}>导出日志</Text>
                <Text style={[styles.settingDesc, { color: subColor }]}>
                  导出为 CSV 文件并通过系统分享
                </Text>
              </View>
            </View>
            {isExporting ? (
              <ActivityIndicator size="small" color="#4A90D9" />
            ) : (
              <Text style={[styles.actionArrow, { color: subColor }]}>›</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 数据记录统计 */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.infoRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📊</Text>
              <View style={styles.settingTextGroup}>
                <Text style={[styles.settingLabel, { color: textColor }]}>日志总数</Text>
              </View>
            </View>
            <Text style={[styles.infoValue, { color: '#4A90D9' }]}>{logs.length} 条</Text>
          </View>
        </View>

        {/* 危险操作区 */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: '#E74C3C' }]}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleClearAll}
            activeOpacity={0.6}
            disabled={logs.length === 0}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🗑️</Text>
              <View style={styles.settingTextGroup}>
                <Text style={[styles.settingLabel, { color: '#E74C3C' }]}>清空全部日志</Text>
                <Text style={[styles.settingDesc, { color: subColor }]}>
                  此操作不可撤销
                </Text>
              </View>
            </View>
            <Text style={[styles.actionArrow, { color: subColor }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 版本信息 */}
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: subColor }]}>
            DeepSeek Time Log v1.0.0
          </Text>
          <Text style={[styles.versionText, { color: subColor }]}>
            Built with Expo SDK 52
          </Text>
        </View>
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
    gap: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    fontSize: 22,
  },
  settingTextGroup: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  actionArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  versionText: {
    fontSize: 12,
  },
});
