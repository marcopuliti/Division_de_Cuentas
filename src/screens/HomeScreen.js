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
  StatusBar,
  Alert,
} from 'react-native';
import { formatMoney } from '../utils/calculator';

const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#EEF0FF',
  danger: '#FF6584',
  bg: '#F8F9FC',
  card: '#FFFFFF',
  text: '#1A1A2E',
  muted: '#8A8FA8',
  border: '#E8EAF0',
};

export default function HomeScreen({ groups, onOpenGroup, onCreateGroup, onDeleteGroup }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');

  function handleCreate() {
    const name = groupName.trim();
    if (!name) return;
    onCreateGroup(name);
    setGroupName('');
    setModalVisible(false);
  }

  function confirmDelete(group) {
    Alert.alert(
      'Eliminar grupo',
      `¿Eliminar "${group.name}" y todos sus gastos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteGroup(group.id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>División de Cuentas</Text>
        <Text style={styles.headerSub}>Tus grupos</Text>
      </View>

      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🧾</Text>
          <Text style={styles.emptyTitle}>No hay grupos todavía</Text>
          <Text style={styles.emptyText}>Creá uno para empezar a dividir gastos</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const total = item.expenses.reduce((s, e) => s + e.amount, 0);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => onOpenGroup(item.id)}
                onLongPress={() => confirmDelete(item)}
                activeOpacity={0.85}
              >
                <View style={styles.cardLeft}>
                  <View style={styles.cardIcon}>
                    <Text style={styles.cardIconText}>
                      {item.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Text style={styles.cardMeta}>
                      {item.people.length} persona{item.people.length !== 1 ? 's' : ''} ·{' '}
                      {item.expenses.length} gasto{item.expenses.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardTotal}>{formatMoney(total)}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+ Nuevo grupo</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nuevo grupo</Text>
            <Text style={styles.modalLabel}>Nombre del grupo</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Asado del sábado, Viaje..."
              placeholderTextColor={COLORS.muted}
              value={groupName}
              onChangeText={setGroupName}
              autoFocus
              onSubmitEditing={handleCreate}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => { setModalVisible(false); setGroupName(''); }}
              >
                <Text style={styles.btnSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleCreate}>
                <Text style={styles.btnPrimaryText}>Crear</Text>
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
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  cardName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  cardTotal: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
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
  fabText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptyText: { fontSize: 14, color: COLORS.muted, marginTop: 6 },
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
