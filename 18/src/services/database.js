let SQL = null

async function getSQL() {
  if (!SQL) {
    const initSqlJs = window.initSqlJs
    if (!initSqlJs) {
      throw new Error('sql.js 未加载，请确保 CDN 脚本已正确引入')
    }
    SQL = await initSqlJs({
      locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.9.0/${file}`
    })
  }
  return SQL
}

const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  registration_date DATE,
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT,
  price REAL NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  description TEXT,
  created_at DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  order_date DATE NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
`

function generateRandomDate(startYear = 2020, endYear = 2024) {
  const start = new Date(startYear, 0, 1)
  const end = new Date(endYear, 11, 31)
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return randomDate.toISOString().split('T')[0]
}

function generateRandomName() {
  const firstNames = ['张伟', '王芳', '李娜', '刘洋', '陈静', '杨阳', '赵敏', '黄磊', '周杰', '吴秀波', '郑爽', '孙俪', '马云', '马化腾', '雷军', '董明珠', '王健林', '许家印', '李书福', '魏建军']
  const lastNames = ['张', '王', '李', '刘', '陈', '杨', '赵', '黄', '周', '吴', '郑', '孙', '马', '朱', '胡', '林', '郭', '何', '高', '罗']
  return lastNames[Math.floor(Math.random() * lastNames.length)] + firstNames[Math.floor(Math.random() * firstNames.length)]
}

function generateRandomEmail(name) {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'qq.com', '163.com', 'hotmail.com']
  const cleanName = name.replace(/\s+/g, '.').toLowerCase()
  const randomNum = Math.floor(Math.random() * 1000)
  return `${cleanName}${randomNum}@${domains[Math.floor(Math.random() * domains.length)]}`
}

function generateRandomPhone() {
  const prefixes = ['138', '139', '136', '137', '135', '134', '159', '158', '157', '150', '151', '152', '188', '187', '186', '185', '183', '182', '181', '180']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  return prefix + suffix
}

function generateRandomAddress() {
  const streets = ['中山路', '解放路', '人民路', '建设路', '文化路', '科技路', '和平路', '友谊路', '长安街', '南京路', '北京路', '上海路', '广州路', '深圳路', '杭州路']
  const numbers = ['1号', '28号', '56号', '89号', '123号', '256号', '345号', '567号', '789号', '999号']
  return streets[Math.floor(Math.random() * streets.length)] + numbers[Math.floor(Math.random() * numbers.length)]
}

function generateRandomCity() {
  const cities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '重庆', '天津', '苏州', '郑州', '长沙', '东莞']
  return cities[Math.floor(Math.random() * cities.length)]
}

function generateRandomProductName() {
  const products = [
    'iPhone 15 Pro', 'MacBook Pro 14寸', 'iPad Air', 'AirPods Pro',
    '华为 Mate 60', '小米 14', '三星 Galaxy S24', 'OPPO Find X7',
    '联想 ThinkPad', '戴尔 XPS', '惠普暗影精灵', '华硕天选',
    '索尼 PlayStation 5', '任天堂 Switch', 'Xbox Series X',
    '戴森吸尘器', '美的空调', '海尔冰箱', '格力电风扇',
    '小米电视', '华为智慧屏', '索尼电视', '三星电视',
    '罗技鼠标', '机械键盘', '电竞显示器', '游戏手柄',
    '智能手表', '运动手环', '无线耳机', '蓝牙音箱',
    '平板电脑', '电子书阅读器', '便携投影仪', '智能音箱'
  ]
  return products[Math.floor(Math.random() * products.length)]
}

function generateRandomCategory() {
  const categories = ['电子产品', '手机', '电脑', '配件', '家电', '数码', '游戏', '智能家居', '办公设备', '音频设备']
  return categories[Math.floor(Math.random() * categories.length)]
}

function generateRandomStatus() {
  const statuses = ['active', 'inactive', 'pending', 'suspended']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

function generateRandomOrderStatus() {
  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

export async function initDatabase() {
  const SQL = await getSQL()
  const db = new SQL.Database()
  
  db.run(CREATE_TABLES_SQL)
  
  const insertCustomerStmt = db.prepare(`
    INSERT INTO customers (name, email, phone, address, city, country, registration_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  const customers = []
  for (let i = 0; i < 500; i++) {
    const name = generateRandomName()
    const customer = {
      id: i + 1,
      name,
      email: generateRandomEmail(name),
      phone: generateRandomPhone(),
      address: generateRandomAddress(),
      city: generateRandomCity(),
      country: '中国',
      registration_date: generateRandomDate(),
      status: generateRandomStatus()
    }
    customers.push(customer)
    
    insertCustomerStmt.run([
      customer.name,
      customer.email,
      customer.phone,
      customer.address,
      customer.city,
      customer.country,
      customer.registration_date,
      customer.status
    ])
  }
  insertCustomerStmt.free()
  
  const insertProductStmt = db.prepare(`
    INSERT INTO products (name, category, price, stock_quantity, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  const products = []
  for (let i = 0; i < 100; i++) {
    const product = {
      id: i + 1,
      name: generateRandomProductName(),
      category: generateRandomCategory(),
      price: Math.round((Math.random() * 10000 + 100) * 100) / 100,
      stock_quantity: Math.floor(Math.random() * 500) + 10,
      description: `这是一款高品质的${generateRandomCategory()}产品，性能卓越，质量可靠。`,
      created_at: generateRandomDate()
    }
    products.push(product)
    
    insertProductStmt.run([
      product.name,
      product.category,
      product.price,
      product.stock_quantity,
      product.description,
      product.created_at
    ])
  }
  insertProductStmt.free()
  
  const insertOrderStmt = db.prepare(`
    INSERT INTO orders (customer_id, product_id, order_date, quantity, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  for (let i = 0; i < 400; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const product = products[Math.floor(Math.random() * products.length)]
    const quantity = Math.floor(Math.random() * 10) + 1
    const totalAmount = Math.round(product.price * quantity * 100) / 100
    
    insertOrderStmt.run([
      customer.id,
      product.id,
      generateRandomDate(),
      quantity,
      totalAmount,
      generateRandomOrderStatus()
    ])
  }
  insertOrderStmt.free()
  
  return db
}

export function executeQuery(db, sql) {
  const results = []
  const execResult = db.exec(sql)
  
  if (execResult.length > 0) {
    const columns = execResult[0].columns
    const values = execResult[0].values
    
    values.forEach(row => {
      const obj = {}
      columns.forEach((col, index) => {
        obj[col] = row[index]
      })
      results.push(obj)
    })
  }
  
  return results
}

export function getTableSchema(db, tableName) {
  const sql = `PRAGMA table_info(${tableName})`
  const results = executeQuery(db, sql)
  return results.map(col => ({
    name: col.name,
    type: col.type,
    notNull: col.notnull === 1,
    defaultValue: col.dflt_value,
    primaryKey: col.pk === 1
  }))
}

export function exportToCSV(data) {
  if (!data || data.length === 0) {
    return ''
  }
  
  const headers = Object.keys(data[0])
  const headerRow = headers.map(h => `"${h}"`).join(',')
  
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      if (value === null || value === undefined) {
        return ''
      }
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })
  
  return [headerRow, ...dataRows].join('\n')
}
