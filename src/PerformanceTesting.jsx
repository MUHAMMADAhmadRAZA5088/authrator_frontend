import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Play, StopCircle, X, Settings, FolderOpen, ChevronDown, Download, FileText 
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  ChartLegend
);

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
  const [hasInvalidUrls, setHasInvalidUrls] = useState(false);
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

  useEffect(() => {
    // Check for invalid URLs in initial APIs
    if (initialApi) {
      setHasInvalidUrls(!initialApi.url || initialApi.url.trim() === '');
    } else if (initialCollection && initialCollection.apis) {
      setHasInvalidUrls(initialCollection.apis.some(a => !a.url || a.url.trim() === ''));
    }
  }, [initialApi, initialCollection]);

  const makeRequest = useCallback(async (api) => {
    if (!api.url || api.url.trim() === '') {
      throw new Error('API URL is missing or empty');
    }
    
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
    const apis = collection.apis || [];
    setSelectedApis(apis);
    setHasInvalidUrls(apis.some(a => !a.url || a.url.trim() === ''));
    setShowCollectionSelect(false);
  };

  const handleSelectApi = (api) => {
    if (selectedApis.find(a => a.id === api.id)) {
      const updatedApis = selectedApis.filter(a => a.id !== api.id);
      setSelectedApis(updatedApis);
      setHasInvalidUrls(updatedApis.some(a => !a.url || a.url.trim() === ''));
    } else {
      const updatedApis = [...selectedApis, api];
      setSelectedApis(updatedApis);
      setHasInvalidUrls(updatedApis.some(a => !a.url || a.url.trim() === ''));
    }
  };

  const generateReport = () => {
    const apiSummaries = selectedApis.map(api => {
      const apiData = results.responseTimeData.filter(d => d.api === api.name);
      const avgTime = apiData.reduce((acc, curr) => acc + curr.responseTime, 0) / apiData.length || 0;
      const successRate = ((apiData.length / (testConfig.iterations / selectedApis.length)) * 100);
      
      return {
        name: api.name,
        method: api.method,
        url: api.url,
        averageResponseTime: avgTime,
        successRate: successRate,
        totalRequests: apiData.length
      };
    });

    const report = {
      timestamp: new Date().toISOString(),
      testConfiguration: {
        ...testConfig,
        totalApis: selectedApis.length,
      },
      overallSummary: results.summary,
      apiDetails: apiSummaries,
      rawData: {
        responseTimeData: results.responseTimeData,
        throughputData: results.throughputData
      }
    };

    return report;
  };

  const downloadReport = () => {
    const report = generateReport();
    const reportBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-test-report-${new Date().toISOString().split('.')[0].replace(/:/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generatePDFReport = () => {
    const report = generateReport();
    const doc = new jsPDF();
    
   
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 100);
    doc.text('Performance Test Report', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    
 
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 100);
    doc.text('Test Configuration', 14, 44);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Iterations: ${report.testConfiguration.iterations}`, 14, 52);
    doc.text(`Concurrent Users: ${report.testConfiguration.concurrentUsers}`, 14, 58);
    doc.text(`Ramp Up Period: ${report.testConfiguration.rampUpPeriod}s`, 14, 64);
    doc.text(`Delay: ${report.testConfiguration.delay}ms`, 14, 70);
    doc.text(`Total APIs Tested: ${report.testConfiguration.totalApis}`, 14, 76);
    
   
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 100);
    doc.text('Overall Summary', 14, 88);
    
    const summaryData = [
      ['Metric', 'Value'],
      ['Average Response Time', `${report.overallSummary.avgResponseTime.toFixed(2)}ms`],
      ['Min Response Time', `${report.overallSummary.minResponseTime.toFixed(2)}ms`],
      ['Max Response Time', `${report.overallSummary.maxResponseTime.toFixed(2)}ms`],
      ['Error Rate', `${report.overallSummary.errorRate.toFixed(2)}%`],
      ['Total Requests', report.overallSummary.totalRequests],
      ['Successful Requests', report.overallSummary.successfulRequests],
      ['Failed Requests', report.overallSummary.failedRequests]
    ];
    
    autoTable(doc, {
      startY: 94,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'striped',
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255]
      }
    });
    
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 100);
    let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 94;
    doc.text('API Details', 14, finalY + 15);
    
    const apiDetailsHeaders = ['API Name', 'Method', 'URL', 'Avg Response Time (ms)', 'Success Rate (%)', 'Total Requests'];
    const apiDetailsData = report.apiDetails.map(api => [
      api.name,
      api.method,
      api.url.length > 30 ? api.url.substring(0, 27) + '...' : api.url,
      api.averageResponseTime.toFixed(2),
      api.successRate.toFixed(2),
      api.totalRequests
    ]);
    
    autoTable(doc, {
      startY: finalY + 20,
      head: [apiDetailsHeaders],
      body: apiDetailsData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 51, 102],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        2: { cellWidth: 50 }
      }
    });
    
    
    doc.save(`performance-test-report-${new Date().toISOString().split('.')[0].replace(/:/g, '-')}.pdf`);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 dark:text-gray-300">
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Performance Testing</h2>
        <div className="flex items-center gap-2">
          {results.responseTimeData.length > 0 && (
            <>
              <button
                onClick={downloadReport}
                className="flex items-center px-3 py-1.5 text-sm rounded-md text-white bg-green-500 hover:bg-green-600"
              >
                <Download size={16} className="mr-1.5" />
                JSON Report
              </button>
              <button
                onClick={generatePDFReport}
                className="flex items-center px-3 py-1.5 text-sm rounded-md text-white bg-purple-500 hover:bg-purple-600"
              >
                <FileText size={16} className="mr-1.5" />
                PDF Report
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>


      <div className="p-4 border-b border-purple-200 dark:border-zinc-700">
        <div className="space-y-4">
        
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Collection
            </label>
            <button
              onClick={() => setShowCollectionSelect(!showCollectionSelect)}
              className="w-full px-3 py-2 text-left border border-purple-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 flex items-center justify-between"
            >
              <span>{selectedCollection?.name || 'Select Collection'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showCollectionSelect && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-700 border border-purple-200 dark:border-zinc-600 rounded-md shadow-lg max-h-60 overflow-auto">
                {collections
                  .filter(collection => collection.id !== 'temp-99999' && collection.name !== 'Unsaved Requests' && collection.name !== 'History Requests 9999999')
                  .map(collection => (
                  <button
                    key={collection.id}
                    onClick={() => handleSelectCollection(collection)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-600 flex items-center"
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
              <div className="space-y-2 max-h-40 overflow-auto border border-purple-200 dark:border-zinc-600 rounded-md p-2">
                {selectedCollection.apis.map(api => (
                  <label key={api.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedApis.some(a => a.id === api.id)}
                      onChange={() => handleSelectApi(api)}
                      className="rounded border-purple-300 dark:border-zinc-600"
                    />
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide ${
                      {
                        GET: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300',
                        POST: 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300',
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

    
      <div className="p-4 border-b border-purple-200 dark:border-zinc-700">
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
              className="w-full px-3 py-2 border border-purple-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
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
              className="w-full px-3 py-2 border border-purple-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
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
              className="w-full px-3 py-2 border border-purple-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
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
              className="w-full px-3 py-2 border border-purple-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          {hasInvalidUrls && (
            <div className="mr-4 text-yellow-500 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Some selected APIs have missing URLs
            </div>
          )}
          <button
            onClick={runTest}
            disabled={isRunning || selectedApis.length === 0 || hasInvalidUrls}
            className={`flex items-center px-4 py-2 rounded-md text-white ${
              isRunning || selectedApis.length === 0 || hasInvalidUrls
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-500 hover:bg-purple-600'
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
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
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
          
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
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
          
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
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
       
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Response Time Over Time</h3>
            <div className="w-full h-[400px] min-h-[400px] flex items-center justify-center">
              {results.responseTimeData.length > 0 ? (
                <Line
                  data={{
                    labels: results.responseTimeData.map(d => d.time.toFixed(1) + 's'),
                    datasets: [
                      {
                        label: 'Response Time',
                        data: results.responseTimeData.map(d => d.responseTime),
                        fill: false,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                        tension: 0.1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 0
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'Response Time (ms)',
                          font: { size: 12 }
                        },
                        ticks: { beginAtZero: true }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Time (s)',
                          font: { size: 12 }
                        },
                        ticks: {
                          maxRotation: 0,
                          autoSkip: true,
                          maxTicksLimit: 10
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const dataPoint = results.responseTimeData[context.dataIndex];
                            return [
                              `Response Time: ${dataPoint.responseTime.toFixed(2)} ms`,
                              `API: ${dataPoint.api}`
                            ];
                          }
                        }
                      },
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          boxWidth: 6
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-gray-400 dark:text-gray-500">No data available</div>
              )}
            </div>
          </div>

      
          <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Throughput Over Time</h3>
            <div className="w-full h-[400px] min-h-[400px] flex items-center justify-center">
              {results.throughputData.length > 0 ? (
                <Line
                  data={{
                    labels: results.throughputData.map(d => d.time.toFixed(1) + 's'),
                    datasets: [
                      {
                        label: 'Total Requests',
                        data: results.throughputData.map(d => d.requests),
                        fill: false,
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                        tension: 0.1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 0
                    },
                    scales: {
                      y: {
                        title: {
                          display: true,
                          text: 'Total Requests',
                          font: { size: 12 }
                        },
                        ticks: {
                          beginAtZero: true,
                          stepSize: 1
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Time (s)',
                          font: { size: 12 }
                        },
                        ticks: {
                          maxRotation: 0,
                          autoSkip: true,
                          maxTicksLimit: 10
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const dataPoint = results.throughputData[context.dataIndex];
                            return [
                              `Requests: ${dataPoint.requests}`,
                              `API: ${dataPoint.api}`
                            ];
                          }
                        }
                      },
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          boxWidth: 6
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-gray-400 dark:text-gray-500">No data available</div>
              )}
            </div>
          </div>

          
          {selectedApis.length > 1 && (
            <div className="bg-white dark:bg-zinc-700 p-4 rounded-lg">
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