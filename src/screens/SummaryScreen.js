import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { calculateSettlement, formatMoney, groupStats } from '../utils/calculator';

const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#EEF0FF',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#F7A041',
  warningLight: '#FFF3E0',
  danger: '#FF6584',
  dangerLight: '#FFF0F3',
  bg: '#F8F9FC',
  card: '#FFFFFF',
  text: '#1A1A2E',
  muted: '#8A8FA8',
  border: '#E8EAF0',
};

const AVATAR_COLORS = ['#6C63FF', '#FF6584', '#43B89C', '#F7A041', '#5B8AF4', '#E040FB'];

export default function SummaryScreen({ group, onBack }) {
  const transactions = calculateSettlement(group.people, group.expenses);
  const { total, perPerson } = groupStats(group.people, group.expenses);

  function getPersonName(id) {
    return group.people.find((p) => p.id === id)?.name || '?';
  }

  function getAvatarColor(id) {
    const idx = group.people.findIndex((p) => p.id === id);
    return AVATAR_COLORS[idx % AVATAR_COLORS.length];
  }

  // Calcular cuánto pagó cada uno vs cuánto debería haber pagado
  const personStats = group.people.map((person) => {
    const paid = group.expenses
      .filter((e) => e.paidBy === person.id)
      .reduce((sum, e) => sum + e.amount, 0);

    const owes = group.expenses
      .filter((e) => e.participants.includes(person.id))
      .reduce((sum, e) => sum + e.amount / e.participants.length, 0);

    return { ...person, paid, owes, balance: paid - owes };
  });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liquidación</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Resumen general */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatMoney(total)}</Text>
            <Text style={styles.statLabel}>Total gastado</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatMoney(perPerson)}</Text>
            <Text style={styles.statLabel}>Por persona</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{group.expenses.length}</Text>
            <Text style={styles.statLabel}>Gastos</Text>
          </View>
        </View>

        {/* Balance por persona */}
        <Text style={styles.sectionTitle}>Balance individual</Text>
        {personStats.map((person) => {
          const isPositive = person.balance >= 0;
          const color = isPositive ? COLORS.success : COLORS.danger;
          const bg = isPositive ? COLORS.successLight : COLORS.dangerLight;
          return (
            <View key={person.id} style={styles.balanceCard}>
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(person.id) }]}>
                <Text style={styles.avatarText}>{person.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.balanceInfo}>
                <Text style={styles.balanceName}>{person.name}</Text>
                <Text style={styles.balanceSub}>
                  Pagó {formatMoney(person.paid)} · Le corresponde {formatMoney(person.owes)}
                </Text>
              </View>
              <View style={[styles.balanceBadge, { backgroundColor: bg }]}>
                <Text style={[styles.balanceBadgeText, { color }]}>
                  {isPositive ? '+' : ''}{formatMoney(person.balance)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Transferencias */}
        <Text style={styles.sectionTitle}>¿Quién le paga a quién?</Text>

        {transactions.length === 0 ? (
          <View style={styles.allEvenCard}>
            <Text style={styles.allEvenIcon}>🎉</Text>
            <Text style={styles.allEvenTitle}>¡Todos están en paz!</Text>
            <Text style={styles.allEvenText}>No hay deudas pendientes.</Text>
          </View>
        ) : (
          transactions.map((tx, idx) => {
            const fromColor = getAvatarColor(tx.from);
            const toColor = getAvatarColor(tx.to);
            return (
              <View key={idx} style={styles.txCard}>
                <View style={styles.txPerson}>
                  <View style={[styles.txAvatar, { backgroundColor: fromColor }]}>
                    <Text style={styles.txAvatarText}>
                      {getPersonName(tx.from).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.txName}>{getPersonName(tx.from)}</Text>
                </View>

                <View style={styles.txMiddle}>
                  <Text style={styles.txAmount}>{formatMoney(tx.amount)}</Text>
                  <Text style={styles.txArrow}>→</Text>
                </View>

                <View style={styles.txPerson}>
                  <View style={[styles.txAvatar, { backgroundColor: toColor }]}>
                    <Text style={styles.txAvatarText}>
                      {getPersonName(tx.to).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.txName}>{getPersonName(tx.to)}</Text>
                </View>
              </View>
            );
          })
        )}

        {/* Detalle de gastos */}
        <Text style={styles.sectionTitle}>Detalle de gastos</Text>
        {group.expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseRow}>
            <View style={styles.expenseLeft}>
              <Text style={styles.expenseTitle}>{expense.title}</Text>
              <Text style={styles.expenseMeta}>
                Pagó: {getPersonName(expense.paidBy)} · {expense.participants.length} participantes
              </Text>
            </View>
            <Text style={styles.expenseAmount}>{formatMoney(expense.amount)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {},
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  content: { padding: 16, paddingBottom: 48 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.muted, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  balanceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  balanceInfo: { flex: 1 },
  balanceName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  balanceSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  balanceBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  balanceBadgeText: { fontSize: 14, fontWeight: '800' },
  allEvenCard: {
    backgroundColor: COLORS.successLight,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  allEvenIcon: { fontSize: 48, marginBottom: 10 },
  allEvenTitle: { fontSize: 18, fontWeight: '700', color: '#2E7D32' },
  allEvenText: { fontSize: 13, color: '#4CAF50', marginTop: 4 },
  txCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  txPerson: { alignItems: 'center', gap: 6, width: 72 },
  txAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txAvatarText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  txName: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  txMiddle: { flex: 1, alignItems: 'center', gap: 2 },
  txAmount: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  txArrow: { fontSize: 20, color: COLORS.muted },
  expenseRow: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  expenseLeft: { flex: 1 },
  expenseTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  expenseMeta: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  expenseAmount: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginLeft: 12 },
});
