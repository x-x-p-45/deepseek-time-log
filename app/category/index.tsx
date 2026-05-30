import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  FlatList,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimeLogStore } from '../../src/store/timeLogStore';
import { LogCategory } from '../../src/types';
import { EmptyState } from '../../src/components/EmptyState';

const PRESET_COLORS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C',
  '#3498DB', '#9B59B6', '#E91E63', '#00BCD4', '#FF5722',
  '#795548', '#607D8B', '#4A90D9', '#50C878', '#F5A623',
];

export default function CategoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const categories = useTimeLogStore((s) => s.categories);
  const addCategory = useTimeLogStore((s) => s.addCategory);
  const updateCategory = useTimeLogStore((s) => s.updateCategory);
  const deleteCategory = useTimeLogStore((s) => s.deleteCategory);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<LogCategory | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

  // 系统分类 vs 自定义分类
  const defaultCategories = categories.filter((c) => c.isDefault);
  const customCategories = categories.filter((c) => !c.isDefault);

  const bgColor = isDark ? '#1A1A2E' : '#F8F9FA';
  const cardBg = isDark ? '#2D2D44' : '#FFFFFF';
  const textColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const subColor = isDark ? '#ADB5BD' : '#6C757D';
  const borderColor = isDark ? '#3D3D5C' : '#E9ECEF';
  const inputBg = isDark ? '#1A1A2E' : '#F0F0F0';

  // 打开新增弹窗
  const openAddModal = useCallback(() => {
    setEditingCategory(null);
    setNewName('');
    setNewColor(PRESET_COLORS[0]);
    setModalVisible(true);
  }, []);

  // 打开编辑弹窗
  const openEditModal = useCallback((cat: LogCategory) => {
    setEditingCategory(cat);
    setNewName(cat.name);
    setNewColor(cat.color);
    setModalVisible(true);
  }, []);

  // 保存（新增或编辑）
  const handleSave = useCallback(async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('提示', '请输入分类名称');
      return;
    }
    if (trimmed.length > 20) {
      Alert.alert('提示', '分类名称不能超过20个字符');
      return;
    }

    // 检查重名
    const duplicate = categories.find(
      (c) => c.name === trimmed && c.id !== editingCategory?.id
    );
    if (duplicate) {
      Alert.alert('提示', '已存在同名分类，请使用其他名称');
      return;
    }

    if (editingCategory) {
      await updateCategory(editingCategory.id, trimmed, newColor);
    } else {
      await addCategory(trimmed, newColor);
    }

    setModalVisible(false);
  }, [newName, newColor, editingCategory, categories, addCategory, updateCategory]);

  // 删除自定义分类
  const handleDelete = useCallback(
    (cat: LogCategory) => {
      Alert.alert(
        '确认删除',
        `确定要删除分类「${cat.name}」吗？\n关联的日志将自动迁移至"AI 对话"分类。`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '删除',
            style: 'destructive',
            onPress: () => deleteCategory(cat.id),
          },
        ]
      );
    },
    [deleteCategory]
  );

  const renderCategoryItem = useCallback(
    ({ item }: { item: LogCategory }) => (
      <View style={[styles.categoryItem, { backgroundColor: cardBg, borderColor }]}>
        {/* 颜色指示 */}
        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
        {/* 名称 */}
        <Text style={[styles.categoryName, { color: textColor }]} numberOfLines={1}>
          {item.name}
        </Text>
        {/* 类型标签 */}
        {item.isDefault ? (
          <View style={[styles.tag, { backgroundColor: isDark ? '#3D3D5C' : '#E9ECEF' }]}>
            <Text style={[styles.tagText, { color: subColor }]}>系统</Text>
          </View>
        ) : null}
        {/* 操作按钮 */}
        {!item.isDefault && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => openEditModal(item)}
              accessibilityLabel="编辑"
            >
              <Text style={styles.iconText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => handleDelete(item)}
              accessibilityLabel="删除"
            >
              <Text style={styles.iconText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [cardBg, textColor, subColor, borderColor, isDark, openEditModal, handleDelete]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]} edges={['top']}>
      <FlatList
        data={[...defaultCategories, ...customCategories]}
        keyExtractor={(item) => item.id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Text style={[styles.title, { color: textColor }]}>分类管理</Text>

            {/* 系统分类标题 */}
            {defaultCategories.length > 0 && (
              <Text style={[styles.sectionTitle, { color: subColor }]}>系统默认分类</Text>
            )}

            {/* 自定义分类标题 */}
            <Text style={[styles.sectionTitle, { color: subColor }]}>
              自定义分类
              {customCategories.length === 0 && '（暂无）'}
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={openAddModal}
            activeOpacity={0.7}
          >
            <Text style={styles.addBtnText}>+ 新增分类</Text>
          </TouchableOpacity>
        }
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        ListEmptyComponent={
          customCategories.length === 0 && defaultCategories.length === 0 ? (
            <EmptyState icon="📂" title="暂无分类" subtitle="点击下方按钮添加自定义分类" />
          ) : null
        }
      />

      {/* 新增/编辑弹窗 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              {editingCategory ? '编辑分类' : '新增分类'}
            </Text>

            {/* 名称输入 */}
            <Text style={[styles.fieldLabel, { color: subColor }]}>名称</Text>
            <TextInput
              style={[styles.nameInput, { backgroundColor: inputBg, color: textColor, borderColor }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="分类名称"
              placeholderTextColor={subColor}
              maxLength={20}
              autoFocus
            />

            {/* 颜色选择 */}
            <Text style={[styles.fieldLabel, { color: subColor }]}>颜色</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setNewColor(color)}
                  activeOpacity={0.7}
                />
              ))}
            </View>

            {/* 操作按钮 */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn, { borderColor }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: subColor }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveModalBtn]}
                onPress={handleSave}
              >
                <Text style={[styles.modalBtnText, { color: '#FFFFFF' }]}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 4,
  },
  iconText: {
    fontSize: 16,
  },
  addBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#4A90D9',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#4A90D9',
    fontSize: 15,
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  nameInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelModalBtn: {
    borderWidth: 1,
  },
  saveModalBtn: {
    backgroundColor: '#4A90D9',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
