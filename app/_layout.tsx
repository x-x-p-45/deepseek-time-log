import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { useTimeLogStore } from '../src/store/timeLogStore';

/**
 * 根布局：Tabs 导航 + 主题 + ErrorBoundary + 数据初始化
 */
export default function RootLayout() {
  const [initError, setInitError] = useState<string | null>(null);
  const loadFromStorage = useTimeLogStore((s) => s.loadFromStorage);
  const isLoaded = useTimeLogStore((s) => s.isLoaded);

  useEffect(() => {
    loadFromStorage().catch((err) => {
      console.error('[RootLayout] Init failed:', err);
      setInitError(err instanceof Error ? err.message : '初始化失败');
    });
  }, []);

  // 加载中
  if (!isLoaded && !initError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90D9" />
        <Text style={styles.loadingText}>加载中...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  // 初始化异常
  if (initError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>初始化失败</Text>
        <Text style={styles.errorDetail}>{initError}</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#4A90D9',
            tabBarInactiveTintColor: '#ADB5BD',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopColor: '#F0F0F0',
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: '500',
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: '首页',
              tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text>,
            }}
          />
          <Tabs.Screen
            name="logs"
            options={{
              title: '日志',
              headerShown: false,
              tabBarIcon: () => <Text style={{ fontSize: 20 }}>📋</Text>,
            }}
          />
          <Tabs.Screen
            name="stats"
            options={{
              title: '统计',
              tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text>,
            }}
          />
          <Tabs.Screen
            name="category"
            options={{
              title: '分类',
              tabBarIcon: () => <Text style={{ fontSize: 20 }}>📂</Text>,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: '设置',
              tabBarIcon: () => <Text style={{ fontSize: 20 }}>⚙️</Text>,
            }}
          />
        </Tabs>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6C757D',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 13,
    color: '#E74C3C',
    textAlign: 'center',
  },
});
