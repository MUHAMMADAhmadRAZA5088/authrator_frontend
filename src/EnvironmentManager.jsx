import React, { useState, useEffect } from 'react';
import { 
  Settings, Check, Trash, Plus, Search, Edit2, X, 
  Database, Lock, Save, RefreshCw, Copy, Eye, EyeOff,
  Download, Upload, Globe, Copy as Duplicate, ExternalLink
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'app_environments';

const EnvironmentManagementPanel = ({ 
  environments, 
  activeEnvironment, 
  onEnvChange, 
  onAddEnv, 
  onDeleteEnv, 
  onUpdateEnv, 
  onClose 
}) => {
 
  const [localEnvironments, setLocalEnvironments] = useState([]);
  const [localActiveEnvironment, setLocalActiveEnvironment] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [envVariableInputs, setEnvVariableInputs] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [showValues, setShowValues] = useState({});
  const [globalVariables, setGlobalVariables] = useState({});
  const [importError, setImportError] = useState('');

  useEffect(() => {
    if (environments) {
      setLocalEnvironments(environments);
    }
    if (activeEnvironment) {
      setLocalActiveEnvironment(activeEnvironment);
    }
    setIsInitialized(true);
  }, [environments, activeEnvironment]);

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        if (parsedData.globalVariables) {
          setGlobalVariables(parsedData.globalVariables);
        }
      }
    } catch (error) {
      console.error("Error loading global variables from localStorage:", error);
    }
  }, []);


  useEffect(() => {
    if (isInitialized) {
      try {
       
        const dataToStore = {
          environments: localEnvironments,
          activeEnvironmentId: localActiveEnvironment?.id || null,
          globalVariables: globalVariables
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
        
       
        if (onUpdateEnv && localEnvironments !== environments) {
          localEnvironments.forEach(env => {
            const originalEnv = environments.find(e => e.id === env.id);
            if (!originalEnv || JSON.stringify(originalEnv) !== JSON.stringify(env)) {
              onUpdateEnv(env.id, env);
            }
          });
        }
      } catch (error) {
        console.error("Error saving environments to localStorage:", error);
      }
    }
  }, [localEnvironments, localActiveEnvironment, globalVariables, isInitialized, environments, onUpdateEnv]);

  const filteredEnvironments = localEnvironments.filter(env => 
    env.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEnvironment = () => {
    if (!newEnvName.trim()) return;
    const newEnvironment = { 
      id: `env_${Date.now()}`, 
      name: newEnvName, 
      variables: {} 
    };
    
    setLocalEnvironments([...localEnvironments, newEnvironment]);
    setNewEnvName('');
    
    if (onAddEnv) {
      onAddEnv(newEnvironment);
    }
  };

  const handleEnvChange = (env) => {
    setLocalActiveEnvironment(env);
    
    if (onEnvChange) {
      onEnvChange(env);
    }
  };

  const handleDeleteEnv = (envId) => {
    const updatedEnvironments = localEnvironments.filter(env => env.id !== envId);
    setLocalEnvironments(updatedEnvironments);
    
    if (localActiveEnvironment?.id === envId) {
      setLocalActiveEnvironment(null);
    }
    
    if (onDeleteEnv) {
      onDeleteEnv(envId);
    }
  };

  const handleUpdateEnv = (updatedEnv) => {
    const updatedEnvironments = localEnvironments.map(env => 
      env.id === updatedEnv.id ? updatedEnv : env
    );
    
    setLocalEnvironments(updatedEnvironments);
    
    if (localActiveEnvironment?.id === updatedEnv.id) {
      setLocalActiveEnvironment(updatedEnv);
    }
    
    if (onUpdateEnv) {
      onUpdateEnv(updatedEnv.id, updatedEnv);
    }
  };

  const handleVariableChange = (envId, field, value) => {
    setEnvVariableInputs(prev => ({
      ...prev,
      [envId]: { ...prev[envId], [field]: value }
    }));
  };

  const handleAddVariable = (env) => {
    const inputs = envVariableInputs[env.id] || {};
    const name = inputs.name?.trim();
    
    if (!name) return;
    
    const initialValue = inputs.initialValue || '';
    const currentValue = inputs.currentValue || initialValue || '';
    
    const updatedEnv = JSON.parse(JSON.stringify(env));
    updatedEnv.variables[name] = {
      initialValue: initialValue,
      currentValue: currentValue,
      type: inputs.type || 'text'
    };
    
    const updatedEnvironments = localEnvironments.map(e => 
      e.id === env.id ? updatedEnv : e
    );
    
    setLocalEnvironments(updatedEnvironments);
    
    if (localActiveEnvironment?.id === env.id) {
      setLocalActiveEnvironment(updatedEnv);
    }
    
    setEnvVariableInputs(prev => ({ 
      ...prev, 
      [env.id]: { name: '', initialValue: '', currentValue: '' } 
    }));
    
    if (onUpdateEnv) {
      onUpdateEnv(updatedEnv.id, updatedEnv);
    }
  };

  const handleAddGlobalVariable = () => {
    const inputs = envVariableInputs['global'] || {};
    const name = inputs.name?.trim();
    
    if (!name) return;
    
    const initialValue = inputs.initialValue || '';
    const currentValue = inputs.currentValue || initialValue || '';
    
    const updatedGlobalVars = { ...globalVariables };
    updatedGlobalVars[name] = {
      initialValue: initialValue,
      currentValue: currentValue,
      type: inputs.type || 'text'
    };
    
    setGlobalVariables(updatedGlobalVars);
    
    setEnvVariableInputs(prev => ({ 
      ...prev, 
      ['global']: { name: '', initialValue: '', currentValue: '' } 
    }));
    
    
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      let dataToUpdate = { environments: [], activeEnvironmentId: null, globalVariables: updatedGlobalVars };
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        dataToUpdate = {
          ...parsedData,
          globalVariables: updatedGlobalVars
        };
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToUpdate));
    } catch (error) {
      console.error("Error saving global variables to localStorage:", error);
    }
  };

  const handleEditVariable = (env, variableName, field, value) => {
    const updatedEnv = JSON.parse(JSON.stringify(env));
    updatedEnv.variables[variableName][field] = value;
    
    const updatedEnvironments = localEnvironments.map(e => 
      e.id === env.id ? updatedEnv : e
    );
    
    setLocalEnvironments(updatedEnvironments);
    
    if (localActiveEnvironment?.id === env.id) {
      setLocalActiveEnvironment(updatedEnv);
    }
  };

  const handleEditGlobalVariable = (variableName, field, value) => {
    const updatedGlobalVars = { ...globalVariables };
    updatedGlobalVars[variableName][field] = value;
    setGlobalVariables(updatedGlobalVars);
  };

  const handleRemoveVariable = (env, variableName) => {
    const updatedEnv = JSON.parse(JSON.stringify(env));
    delete updatedEnv.variables[variableName];
    
    const updatedEnvironments = localEnvironments.map(e => 
      e.id === env.id ? updatedEnv : e
    );
    
    setLocalEnvironments(updatedEnvironments);
    
    if (localActiveEnvironment?.id === env.id) {
      setLocalActiveEnvironment(updatedEnv);
    }
  };

  const handleRemoveGlobalVariable = (variableName) => {
    const updatedGlobalVars = { ...globalVariables };
    delete updatedGlobalVars[variableName];
    setGlobalVariables(updatedGlobalVars);
  };

  const resetToInitialValue = (env, variableName) => {
    const initialValue = env.variables[variableName].initialValue;
    handleEditVariable(env, variableName, 'currentValue', initialValue);
  };

  const resetGlobalToInitialValue = (variableName) => {
    const initialValue = globalVariables[variableName].initialValue;
    handleEditGlobalVariable(variableName, 'currentValue', initialValue);
  };

  const duplicateEnvironment = (env) => {
    const newEnv = JSON.parse(JSON.stringify(env));
    newEnv.id = `env_${Date.now()}`;
    newEnv.name = `${env.name} Copy`;
    setLocalEnvironments([...localEnvironments, newEnv]);
  };

  const exportEnvironment = (env) => {
    const exportData = {
      name: env.name,
      variables: env.variables,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${env.name.replace(/\s+/g, '_')}_environment.json`;
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportAllEnvironments = () => {
    const exportData = {
      environments: localEnvironments,
      globalVariables: globalVariables,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'authrator_environments.json';
    document.body.appendChild(a);
    a.click();
    
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const importEnvironment = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setImportError('');
        
        if (data.environments) {
          
          const newEnvironments = [...localEnvironments];
          
          data.environments.forEach(env => {
            const exists = localEnvironments.some(existing => existing.id === env.id);
            if (!exists) {
              env.id = `env_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
              newEnvironments.push(env);
            }
          });
          
          setLocalEnvironments(newEnvironments);
          
          
          if (data.globalVariables) {
            setGlobalVariables({...globalVariables, ...data.globalVariables});
          }
        } else if (data.name && data.variables) {
         
          const newEnv = {
            id: `env_${Date.now()}`,
            name: data.name,
            variables: data.variables
          };
          
          setLocalEnvironments([...localEnvironments, newEnv]);
        } else {
          setImportError('Invalid environment file format');
        }
      } catch (error) {
        console.error('Error importing environment:', error);
        setImportError('Could not parse the environment file');
      }
      
      
      e.target.value = '';
    };
    
    reader.readAsText(file);
  };

  const toggleValueVisibility = (envId, variableName) => {
    setShowValues(prev => ({
      ...prev,
      [`${envId}_${variableName}`]: !prev[`${envId}_${variableName}`]
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderEnvironmentVariableList = (env, isGlobal = false) => {
    const variables = isGlobal ? globalVariables : env.variables;
    const variableCount = Object.keys(variables || {}).length;
    
    return (
      <div className="mb-4">
        <div className="bg-gray-100 dark:bg-gray-750 rounded-t-md p-2 border border-gray-200 dark:border-gray-600 flex items-center">
          <div className="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300">VARIABLE</div>
          <div className="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300">INITIAL VALUE</div>
          <div className="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300">CURRENT VALUE</div>
          <div className="w-1/4 text-sm font-medium text-gray-700 dark:text-gray-300">TYPE</div>
          <div className="w-16"></div>
        </div>
        
        {variableCount > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-b-md border-x border-b border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700">
            {Object.entries(variables).map(([key, variable]) => (
              <div key={key} className="flex items-center p-2">
                <div className="w-1/4 px-2">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}</span>
                  </div>
                </div>
                <div className="w-1/4 px-2">
                  <div className="relative">
                    <input
                      type={showValues[`${isGlobal ? 'global' : env.id}_${key}_initial`] ? "text" : "password"}
                      className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-transparent"
                      value={variable.initialValue}
                      onChange={(e) => isGlobal ? 
                        handleEditGlobalVariable(key, 'initialValue', e.target.value) : 
                        handleEditVariable(env, key, 'initialValue', e.target.value)
                      }
                    />
                    <button
                      onClick={() => toggleValueVisibility(isGlobal ? 'global' : env.id, `${key}_initial`)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showValues[`${isGlobal ? 'global' : env.id}_${key}_initial`] ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="w-1/4 px-2">
                  <div className="relative">
                    <input
                      type={showValues[`${isGlobal ? 'global' : env.id}_${key}_current`] ? "text" : "password"}
                      className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-transparent"
                      value={variable.currentValue}
                      onChange={(e) => isGlobal ? 
                        handleEditGlobalVariable(key, 'currentValue', e.target.value) : 
                        handleEditVariable(env, key, 'currentValue', e.target.value)
                      }
                    />
                    <button
                      onClick={() => toggleValueVisibility(isGlobal ? 'global' : env.id, `${key}_current`)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      {showValues[`${isGlobal ? 'global' : env.id}_${key}_current`] ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="w-1/4 px-2">
                  <select
                    className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-transparent"
                    value={variable.type || 'text'}
                    onChange={(e) => isGlobal ? 
                      handleEditGlobalVariable(key, 'type', e.target.value) : 
                      handleEditVariable(env, key, 'type', e.target.value)
                    }
                  >
                    <option value="text">Text</option>
                    <option value="secret">Secret</option>
                    <option value="default">Default</option>
                  </select>
                </div>
                <div className="w-16 flex justify-end space-x-1">
                  <button 
                    onClick={() => copyToClipboard(variable.currentValue)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    title="Copy value"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                  <button 
                    onClick={() => isGlobal ? 
                      resetGlobalToInitialValue(key) : 
                      resetToInitialValue(env, key)
                    } 
                    className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md"
                    title="Reset to initial value"
                  >
                    <RefreshCw className="w-4 h-4 text-blue-500" />
                  </button>
                  <button 
                    onClick={() => isGlobal ? 
                      handleRemoveGlobalVariable(key) : 
                      handleRemoveVariable(env, key)
                    } 
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                    title="Delete variable"
                  >
                    <Trash className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-b-md border-x border-b border-gray-200 dark:border-gray-600 p-4 text-center text-gray-500 dark:text-gray-400">
            No variables defined. Add one below.
          </div>
        )}
      </div>
    );
  }

  const renderVariableForm = (id, isGlobal = false) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 p-3">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Variable name"
            className="w-1/4 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
            value={(envVariableInputs[id]?.name || '')}
            onChange={(e) => handleVariableChange(id, 'name', e.target.value)}
          />
          <input
            type="text"
            placeholder="Initial value"
            className="w-1/4 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
            value={(envVariableInputs[id]?.initialValue || '')}
            onChange={(e) => handleVariableChange(id, 'initialValue', e.target.value)}
          />
          <input
            type="text"
            placeholder="Current value"
            className="w-1/4 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
            value={(envVariableInputs[id]?.currentValue || '')}
            onChange={(e) => handleVariableChange(id, 'currentValue', e.target.value)}
          />
          <select
            className="w-1/4 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
            value={(envVariableInputs[id]?.type || 'text')}
            onChange={(e) => handleVariableChange(id, 'type', e.target.value)}
          >
            <option value="text">Text</option>
            <option value="secret">Secret</option>
            <option value="default">Default</option>
          </select>
          <button
            onClick={() => isGlobal ? handleAddGlobalVariable() : handleAddVariable(localEnvironments.find(e => e.id === id))}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            disabled={!envVariableInputs[id]?.name?.trim()}
          >
            <Plus className="w-4 h-4 inline" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Environment Management</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={exportAllEnvironments}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md flex items-center text-blue-500"
            title="Export all environments"
          >
            <Download className="w-5 h-5 mr-1" />
            <span className="text-sm">Export All</span>
          </button>
          <label className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md flex items-center text-blue-500 cursor-pointer" title="Import environment">
            <Upload className="w-5 h-5 mr-1" />
            <span className="text-sm">Import</span>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={importEnvironment}
            />
          </label>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      </div>
      
      {importError && (
        <div className="m-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md">
          {importError}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search environments..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="New Environment Name"
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
            />
            <button
              onClick={handleAddEnvironment}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              disabled={!newEnvName.trim()}
            >
              <Plus className="w-4 h-4 mr-2 inline" /> Add
            </button>
          </div>
        </div>
        
       
        <div className="mb-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-600">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <h3 className="text-md font-semibold text-indigo-700 dark:text-indigo-300">Global Environment</h3>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                Always Active
              </span>
            </div>
          </div>
          
          {renderEnvironmentVariableList({ id: 'global' }, true)}
          {renderVariableForm('global', true)}
          
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
            <ExternalLink className="w-3 h-3 inline mr-1" />
            Global variables are available in all environments and are overridden by environment-specific variables.
          </div>
        </div>
        
        <div className="space-y-6">
          {filteredEnvironments.length === 0 ? (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400">No environments found.</div>
          ) : (
            filteredEnvironments.map(env => (
              <div key={env.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">{env.name}</h3>
                    {localActiveEnvironment?.id === env.id && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => duplicateEnvironment(env)} 
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                      title="Duplicate environment"
                    >
                      <Duplicate className="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => exportEnvironment(env)} 
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                      title="Export environment"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleEnvChange(env)} 
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
                      title="Set as active environment"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEnv(env.id)} 
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                      title="Delete environment"
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {renderEnvironmentVariableList(env)}
                {renderVariableForm(env.id)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentManagementPanel;