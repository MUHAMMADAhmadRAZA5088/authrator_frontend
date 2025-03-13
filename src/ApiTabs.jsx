import React, { useState, useEffect } from 'react';
import { PlusCircle, X, MoreVertical, Trash2, Pencil } from 'lucide-react';

const ApiTabs = ({ collections, activeFolderId, activeApiId, createNewApi, openNewTab, closeTab, openTabs, setActiveSection, setIsPerformanceTesting }) => {
  // State to track hidden tabs
  const [hiddenTabs, setHiddenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(activeApiId);

  // Update active tab when activeApiId changes from props
  useEffect(() => {
    if (activeApiId) {
      setActiveTab(activeApiId);
      // Remove from hidden tabs if it was hidden
      if (hiddenTabs.includes(activeApiId)) {
        setHiddenTabs(hiddenTabs.filter(id => id !== activeApiId));
      }
    }
  }, [activeApiId]);

  const methodColors = {
    GET: '#49cc90',
    POST: '#61affe',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    PATCH: '#b45dd9'
  };

  // Function to handle tab closing
  const handleCloseTab = (tabId, e) => {
    e.stopPropagation();
    closeTab(tabId);
  };

  // Function to handle tab selection
  const handleTabSelect = (api) => {
    setActiveTab(api.id);
    setActiveSection('collections');
    setIsPerformanceTesting(false);
    // If the tab was hidden, unhide it
    if (hiddenTabs.includes(api.id)) {
      setHiddenTabs(hiddenTabs.filter(id => id !== api.id));
    }
    openNewTab(api.folderId, api);
  };

  const handleCreateNewApi = () => {
    const tempFolderId = 'temp-99999';
    createNewApi(tempFolderId);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
      <div className="flex items-center overflow-x-auto" style={{ height: '40px' }}>
        {openTabs.map((tab) => (
          <div 
            key={tab.id} 
            onClick={() => handleTabSelect(tab)}
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
            <button
              onClick={(e) => handleCloseTab(tab.id, e)}
              className="ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        ))}
        <button
          onClick={handleCreateNewApi}
          className="flex items-center justify-center h-full px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <PlusCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default ApiTabs;