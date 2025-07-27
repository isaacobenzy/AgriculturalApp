import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { Colors, Spacing, Typography } from '../constants';
import { Card } from './ui';

const screenWidth = Dimensions.get('window').width;

interface WeatherChartProps {
  data: Array<{
    date: string;
    temperature: number;
    humidity: number;
    rainfall: number;
  }>;
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ data }) => {
  const chartData = {
    labels: data.slice(-7).map(item => new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        data: data.slice(-7).map(item => item.temperature),
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Temperature Trend (°C)</Text>
      <LineChart
        data={chartData}
        width={screenWidth - 60}
        height={200}
        chartConfig={{
          backgroundColor: Colors.background,
          backgroundGradientFrom: Colors.background,
          backgroundGradientTo: Colors.background,
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: Colors.primary,
          },
        }}
        bezier
        style={styles.chart}
      />
    </Card>
  );
};

interface CropStatusChartProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

export const CropStatusChart: React.FC<CropStatusChartProps> = ({ data }) => {
  const colors = [
    Colors.success,
    Colors.warning,
    Colors.info,
    Colors.error,
  ];

  const chartData = data.map((item, index) => ({
    name: item.status,
    population: item.count,
    color: colors[index % colors.length],
    legendFontColor: Colors.text,
    legendFontSize: 12,
  }));

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Crop Status Distribution</Text>
      <PieChart
        data={chartData}
        width={screenWidth - 60}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </Card>
  );
};

interface ActivityChartProps {
  data: Array<{
    month: string;
    activities: number;
  }>;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        data: data.map(item => item.activities),
      },
    ],
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Monthly Activities</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 60}
        height={200}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: Colors.background,
          backgroundGradientFrom: Colors.background,
          backgroundGradientTo: Colors.background,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.medium,
  },
  title: {
    ...Typography.heading3,
    color: Colors.text,
    marginBottom: Spacing.medium,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});