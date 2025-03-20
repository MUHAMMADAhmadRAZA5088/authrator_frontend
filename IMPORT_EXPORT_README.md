# Authrator Import/Export Functionality

This document explains how to import and export collections in Authrator, allowing you to share your API collections with others or migrate between systems.

## Supported Formats

Authrator supports importing collections from:

1. **Postman Collections** (v2.1 format)
2. **Authrator Export** format

## Exporting Collections

### Export a Single Collection

1. In the Collections sidebar, find the collection you want to export
2. Click the vertical dots menu (⋮) on the right side of the collection
3. Select "Export" from the dropdown menu
4. A JSON file with your collection will be downloaded automatically

### Export All Collections

1. In the Collections sidebar, scroll down to the "Import & Export" section
2. Click the "Export All" button
3. A JSON file containing all your collections will be downloaded automatically

## Importing Collections

1. In the Collections sidebar, scroll down to the "Import & Export" section
2. Click the "Import" button
3. In the modal dialog that appears, either:
   - Drag and drop your collection file onto the drop area, OR
   - Click "Browse files" to select a file from your system
4. Wait for the import to complete

## Working Offline

Authrator supports import and export functionality even when you're offline:

- When offline, collections are stored in your browser's local storage
- When you reconnect, you can sync your offline collections with the server

## Troubleshooting

If you encounter issues with import/export:

1. **Invalid Format Error**: Ensure you're importing a valid Postman (v2.1) or Authrator JSON file
2. **Import Fails**: Check that your JSON is properly formatted with no syntax errors
3. **Export Missing Information**: Make sure your collections and requests have all the necessary fields

## Supported Collection Properties

The following properties are preserved during import/export:

- Collection name and description
- Requests (method, URL, name)
- Headers
- Query parameters
- Request body (raw, form-data, url-encoded)
- Authentication details (Basic, Bearer, JWT)

## Example Collection Format

```json
{
  "info": {
    "name": "My Collection",
    "description": "A sample collection",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Users",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://api.example.com/users",
          "query": []
        }
      }
    }
  ]
}
``` 