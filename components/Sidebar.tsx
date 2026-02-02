
import React, { useState } from 'react';
import { Person, Group } from '../types';

interface SidebarProps {
  people: Person[];
  groups: Group[];
  onAddPerson: (name: string) => void;
  onRemovePerson: (id: string) => void;
  onAddGroup: (name: string, memberIds: string[]) => void;
  onUpdateGroup: (id: string, name: string, memberIds: string[]) => void;
  onRemoveGroup: (id: string) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  people, 
  groups, 
  onAddPerson, 
  onRemovePerson, 
  onAddGroup, 
  onUpdateGroup, 
  onRemoveGroup, 
  className 
}) => {
  const [personName, setPersonName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const handleAddPerson = () => {
    if (personName.trim()) {
      onAddPerson(personName.trim());
      setPersonName('');
    }
  };

  const handleSaveGroup = () => {
    if (groupName.trim() && selectedMembers.length > 0) {
      if (editingGroupId) {
        onUpdateGroup(editingGroupId, groupName.trim(), selectedMembers);
        setEditingGroupId(null);
      } else {
        onAddGroup(groupName.trim(), selectedMembers);
      }
      setGroupName('');
      setSelectedMembers([]);
    }
  };

  const startEdit = (group: Group) => {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setSelectedMembers(group.memberIds);
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setGroupName('');
    setSelectedMembers([]);
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50">
        <h1 className="text-xl md:text-2xl font-black text-indigo-600 tracking-tight">SplitSmart</h1>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Core Management</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-8 md:space-y-10">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">The Squad</h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{people.length} People</span>
          </div>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddPerson(); }}
              placeholder="Add person..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={handleAddPerson}
              className="bg-indigo-600 text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          <div className="space-y-1">
            {people.map(p => (
              <div key={p.id} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                <span className="text-sm font-medium text-slate-700">{p.name}</span>
                <button type="button" onClick={() => onRemovePerson(p.id)} className="text-slate-300 hover:text-red-500 p-2">
                  <i className="fas fa-trash-alt text-xs"></i>
                </button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Groups</h3>
            {editingGroupId && (
              <button type="button" onClick={cancelEdit} className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                Cancel
              </button>
            )}
          </div>
          <div className={`p-4 rounded-xl border space-y-3 mb-4 transition-colors ${editingGroupId ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveGroup(); }}
              placeholder="Group name..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none"
            />
            {people.length > 0 && (
              <div className="max-h-32 overflow-y-auto border border-slate-200 bg-white rounded-lg p-2">
              {people.map(p => (
                <label key={p.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 cursor-pointer rounded">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedMembers([...selectedMembers, p.id]);
                      else setSelectedMembers(selectedMembers.filter(id => id !== p.id));
                    }}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-xs text-slate-600 font-medium">{p.name}</span>
                </label>
              ))}
            </div>
            )}
            <button
              type="button"
              onClick={handleSaveGroup}
              disabled={!groupName || selectedMembers.length < 1}
              className={`w-full text-white py-2 rounded-lg text-xs font-bold transition-all ${editingGroupId ? 'bg-amber-600' : 'bg-slate-800'}`}
            >
              {editingGroupId ? 'Update' : 'Create'}
            </button>
          </div>

          <div className="space-y-2">
            {groups.map(g => (
              <div key={g.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm group">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-users text-indigo-400 text-[10px]"></i>
                    {g.name}
                  </h4>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => startEdit(g)} className="text-slate-300 hover:text-amber-500 p-1">
                      <i className="fas fa-edit text-xs"></i>
                    </button>
                    <button type="button" onClick={() => onRemoveGroup(g.id)} className="text-slate-300 hover:text-red-500 p-1">
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  {g.memberIds.map(id => people.find(p => p.id === id)?.name).join(', ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
