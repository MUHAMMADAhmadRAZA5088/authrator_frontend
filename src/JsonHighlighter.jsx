import React from "react";

const JsonHighlighter = ({ data }) => {
    const renderValue = (value) => {
      if (typeof value === 'boolean') {
        return <span className="text-orange-500 dark:text-orange-400">{value.toString()}</span>;
      }
      if (typeof value === 'number') {
        return <span className="text-indigo-500 dark:text-indigo-400">{value}</span>;
      }
      if (typeof value === 'string') {
        if (value.match(/^\d{4}-\d{2}-\d{2}T/)) {
          return <span className="text-green-500 dark:text-green-400">"{value}"</span>;
        }
        return <span className="text-teal-500 dark:text-teal-400">"{value}"</span>;
      }
      return value;
    };
  
    const renderJson = (obj, level = 0) => {
      const indent = '  '.repeat(level);
      
      if (Array.isArray(obj)) {
        return (
          <>
            {'[\n'}
            {obj.map((item, index) => (
              <React.Fragment key={index}>
                {indent}  {renderJson(item, level + 1)}
                {index < obj.length - 1 ? ',' : ''}{'\n'}
              </React.Fragment>
            ))}
            {indent}{']'}
          </>
        );
      }
      
      if (typeof obj === 'object' && obj !== null) {
        return (
          <>
            {'{\n'}
            {Object.entries(obj).map(([key, value], index, arr) => (
              <React.Fragment key={key}>
                {indent}  <span className="text-blue-500 dark:text-blue-400">"{key}"</span>: {renderJson(value, level + 1)}
                {index < arr.length - 1 ? ',' : ''}{'\n'}
              </React.Fragment>
            ))}
            {indent}{'}'}
          </>
        );
      }
      
      return renderValue(obj);
    };
  
    return (
      <pre className="font-mono text-sm leading-relaxed font-[JetBrains Mono],monospace">
        {renderJson(data)}
      </pre>
    );
  };

  export default JsonHighlighter;