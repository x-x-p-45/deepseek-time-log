import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAutoTimer } from '../src/hooks/useAutoTimer';
import { useTimeLogStore } from '../src/store/timeLogStore';
import { formatDuration } from '../src/utils/dateFormatter';

/**
 * 首页 —— AI 对话自动计时演示页
 */
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categories = useTimeLogStore((s) => s.categories);
  const getElapsedMs = useTimeLogStore((s) => s.getElapsedMs);

  const aiCategory = categories.find((c) => c.id === 'default_ai_chat') ?? categories[0];

  const { isRunning } = useAutoTimer(
    aiCategory?.id ?? '',
    'chat',
    'AI 对话'
  );

  const [elapsedDisplay, setElapsedDisplay] = useState('00:00');

  // 每秒刷新已过时间
  useEffect(() => {
    if (!isRunning) {
      setElapsedDisplay('00:00');
      return;
    }

    const interval = setInterval(() => {
      const ms = getElapsedMs();
      const totalSec = Math.floor(ms / 1000);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      setElapsedDisplay(
        `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, getElapsedMs]);

  // 模拟对话数据
  const demoMessages = [
    { role: 'user', text: '帮我用 React Native 写一个登录页面' },
    { role: 'ai', text: '好的，我来为你生成一个完整的登录页面组件，包含表单验证和样式...' },
    { role: 'user', text: '能加上社交登录按钮吗？' },
    { role: 'ai', text: '当然可以，我来添加微信和 Apple 登录的按钮...' },
  ];

  const bgColor = isDark ? '#1A1A2E' : '#F8F9FA';
  const cardBg = isDark ? '#2D2D44' : '#FFFFFF';
  const textColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const subColor = isDark ? '#ADB5BD' : '#6C757D';
  const userBubble = isDark ? '#3A3A5C' : '#E3F0FF';
  const aiBubble = isDark ? '#2D2D44' : '#FFFFFF';
  const borderColor = isDark ? '#3D3D5C' : '#E9ECEF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      {/* 头部 */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>AI 对话</Text>
        {/* 计时状态 */}
        <View style={styles.timerBadge}>
          <View style={[styles.timerDot, isRunning && styles.timerDotActive]} />
          <Text style={[styles.timerText, { color: isRunning ? '#50C878' : subColor }]}>
            {isRunning ? `计时中 ${elapsedDisplay}` : '未计时'}
          </Text>
        </View>
      </View>

      {/* 对话区域 */}
      <ScrollView
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {demoMessages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.messageRow,
              msg.role === 'user' ? styles.userRow : styles.aiRow,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.role === 'user'
                  ? [styles.userBubble, { backgroundColor: userBubble }]
                  : [styles.aiBubble, { backgroundColor: aiBubble, borderColor: borderColor }],
              ]}
            >
              <Text style={[styles.messageRole, { color: subColor }]}>
                {msg.role === 'user' ? '👤 用户' : '🤖 DeepSeek'}
              </Text>
              <Text style={[styles.messageText, { color: textColor }]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 底部信息栏 */}
      <View style={[styles.footer, { backgroundColor: cardBg, borderTopColor: borderColor }]}>
        <View style={styles.footerInfo}>
          <Text style={[styles.footerLabel, { color: subColor }]}>当前分类</Text>
          <View style={styles.footerCategory}>
            <View style={[styles.footerDot, { backgroundColor: aiCategory?.color ?? '#4A90D9' }]} />
            <Text style={[styles.footerValue, { color: textColor }]}>
              {aiCategory?.name ?? 'AI 对话'}
            </Text>
          </View>
        </View>
        <View style={styles.footerInfo}>
          <Text style={[styles.footerLabel, { color: subColor }]}>计时模式</Text>
          <Text style={[styles.footerValue, { color: textColor }]}>
            {isRunning ? '🟢 自动记录中' : '⚪ 已暂停'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ADB5BD',
  },
  timerDotActive: {
    backgroundColor: '#50C878',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  messageRole: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerInfo: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  footerCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '500',
  },
});
