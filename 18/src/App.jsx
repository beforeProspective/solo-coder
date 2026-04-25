import { useState, useEffect, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import 'prismjs/components/prism-sql'
import './App.css'
import { initDatabase, executeQuery, getTableSchema, exportToCSV } from './services/database'

function App() {
  const [db, setDb] = useState(null)
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM customers')
  const [queryResults, setQueryResults] = useState([])
  const [tableSchemas, setTableSchemas] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const database = await initDatabase()
        setDb(database)
        
        const schemas = {}
        const tables = ['customers', 'orders', 'products']
        tables.forEach(table => {
          schemas[table] = getTableSchema(database, table)
        })
        setTableSchemas(schemas)
        
        const initialResults = executeQuery(database, 'SELECT * FROM customers')
        setQueryResults(initialResults)
        
        setMessage('数据库初始化成功！已创建3张表并插入1000条模拟数据。')
      } catch (err) {
        setError(err.message)
        console.error('初始化数据库失败:', err)
      } finally {
        setLoading(false)
      }
    }
    
    init()
  }, [])

  const handleExecute = useCallback(() => {
    if (!db) return
    
    setError(null)
    setMessage('')
    
    try {
      const results = executeQuery(db, sqlQuery)
      setQueryResults(results)
      setMessage(`查询执行成功！返回 ${results.length} 条记录。`)
    } catch (err) {
      setError(err.message)
      console.error('执行 SQL 失败:', err)
    }
  }, [db, sqlQuery])

  const handleExportCSV = useCallback(() => {
    if (queryResults.length === 0) {
      setError('没有数据可导出')
      return
    }
    
    try {
      const csv = exportToCSV(queryResults)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `query_results_${Date.now()}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setMessage('CSV 文件导出成功！')
    } catch (err) {
      setError('导出 CSV 失败: ' + err.message)
    }
  }, [queryResults])

  const handleTableClick = (tableName) => {
    setSqlQuery(`SELECT * FROM ${tableName}`)
  }

  const columnDefs = queryResults.length > 0
    ? Object.keys(queryResults[0]).map(key => ({
        headerName: key,
        field: key,
        sortable: true,
        filter: true,
        resizable: true,
        minWidth: 100,
      }))
    : []

  const highlightSQL = (code) => {
    return highlight(code, languages.sql, 'sql')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>正在初始化数据库...</p>
      </div>
    )
  }

  if (error && !db) {
    return (
      <div className="error-container">
        <h2>初始化失败</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>SQLite 可视化工具</h1>
        <div className="header-actions">
          <button 
            className="execute-btn" 
            onClick={handleExecute}
            disabled={!db}
          >
            执行查询
          </button>
          <button 
            className="export-btn" 
            onClick={handleExportCSV}
            disabled={queryResults.length === 0}
          >
            导出 CSV
          </button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3>数据库表</h3>
          </div>
          <div className="sidebar-content">
            {Object.entries(tableSchemas).map(([tableName, schema]) => (
              <div key={tableName} className="table-item">
                <div 
                  className="table-name" 
                  onClick={() => handleTableClick(tableName)}
                >
                  <span className="table-icon">📋</span>
                  {tableName}
                </div>
                <div className="table-columns">
                  {schema.map((column, index) => (
                    <div key={index} className="column-item">
                      <span className="column-name">{column.name}</span>
                      <span className="column-type">{column.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="content">
          <div className="sql-editor-section">
            <div className="editor-header">
              <h3>SQL 查询</h3>
            </div>
            <div className="editor-container">
              <Editor
                value={sqlQuery}
                onValueChange={setSqlQuery}
                highlight={highlightSQL}
                padding={16}
                className="code-editor"
                placeholder="输入 SQL 查询..."
                disabled={!db}
              />
            </div>
          </div>

          <div className="message-section">
            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                {error}
              </div>
            )}
            {message && (
              <div className="info-message">
                <span className="info-icon">ℹ️</span>
                {message}
              </div>
            )}
          </div>

          <div className="results-section">
            <div className="results-header">
              <h3>查询结果</h3>
              {queryResults.length > 0 && (
                <span className="results-count">
                  {queryResults.length} 条记录
                </span>
              )}
            </div>
            <div className="ag-theme-alpine results-table">
              <AgGridReact
                rowData={queryResults}
                columnDefs={columnDefs}
                defaultColDef={{
                  flex: 1,
                  minWidth: 100,
                }}
                pagination={true}
                paginationPageSize={20}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
