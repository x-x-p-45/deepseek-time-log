import React from 'react';
import { Stack } from 'expo-router';

/**
 * 日志模块 Stack 导航
 */
export default function LogsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#4A90D9',
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: '时间日志' }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          title: (route.params as { id?: string })?.id === 'new'
            ? '新增日志'
            : '编辑日志',
          presentation: 'card',
        })}
      />
    </Stack>
  );
}
