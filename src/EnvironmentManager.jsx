import React, { useState, useEffect } from 'react';
import { 
  Settings, Check, Trash, Plus, Search, Edit2, X, 
  Database, Lock, Save, RefreshCw
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'app_environments';

const EnvironmentManagementPanel = ({ onClose }) => {
  const [environments, setEnvironments] = useState([]);
  const [activeEnvironment, setActiveEnvironment] = useState(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [envVariableInputs, setEnvVariableInputs] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load environments from localStorage on component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        if (Array.isArray(parsedData.environments)) {
          setEnvironments(parsedData.environments);
          
          if (parsedData.activeEnvironmentId) {
            const active = parsedData.environments.find(
              env => env.id === parsedData.activeEnvironmentId
            );
            if (active) {
              setActiveEnvironment(active);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading environments from localStorage:", error);
    }
    
    setIsInitialized(true);
  }, []);

  // Save environments to localStorage whenever they change
  useEffect(() => {
    // Only save after initial load to prevent overwriting with empty data
    if (isInitialized) {
      try {
        const dataToStore = {
          environments: environments,
          activeEnvironmentId: activeEnvironment?.id || null
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToStore));
        console.log("Saved to localStorage:", dataToStore);
      } catch (error) {
        console.error("Error saving environments to localStorage:", error);
      }
    }
  }, [environments, activeEnvironment, isInitialized]);

  const filteredEnvironments = environments.filter(env => 
    env.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEnvironment = () => {
    if (!newEnvName.trim()) return;
    const newEnvironment = { 
      id: `env_${Date.now()}`, 
      name: newEnvName, 
      variables: {} 
    };
    
    const updatedEnvironments = [...environments, newEnvironment];
    setEnvironments(updatedEnvironments);
    setNewEnvName('');
    
    // Debug log
    console.log("Added new environment:", newEnvironment);
    console.log("Updated environments list:", updatedEnvironments);
  };

  const handleEnvChange = (env) => {
    setActiveEnvironment(env);
    console.log("Set active environment:", env);
  };

  const handleDeleteEnv = (envId) => {
    const updatedEnvironments = environments.filter(env => env.id !== envId);
    setEnvironments(updatedEnvironments);
    
    if (activeEnvironment?.id === envId) {
      setActiveEnvironment(null);
    }
    
    console.log("Deleted environment ID:", envId);
    console.log("Updated environments list:", updatedEnvironments);
  };

  const handleUpdateEnv = (updatedEnv) => {
    const updatedEnvironments = environments.map(env => 
      env.id === updatedEnv.id ? updatedEnv : env
    );
    
    setEnvironments(updatedEnvironments);
    
    if (activeEnvironment?.id === updatedEnv.id) {
      setActiveEnvironment(updatedEnv);
    }
    
    console.log("Updated environment:", updatedEnv);
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
    
    // Create a deep copy of the environment to update
    const updatedEnv = JSON.parse(JSON.stringify(env));
    
    // Add the new variable
    updatedEnv.variables[name] = {
      initialValue: initialValue,
      currentValue: currentValue
    };
    
    // Update the environments array
    const updatedEnvironments = environments.map(e => 
      e.id === env.id ? updatedEnv : e
    );
    
    setEnvironments(updatedEnvironments);
    
    // Update active environment if needed
    if (activeEnvironment?.id === env.id) {
      setActiveEnvironment(updatedEnv);
    }
    
    // Clear input fields after adding
    setEnvVariableInputs(prev => ({ 
      ...prev, 
      [env.id]: { name: '', initialValue: '', currentValue: '' } 
    }));
    
    console.log("Added variable to environment:", name, updatedEnv);
    console.log("Updated environments list:", updatedEnvironments);
  };

  const handleEditVariable = (env, variableName, field, value) => {
    // Create deep copies to ensure state updates properly
    const updatedEnv = JSON.parse(JSON.stringify(env));
    updatedEnv.variables[variableName][field] = value;
    
    const updatedEnvironments = environments.map(e => 
      e.id === env.id ? updatedEnv : e
    );
    
    setEnvironments(updatedEnvironments);
    
    if (activeEnvironment?.id === env.id) {
      setActiveEnvironment(updatedEnv);
    }
    
    console.log(`Updated ${field} for variable ${variableName}:`, updatedEnv);
  };

  const handleRemoveVariable = (env, variableName) => {
    // Create deep copy of environment
    const updatedEnv = JSON.parse(JSON.stringify(env));
    delete updatedEnv.variables[variableName];
    
    const updatedEnvironments = environments.map(e => 
      e.id === env.id ? updatedEnv : e
    );
    
    setEnvironments(updatedEnvironments);
    
    if (activeEnvironment?.id === env.id) {
      setActiveEnvironment(updatedEnv);
    }
    
    console.log(`Removed variable ${variableName} from:`, updatedEnv);
  };

  const resetToInitialValue = (env, variableName) => {
    const initialValue = env.variables[variableName].initialValue;
    handleEditVariable(env, variableName, 'currentValue', initialValue);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Environment Management</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
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
                    {activeEnvironment?.id === env.id && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleEnvChange(env)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md">
                      <Check className="w-4 h-4 text-green-500" />
                    </button>
                    <button onClick={() => handleDeleteEnv(env.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md">
                      <Trash className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Postman-like Variables Table */}
                <div className="mb-4">
                  <div className="bg-gray-100 dark:bg-gray-750 rounded-t-md p-2 border border-gray-200 dark:border-gray-600 flex items-center">
                    <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">VARIABLE</div>
                    <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">INITIAL VALUE</div>
                    <div className="w-1/3 text-sm font-medium text-gray-700 dark:text-gray-300">CURRENT VALUE</div>
                    <div className="w-16"></div>
                  </div>
                  
                  {Object.keys(env.variables || {}).length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-b-md border-x border-b border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700">
                      {Object.entries(env.variables || {}).map(([key, variable]) => (
                        <div key={key} className="flex items-center p-2">
                          <div className="w-1/3 px-2">
                            {editMode === `${env.id}_${key}` ? (
                              <input
                                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                value={key}
                                disabled={true}
                              />
                            ) : (
                              <div className="flex items-center">
                                <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}</span>
                              </div>
                            )}
                          </div>
                          <div className="w-1/3 px-2">
                            {editMode === `${env.id}_${key}` ? (
                              <input
                                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                value={variable.initialValue}
                                onChange={(e) => handleEditVariable(env, key, 'initialValue', e.target.value)}
                              />
                            ) : (
                              <span className="text-sm text-gray-600 dark:text-gray-400">{variable.initialValue}</span>
                            )}
                          </div>
                          <div className="w-1/3 px-2">
                            {editMode === `${env.id}_${key}` ? (
                              <input
                                className="w-full p-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                                value={variable.currentValue}
                                onChange={(e) => handleEditVariable(env, key, 'currentValue', e.target.value)}
                              />
                            ) : (
                              <span className="text-sm text-gray-600 dark:text-gray-400">{variable.currentValue}</span>
                            )}
                          </div>
                          <div className="w-16 flex justify-end space-x-1">
                            {editMode === `${env.id}_${key}` ? (
                              <button 
                                onClick={() => setEditMode(null)} 
                                className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-md"
                              >
                                <Save className="w-4 h-4 text-green-500" />
                              </button>
                            ) : (
                              <>
                                <button 
                                  onClick={() => setEditMode(`${env.id}_${key}`)} 
                                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                >
                                  <Edit2 className="w-4 h-4 text-gray-500" />
                                </button>
                                <button 
                                  onClick={() => resetToInitialValue(env, key)} 
                                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md"
                                >
                                  <RefreshCw className="w-4 h-4 text-blue-500" />
                                </button>
                                <button 
                                  onClick={() => handleRemoveVariable(env, key)} 
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md"
                                >
                                  <Trash className="w-4 h-4 text-red-500" />
                                </button>
                              </>
                            )}
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
                
                {/* Add New Variable Form */}
                <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 p-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Variable name"
                      className="w-1/3 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
                      value={(envVariableInputs[env.id]?.name || '')}
                      onChange={(e) => handleVariableChange(env.id, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Initial value"
                      className="w-1/3 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
                      value={(envVariableInputs[env.id]?.initialValue || '')}
                      onChange={(e) => handleVariableChange(env.id, 'initialValue', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Current value"
                      className="w-1/3 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
                      value={(envVariableInputs[env.id]?.currentValue || '')}
                      onChange={(e) => handleVariableChange(env.id, 'currentValue', e.target.value)}
                    />
                    <button
                      onClick={() => handleAddVariable(env)}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
                      disabled={!envVariableInputs[env.id]?.name?.trim()}
                    >
                      <Plus className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentManagementPanel;