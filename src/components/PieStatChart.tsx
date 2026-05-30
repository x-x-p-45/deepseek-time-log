import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { CategoryStat } from '../types';
import { formatDurationShort } from '../utils/dateFormatter';

interface PieStatChartProps {
  data: CategoryStat[];
}

const CHART_SIZE = 220;
const RADIUS = 90;
const CENTER = CHART_SIZE / 2;
const COLORS_FALLBACK = ['#4A90D9', '#50C878', '#F5A623', '#9B59B6', '#E74C3C', '#1ABC9C', '#34495E', '#E67E22'];

/**
 * 计算 SVG 扇形 Path
 */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? '1' : '0';

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

export function PieStatChart({ data }: PieStatChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { paths, total } = useMemo(() => {
    const totalDuration = data.reduce((sum, d) => sum + d.duration, 0);
    let cumulativeAngle = 0;

    const pathItems = data.map((item, index) => {
      const sliceAngle = totalDuration > 0
        ? (item.duration / totalDuration) * 360
        : 0;

      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle = endAngle;

      const color = item.color || COLORS_FALLBACK[index % COLORS_FALLBACK.length];

      return {
        ...item,
        path: sliceAngle > 0 ? describeArc(CENTER, CENTER, RADIUS, startAngle, endAngle) : '',
        color,
        // 标签放在扇形中间角度
        midAngle: startAngle + sliceAngle / 2,
      };
    });

    return { paths: pathItems, total: totalDuration };
  }, [data]);

  const textColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const subColor = isDark ? '#ADB5BD' : '#6C757D';

  if (data.length === 0 || total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: subColor }]}>暂无数据</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 饼图 */}
      <View style={styles.chartWrapper}>
        <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
          <G>
            {paths.map((item, index) =>
              item.path ? (
                <Path
                  key={index}
                  d={item.path}
                  fill={item.color}
                  stroke={isDark ? '#1A1A2E' : '#FFFFFF'}
                  strokeWidth={2}
                />
              ) : null
            )}
          </G>
        </Svg>
        {/* 中心文字 */}
        <View style={styles.centerLabel}>
          <Text style={[styles.totalLabel, { color: textColor }]}>
            {formatDurationShort(total)}
          </Text>
        </View>
      </View>

      {/* 图例 */}
      <View style={styles.legend}>
        {paths.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendName, { color: textColor }]} numberOfLines={1}>
              {item.categoryName}
            </Text>
            <Text style={[styles.legendPercent, { color: subColor }]}>
              {item.percentage.toFixed(0)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  legend: {
    marginTop: 16,
    width: '100%',
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 12,
    maxWidth: 80,
  },
  legendPercent: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default PieStatChart;
