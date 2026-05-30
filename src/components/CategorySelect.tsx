import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LogCategory } from '../types';

interface CategorySelectProps {
  categories: LogCategory[];
  selectedId: string | null; // null = 全部
  onSelect: (categoryId: string | null) => void;
  showAllOption?: boolean;
}

export function CategorySelect({
  categories,
  selectedId,
  onSelect,
  showAllOption = true,
}: CategorySelectProps) {
  const items = useMemo(() => {
    const list: { id: string | null; name: string; color: string }[] = [];
    if (showAllOption) {
      list.push({ id: null, name: '全部', color: '#6C757D' });
    }
    categories.forEach((c) => {
      list.push({ id: c.id, name: c.name, color: c.color });
    });
    return list;
  }, [categories, showAllOption]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <TouchableOpacity
            key={item.id ?? '__all__'}
            style={[
              styles.chip,
              isSelected && { backgroundColor: item.color },
            ]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.7}
            accessibilityLabel={`筛选分类：${item.name}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              style={[
                styles.chipText,
                isSelected && { color: '#FFFFFF' },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E9ECEF',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#495057',
  },
});

export default CategorySelect;
