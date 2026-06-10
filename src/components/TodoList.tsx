'use client';

import React, { useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { TodoItem } from '../utils/db';

interface TodoListProps {
  todos: TodoItem[];
  onAddTodo: (title: string, notes: string | null) => void;
  onUpdateTodo: (todo: TodoItem, title: string, notes: string | null) => void;
  onToggleTodo: (todo: TodoItem) => void;
  onDeleteTodo: (todo: TodoItem) => void;
}

export default function TodoList({
  todos,
  onAddTodo,
  onUpdateTodo,
  onToggleTodo,
  onDeleteTodo
}: TodoListProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const openTodos = todos.filter((todo) => !todo.isCompleted);
  const doneTodos = todos.filter((todo) => todo.isCompleted);

  const resetForm = () => {
    setTitle('');
    setNotes('');
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    const editingTodo = todos.find((todo) => todo.id === editingId);
    if (editingTodo) {
      onUpdateTodo(editingTodo, title.trim(), notes.trim() || null);
    } else {
      onAddTodo(title.trim(), notes.trim() || null);
    }
    resetForm();
  };

  const beginEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setTitle(todo.title);
    setNotes(todo.notes ?? '');
  };

  return (
    <div style={containerStyle}>
      <div className="glass-card" style={heroCardStyle}>
        <div>
          <span style={eyebrowStyle}>Independent Tasks</span>
          <h3 style={titleStyle}>Todo List</h3>
          <p style={subtitleStyle}>{openTodos.length} open • {doneTodos.length} done</p>
        </div>
        <div style={checkOrbStyle}><Check size={28} /></div>
      </div>

      <div className="glass-card" style={formCardStyle}>
        <input
          className="form-input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a one-off task"
          style={inputStyle}
        />
        <input
          className="form-input"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes (optional)"
          style={inputStyle}
        />
        <div style={formActionsStyle}>
          {editingId !== null && (
            <button className="btn-secondary" onClick={resetForm} style={smallButtonStyle}>Cancel</button>
          )}
          <button className="btn-primary" onClick={handleSubmit} disabled={!title.trim()} style={smallButtonStyle}>
            <Plus size={14} />
            <span>{editingId !== null ? 'Save Todo' : 'Add Todo'}</span>
          </button>
        </div>
      </div>

      {todos.length === 0 && (
        <div className="glass-card" style={emptyStyle}>
          <p style={{ fontWeight: 800, marginBottom: '6px' }}>Nothing on your list.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Capture tasks here without turning them into habits.</p>
        </div>
      )}

      {openTodos.length > 0 && <TodoSection title="Open" todos={openTodos} onToggleTodo={onToggleTodo} onEdit={beginEdit} onDeleteTodo={onDeleteTodo} />}
      {doneTodos.length > 0 && <TodoSection title="Done" todos={doneTodos} onToggleTodo={onToggleTodo} onEdit={beginEdit} onDeleteTodo={onDeleteTodo} />}
    </div>
  );
}

function TodoSection({
  title,
  todos,
  onToggleTodo,
  onEdit,
  onDeleteTodo
}: {
  title: string;
  todos: TodoItem[];
  onToggleTodo: (todo: TodoItem) => void;
  onEdit: (todo: TodoItem) => void;
  onDeleteTodo: (todo: TodoItem) => void;
}) {
  return (
    <section style={sectionStyle}>
      <h4 style={sectionTitleStyle}>{title}</h4>
      {todos.map((todo) => (
        <div key={todo.id} className="glass-card" style={{ ...todoRowStyle, opacity: todo.isCompleted ? 0.68 : 1 }}>
          <button onClick={() => onToggleTodo(todo)} style={checkboxStyle} aria-label="Toggle todo">
            {todo.isCompleted && <Check size={15} />}
          </button>
          <button onClick={() => onEdit(todo)} style={todoTextButtonStyle}>
            <span style={{ ...todoTitleStyle, textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>{todo.title}</span>
            {todo.notes && <span style={todoNotesStyle}>{todo.notes}</span>}
          </button>
          <button onClick={() => onDeleteTodo(todo)} style={deleteButtonStyle} aria-label="Delete todo">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </section>
  );
}

const containerStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '16px' };
const heroCardStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px' };
const eyebrowStyle: React.CSSProperties = { color: 'var(--primary)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.8px' };
const titleStyle: React.CSSProperties = { fontSize: '28px', fontWeight: 900, marginTop: '4px' };
const subtitleStyle: React.CSSProperties = { color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' };
const checkOrbStyle: React.CSSProperties = { width: '58px', height: '58px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'linear-gradient(135deg, var(--success), var(--primary))', boxShadow: '0 12px 28px rgba(6, 214, 160, 0.25)' };
const formCardStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px' };
const inputStyle: React.CSSProperties = { width: '100%' };
const formActionsStyle: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' };
const smallButtonStyle: React.CSSProperties = { height: '38px', borderRadius: '12px', padding: '0 14px', boxShadow: 'none' };
const emptyStyle: React.CSSProperties = { padding: '28px', textAlign: 'center' };
const sectionStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '10px' };
const sectionTitleStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)' };
const todoRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' };
const checkboxStyle: React.CSSProperties = { width: '26px', height: '26px', borderRadius: '50%', border: '2px solid var(--primary)', background: 'rgba(131, 56, 236, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
const todoTextButtonStyle: React.CSSProperties = { flex: 1, border: 'none', background: 'transparent', color: 'inherit', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 };
const todoTitleStyle: React.CSSProperties = { fontWeight: 800, fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const todoNotesStyle: React.CSSProperties = { color: 'var(--text-muted)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const deleteButtonStyle: React.CSSProperties = { border: 'none', background: 'rgba(255,107,107,0.12)', color: '#FF6B6B', width: '34px', height: '34px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 };
