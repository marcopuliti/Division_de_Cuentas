import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './src/screens/HomeScreen';
import GroupScreen from './src/screens/GroupScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import SummaryScreen from './src/screens/SummaryScreen';

const STORAGE_KEY = '@divisioncuentas_groups';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function App() {
  const [groups, setGroups] = useState([]);
  const [screen, setScreen] = useState('home'); // 'home' | 'group' | 'addExpense' | 'summary'
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // Cargar datos guardados al iniciar
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) setGroups(JSON.parse(data));
    });
  }, []);

  // Guardar cada vez que cambian los grupos
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  // ── Grupos ──────────────────────────────────────────────
  function handleCreateGroup(name) {
    const newGroup = { id: generateId(), name, people: [], expenses: [] };
    setGroups((prev) => [newGroup, ...prev]);
  }

  function handleDeleteGroup(groupId) {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }

  function updateGroup(groupId, updater) {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? updater(g) : g)));
  }

  // ── Personas ─────────────────────────────────────────────
  function handleAddPerson(groupId, name) {
    updateGroup(groupId, (g) => ({
      ...g,
      people: [...g.people, { id: generateId(), name }],
    }));
  }

  function handleDeletePerson(groupId, personId) {
    updateGroup(groupId, (g) => ({
      ...g,
      people: g.people.filter((p) => p.id !== personId),
    }));
  }

  // ── Gastos ────────────────────────────────────────────────
  function handleSaveExpense({ title, amount, paidBy, participants }) {
    if (editingExpense) {
      updateGroup(activeGroupId, (g) => ({
        ...g,
        expenses: g.expenses.map((e) =>
          e.id === editingExpense.id ? { ...e, title, amount, paidBy, participants } : e
        ),
      }));
      setEditingExpense(null);
    } else {
      updateGroup(activeGroupId, (g) => ({
        ...g,
        expenses: [
          ...g.expenses,
          { id: generateId(), title, amount, paidBy, participants },
        ],
      }));
    }
    setScreen('group');
  }

  function handleDeleteExpense(groupId, expenseId) {
    updateGroup(groupId, (g) => ({
      ...g,
      expenses: g.expenses.filter((e) => e.id !== expenseId),
    }));
  }

  // ── Navegación ────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <HomeScreen
        groups={groups}
        onOpenGroup={(id) => { setActiveGroupId(id); setScreen('group'); }}
        onCreateGroup={handleCreateGroup}
        onDeleteGroup={handleDeleteGroup}
      />
    );
  }

  if (screen === 'group' && activeGroup) {
    return (
      <GroupScreen
        group={activeGroup}
        onBack={() => setScreen('home')}
        onAddExpense={() => { setEditingExpense(null); setScreen('addExpense'); }}
        onEditExpense={(expense) => { setEditingExpense(expense); setScreen('addExpense'); }}
        onDeleteExpense={handleDeleteExpense}
        onAddPerson={handleAddPerson}
        onDeletePerson={handleDeletePerson}
        onOpenSummary={() => setScreen('summary')}
      />
    );
  }

  if (screen === 'addExpense' && activeGroup) {
    return (
      <AddExpenseScreen
        group={activeGroup}
        onBack={() => { setEditingExpense(null); setScreen('group'); }}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
      />
    );
  }

  if (screen === 'summary' && activeGroup) {
    return (
      <SummaryScreen
        group={activeGroup}
        onBack={() => setScreen('group')}
      />
    );
  }

  // Fallback
  return null;
}
