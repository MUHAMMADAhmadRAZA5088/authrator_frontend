import React, { useState, useEffect } from 'react';
import { PlusCircle, X, MoreVertical, Trash2, Pencil } from 'lucide-react';

const ApiTabs = ({ collections, activeFolderId, activeApiId, createNewApi, openNewTab }) => {
  // State to track hidden tabs
  const [hiddenTabs, setHiddenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(activeApiId);

  // Update active tab when activeApiId changes from props
  useEffect(() => {
    if (activeApiId) {
      setActiveTab(activeApiId);
    }
  }, [activeApiId]);

  // Get all APIs from all collections
  const allApis = collections.flatMap(folder => 
    folder.apis.map(api => ({ 
      ...api, 
      folderId: folder.id, 
      folderName: folder.name 
    }))
  );

  // Filter out hidden tabs unless they're the active tab
  const visibleApis = allApis.filter(api => 
    !hiddenTabs.includes(api.id) || api.id === activeTab
  );

  const methodColors = {
    GET: '#49cc90',
    POST: '#61affe',
    PUT: '#fca130',
    DELETE: '#f93e3e',
    PATCH: '#b45dd9'
  };

  // Function to hide a tab
  const hideTab = (tabId, e) => {
    e.stopPropagation();
    setHiddenTabs([...hiddenTabs, tabId]);

    // If we're hiding the active tab, select another visible tab if available
    if (tabId === activeTab) {
      const remainingTabs = visibleApis.filter(api => api.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0].id);
        openNewTab(remainingTabs[0].folderId, remainingTabs[0]);
      }
    }
  };

  // Function to handle tab selection
  const handleTabSelect = (api) => {
    setActiveTab(api.id);
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
        {visibleApis.map((api) => (
          <div 
            key={api.id} 
            onClick={() => handleTabSelect(api)}
            className={`flex items-center min-w-0 h-full px-4 cursor-pointer group
              ${activeTab === api.id ? 'bg-white dark:bg-gray-800 border-t-2' : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            style={{ borderTopColor: activeTab === api.id ? methodColors[api.method] : 'transparent' }}
          >
            <span 
              className="mr-2 px-2 py-0.5 rounded text-xs font-mono"
              style={{ backgroundColor: `${methodColors[api.method]}20`, color: methodColors[api.method] }}
            >
              {api.method}
            </span>
            <span className="truncate text-sm text-gray-700 dark:text-gray-300 max-w-xs">
              {api.name}
            </span>
            <button
              onClick={(e) => hideTab(api.id, e)}
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