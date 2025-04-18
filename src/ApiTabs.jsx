import React, { useState, useEffect } from 'react';
import { PlusCircle, X, MoreVertical, Trash2, Pencil } from 'lucide-react';
import ApiTabDropdown from './ApiTabDropdown';
import ApiTabRenameModal from './ApiTabRenameModal';

const ApiTabs = ({ collections, activeFolderId, activeApiId, createNewApi, openNewTab, closeTab, openTabs, setActiveSection, setIsPerformanceTesting, openRenameModal }) => {
 
  const [hiddenTabs, setHiddenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(activeApiId);
  const [isApiTabRenameModalOpen, setIsApiTabRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);
  const [itemName, setItemName] = useState('');
 
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    tabId: null,
    tabName: ''
  });

  useEffect(() => {
    if (activeApiId) {
      setActiveTab(activeApiId);
      
      if (hiddenTabs.includes(activeApiId)) {
        setHiddenTabs(hiddenTabs.filter(id => id !== activeApiId));
      }
    }
  }, [activeApiId]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({...contextMenu, visible: false});
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  const methodColors = {
    GET: '#49cc90',
    POST: '#61affe',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    PATCH: '#b45dd9'
  };

  const handleCloseTab = (tabId, e) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  const handleTabSelect = (api) => {
    setActiveTab(api.id);
    setActiveSection('collections');
    setIsPerformanceTesting(false);
    
    if (hiddenTabs.includes(api.id)) {
      setHiddenTabs(hiddenTabs.filter(id => id !== api.id));
    }
    openNewTab(api.folderId, api);
  };

  const handleCreateNewApi = () => {
    const tempFolderId = 'temp-99999';
    createNewApi(tempFolderId);
  };

  const openApiTabRenameModal = (id, name) => {
    setItemToRename(id);
    setItemName(name);
    setIsApiTabRenameModalOpen(true);
  };

  const handleRenameSubmit = (newName) => {
    openRenameModal(itemToRename, 'api', newName);
    setIsApiTabRenameModalOpen(false);
    setItemToRename(null);
    setItemName('');
  };

  const handleContextMenu = (e, tab) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tabId: tab.id,
      tabName: tab.name
    });
  };

  const handleRenameFromContextMenu = () => {
    if (contextMenu.tabId) {
      openApiTabRenameModal(contextMenu.tabId, contextMenu.tabName);
      setContextMenu({...contextMenu, visible: false});
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
      <div className="flex items-center overflow-x-auto" style={{ height: '40px' }}>
        {openTabs.map((tab) => (
          <div 
            key={tab.id} 
            onClick={() => handleTabSelect(tab)}
            onContextMenu={(e) => handleContextMenu(e, tab)}
            className={`flex items-center min-w-0 h-full px-4 cursor-pointer group
              ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 border-t-2' : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            style={{ borderTopColor: activeTab === tab.id ? methodColors[tab.method] : 'transparent' }}
          >
            <span 
              className="mr-2 px-2 py-0.5 rounded text-xs font-mono"
              style={{ backgroundColor: `${methodColors[tab.method]}20`, color: methodColors[tab.method] }}
            >
              {tab.method}
            </span>
            <span className="truncate text-sm text-gray-700 dark:text-gray-300 max-w-xs">
              {tab.name}
            </span>
            <div className="flex items-center ml-2">

              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 ml-1"
              >
                <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={handleCreateNewApi}
          className="flex items-center justify-center h-full px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <PlusCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {contextMenu.visible && (
        <div 
          className="fixed bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-[9999]"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleRenameFromContextMenu}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Pencil className="w-4 h-4 dark:text-white" />
            <span className=' dark:text-white'>Rename</span>
          </button>
        </div>
      )}

      <ApiTabRenameModal
        isOpen={isApiTabRenameModalOpen}
        onClose={() => setIsApiTabRenameModalOpen(false)}
        itemName={itemName}
        onRename={handleRenameSubmit}
      />
    </div>
  );
};

export default ApiTabs;