import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Star,
  Pin,
  Trash2,
  FolderOpen,
  Briefcase,
  User,
  Heart,
  Moon,
  BookOpen,
  Lightbulb,
  ChevronLeft,
  Save,
  PanelLeft,
  Edit,
  X,
  Palette,
  MoreVertical,
  Archive
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Note } from '../../types';
import { useConfig } from '../../context/ConfigContext';
import { NotesService } from '../../services/api';
import ConfirmModal from '../ui/ConfirmModal';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'favorites' | 'archive' | 'trash';
type FolderType = 'work' | 'personal' | 'health' | 'islamic' | 'journal' | 'ideas' | 'trash' | 'archive' | string | null;

// Helper to strip HTML for excerpts
const stripHtml = (html: string) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const NotesModule: React.FC = () => {
  // State
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeFolder, setActiveFolder] = useState<FolderType>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Delete Confirmation State
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  // Consume Config for Folders
  const { folders } = useConfig();

  // Editor State
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorColor, setEditorColor] = useState<string>('white');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Quill Ref
  const quillRef = useRef<any>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Filter Logic
  const filteredNotes = notes.filter(note => {
    // Search Filter
    const plainTextContent = stripHtml(note.content).toLowerCase();
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plainTextContent.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Category/Folder Filter
    if (activeFilter === 'favorites') return note.isFavorite && note.folder !== 'trash' && note.folder !== 'archive';
    if (activeFilter === 'archive') return note.folder === 'archive';
    if (activeFilter === 'trash') return note.folder === 'trash';
    if (activeFolder) return note.folder === activeFolder;

    // Default 'all' - exclude trash and archive
    return note.folder !== 'trash' && note.folder !== 'archive';
  });

  // Sort: Pinned first, then date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Fetch Notes on Mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const fetchedNotes = await NotesService.getAll();
        // Map backend fields to frontend expected fields
        const mappedNotes = fetchedNotes.map((n: any) => ({
          ...n,
          timestamp: n.updatedAt ? new Date(n.updatedAt) : (n.createdAt ? new Date(n.createdAt) : new Date())
        }));
        setNotes(mappedNotes);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Quill Initialization and Sync
  useEffect(() => {
    if (isEditorOpen && editorContainerRef.current && !quillRef.current) {
      // Initialize Quill
      const Quill = (window as any).Quill;
      if (Quill) {
        // Base modules configuration
        const modules: any = {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
            ['link', 'image'],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
          ]
        };

        // Safe Registration of Image Resize
        const ImageResize = (window as any).ImageResize?.default || (window as any).ImageResize;
        if (ImageResize) {
          if (!Quill.imports['modules/imageResize']) {
            try {
              Quill.register('modules/imageResize', ImageResize);
            } catch (e) {
              console.warn('Failed to register ImageResize module', e);
            }
          }
          if (Quill.imports['modules/imageResize']) {
            modules.imageResize = {
              displaySize: true
            };
          }
        }

        quillRef.current = new Quill(editorContainerRef.current, {
          theme: 'snow',
          placeholder: 'Start writing...',
          modules: modules
        });

        // Handle Change
        quillRef.current.on('text-change', () => {
          setEditorContent(quillRef.current.root.innerHTML);
        });
      }
    }
  }, [isEditorOpen]);

  // Sync content when opening a new note
  useEffect(() => {
    if (isEditorOpen && quillRef.current) {
      const currentEditorText = quillRef.current.root.innerHTML;
      let contentToLoad = selectedNote?.content || '';
      if (!contentToLoad.includes('<') && contentToLoad.includes('\n')) {
        contentToLoad = contentToLoad.replace(/\n/g, '<br>');
      }

      if (currentEditorText !== contentToLoad) {
        quillRef.current.root.innerHTML = contentToLoad;
      }
    }
  }, [selectedNote, isEditorOpen]);


  // Handlers
  const handleOpenNote = (note: Note) => {
    setSelectedNote(note);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorColor(note.color || 'white');
    setIsEditorOpen(true);
    setIsColorPickerOpen(false);
  };

  const handleCreateNote = async () => {
    const targetFolder = activeFolder && activeFolder !== 'trash' && activeFolder !== 'archive' ? (activeFolder as any) : 'personal';
    const folderObj = folders.find(f => f.id === targetFolder);
    const defaultColor = folderObj?.color || 'white';

    const newNotePartial: Partial<Note> = {
      title: '',
      content: '',
      excerpt: '',
      folder: targetFolder,
      tags: [],
      isPinned: false,
      isFavorite: false,
      color: defaultColor
    };

    // Optimistic UI update (optional, but for new note usually we want ID from server if creating immediately)
    // Actually, create blank note on server immediately so we have an ID for autosave
    try {
      const createdNote = await NotesService.create(newNotePartial);
      setNotes([createdNote, ...notes]);
      handleOpenNote(createdNote);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;

    setIsSaving(true);

    // Prepare update payload
    const plainText = stripHtml(editorContent);
    const excerpt = plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '');

    const updates = {
      title: editorTitle || 'Untitled Note',
      content: editorContent,
      excerpt: excerpt,
      color: editorColor,
      folder: selectedNote.folder // Ensure folder is preserved or updated if needed
    };

    // Optimistic UI
    setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, ...updates, timestamp: new Date() } : n));

    // API Call
    try {
      const updatedNote = await NotesService.update(selectedNote.id, updates);
      // Update state with server response (timestamp etc)
      setNotes(prev => prev.map(n => n.id === selectedNote.id ? updatedNote : n));
    } catch (error) {
      console.error('Failed to save note:', error);
      // Revert or show error
    } finally {
      setIsSaving(false);
    }
  };

  const togglePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    // Optimistic
    const newStatus = !note.isPinned;
    setNotes(notes.map(n => n.id === id ? { ...n, isPinned: newStatus } : n));

    try {
      await NotesService.update(id, { isPinned: newStatus });
    } catch (err) {
      console.error('Failed to toggle pin', err);
      // Revert
      setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !newStatus } : n));
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    // Optimistic
    const newStatus = !note.isFavorite;
    setNotes(notes.map(n => n.id === id ? { ...n, isFavorite: newStatus } : n));

    try {
      await NotesService.update(id, { isFavorite: newStatus });
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      setNotes(notes.map(n => n.id === id ? { ...n, isFavorite: !newStatus } : n));
    }
  };

  const toggleArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const newFolder = note.folder === 'archive' ? 'personal' : 'archive'; // fallback to personal if unarchiving

    // Optimistic
    setNotes(notes.map(n => n.id === id ? { ...n, folder: newFolder } : n));
    if (selectedNote?.id === id && isEditorOpen) {
      closeEditor();
    }

    try {
      await NotesService.update(id, { folder: newFolder });
    } catch (err) {
      console.error('Failed to toggle archive', err);
      // Revert
      setNotes(notes.map(n => n.id === id ? { ...n, folder: note.folder } : n));
    }
  };

  const initiateMoveToTrash = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNoteToDelete(id);
  }

  const confirmMoveToTrash = async () => {
    if (noteToDelete) {
      // Optimistic
      setNotes(notes.map(n => n.id === noteToDelete ? { ...n, folder: 'trash' } : n));

      const noteId = noteToDelete;
      setNoteToDelete(null);
      if (selectedNote?.id === noteId) {
        closeEditor();
      }

      try {
        // We can either update folder to 'trash' or hard delete if 'trash' is implemented as delete
        // Looking at Filters, 'trash' is just a folder.
        await NotesService.update(noteId, { folder: 'trash' });
      } catch (err) {
        console.error('Failed to move to trash', err);
        // Revert not implemented for brevity
      }
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isEditorOpen && selectedNote && (editorTitle !== selectedNote.title || editorContent !== selectedNote.content || editorColor !== (selectedNote.color || 'white'))) {
        handleSaveNote();
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [editorTitle, editorContent, editorColor]);


  const getColorStyles = (color: string = 'white') => {
    switch (color) {
      case 'blue': return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', ring: 'ring-blue-200', placeholder: 'placeholder-blue-300' };
      case 'amber': return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', placeholder: 'placeholder-amber-300' };
      case 'emerald': return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', placeholder: 'placeholder-emerald-300' };
      case 'purple': return { bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700', ring: 'ring-purple-200', placeholder: 'placeholder-purple-300' };
      case 'rose': return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', ring: 'ring-rose-200', placeholder: 'placeholder-rose-300' };
      case 'indigo': return { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-700', ring: 'ring-indigo-200', placeholder: 'placeholder-indigo-300' };
      case 'teal': return { bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-700', ring: 'ring-teal-200', placeholder: 'placeholder-teal-300' };
      default: return { bg: 'bg-white', border: 'border-slate-100', text: 'text-slate-700', ring: 'ring-slate-200', placeholder: 'placeholder-slate-300' };
    }
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    quillRef.current = null;
  };

  const editorStyles = getColorStyles(editorColor);

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

      {/* Left Sidebar */}
      <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-40 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
        <div className="w-64 h-full flex flex-col">
          {/* Search Bar */}
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400 text-slate-900"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-3 space-y-6">

            {/* Main Filters */}
            <div className="space-y-1">
              <button
                onClick={() => { setActiveFilter('all'); setActiveFolder(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'all' && !activeFolder ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <FolderOpen size={18} className={activeFilter === 'all' && !activeFolder ? 'text-blue-500' : 'text-slate-400'} />
                All Notes
              </button>
              <button
                onClick={() => { setActiveFilter('favorites'); setActiveFolder(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'favorites' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Star size={18} className={activeFilter === 'favorites' ? 'text-amber-500' : 'text-slate-400'} />
                Favorites
              </button>
              <button
                onClick={() => { setActiveFilter('archive'); setActiveFolder(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'archive' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Archive size={18} className={activeFilter === 'archive' ? 'text-purple-500' : 'text-slate-400'} />
                Archive
              </button>
              <button
                onClick={() => { setActiveFilter('trash'); setActiveFolder(null); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === 'trash' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Trash2 size={18} className={activeFilter === 'trash' ? 'text-red-500' : 'text-slate-400'} />
                Trash
              </button>
            </div>

            {/* Folders */}
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Folders</h3>
              </div>
              <div className="space-y-1">
                {folders.map((folder) => (
                  <div key={folder.id} className="group relative">
                    <button
                      onClick={() => { setActiveFolder(folder.id as FolderType); setActiveFilter('all'); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeFolder === folder.id ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                      <span className={activeFolder === folder.id ? 'text-blue-500' : 'text-slate-400'}>
                        <folder.icon size={18} />
                      </span>
                      <span className="capitalize flex-1 text-left">{folder.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header */}
        <div className="h-16 px-4 md:px-6 border-b border-slate-100 flex items-center justify-between bg-white z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg active:bg-slate-200"
            >
              <MoreVertical size={20} />
            </button>
            <button
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              <PanelLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-900 capitalize truncate max-w-[120px] sm:max-w-none">
              {activeFolder || (activeFilter === 'all' ? 'All Notes' : activeFilter)}
            </h2>
            <span className="text-sm text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full hidden sm:block">
              {sortedNotes.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 mr-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={18} />
              </button>
            </div>

            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-slate-200 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Note</span>
            </button>
          </div>
        </div>

        {/* Notes Grid/List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/30">
          {sortedNotes.length > 0 ? (
            <div className={`
              grid gap-4 
              ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}
            `}>
              {sortedNotes.map((note) => {
                const styles = getColorStyles(note.color);
                return (
                  <div
                    key={note.id}
                    onClick={() => handleOpenNote(note)}
                    className={`
                      group relative rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col active:scale-[0.99] md:active:scale-100
                      ${viewMode === 'list' ? 'flex-row items-center gap-6' : 'h-64'}
                      ${styles.bg} ${styles.border} border
                    `}
                  >
                    <div className={`flex-1 ${viewMode === 'list' ? 'min-w-0' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold transition-colors ${viewMode === 'list' ? 'text-base truncate' : 'text-lg line-clamp-2'} ${styles.text}`}>
                          {note.title || 'Untitled Note'}
                        </h3>
                        {note.isPinned && <Pin size={16} className="text-slate-400 rotate-45 shrink-0 ml-2" fill="currentColor" />}
                      </div>

                      <p className={`text-slate-500 text-sm leading-relaxed ${viewMode === 'list' ? 'truncate' : 'line-clamp-4'}`}>
                        {note.excerpt || stripHtml(note.content).substring(0, 100)}
                      </p>
                    </div>

                    <div className={`
                      mt-4 pt-4 border-t border-slate-100 flex items-center justify-between
                      ${viewMode === 'list' ? 'mt-0 pt-0 border-0 w-80 justify-end gap-4 shrink-0' : ''}
                    `}>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-white/50 px-2 py-1 rounded-md">
                          {note.folder}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDistanceToNow(note.timestamp, { addSuffix: true })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenNote(note); }}
                          className="p-3 md:p-2 rounded-full hover:bg-white text-slate-400 hover:text-slate-600"
                          title="Edit Note"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => toggleFavorite(e, note.id)}
                          className={`p-3 md:p-2 rounded-full hover:bg-white ${note.isFavorite ? 'text-amber-400' : 'text-slate-400'}`}
                        >
                          <Star size={16} fill={note.isFavorite ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={(e) => togglePin(e, note.id)}
                          className={`p-3 md:p-2 rounded-full hover:bg-white ${note.isPinned ? 'text-blue-500' : 'text-slate-400'}`}
                        >
                          <Pin size={16} />
                        </button>
                        <button
                          onClick={(e) => toggleArchive(e, note.id)}
                          className={`p-3 md:p-2 rounded-full hover:bg-white ${note.folder === 'archive' ? 'text-purple-500' : 'text-slate-400 hover:text-purple-500'}`}
                          title={note.folder === 'archive' ? "Unarchive" : "Archive"}
                        >
                          <Archive size={16} />
                        </button>
                        <button
                          onClick={(e) => initiateMoveToTrash(e, note.id)}
                          className="p-3 md:p-2 rounded-full hover:bg-white text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                {activeFilter === 'archive' ? <Archive size={32} /> : <Search size={32} />}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {activeFilter === 'archive' ? 'No archived notes' : 'No notes found'}
              </h3>
              <p className="text-slate-500 mt-1 max-w-xs">
                {activeFilter === 'archive' ? 'Notes you archive will appear here.' : 'Try adjusting your filters or create a new note to get started.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Overlay Panel */}
      {isEditorOpen && (
        <div className={`absolute inset-0 z-50 flex flex-col animate-fade-in ${editorStyles.bg}`}>
          {/* Editor Header */}
          <div className={`h-16 px-4 md:px-8 border-b border-slate-100 flex items-center justify-between shrink-0 ${editorStyles.bg}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={closeEditor}
                className="p-2 -ml-2 hover:bg-black/5 rounded-lg text-slate-500 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1 uppercase tracking-wider">
                  {activeFolder || selectedNote?.folder || 'Uncategorized'}
                  {isSaving && <span className="text-slate-300 ml-2 animate-pulse">• Saving...</span>}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Color Picker Toggle */}
              <div className="relative">
                <button
                  onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                  className={`p-2 rounded-lg transition-colors ${isColorPickerOpen ? 'bg-slate-200 text-slate-900' : 'hover:bg-black/5 text-slate-400 hover:text-slate-600'}`}
                  title="Change Color"
                >
                  <Palette size={20} />
                </button>
                {isColorPickerOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-3 flex gap-2 z-10 animate-in zoom-in-95 duration-200">
                    {[
                      { id: 'white', bg: 'bg-white', ring: 'ring-slate-200' },
                      { id: 'blue', bg: 'bg-blue-50', ring: 'ring-blue-200' },
                      { id: 'amber', bg: 'bg-amber-50', ring: 'ring-amber-200' },
                      { id: 'emerald', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
                      { id: 'purple', bg: 'bg-purple-50', ring: 'ring-purple-200' },
                      { id: 'rose', bg: 'bg-rose-50', ring: 'ring-rose-200' },
                      { id: 'indigo', bg: 'bg-indigo-50', ring: 'ring-indigo-200' },
                      { id: 'teal', bg: 'bg-teal-50', ring: 'ring-teal-200' }
                    ].map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setEditorColor(c.id); setIsColorPickerOpen(false); }}
                        className={`
                                w-8 h-8 rounded-full border border-slate-200 transition-all hover:scale-110 
                                ${c.bg} ${c.id === editorColor ? `ring-2 ring-offset-2 ${c.ring}` : ''}
                              `}
                        title={c.id}
                      />
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => toggleArchive({ stopPropagation: () => { } } as any, selectedNote?.id || '')} className={`p-2 hover:bg-black/5 rounded-lg transition-colors hidden sm:block ${selectedNote?.folder === 'archive' ? 'text-purple-500' : 'text-slate-400 hover:text-purple-600'}`} title={selectedNote?.folder === 'archive' ? "Unarchive" : "Archive"}>
                <Archive size={20} />
              </button>
              <button onClick={() => toggleFavorite({ stopPropagation: () => { } } as any, selectedNote?.id || '')} className="p-2 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors hidden sm:block" title="Favorite">
                <Star size={20} fill={selectedNote?.isFavorite ? "currentColor" : "none"} className={selectedNote?.isFavorite ? "text-amber-400" : ""} />
              </button>
              <button className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 active:scale-95" onClick={closeEditor}>
                <Save size={16} />
                Done
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-8 pt-8 pb-4 shrink-0">
              <input
                type="text"
                placeholder="Note Title"
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
                className={`w-full text-3xl md:text-4xl font-bold border-none focus:ring-0 bg-transparent p-0 ${editorStyles.text} ${editorStyles.placeholder}`}
              />
            </div>
            <div className="flex-1 overflow-hidden relative flex flex-col">
              <div id="quill-editor" ref={editorContainerRef} className="h-full border-none" />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={confirmMoveToTrash}
        title="Move to Trash"
        message="Are you sure you want to move this note to trash? You can restore it later from the Trash folder."
        confirmText="Move to Trash"
      />
    </div>
  );
};

export default NotesModule;