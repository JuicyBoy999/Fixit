import { useEffect, useState } from 'react';
import AdminShell, { AdminEmpty, AdminIcon, AdminNotice } from '../components/admin/AdminShell';
import { adminFetch } from '../components/admin/adminApi';

const emptyForm = { name: '', repair_types: '', is_active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editor, setEditor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminFetch('/api/categories/all');
      setCategories(data.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initial = window.setTimeout(() => load(), 0);
    return () => window.clearTimeout(initial);
  }, []);

  const startCreate = () => {
    setEditor({ mode: 'create' });
    setForm(emptyForm);
  };

  const startEdit = category => {
    setEditor({ mode: 'edit', category });
    setForm({ name: category.name, repair_types: category.repair_types || '', is_active: category.is_active });
  };

  const save = async event => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    setError('');
    try {
      const editing = editor.mode === 'edit';
      await adminFetch(editing ? `/api/categories/${editor.category.id}` : '/api/categories', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      });
      setSuccess(`${form.name.trim()} was ${editing ? 'updated' : 'added'} and the customer booking catalog is current.`);
      setEditor(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async category => {
    setError('');
    try {
      await adminFetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: category.name, repair_types: category.repair_types, is_active: !category.is_active }),
      });
      setCategories(current => current.map(item => item.id === category.id ? { ...item, is_active: !item.is_active } : item));
      setSuccess(`${category.name} is now ${category.is_active ? 'hidden from' : 'available in'} customer booking.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminFetch(`/api/categories/${deleteTarget.id}`, { method: 'DELETE' });
      setCategories(current => current.filter(item => item.id !== deleteTarget.id));
      setSuccess(`${deleteTarget.name} was deleted from the service catalog.`);
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell
      eyebrow="Marketplace configuration"
      title="Service catalog"
      description="Maintain device categories and the repair types customers can request. Active changes are reflected immediately in the booking flow."
      actions={<button className="adm-btn adm-btn-primary" onClick={startCreate}>+ Add category</button>}
    >
      {error && <AdminNotice>{error}</AdminNotice>}
      {success && <AdminNotice type="success">{success}</AdminNotice>}

      <section className="adm-stats">
        <CategoryStat label="Total categories" value={categories.length} note="All catalog records" />
        <CategoryStat label="Live in booking" value={categories.filter(item => item.is_active).length} note="Visible to customers now" />
        <CategoryStat label="Hidden" value={categories.filter(item => !item.is_active).length} note="Retained but not bookable" />
        <CategoryStat label="Repair options" value={categories.reduce((sum, item) => sum + String(item.repair_types || '').split(',').filter(Boolean).length, 0)} note="Configured service types" />
      </section>

      <section className="adm-card">
        <div className="adm-card-head"><div><h2>Device categories</h2><p>Customer-facing service structure</p></div><span className="adm-inline-note"><span className="adm-badge adm-badge-active">Live sync</span>Active records feed the booking form</span></div>
        {loading ? <div className="adm-loading">Loading service catalog…</div> : categories.length === 0 ? (
          <AdminEmpty title="No device categories" description="Add the first category to make a repair option available to customers." />
        ) : (
          <div className="adm-category-grid">{categories.map(category => (
            <article key={category.id} className={`adm-category ${category.is_active ? '' : 'is-hidden'}`}>
              <div className="adm-category-top"><h3>{category.name}</h3><span className={`adm-badge adm-badge-${category.is_active ? 'active' : 'deactivated'}`}>{category.is_active ? 'Live' : 'Hidden'}</span></div>
              <p>{category.repair_types || 'No repair types configured yet.'}</p>
              <div className="adm-row-actions"><button className="adm-btn adm-btn-secondary" onClick={() => startEdit(category)}>Edit</button><button className="adm-btn adm-btn-secondary" onClick={() => toggle(category)}>{category.is_active ? 'Hide' : 'Publish'}</button><button className="adm-btn adm-btn-danger" onClick={() => setDeleteTarget(category)}>Delete</button></div>
            </article>
          ))}</div>
        )}
      </section>

      {editor && <EditorDialog editor={editor} form={form} setForm={setForm} busy={busy} onClose={() => setEditor(null)} onSave={save} />}
      {deleteTarget && <DeleteDialog category={deleteTarget} busy={busy} onClose={() => setDeleteTarget(null)} onConfirm={remove} />}
    </AdminShell>
  );
}

function CategoryStat({ label, value, note }) {
  return <div className="adm-stat"><div className="adm-stat-top"><span>{label}</span><span className="adm-stat-icon"><AdminIcon name="tool" /></span></div><strong>{value}</strong><small>{note}</small></div>;
}

function EditorDialog({ editor, form, setForm, busy, onClose, onSave }) {
  return <div className="adm-dialog-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
    <form className="adm-dialog" role="dialog" aria-modal="true" aria-labelledby="category-title" onSubmit={onSave}>
      <div className="adm-dialog-head"><div><h2 id="category-title">{editor.mode === 'edit' ? 'Edit device category' : 'Add device category'}</h2><p>Use clear customer-friendly labels. Separate repair types with commas.</p></div><button type="button" onClick={onClose} aria-label="Close"><AdminIcon name="close" /></button></div>
      <div className="adm-dialog-body"><div className="adm-form-grid">
        <div className="adm-field adm-field-wide"><label htmlFor="category-name">Category name</label><input id="category-name" className="adm-input" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Smartwatch" autoFocus required /></div>
        <div className="adm-field adm-field-wide"><label htmlFor="repair-types">Repair types</label><textarea id="repair-types" className="adm-input adm-textarea" value={form.repair_types} onChange={event => setForm({ ...form, repair_types: event.target.value })} placeholder="Screen replacement, Battery, Water damage" /></div>
        <div className="adm-field adm-field-wide"><label><input type="checkbox" checked={form.is_active} onChange={event => setForm({ ...form, is_active: event.target.checked })} /> Publish in customer booking immediately</label></div>
      </div></div>
      <div className="adm-dialog-actions"><button className="adm-btn adm-btn-secondary" type="button" onClick={onClose}>Cancel</button><button className="adm-btn adm-btn-primary" type="submit" disabled={busy || !form.name.trim()}>{busy ? 'Saving…' : 'Save category'}</button></div>
    </form>
  </div>;
}

function DeleteDialog({ category, busy, onClose, onConfirm }) {
  return <div className="adm-dialog-backdrop" role="presentation"><section className="adm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-category-title"><div className="adm-dialog-head"><div><h2 id="delete-category-title">Delete {category.name}?</h2><p>This permanently removes the category. Hiding it is safer if existing bookings may reference it.</p></div><button onClick={onClose} aria-label="Close"><AdminIcon name="close" /></button></div><div className="adm-dialog-actions"><button className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button><button className="adm-btn adm-btn-danger" disabled={busy} onClick={onConfirm}>{busy ? 'Deleting…' : 'Delete permanently'}</button></div></section></div>;
}
