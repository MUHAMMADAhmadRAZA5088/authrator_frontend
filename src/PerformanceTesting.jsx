import React, { useState, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { Play, StopCircle, X, Settings, FolderOpen, ChevronDown } from 'lucide-react';

const PerformanceTestingPanel = ({ 
  collections,
  activeEnvironment,
  onClose,
  initialApi = null,
  initialCollection = null
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(initialCollection);
  const [selectedApis, setSelectedApis] = useState(initialApi ? [initialApi] : []);
  const [showCollectionSelect, setShowCollectionSelect] = useState(false);
  const [showApiSelect, setShowApiSelect] = useState(false);
  const [testConfig, setTestConfig] = useState({
    iterations: 100,
    concurrentUsers: 10,
    rampUpPeriod: 5,
    delay: 0,
  });
  const [results, setResults] = useState({
    responseTimeData: [],
    errorRates: [],
    throughputData: [],
    summary: {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      errorRate: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
    }
  });


  const makeRequest = useCallback(async (api) => {
    const headers = new Headers();
    
    if (api.headers) {
      Object.entries(api.headers).forEach(([key, value]) => {
        const processedValue = value.replace(/\{\{(.+?)\}\}/g, (_, variable) => {
          return activeEnvironment?.variables?.[variable.trim()] || '';
        });
        headers.append(key, processedValue);
      });
    }

    let url = api.url;
    if (activeEnvironment?.variables) {
      url = url.replace(/\{\{(.+?)\}\}/g, (_, variable) => {
        return activeEnvironment.variables[variable.trim()] || '';
      });
    }

    let body = null;
    if (api.body && ['POST', 'PUT', 'PATCH'].includes(api.method)) {
      try {
        body = JSON.parse(api.body.replace(/\{\{(.+?)\}\}/g, (_, variable) => {
          return activeEnvironment?.variables?.[variable.trim()] || '';
        }));
      } catch (e) {
        body = api.body;
      }
    }

    const response = await fetch(url, {
      method: api.method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }, [activeEnvironment]);

  const runTest = useCallback(async () => {
    if (selectedApis.length === 0) {
      alert('Please select at least one API to test');
      return;
    }

    setIsRunning(true);
    setResults({
      responseTimeData: [],
      errorRates: [],
      throughputData: [],
      summary: {
        avgResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        errorRate: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
      }
    });

    const startTime = Date.now();
    let completedRequests = 0;
    let successfulRequests = 0;
    let failedRequests = 0;
    let totalResponseTime = 0;
    let minResponseTime = Infinity;
    let maxResponseTime = 0;
    
    const iterationsPerApi = Math.ceil(testConfig.iterations / selectedApis.length);
    const batchSize = Math.ceil(iterationsPerApi / testConfig.concurrentUsers);
    const delayBetweenBatches = (testConfig.rampUpPeriod * 1000) / batchSize;

    for (const api of selectedApis) {
      for (let batch = 0; batch < batchSize; batch++) {
        const batchPromises = [];
        
        for (let user = 0; user < testConfig.concurrentUsers; user++) {
          if (completedRequests >= testConfig.iterations) break;
          
          batchPromises.push(
            (async () => {
              const requestStart = Date.now();
              try {
                await makeRequest(api);
                successfulRequests++;
                const responseTime = Date.now() - requestStart;
                totalResponseTime += responseTime;
                minResponseTime = Math.min(minResponseTime, responseTime);
                maxResponseTime = Math.max(maxResponseTime, responseTime);
                
                completedRequests++;
                
                setResults(prev => ({
                  ...prev,
                  responseTimeData: [...prev.responseTimeData, {
                    time: (Date.now() - startTime) / 1000,
                    responseTime,
                    api: api.name
                  }],
                  throughputData: [...prev.throughputData, {
                    time: (Date.now() - startTime) / 1000,
                    requests: completedRequests,
                    api: api.name
                  }]
                }));
              } catch (error) {
                failedRequests++;
                completedRequests++;
              }
            })()
          );
        }
        
        await Promise.all(batchPromises);
        if (delayBetweenBatches > 0) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
        }
      }
    }

    const summary = {
      avgResponseTime: totalResponseTime / successfulRequests,
      minResponseTime,
      maxResponseTime,
      errorRate: (failedRequests / testConfig.iterations) * 100,
      totalRequests: completedRequests,
      successfulRequests,
      failedRequests
    };

    setResults(prev => ({ ...prev, summary }));
    setIsRunning(false);
  }, [testConfig, makeRequest, selectedApis]);

  const handleSelectCollection = (collection) => {
    setSelectedCollection(collection);
    setSelectedApis(collection.apis || []);
    setShowCollectionSelect(false);
  };

  const handleSelectApi = (api) => {
    if (selectedApis.find(a => a.id === api.id)) {
      setSelectedApis(selectedApis.filter(a => a.id !== api.id));
    } else {
      setSelectedApis([...selectedApis, api]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 dark:text-gray-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance Testing</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>


      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
        
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Collection
            </label>
            <button
              onClick={() => setShowCollectionSelect(!showCollectionSelect)}
              className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 flex items-center justify-between"
            >
              <span>{selectedCollection?.name || 'Select Collection'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showCollectionSelect && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {collections.map(collection => (
                  <button
                    key={collection.id}
                    onClick={() => handleSelectCollection(collection)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    {collection.name}
                  </button>
                ))}
              </div>
            )}
          </div>

         
          {selectedCollection && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Selected APIs
              </label>
              <div className="space-y-2 max-h-40 overflow-auto border border-gray-200 dark:border-gray-600 rounded-md p-2">
                {selectedCollection.apis.map(api => (
                  <label key={api.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedApis.some(a => a.id === api.id)}
                      onChange={() => handleSelectApi(api)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide ${
                      {
                        GET: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300',
                        POST: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300',
                        PUT: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300',
                        DELETE: 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300',
                        PATCH: 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300',
                      }[api.method]
                    }`}>
                      {api.method}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{api.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Iterations per API
            </label>
            <input
              type="number"
              value={testConfig.iterations}
              onChange={(e) => setTestConfig(prev => ({
                ...prev,
                iterations: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Concurrent Users
            </label>
            <input
              type="number"
              value={testConfig.concurrentUsers}
              onChange={(e) => setTestConfig(prev => ({
                ...prev,
                concurrentUsers: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ramp-up Period (s)
            </label>
            <input
              type="number"
              value={testConfig.rampUpPeriod}
              onChange={(e) => setTestConfig(prev => ({
                ...prev,
                rampUpPeriod: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delay (ms)
            </label>
            <input
              type="number"
              value={testConfig.delay}
              onChange={(e) => setTestConfig(prev => ({
                ...prev,
                delay: parseInt(e.target.value)
              }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={runTest}
            disabled={isRunning || selectedApis.length === 0}
            className={`flex items-center px-4 py-2 rounded-md text-white ${
              isRunning || selectedApis.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isRunning ? (
              <>
                <StopCircle className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Test
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Response Time</h3>
            <div className="mt-2">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {results.summary.avgResponseTime.toFixed(2)} ms
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Min: {results.summary.minResponseTime} ms | Max: {results.summary.maxResponseTime} ms
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Error Rate</h3>
            <div className="mt-2">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {results.summary.errorRate.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Failed: {results.summary.failedRequests} / Total: {results.summary.totalRequests}
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Throughput</h3>
            <div className="mt-2">
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {results.summary.totalRequests} requests
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Successful: {results.summary.successfulRequests}
              </p>
            </div>
          </div>
        </div>

      
        <div className="space-y-6">
       
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Response Time Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                  />
                  <YAxis 
                    label={{ value: 'Response Time (ms)', angle: -90, position: 'left' }} 
                  />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-600 rounded shadow">
                          <p className="text-sm">Time: {payload[0].payload.time.toFixed(2)}s</p>
                          <p className="text-sm">Response Time: {payload[0].value.toFixed(2)}ms</p>
                          <p className="text-sm">API: {payload[0].payload.api}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#3b82f6" 
                    name="Response Time"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

      
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Throughput Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.throughputData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                  />
                  <YAxis 
                    label={{ value: 'Total Requests', angle: -90, position: 'left' }} 
                  />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-600 rounded shadow">
                          <p className="text-sm">Time: {payload[0].payload.time.toFixed(2)}s</p>
                          <p className="text-sm">Requests: {payload[0].value}</p>
                          <p className="text-sm">API: {payload[0].payload.api}</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#10b981" 
                    name="Total Requests"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          
          {selectedApis.length > 1 && (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">API Performance Summary</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">API</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {selectedApis.map(api => {
                      const apiData = results.responseTimeData.filter(d => d.api === api.name);
                      const avgTime = apiData.reduce((acc, curr) => acc + curr.responseTime, 0) / apiData.length || 0;
                      
                      return (
                        <tr key={api.id}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{api.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{avgTime.toFixed(2)} ms</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                            {((apiData.length / (testConfig.iterations / selectedApis.length)) * 100).toFixed(2)}%
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{apiData.length}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTestingPanel;