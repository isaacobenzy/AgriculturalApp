import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Colors, Spacing, Typography } from '../constants';
import { Button, Input, Card, LoadingSpinner } from './ui';
import { useAppStore } from '../hooks/useApp';
import { useAuthStore } from '../hooks/useAuth';
import { Crop } from '../types';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  crop_id?: string;
}

interface Income {
  id: string;
  source: string;
  amount: number;
  description: string;
  date: string;
  crop_id?: string;
}

export const FinanceManager: React.FC = () => {
  const { user } = useAuthStore();
  const { crops } = useAppStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    description: '',
    crop_id: '',
  });

  const [incomeForm, setIncomeForm] = useState({
    source: '',
    amount: '',
    description: '',
    crop_id: '',
  });

  const categories = [
    'Seeds & Plants',
    'Fertilizers',
    'Pesticides',
    'Equipment',
    'Labor',
    'Utilities',
    'Transportation',
    'Other',
  ];

  const incomeSources = [
    'Crop Sales',
    'Livestock Sales',
    'Equipment Rental',
    'Consulting',
    'Government Subsidies',
    'Other',
  ];

  const resetExpenseForm = () => {
    setExpenseForm({
      category: '',
      amount: '',
      description: '',
      crop_id: '',
    });
    setEditingExpense(null);
  };

  const resetIncomeForm = () => {
    setIncomeForm({
      source: '',
      amount: '',
      description: '',
      crop_id: '',
    });
    setEditingIncome(null);
  };

  const handleAddExpense = async () => {
    if (!expenseForm.category || !expenseForm.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newExpense: Expense = {
        id: Date.now().toString(),
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: new Date().toISOString(),
        crop_id: expenseForm.crop_id || undefined,
      };

      setExpenses(prev => [newExpense, ...prev]);
      setShowExpenseModal(false);
      resetExpenseForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = async () => {
    if (!incomeForm.source || !incomeForm.amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const newIncome: Income = {
        id: Date.now().toString(),
        source: incomeForm.source,
        amount: parseFloat(incomeForm.amount),
        description: incomeForm.description,
        date: new Date().toISOString(),
        crop_id: incomeForm.crop_id || undefined,
      };

      setIncome(prev => [newIncome, ...prev]);
      setShowIncomeModal(false);
      resetIncomeForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to add income');
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <Animatable.View animation="fadeInUp" delay={100}>
          <View style={styles.summaryContainer}>
            <Card style={[styles.summaryCard, { backgroundColor: Colors.success + '20' }]}>
              <Text style={styles.summaryLabel}>Total Income</Text>
              <Text style={[styles.summaryAmount, { color: Colors.success }]}>
                ${totalIncome.toFixed(2)}
              </Text>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: Colors.error + '20' }]}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={[styles.summaryAmount, { color: Colors.error }]}>
                ${totalExpenses.toFixed(2)}
              </Text>
            </Card>

            <Card style={[styles.summaryCard, { backgroundColor: netProfit >= 0 ? Colors.success + '20' : Colors.error + '20' }]}>
              <Text style={styles.summaryLabel}>Net Profit</Text>
              <Text style={[styles.summaryAmount, { color: netProfit >= 0 ? Colors.success : Colors.error }]}>
                ${netProfit.toFixed(2)}
              </Text>
            </Card>
          </View>
        </Animatable.View>

        {/* Action Buttons */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.actionContainer}>
          <Button
            title="Add Expense"
            onPress={() => setShowExpenseModal(true)}
            variant="outline"
            style={styles.actionButton}
            leftIcon="remove-circle-outline"
          />
          <Button
            title="Add Income"
            onPress={() => setShowIncomeModal(true)}
            style={styles.actionButton}
            leftIcon="add-circle-outline"
          />
        </Animatable.View>

        {/* Recent Transactions */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {[...expenses, ...income]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map((transaction, index) => {
              const isExpense = 'category' in transaction;
              return (
                <Card key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <Ionicons
                        name={isExpense ? "remove-circle" : "add-circle"}
                        size={24}
                        color={isExpense ? Colors.error : Colors.success}
                      />
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionTitle}>
                          {isExpense ? (transaction as Expense).category : (transaction as Income).source}
                        </Text>
                        <Text style={styles.transactionDescription}>
                          {transaction.description}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(transaction.date).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[
                      styles.transactionAmount,
                      { color: isExpense ? Colors.error : Colors.success }
                    ]}>
                      {isExpense ? '-' : '+'}${transaction.amount.toFixed(2)}
                    </Text>
                  </View>
                </Card>
              );
            })}
        </Animatable.View>
      </ScrollView>

      {/* Expense Modal */}
      <Modal
        visible={showExpenseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowExpenseModal(false);
              resetExpenseForm();
            }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    expenseForm.category === category && styles.categoryChipSelected
                  ]}
                  onPress={() => setExpenseForm(prev => ({ ...prev, category }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    expenseForm.category === category && styles.categoryChipTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label="Amount *"
              value={expenseForm.amount}
              onChangeText={(amount: string) => setExpenseForm(prev => ({ ...prev, amount }))}
              placeholder="0.00"
              keyboardType="numeric"
              leftIcon="cash-outline"
            />

            <Input
              label="Description"
              value={expenseForm.description}
              onChangeText={(description: string) => setExpenseForm(prev => ({ ...prev, description }))}
              placeholder="Optional description"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Related Crop (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !expenseForm.crop_id && styles.categoryChipSelected
                ]}
                onPress={() => setExpenseForm(prev => ({ ...prev, crop_id: '' }))}
              >
                <Text style={[
                  styles.categoryChipText,
                  !expenseForm.crop_id && styles.categoryChipTextSelected
                ]}>
                  None
                </Text>
              </TouchableOpacity>
              {crops.map((crop: Crop) => (
                <TouchableOpacity
                  key={crop.id}
                  style={[
                    styles.categoryChip,
                    expenseForm.crop_id === crop.id && styles.categoryChipSelected
                  ]}
                  onPress={() => setExpenseForm(prev => ({ ...prev, crop_id: crop.id }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    expenseForm.crop_id === crop.id && styles.categoryChipTextSelected
                  ]}>
                    {crop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              title="Add Expense"
              onPress={handleAddExpense}
              loading={loading}
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Income Modal */}
      <Modal
        visible={showIncomeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {
              setShowIncomeModal(false);
              resetIncomeForm();
            }}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Income</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.fieldLabel}>Source *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              {incomeSources.map((source) => (
                <TouchableOpacity
                  key={source}
                  style={[
                    styles.categoryChip,
                    incomeForm.source === source && styles.categoryChipSelected
                  ]}
                  onPress={() => setIncomeForm(prev => ({ ...prev, source }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    incomeForm.source === source && styles.categoryChipTextSelected
                  ]}>
                    {source}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Input
              label="Amount *"
              value={incomeForm.amount}
              onChangeText={(amount: string) => setIncomeForm(prev => ({ ...prev, amount }))}
              placeholder="0.00"
              keyboardType="numeric"
              leftIcon="cash-outline"
            />

            <Input
              label="Description"
              value={incomeForm.description}
              onChangeText={(description: string) => setIncomeForm(prev => ({ ...prev, description }))}
              placeholder="Optional description"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>Related Crop (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  !incomeForm.crop_id && styles.categoryChipSelected
                ]}
                onPress={() => setIncomeForm(prev => ({ ...prev, crop_id: '' }))}
              >
                <Text style={[
                  styles.categoryChipText,
                  !incomeForm.crop_id && styles.categoryChipTextSelected
                ]}>
                  None
                </Text>
              </TouchableOpacity>
              {crops.map((crop: Crop) => (
                <TouchableOpacity
                  key={crop.id}
                  style={[
                    styles.categoryChip,
                    incomeForm.crop_id === crop.id && styles.categoryChipSelected
                  ]}
                  onPress={() => setIncomeForm(prev => ({ ...prev, crop_id: crop.id }))}
                >
                  <Text style={[
                    styles.categoryChipText,
                    incomeForm.crop_id === crop.id && styles.categoryChipTextSelected
                  ]}>
                    {crop.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button
              title="Add Income"
              onPress={handleAddIncome}
              loading={loading}
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.large,
    paddingHorizontal: Spacing.medium,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: Spacing.small / 2,
    padding: Spacing.medium,
    alignItems: 'center',
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.gray,
    marginBottom: Spacing.small,
  },
  summaryAmount: {
    ...Typography.heading3,
    fontWeight: 'bold',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.medium,
    marginBottom: Spacing.large,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.small / 2,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.text,
    marginBottom: Spacing.medium,
    paddingHorizontal: Spacing.medium,
  },
  transactionCard: {
    marginHorizontal: Spacing.medium,
    marginBottom: Spacing.small,
    padding: Spacing.medium,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: Spacing.medium,
    flex: 1,
  },
  transactionTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  transactionDescription: {
    ...Typography.caption,
    color: Colors.gray,
    marginTop: 2,
  },
  transactionDate: {
    ...Typography.caption,
    color: Colors.gray,
    marginTop: 2,
  },
  transactionAmount: {
    ...Typography.body,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    ...Typography.heading2,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.medium,
  },
  fieldLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.small,
    marginTop: Spacing.medium,
  },
  categoryContainer: {
    marginBottom: Spacing.medium,
  },
  categoryChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.medium,
    paddingVertical: Spacing.small,
    borderRadius: 20,
    marginRight: Spacing.small,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.caption,
    color: Colors.text,
  },
  categoryChipTextSelected: {
    color: Colors.white,
  },
  submitButton: {
    marginTop: Spacing.large,
    marginBottom: Spacing.large,
  },
});