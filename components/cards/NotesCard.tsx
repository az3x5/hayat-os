import React from 'react';
import { NotebookPen, Plus, ArrowRight } from 'lucide-react';
import { Note } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface NotesCardProps {
  notes: Note[];
  onClick?: () => void;
}

const NotesCard: React.FC<NotesCardProps> = ({ notes, onClick }) => {
  return (
    <div
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <NotebookPen size={18} />
          </div>
          <h3 className="font-semibold text-slate-900">Notes</h3>
        </div>
        <button className="text-slate-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-lg">
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {notes.slice(0, 3).map((note) => (
          <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all">
            <h4 className="text-sm font-medium text-slate-900">{note.title}</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{note.excerpt}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-slate-400">
                {note.timestamp && !isNaN(new Date(note.timestamp).getTime())
                  ? formatDistanceToNow(new Date(note.timestamp), { addSuffix: true })
                  : 'recently'}
              </span>
              <div className={`w-2 h-2 rounded-full bg-${note.color}-400`} />
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-6">
            <p className="text-sm text-slate-400">No notes yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesCard;