import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { formatMoney, groupStats } from '../utils/calculator';

const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#EEF0FF',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  danger: '#FF6584',
  dangerLight: '#FFF0F3',
  bg: '#F8F9FC',
  card: '#FFFFFF',
  text: '#1A1A2E',
  muted: '#8A8FA8',
  border: '#E8EAF0',
};

const AVATAR_COLORS = ['#6C63FF', '#FF6584', '#43B89C', '#F7A041', '#5B8AF4', '#E040FB'];

export default function GroupScreen({ group, onBack, onAddExpense, onEditExpense, onDeleteExpense, onAddPerson, onDeletePerson, onOpenSummary }) {
  const [tab, setTab] = useState('gastos'); // 'gastos' | 'personas'
  const [addPersonModal, setAddPersonModal] = useState(false);
  const [personName, setPersonName] = useState('');

  const { total } = groupStats(group.people, group.expenses);

  function getPersonName(id) {
    return group.people.find((p) => p.id === id)?.name || '?';
  }

  function getAvatarColor(id) {
    const idx = group.people.findIndex((p) => p.id === id);
    return AVATAR_COLORS[idx % AVATAR_COLORS.length];
  }

  function handleAddPerson() {
    const name = personName.trim();
    if (!name) return;
    onAddPerson(group.id, name);
    setPersonName('');
    setAddPersonModal(false);
  }

  function confirmDeleteExpense(expense) {
    Alert.alert('Eliminar gasto', `¿Eliminar "${expense.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteExpense(group.id, expense.id) },
    ]);
  }

  function confirmDeletePerson(person) {
    const usedInExpense = group.expenses.some(
      (e) => e.paidBy === person.id || e.participants.includes(person.id)
    );
    if (usedInExpense) {
      Alert.alert('No se puede eliminar', `${person.name} participa en uno o más gastos.`);
      return;
    }
    Alert.alert('Eliminar persona', `¿Eliminar a ${person.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDeletePerson(group.id, person.id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Grupos</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{group.name}</Text>
          <Text style={styles.headerTotal}>Total: {formatMoney(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.summaryBtn}
          onPress={() => {
            if (group.people.length === 0 || group.expenses.length === 0) {
              Alert.alert('Sin datos', 'Agregá personas y gastos primero.');
              return;
            }
            onOpenSummary();
          }}
        >
          <Text style={styles.summaryBtnText}>💰</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'gastos' && styles.tabActive]}
          onPress={() => setTab('gastos')}
        >
          <Text style={[styles.tabText, tab === 'gastos' && styles.tabTextActive]}>
            Gastos ({group.expenses.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'personas' && styles.tabActive]}
          onPress={() => setTab('personas')}
        >
          <Text style={[styles.tabText, tab === 'personas' && styles.tabTextActive]}>
            Personas ({group.people.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === 'gastos' ? (
        <>
          {group.expenses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyTitle}>Sin gastos</Text>
              <Text style={styles.emptyText}>
                {group.people.length === 0
                  ? 'Primero agregá personas en la pestaña "Personas"'
                  : 'Tocá "+ Agregar gasto" para empezar'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={group.expenses}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const share = item.amount / item.participants.length;
                return (
                  <View style={styles.card}>
                    <View style={styles.cardTop}>
                      <Text style={styles.expenseTitle}>{item.title}</Text>
                      <View style={styles.cardActions}>
                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() => onEditExpense(item)}
                        >
                          <Text style={styles.editBtnText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => confirmDeleteExpense(item)}
                        >
                          <Text style={styles.deleteBtnText}>🗑️</Text>
                        </TouchableOpacity>
                        <Text style={styles.expenseAmount}>{formatMoney(item.amount)}</Text>
                      </View>
                    </View>
                    <View style={styles.cardBottom}>
                      <View style={styles.paidByBadge}>
                        <Text style={styles.paidByText}>
                          Pagó: <Text style={styles.paidByName}>{getPersonName(item.paidBy)}</Text>
                        </Text>
                      </View>
                      <Text style={styles.shareText}>
                        {item.participants.length} personas · {formatMoney(share)} c/u
                      </Text>
                    </View>
                    <View style={styles.participantsRow}>
                      {item.participants.map((pid) => (
                        <View
                          key={pid}
                          style={[styles.chip, { backgroundColor: getAvatarColor(pid) + '22' }]}
                        >
                          <Text style={[styles.chipText, { color: getAvatarColor(pid) }]}>
                            {getPersonName(pid)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              }}
            />
          )}
          <TouchableOpacity
            style={[styles.fab, group.people.length === 0 && styles.fabDisabled]}
            onPress={() => {
              if (group.people.length === 0) {
                Alert.alert('Sin personas', 'Agregá personas antes de cargar gastos.');
                return;
              }
              onAddExpense();
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.fabText}>+ Agregar gasto</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {group.people.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>Sin personas</Text>
              <Text style={styles.emptyText}>Agregá a los que participaron en los gastos</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {group.people.map((person, idx) => (
                <TouchableOpacity
                  key={person.id}
                  style={styles.card}
                  onLongPress={() => confirmDeletePerson(person)}
                  activeOpacity={0.85}
                >
                  <View style={styles.personRow}>
                    <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }]}>
                      <Text style={styles.avatarText}>{person.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.personName}>{person.name}</Text>
                      <Text style={styles.personMeta}>
                        {group.expenses.filter((e) => e.paidBy === person.id).length} gastos pagados
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TouchableOpacity style={styles.fab} onPress={() => setAddPersonModal(true)} activeOpacity={0.85}>
            <Text style={styles.fabText}>+ Agregar persona</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal agregar persona */}
      <Modal
        visible={addPersonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setAddPersonModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Agregar persona</Text>
            <Text style={styles.modalLabel}>Nombre</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Juan, María..."
              placeholderTextColor={COLORS.muted}
              value={personName}
              onChangeText={setPersonName}
              autoFocus
              onSubmitEditing={handleAddPerson}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => { setAddPersonModal(false); setPersonName(''); }}
              >
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleAddPerson}>
                <Text style={styles.btnPrimaryText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { paddingRight: 12 },
  backText: { fontSize: 15, color: COLORS.primary, fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  headerTotal: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  summaryBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryBtnText: { fontSize: 20 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  tabActive: { backgroundColor: COLORS.primaryLight },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.muted },
  tabTextActive: { color: COLORS.primary },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  expenseTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtn: { padding: 4 },
  editBtnText: { fontSize: 16 },
  deleteBtn: { padding: 4 },
  deleteBtnText: { fontSize: 16 },
  expenseAmount: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginLeft: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  paidByBadge: {
    backgroundColor: COLORS.successLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  paidByText: { fontSize: 12, color: '#2E7D32' },
  paidByName: { fontWeight: '700' },
  shareText: { fontSize: 12, color: COLORS.muted },
  participantsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  personName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  personMeta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 13, color: COLORS.muted, marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },
  fab: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  fabDisabled: { backgroundColor: COLORS.muted },
  fabText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  modal: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  modalLabel: { fontSize: 13, color: COLORS.muted, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  btnSecondary: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnSecondaryText: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  btnPrimary: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});
