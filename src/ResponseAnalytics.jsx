import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const ResponseAnalytics = ({ api }) => {
  if (!api?.responseData) return null;

  // Transform request history for time series
  const timeSeriesData = api.requestHistory?.slice(-10).map((request, index) => ({
    id: index + 1,
    time: typeof request.responseTime === 'number' ? request.responseTime : 0,
    status: request.status,
    success: request.success,
    timestamp: new Date(request.timestamp).toLocaleTimeString()
  })) || [];

  // Enhanced status distribution data
  const statusData = api.requestHistory?.reduce((acc, request) => {
    const statusGroup = Math.floor(request.status / 100) * 100;
    const statusLabel = {
      200: 'Success',
      300: 'Redirect',
      400: 'Client Error',
      500: 'Server Error',
      0: 'Network Error'
    }[statusGroup] || 'Unknown';
    
    acc[statusGroup] = {
      count: (acc[statusGroup]?.count || 0) + 1,
      label: statusLabel
    };
    return acc;
  }, {}) || {};

  const statusChartData = Object.entries(statusData).map(([status, data]) => ({
    status: data.label,
    count: data.count,
    label: `${data.label}: ${data.count}`
  }));

  const COLORS = ['#06B6D4', '#818CF8', '#FBBF24', '#EC4899', '#EF4444'];
  const DARK_COLORS = ['#22D3EE', '#A5B4FC', '#FDE68A', '#F472B6', '#FCA5A5'];

  const sizeData = api.requestHistory?.slice(-10).map((request, index) => ({
    id: index + 1,
    size: request.responseSize / 1024,
    timestamp: new Date(request.timestamp).toLocaleTimeString()
  })) || [];

  // Calculate success rate
  const successRate = api.requestHistory?.length > 0
    ? ((api.requestHistory.filter(req => req.success).length / api.requestHistory.length) * 100).toFixed(1)
    : 0;

  const avgResponseTime = api.requestHistory?.length > 0
    ? (api.requestHistory.reduce((sum, req) => sum + req.responseTime, 0) / api.requestHistory.length).toFixed(1)
    : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {payload[0].payload.timestamp || `Request ${label}`}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {`${payload[0].name}: ${payload[0].value.toFixed(2)} ${payload[0].name === 'size' ? 'KB' : 'ms'}`}
          </p>
          {payload[0].payload.status && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {`Status: ${payload[0].payload.status}`}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex-1 overflow-auto p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Current Request Metrics
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 p-4 rounded-xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Response Time</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  {api.responseData.responseTime || 0}
                </p>
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">ms</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Avg: {avgResponseTime}ms
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Success Rate</p>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {successRate}
                </p>
                <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Response Time Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6B7280"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  className="dark:text-gray-400 dark:stroke-gray-700"
                />
                <YAxis 
                  stroke="#6B7280"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  className="dark:text-gray-400 dark:stroke-gray-700"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  dot={{ fill: '#06B6D4', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                  className="dark:stroke-cyan-400"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Status Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={60}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = 25 + innerRadius + (outerRadius - innerRadius);
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (
                      <text
                        x={x}
                        y={y}
                        className="text-xs dark:fill-gray-300"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {statusChartData[index].label}
                      </text>
                    );
                  }}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={document.documentElement.classList.contains('dark') ? DARK_COLORS[index % DARK_COLORS.length] : COLORS[index % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Response Size Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
                <XAxis 
                  dataKey="timestamp" 
                  stroke="#6B7280"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  className="dark:text-gray-400 dark:stroke-gray-700"
                />
                <YAxis 
                  stroke="#6B7280"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  className="dark:text-gray-400 dark:stroke-gray-700"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="size" 
                  fill="#818CF8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseAnalytics;