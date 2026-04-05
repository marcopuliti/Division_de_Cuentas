import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

const COLORS = {
  primary: '#6C63FF',
  primaryLight: '#EEF0FF',
  bg: '#F8F9FC',
  card: '#FFFFFF',
  text: '#1A1A2E',
  muted: '#8A8FA8',
  border: '#E8EAF0',
  success: '#4CAF50',
};

const AVATAR_COLORS = ['#6C63FF', '#FF6584', '#43B89C', '#F7A041', '#5B8AF4', '#E040FB'];

export default function AddExpenseScreen({ group, onBack, onSave, editingExpense }) {
  const [title, setTitle] = useState(editingExpense?.title ?? '');
  const [amount, setAmount] = useState(editingExpense ? String(editingExpense.amount) : '');
  const [paidBy, setPaidBy] = useState(editingExpense?.paidBy ?? group.people[0]?.id ?? null);
  const [participants, setParticipants] = useState(editingExpense?.participants ?? group.people.map((p) => p.id));

  function toggleParticipant(id) {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setParticipants(group.people.map((p) => p.id));
  }

  function clearAll() {
    setParticipants([]);
  }

  function handleSave() {
    const trimTitle = title.trim();
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (!trimTitle) {
      Alert.alert('Error', 'Ingresá un nombre para el gasto.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Ingresá un monto válido mayor a 0.');
      return;
    }
    if (!paidBy) {
      Alert.alert('Error', 'Seleccioná quién pagó.');
      return;
    }
    if (participants.length === 0) {
      Alert.alert('Error', 'Seleccioná al menos un participante.');
      return;
    }

    onSave({
      title: trimTitle,
      amount: parsedAmount,
      paidBy,
      participants,
    });
  }

  function getAvatarColor(id) {
    const idx = group.people.findIndex((p) => p.id === id);
    return AVATAR_COLORS[idx % AVATAR_COLORS.length];
  }

  const shareAmount =
    participants.length > 0 && !isNaN(parseFloat(amount))
      ? (parseFloat(amount.replace(',', '.')) / participants.length).toFixed(2)
      : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editingExpense ? 'Editar gasto' : 'Nuevo gasto'}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Guardar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Nombre del gasto */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nombre del gasto</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Pizza, Uber, Cerveza..."
            placeholderTextColor={COLORS.muted}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        {/* Monto */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Monto total</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor={COLORS.muted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
          {shareAmount && participants.length > 0 && (
            <Text style={styles.sharePreview}>
              ${shareAmount} por persona ({participants.length} participantes)
            </Text>
          )}
        </View>

        {/* Quién pagó */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>¿Quién pagó?</Text>
          <View style={styles.peopleGrid}>
            {group.people.map((person, idx) => {
              const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const selected = paidBy === person.id;
              return (
                <TouchableOpacity
                  key={person.id}
                  style={[
                    styles.personCard,
                    selected && { borderColor: color, backgroundColor: color + '15' },
                  ]}
                  onPress={() => setPaidBy(person.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.personAvatar, { backgroundColor: selected ? color : COLORS.border }]}>
                    <Text style={styles.personAvatarText}>{person.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.personCardName, selected && { color }]} numberOfLines={1}>
                    {person.name}
                  </Text>
                  {selected && <Text style={[styles.checkMark, { color }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Participantes */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionLabel}>¿Quiénes participan?</Text>
            <View style={styles.selectBtns}>
              <TouchableOpacity onPress={selectAll}>
                <Text style={styles.selectBtnText}>Todos</Text>
              </TouchableOpacity>
              <Text style={styles.selectBtnDivider}>·</Text>
              <TouchableOpacity onPress={clearAll}>
                <Text style={styles.selectBtnText}>Ninguno</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.checkList}>
            {group.people.map((person, idx) => {
              const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
              const isSelected = participants.includes(person.id);
              return (
                <TouchableOpacity
                  key={person.id}
                  style={styles.checkRow}
                  onPress={() => toggleParticipant(person.id)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.checkbox, isSelected && { backgroundColor: color, borderColor: color }]}>
                    {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <View style={[styles.checkAvatar, { backgroundColor: color }]}>
                    <Text style={styles.checkAvatarText}>{person.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.checkName}>{person.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
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
  backText: { fontSize: 15, color: COLORS.muted, fontWeight: '500' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  content: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 28 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  selectBtns: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  selectBtnDivider: { color: COLORS.muted },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.card,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
  },
  currencySymbol: { fontSize: 22, fontWeight: '700', color: COLORS.muted, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 28, fontWeight: '700', color: COLORS.text, paddingVertical: 12 },
  sharePreview: { marginTop: 8, fontSize: 13, color: COLORS.success, fontWeight: '600' },
  peopleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  personCard: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    backgroundColor: COLORS.card,
    gap: 6,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personAvatarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  personCardName: { fontSize: 12, fontWeight: '600', color: COLORS.muted, maxWidth: 70, textAlign: 'center' },
  checkMark: { fontSize: 14, fontWeight: '700' },
  checkList: { gap: 10 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCheck: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  checkAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkAvatarText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  checkName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
});
