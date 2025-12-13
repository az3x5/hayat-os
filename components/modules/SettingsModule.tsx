
import React, { useState, useEffect } from 'react';
import {
   User,
   Bell,
   Palette,
   Shield,
   RefreshCw,
   Layers,
   Accessibility,
   Globe,
   Cpu,
   LogOut,
   MoreVertical,
   PanelLeft,
   Moon,
   Sun,
   Monitor,
   Check,
   LayoutTemplate,
   Camera,
   Mail,
   Phone,
   Lock,
   Smartphone,
   History,
   AlertCircle,
   Key,
   Download,
   Trash2,
   Cloud,
   Upload,
   Link,
   CheckCircle,
   Eye,
   Type,
   Move,
   Clock,
   Coins,
   ChevronRight,
   Calendar,
   Activity,
   DollarSign,
   Music,
   Github,
   Chrome,
   Save,
   LayoutGrid,
   NotebookPen,
   Briefcase,
   Lightbulb,
   BookOpen,
   Coffee,
   ShoppingBag,
   Zap,
   Car,
   Heart,
   Plus,
   Edit2,
   Weight,
   Footprints,
   Droplets,
   Dumbbell,
   X,
   Star,
   Home,
   Plane,
   Smile,
   Anchor,
   Settings,
   EyeOff
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useConfig, ConfigItem } from '../../context/ConfigContext';
import ConfirmModal from '../ui/ConfirmModal';
import { SettingsService } from '../../services/api';

type SettingsTab = 'account' | 'security' | 'notifications' | 'appearance' | 'privacy' | 'backup' | 'integrations' | 'accessibility' | 'regional' | 'modules';

type ModalType = 'folder' | 'list' | 'metric' | 'category' | 'area' | null;
type ModalMode = 'add' | 'edit';

// Icon mapping for selection
const AVAILABLE_ICONS = [
   { id: 'Briefcase', icon: Briefcase },
   { id: 'User', icon: User },
   { id: 'BookOpen', icon: BookOpen },
   { id: 'Lightbulb', icon: Lightbulb },
   { id: 'Heart', icon: Heart },
   { id: 'Moon', icon: Moon },
   { id: 'Activity', icon: Activity },
   { id: 'DollarSign', icon: DollarSign },
   { id: 'Coffee', icon: Coffee },
   { id: 'ShoppingBag', icon: ShoppingBag },
   { id: 'Zap', icon: Zap },
   { id: 'Car', icon: Car },
   { id: 'Plane', icon: Plane },
   { id: 'Home', icon: Home },
   { id: 'Music', icon: Music },
   { id: 'Star', icon: Star },
   { id: 'Smile', icon: Smile },
   { id: 'Globe', icon: Globe },
   { id: 'Shield', icon: Shield },
   { id: 'Smartphone', icon: Smartphone },
];

// Reusable Toggle Component (Untitled UI Style)
const Switch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
   <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${checked ? 'bg-brand-600' : 'bg-slate-200'}`}
   >
      <span className={`inline-block w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ml-0.5 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
   </button>
);

