import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, useWindowDimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { DailyStat } from '../types';
import { formatDurationShort } from '../utils/dateFormatter';

interface BarStatChartProps {
  data: DailyStat[];
}

const BAR_WIDTH = 36;
const BAR_GAP = 16;
const CHART_HEIGHT = 200;
const LEFT_PADDING = 40;
const RIGHT_PADDING = 16;
const TOP_PADDING = 16;
const BOTTOM_PADDING = 30;

export function BarStatChart({ data }: BarStatChartProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();

  const textColor = isDark ? '#E9ECEF' : '#1A1A2E';
  const subColor = isDark ? '#ADB5BD' : '#6C757D';
  const axisColor = isDark ? '#495057' : '#DEE2E6';
  const barColor = '#4A90D9';

  const { chartWidth, yLabels, barItems } = useMemo(() => {
    const totalWidth = LEFT_PADDING + data.length * (BAR_WIDTH + BAR_GAP) + RIGHT_PADDING;
    const drawWidth = totalWidth - LEFT_PADDING - RIGHT_PADDING;

    // Y 轴刻度
    const maxVal = data.reduce((max, d) => Math.max(max, d.totalDuration), 0);
    const yMax = maxVal > 0 ? maxVal * 1.15 : 3600000; // 至少 1h
    const stepCount = 4;
    const step = yMax / stepCount;

    const labels: { label: string; y: number }[] = [];
    for (let i = 0; i <= stepCount; i++) {
      const val = step * i;
      const y = TOP_PADDING + CHART_HEIGHT - (val / yMax) * CHART_HEIGHT;
      labels.push({ label: formatDurationShort(val), y });
    }

    // 柱状图数据
    const bars = data.map((item, index) => {
      const barHeight = yMax > 0 ? (item.totalDuration / yMax) * CHART_HEIGHT : 0;
      const x = LEFT_PADDING + index * (BAR_WIDTH + BAR_GAP);
      const y = TOP_PADDING + CHART_HEIGHT - barHeight;

      // 短标签：MM-DD
      const dateLabel = item.date.length >= 5
        ? item.date.slice(5) // 'MM-DD'
        : item.date;

      return {
        x,
        y: y > TOP_PADDING ? y : TOP_PADDING,
        height: Math.max(barHeight, 2),
        label: dateLabel,
        valueLabel: formatDurationShort(item.totalDuration),
      };
    });

    return {
      chartWidth: Math.max(totalWidth, screenWidth - 32),
      yLabels: labels,
      barItems: bars,
    };
  }, [data, screenWidth]);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: subColor }]}>暂无数据</Text>
      </View>
    );
  }

  const svgHeight = TOP_PADDING + CHART_HEIGHT + BOTTOM_PADDING;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollContainer}
    >
      <Svg width={chartWidth} height={svgHeight} viewBox={`0 0 ${chartWidth} ${svgHeight}`}>
        <G>
          {/* Y 轴网格线 + 标签 */}
          {yLabels.map((yl, i) => (
            <G key={`y-${i}`}>
              <Line
                x1={LEFT_PADDING}
                y1={yl.y}
                x2={chartWidth - RIGHT_PADDING}
                y2={yl.y}
                stroke={axisColor}
                strokeWidth={1}
                strokeDasharray={i === 0 ? '' : '4,4'}
              />
              <SvgText
                x={LEFT_PADDING - 8}
                y={yl.y + 4}
                fill={subColor}
                fontSize={11}
                textAnchor="end"
              >
                {yl.label}
              </SvgText>
            </G>
          ))}

          {/* 柱形 */}
          {barItems.map((bar, i) => (
            <G key={`bar-${i}`}>
              <Rect
                x={bar.x}
                y={bar.y}
                width={BAR_WIDTH}
                height={bar.height}
                fill={barColor}
                rx={4}
                ry={4}
                opacity={0.9}
              />
              {/* 顶部数值 */}
              <SvgText
                x={bar.x + BAR_WIDTH / 2}
                y={bar.y - 6}
                fill={textColor}
                fontSize={10}
                fontWeight="600"
                textAnchor="middle"
              >
                {bar.valueLabel}
              </SvgText>
              {/* X 轴标签 */}
              <SvgText
                x={bar.x + BAR_WIDTH / 2}
                y={TOP_PADDING + CHART_HEIGHT + 18}
                fill={subColor}
                fontSize={10}
                textAnchor="middle"
              >
                {bar.label}
              </SvgText>
            </G>
          ))}
        </G>
      </Svg>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 14,
  },
});

export default BarStatChart;
