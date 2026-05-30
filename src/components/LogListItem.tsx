import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { TimeLog } from '../types';
import { formatDateTime, formatDuration } from '../utils/dateFormatter';

interface LogListItemProps {
  log: TimeLog;
  onPress: (log: TimeLog) => void;
  onDelete: (log: TimeLog) => void;
}

export const LogListItem = memo(function LogListItem({
  log,
  onPress,
  onDelete,
}: LogListItemProps) {
  const handleDelete = () => {
    Alert.alert(
      '确认删除',
      `确定要删除日志「${log.title}」吗？\n此操作不可撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => onDelete(log),
        },
      ]
    );
  };

  const handleLongPress = () => {
    Alert.alert('操作', `日志：${log.title}`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => onDelete(log),
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(log)}
      onLongPress={handleLongPress}
      activeOpacity={0.6}
      accessibilityLabel={`日志：${log.title}，时长${formatDuration(log.duration)}`}
    >
      {/* 左侧色条 */}
      <View
        style={[styles.colorBar, { backgroundColor: log.category.color }]}
      />

      {/* 中间内容 */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {log.title}
          </Text>
          <Text style={styles.duration}>{formatDuration(log.duration)}</Text>
        </View>

        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: log.category.color + '20' }]}>
            <Text style={[styles.badgeText, { color: log.category.color }]}>
              {log.category.name}
            </Text>
          </View>
          {log.isAuto && (
            <View style={styles.autoBadge}>
              <Text style={styles.autoBadgeText}>自动</Text>
            </View>
          )}
        </View>

        <Text style={styles.time}>
          {formatDateTime(log.startTime)} — {formatDateTime(log.endTime)}
        </Text>

        {log.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {log.note}
          </Text>
        ) : null}
      </View>

      {/* 右侧删除按钮 */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={handleDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="删除"
      >
        <Text style={styles.deleteBtnText}>🗑️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

export default LogListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  colorBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
    marginRight: 8,
  },
  duration: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90D9',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  autoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
  },
  autoBadgeText: {
    fontSize: 10,
    color: '#888',
  },
  time: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  note: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  deleteBtnText: {
    fontSize: 16,
  },
});