const SettingsModule: React.FC = () => {
   const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
   const [isSidebarVisible, setIsSidebarVisible] = useState(true);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
   const { theme, setThemeMode, setRadius, isPrivacyMode, togglePrivacyMode } = useTheme();

   // Consuming Global Config Context
   const {
      folders, lists, metrics, financeCategories,
      addFolder, updateFolder, deleteFolder,
      addList, updateList, deleteList,
      addMetric, updateMetric, deleteMetric,
      addFinanceCategory, updateFinanceCategory, deleteFinanceCategory
   } = useConfig();

   // Modal State
   const [modalType, setModalType] = useState<ModalType>(null);
   const [modalMode, setModalMode] = useState<ModalMode>('add');
   const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);

   // Delete Confirmation State
   const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, type: ModalType, name?: string } | null>(null);

   // Form State
   const [itemName, setItemName] = useState('');
   const [itemColor, setItemColor] = useState('blue');
   const [itemIcon, setItemIcon] = useState('Briefcase');
   const [itemUnit, setItemUnit] = useState('');

   // Toggles State
   const [toggles, setToggles] = useState({
      notifications: true,
      emailAlerts: false,
      soundEffects: true,
      weeklyReport: true,
      privacyMode: false,
      biometricAuth: false,
      autoBackup: true,
      locationAccess: true,
   });

   // Load Settings from Backend
   useEffect(() => {
      const fetchSettings = async () => {
         try {
            const settings = await SettingsService.getSettings();
            if (settings) {
               // Sync backend settings to local state
               setToggles(prev => ({
                  ...prev,
                  privacyMode: settings.privacyMode,
                  // Other toggles if supported by backend
               }));
               if (settings.themeMode !== 'system') setThemeMode(settings.themeMode);
               if (settings.privacyMode !== isPrivacyMode && settings.privacyMode) togglePrivacyMode();
               // Note: togglePrivacyMode toggles current state. If we want to set it, we need to check current state.
               // If backend says true, and we are false -> toggle.
               // If backend says true, and we are true -> do nothing.
               // The logic `settings.privacyMode !== isPrivacyMode` covers this if we assume single toggle.
            }
         } catch (err) {
            console.error('Failed to load settings', err);
         }
      };
      fetchSettings();
   }, []);

   const toggle = async (key: keyof typeof toggles) => {
      const newValue = !toggles[key];
      setToggles(prev => ({ ...prev, [key]: newValue }));

      // Persist to Backend if it's a backend-supported setting
      if (key === 'privacyMode') {
         togglePrivacyMode(); // Update Context
         try {
            await SettingsService.updateSettings({ privacyMode: newValue });
         } catch (err) { console.error(err); }
      } else {
         // Just mock persistence for others (or add fields to schema later)
      }
   };

   const handleThemeChange = async (mode: 'light' | 'dark' | 'system') => {
      setThemeMode(mode);
      try {
         await SettingsService.updateSettings({ themeMode: mode });
      } catch (err) { console.error(err); }
   };

   const tabs = [
      { id: 'account', label: 'Account & Profile', icon: User },
      { id: 'appearance', label: 'Theme & Appearance', icon: Palette },
      { id: 'modules', label: 'Modules & Categories', icon: LayoutGrid },
      { id: 'privacy', label: 'Data & Privacy', icon: Layers },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'security', label: 'Auth & Security', icon: Shield },
      { id: 'backup', label: 'Backup & Sync', icon: RefreshCw },
      { id: 'integrations', label: 'Integrations', icon: Cpu },
      { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
      { id: 'regional', label: 'Language & Region', icon: Globe },
   ];

   const openModal = (type: ModalType, mode: ModalMode = 'add', item: any = null) => {
      setModalType(type);
      setModalMode(mode);
      setEditingItem(item);
      if (item) {
         setItemName(item.label || item.name);
         setItemColor(item.color || 'blue');
         setItemUnit(item.unit || '');
         // Find icon ID from component if possible, otherwise default
         const matchedIcon = AVAILABLE_ICONS.find(i => i.icon === item.icon);
         setItemIcon(matchedIcon ? matchedIcon.id : 'Briefcase');
      } else {
         setItemName('');
         setItemColor('blue');
         setItemUnit('');
         setItemIcon('Briefcase');
      }
   };

   const closeModal = () => {
      setModalType(null);
      setEditingItem(null);
      setItemName('');
   };

   const handleSaveItem = () => {
      if (!itemName || !modalType) return;

      const Icon = AVAILABLE_ICONS.find(i => i.id === itemIcon)?.icon || Briefcase;

      // Construct new item object
      const newItem: ConfigItem = {
         id: editingItem ? editingItem.id : Date.now().toString(),
         label: itemName,
         icon: Icon,
         color: itemColor,
         count: editingItem ? editingItem.count : 0, // Preserve count
         unit: itemUnit || undefined,
         active: editingItem ? editingItem.active : true,
      };

      if (modalType === 'folder') {
         modalMode === 'edit' ? updateFolder(newItem) : addFolder(newItem);
      } else if (modalType === 'list') {
         modalMode === 'edit' ? updateList(newItem) : addList(newItem);
      } else if (modalType === 'metric') {
         modalMode === 'edit' ? updateMetric(newItem) : addMetric(newItem);
      } else if (modalType === 'category') {
         modalMode === 'edit' ? updateFinanceCategory(newItem) : addFinanceCategory(newItem);
      }

      closeModal();
   };

   const requestDelete = (id: string, type: ModalType, name?: string) => {
      setDeleteConfirmation({ id, type, name });
   };

   const handleConfirmDelete = () => {
      if (!deleteConfirmation) return;
      const { id, type } = deleteConfirmation;

      if (type === 'folder') deleteFolder(id);
      else if (type === 'list') deleteList(id);
      else if (type === 'metric') deleteMetric(id);
      else if (type === 'category') deleteFinanceCategory(id);

      setDeleteConfirmation(null);
   };

   // --- RENDER FUNCTIONS ---

   const renderModules = () => (
      <div className="space-y-6 animate-fade-in pb-20">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Module Configuration</h3>
            <p className="text-sm text-slate-500">Manage categories, labels, icons, and colors for your HayatOS modules.</p>
         </div>

         {/* Notes Folders */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                     <NotebookPen size={20} />
                  </div>
                  Notes Folders
               </h3>
               <button onClick={() => openModal('folder', 'add')} className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm">
                  <Plus size={16} /> Add Folder
               </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {folders.map((folder) => (
                  <div key={folder.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-slate-300 transition-all group bg-slate-50/50 hover:bg-white hover:shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${folder.color}-50 text-${folder.color}-600 border border-${folder.color}-100`}>
                           <folder.icon size={18} />
                        </div>
                        <span className="font-semibold text-sm text-slate-700">{folder.label}</span>
                     </div>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('folder', 'edit', folder)} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-600">
                           <Edit2 size={16} />
                        </button>
                        <button onClick={() => requestDelete(folder.id, 'folder', folder.label)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Reminder Lists */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg border border-red-100">
                     <Bell size={20} />
                  </div>
                  Reminder Lists
               </h3>
               <button onClick={() => openModal('list', 'add')} className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm">
                  <Plus size={16} /> Add List
               </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {lists.map((list) => (
                  <div key={list.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-slate-300 transition-all group bg-slate-50/50 hover:bg-white hover:shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${list.color}-50 text-${list.color}-600 border border-${list.color}-100`}>
                           <list.icon size={18} />
                        </div>
                        <div>
                           <span className="font-semibold text-sm text-slate-700 block">{list.label}</span>
                           <span className="text-[10px] text-slate-500 font-medium">{list.count || 0} tasks</span>
                        </div>
                     </div>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('list', 'edit', list)} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-600">
                           <Edit2 size={16} />
                        </button>
                        <button onClick={() => requestDelete(list.id, 'list', list.label)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Health Metrics */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                     <Activity size={20} />
                  </div>
                  Health Metrics
               </h3>
               <button onClick={() => openModal('metric', 'add')} className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm">
                  <Plus size={16} /> Add Metric
               </button>
            </div>
            <div className="space-y-3">
               {metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all bg-slate-50/50 hover:bg-white hover:shadow-sm">
                     <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${metric.color}-50 text-${metric.color}-600 border border-${metric.color}-100`}>
                           <metric.icon size={20} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900 text-sm">{metric.label}</h4>
                           <p className="text-xs text-slate-500">Unit: {metric.unit}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <Switch checked={!!metric.active} onChange={() => { }} />
                        <button onClick={() => openModal('metric', 'edit', metric)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-lg">
                           <Edit2 size={18} />
                        </button>
                        <button onClick={() => requestDelete(metric.id, 'metric', metric.label)} className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                           <Trash2 size={18} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Finance Categories */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                     <DollarSign size={20} />
                  </div>
                  Finance Categories
               </h3>
               <button onClick={() => openModal('category', 'add')} className="flex items-center gap-2 px-3 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm">
                  <Plus size={16} /> Add Category
               </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {financeCategories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-slate-300 transition-all group bg-slate-50/50 hover:bg-white hover:shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-${cat.color}-50 text-${cat.color}-600 border border-${cat.color}-100`}>
                           <cat.icon size={18} />
                        </div>
                        <span className="font-semibold text-sm text-slate-700">{cat.label}</span>
                     </div>
                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal('category', 'edit', cat)} className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-600">
                           <Edit2 size={16} />
                        </button>
                        <button onClick={() => requestDelete(cat.id, 'category', cat.label)} className="p-1.5 hover:bg-red-50 rounded-md text-slate-400 hover:text-red-600">
                           <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );

   const renderPrivacy = () => (
      <div className="space-y-6 animate-fade-in pb-20">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Privacy Mode</h3>
            <p className="text-sm text-slate-500 mb-6">Automatically blur sensitive information like balances and health metrics when using the app in public spaces.</p>

            <div className="flex items-center justify-between p-5 border border-slate-200 rounded-xl bg-slate-25">
               <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${isPrivacyMode ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 shadow-sm'}`}>
                     {isPrivacyMode ? <EyeOff size={24} /> : <Eye size={24} />}
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900 text-sm">Blur Sensitive Content</h4>
                     <p className="text-sm text-slate-500 mt-0.5">Hide financial balances and personal health data.</p>
                  </div>
               </div>
               <Switch checked={isPrivacyMode} onChange={() => toggle('privacyMode')} />
            </div>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Data & Sharing</h3>
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200"><Globe size={20} /></div>
                     <div>
                        <p className="text-sm font-semibold text-slate-900">Public Profile</p>
                        <p className="text-sm text-slate-500 mt-0.5">Allow others to find your profile</p>
                     </div>
                  </div>
                  <Switch checked={toggles.publicProfile} onChange={() => toggle('publicProfile')} />
               </div>
               <div className="border-t border-slate-100" />
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg border border-slate-200"><Cloud size={20} /></div>
                     <div>
                        <p className="text-sm font-semibold text-slate-900">Share Analytics Data</p>
                        <p className="text-sm text-slate-500 mt-0.5">Help improve HayatOS with usage data</p>
                     </div>
                  </div>
                  <Switch checked={toggles.dataSharing} onChange={() => toggle('dataSharing')} />
               </div>
            </div>
         </div>
      </div>
   );

   const renderAccount = () => (
      <div className="space-y-6 animate-fade-in pb-20">
         {/* Profile Header */}
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Profile Information</h3>
                  <p className="text-sm text-slate-500 mt-1">Update your photo and personal details.</p>
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm">
                  <Save size={16} />
                  <span>Save Changes</span>
               </button>
            </div>

            <div className="flex flex-col md:flex-row items-start gap-8">
               <div className="relative group mx-auto md:mx-0">
                  <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 overflow-hidden border-4 border-white shadow-md ring-1 ring-slate-100">
                     <User size={48} />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-slate-100 text-slate-600 hover:text-brand-600 transition-colors">
                     <Camera size={16} />
                  </button>
               </div>
               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                     <input type="text" defaultValue="Ali Developer" className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
                     <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">@</span>
                        <input type="text" defaultValue="alidev" className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" />
                     </div>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio</label>
                     <textarea rows={3} className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base md:text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-none transition-shadow placeholder-slate-400 text-slate-900 shadow-xs" defaultValue="Building HayatOS to organize my entire life." />
                     <p className="text-xs text-slate-500 mt-1.5">Write a short introduction.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );

   const renderAppearance = () => (
      <div className="space-y-6 animate-fade-in pb-20">
         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Theme Mode</h3>
            <div className="flex gap-4">
               {(['light', 'dark', 'system'] as const).map(mode => (
                  <button
                     key={mode}
                     onClick={() => handleThemeChange(mode)}
                     className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all relative ${theme.mode === mode
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                  >
                     {mode === 'light' && <Sun size={24} />}
                     {mode === 'dark' && <Moon size={24} />}
                     {mode === 'system' && <Monitor size={24} />}
                     <span className="font-medium capitalize">{mode}</span>
                     {theme.mode === mode && (
                        <div className="absolute top-3 right-3 text-brand-600 bg-brand-50 rounded-full p-0.5"><Check size={16} /></div>
                     )}
                  </button>
               ))}
            </div>
         </div>

         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Interface Style</h3>
            <div className="space-y-8">
               <div>
                  <div className="flex justify-between mb-2">
                     <label className="text-sm font-medium text-slate-900">Corner Radius</label>
                     <span className="text-sm font-semibold text-slate-500">{theme.radius}px</span>
                  </div>
                  <input
                     type="range"
                     min="0"
                     max="32"
                     step="4"
                     value={theme.radius}
                     onChange={(e) => setTheme(theme.mode, parseInt(e.target.value))}
                     className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                  />
                  <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
                     <span>Square</span>
                     <span>Standard</span>
                     <span>Round</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );

   // --- MAIN RENDER ---
   return (
      <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">

         {/* Sidebar Navigation */}
         <div className={`
        bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 transition-all duration-300
        fixed inset-y-0 left-0 z-20 h-full overflow-hidden
        ${mobileMenuOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'}
        md:relative md:translate-x-0 md:shadow-none
        ${isSidebarVisible ? 'md:w-64' : 'md:w-0 md:border-r-0'}
      `}>
            <div className="w-64 h-full flex flex-col">
               <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                     Settings
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Manage your HayatOS experience</p>
               </div>

               <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                  {tabs.map((tab) => {
                     const Icon = tab.icon;
                     return (
                        <button
                           key={tab.id}
                           onClick={() => { setActiveTab(tab.id as SettingsTab); setMobileMenuOpen(false); }}
                           className={`
                      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${activeTab === tab.id
                                 ? 'bg-white text-brand-700 shadow-sm ring-1 ring-slate-200'
                                 : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                              }
                    `}
                        >
                           <Icon size={18} className={activeTab === tab.id ? 'text-brand-600' : 'text-slate-400'} />
                           {tab.label}
                        </button>
                     );
                  })}
               </nav>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col min-w-0 bg-white">

            {/* Header */}
            <div className="h-16 px-6 md:px-8 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white z-20">
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                     className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                     <MoreVertical size={20} />
                  </button>
                  <button
                     onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                     className="hidden md:flex p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                     <PanelLeft size={20} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-900">
                     {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
               </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
               <div className="max-w-3xl mx-auto pb-10">
                  {activeTab === 'account' && renderAccount()}
                  {activeTab === 'appearance' && renderAppearance()}
                  {activeTab === 'modules' && renderModules()}
                  {activeTab === 'privacy' && renderPrivacy()}
                  {activeTab !== 'account' && activeTab !== 'appearance' && activeTab !== 'modules' && activeTab !== 'privacy' && (
                     <div className="text-center py-20">
                        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">
                           <Settings size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Settings Section</h3>
                        <p className="text-slate-500 mt-2">This section is currently under development.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Config Modal */}
         {modalType && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
               <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeModal} />
               <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative z-10 flex flex-col max-h-[90dvh] animate-in zoom-in-95 duration-200">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 capitalize">{modalMode} {modalType}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">Configure your {modalType} details.</p>
                     </div>
                     <button onClick={closeModal} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                        <input
                           type="text"
                           value={itemName}
                           onChange={(e) => setItemName(e.target.value)}
                           className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-900 placeholder-slate-400 shadow-xs"
                           placeholder={`e.g. My ${modalType === 'metric' ? 'Metric' : 'List'}`}
                           autoFocus
                        />
                     </div>

                     {modalType === 'metric' && (
                        <div>
                           <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit</label>
                           <input
                              type="text"
                              value={itemUnit}
                              onChange={(e) => setItemUnit(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-base focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-900 placeholder-slate-400 shadow-xs"
                              placeholder="e.g. kg, mins, steps"
                           />
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Color Theme</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                           {['blue', 'emerald', 'rose', 'amber', 'purple', 'indigo', 'cyan', 'orange', 'teal', 'slate'].map(color => (
                              <button
                                 key={color}
                                 onClick={() => setItemColor(color)}
                                 className={`w-10 h-10 rounded-full bg-${color}-500 ring-offset-2 transition-all shrink-0 ${itemColor === color ? 'ring-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                              />
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Icon</label>
                        <div className="grid grid-cols-5 gap-3 max-h-40 overflow-y-auto pr-2">
                           {AVAILABLE_ICONS.map(({ id, icon: Icon }) => (
                              <button
                                 key={id}
                                 onClick={() => setItemIcon(id)}
                                 className={`
                                aspect-square rounded-xl flex items-center justify-center border transition-all
                                ${itemIcon === id
                                       ? 'bg-brand-600 text-white border-brand-700 shadow-md ring-2 ring-brand-100'
                                       : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }
                              `}
                                 title={id}
                              >
                                 <Icon size={20} />
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 border-t border-slate-100 shrink-0 bg-slate-50 rounded-b-2xl flex gap-3">
                     <button
                        onClick={closeModal}
                        className="flex-1 bg-white text-slate-700 py-2.5 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 transition-colors shadow-xs"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSaveItem}
                        className="flex-1 bg-brand-600 text-white py-2.5 rounded-lg font-semibold hover:bg-brand-700 transition-colors shadow-sm"
                     >
                        Save Changes
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Confirmation Modal */}
         <ConfirmModal
            isOpen={!!deleteConfirmation}
            onClose={() => setDeleteConfirmation(null)}
            onConfirm={handleConfirmDelete}
            title={`Delete ${deleteConfirmation?.type}`}
            message={`Are you sure you want to delete "${deleteConfirmation?.name}"? This action cannot be undone.`}
         />
      </div>
   );
};

export default SettingsModule;