import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  shadow = true,
}) => {
  const Component = onPress ? TouchableOpacity : View;
  
  return (
    <Component
      style={[styles.card, shadow && styles.shadow, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Component>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = Colors.primary,
  onPress,
}) => {
  return (
    <Card onPress={onPress} style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </Card>
  );
};

interface CropCardProps {
  name: string;
  variety?: string;
  status: string;
  plantingDate: string;
  onPress?: () => void;
}

export const CropCard: React.FC<CropCardProps> = ({
  name,
  variety,
  status,
  plantingDate,
  onPress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return Colors.info;
      case 'growing': return Colors.success;
      case 'harvested': return Colors.warning;
      case 'failed': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  return (
    <Card onPress={onPress} style={styles.cropCard}>
      <View style={styles.cropHeader}>
        <Text style={styles.cropName}>{name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      {variety && <Text style={styles.cropVariety}>{variety}</Text>}
      <Text style={styles.cropDate}>Planted: {new Date(plantingDate).toLocaleDateString()}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.medium,
    marginBottom: Spacing.medium,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  // Stat Card
  statCard: {
    alignItems: 'center',
    minWidth: 100,
    marginRight: Spacing.medium,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  statValue: {
    ...Typography.heading2,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.small,
  },
  statTitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Crop Card
  cropCard: {
    marginRight: Spacing.medium,
    minWidth: 200,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.small,
  },
  cropName: {
    ...Typography.heading3,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.small,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  cropVariety: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.small,
  },
  cropDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});