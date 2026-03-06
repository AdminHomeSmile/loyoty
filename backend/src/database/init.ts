import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const DATABASE_PATH = process.env.DATABASE_PATH || './data/loyalty.db';

let db: sqlite3.Database;

export const getDatabase = (): sqlite3.Database => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const initDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Ensure data directory exists
    const dir = path.dirname(DATABASE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new sqlite3.Database(DATABASE_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }

      console.log('Connected to SQLite database');

      // Create tables
      db.serialize(() => {
        // Products table
        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT,
            price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Customers table
        db.run(`
          CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            segment TEXT DEFAULT 'regular',
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_purchase_at DATETIME
          )
        `);

        // Transactions table
        db.run(`
          CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            product_id INTEGER,
            amount REAL NOT NULL,
            quantity INTEGER DEFAULT 1,
            points_earned INTEGER DEFAULT 0,
            transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
          )
        `);

        // Rewards table
        db.run(`
          CREATE TABLE IF NOT EXISTS rewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            points_issued INTEGER DEFAULT 0,
            points_redeemed INTEGER DEFAULT 0,
            balance INTEGER DEFAULT 0,
            action_type TEXT,
            transaction_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (transaction_id) REFERENCES transactions(id)
          )
        `);

        
        // Technicians table
        db.run(`
          CREATE TABLE IF NOT EXISTS technicians (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            area TEXT NOT NULL,
            skill_level TEXT DEFAULT 'junior',
            points_balance INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Missions table
        db.run(`
          CREATE TABLE IF NOT EXISTS missions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            points_reward INTEGER NOT NULL,
            frequency TEXT DEFAULT 'daily',
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Mission completions
        db.run(`
          CREATE TABLE IF NOT EXISTS technician_missions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            technician_id INTEGER NOT NULL,
            mission_id INTEGER NOT NULL,
            points_earned INTEGER NOT NULL,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (technician_id) REFERENCES technicians(id),
            FOREIGN KEY (mission_id) REFERENCES missions(id)
          )
        `);

        // Reward catalog
        db.run(`
          CREATE TABLE IF NOT EXISTS reward_catalog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            points_cost INTEGER NOT NULL,
            stock INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Reward redemptions
        db.run(`
          CREATE TABLE IF NOT EXISTS reward_redemptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            technician_id INTEGER NOT NULL,
            reward_id INTEGER NOT NULL,
            points_spent INTEGER NOT NULL,
            redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (technician_id) REFERENCES technicians(id),
            FOREIGN KEY (reward_id) REFERENCES reward_catalog(id)
          )
        `);

        // Insert sample data if tables are empty
        db.get('SELECT COUNT(*) as count FROM products', (err, row: any) => {
          if (!err && row.count === 0) {
            insertSampleData(db);
          }
        });

        db.get('SELECT COUNT(*) as count FROM missions', (err, row: any) => {
          if (!err && row.count === 0) {
            insertTechnicianRewardsSeedData(db);
          }
        });

        resolve();
      });
    });
  });
};

const insertSampleData = (database: sqlite3.Database) => {
  console.log('Inserting sample data...');

  // Sample products
  const products = [
    { name: 'Waterproof Sealant Pro', category: 'Sealants', price: 29.99 },
    { name: 'Premium Coating Spray', category: 'Coatings', price: 39.99 },
    { name: 'Multi-Surface Protector', category: 'Protectors', price: 24.99 },
    { name: 'Heavy Duty Sealant', category: 'Sealants', price: 34.99 },
    { name: 'Eco-Friendly Waterproofing', category: 'Sealants', price: 44.99 },
  ];

  const productStmt = database.prepare(
    'INSERT INTO products (name, category, price) VALUES (?, ?, ?)'
  );
  products.forEach((p) => productStmt.run(p.name, p.category, p.price));
  productStmt.finalize();

  // Sample customers
  const customers = [
    { name: 'John Doe', email: 'john@example.com', phone: '555-0001', segment: 'premium' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '555-0002', segment: 'regular' },
    { name: 'Bob Johnson', email: 'bob@example.com', phone: '555-0003', segment: 'vip' },
    { name: 'Alice Williams', email: 'alice@example.com', phone: '555-0004', segment: 'regular' },
    { name: 'Charlie Brown', email: 'charlie@example.com', phone: '555-0005', segment: 'premium' },
  ];

  const customerStmt = database.prepare(
    'INSERT INTO customers (name, email, phone, segment, last_purchase_at) VALUES (?, ?, ?, ?, datetime("now", "-" || ? || " days"))'
  );
  customers.forEach((c, i) => {
    const daysSinceLastPurchase = Math.floor(Math.random() * 30);
    customerStmt.run(c.name, c.email, c.phone, c.segment, daysSinceLastPurchase);
  });
  customerStmt.finalize();

  // Sample transactions
  const transactionStmt = database.prepare(
    'INSERT INTO transactions (customer_id, product_id, amount, quantity, points_earned, transaction_date) VALUES (?, ?, ?, ?, ?, datetime("now", "-" || ? || " days"))'
  );

  for (let i = 0; i < 50; i++) {
    const customerId = Math.floor(Math.random() * customers.length) + 1;
    const productId = Math.floor(Math.random() * products.length) + 1;
    const quantity = Math.floor(Math.random() * 3) + 1;
    const amount = products[productId - 1].price * quantity;
    const points = Math.floor(amount);
    const daysAgo = Math.floor(Math.random() * 90);

    transactionStmt.run(customerId, productId, amount, quantity, points, daysAgo);
  }
  transactionStmt.finalize();

  // Sample rewards
  database.all('SELECT id, customer_id, points_earned FROM transactions', (err, transactions: any[]) => {
    if (!err && transactions) {
      const rewardStmt = database.prepare(
        'INSERT INTO rewards (customer_id, points_issued, points_redeemed, balance, action_type, transaction_id, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now", "-" || ? || " days"))'
      );

      transactions.forEach((t, i) => {
        const daysAgo = Math.floor(Math.random() * 90);
        rewardStmt.run(t.customer_id, t.points_earned, 0, t.points_earned, 'earned', t.id, daysAgo);
      });
      rewardStmt.finalize();

      // Add some redemptions
      for (let i = 0; i < 10; i++) {
        const customerId = Math.floor(Math.random() * customers.length) + 1;
        const pointsRedeemed = Math.floor(Math.random() * 50) + 10;
        const daysAgo = Math.floor(Math.random() * 60);

        database.run(
          'INSERT INTO rewards (customer_id, points_issued, points_redeemed, balance, action_type, created_at) VALUES (?, ?, ?, ?, ?, datetime("now", "-" || ? || " days"))',
          [customerId, 0, pointsRedeemed, -pointsRedeemed, 'redeemed', daysAgo]
        );
      }
    }
  });

  console.log('Sample data inserted successfully');
};


const insertTechnicianRewardsSeedData = (database: sqlite3.Database) => {
  console.log('Inserting technician rewards seed data...');

  const missions = [
    {
      title: 'ปิดงานติดตั้งครบ 1 งาน',
      description: 'อัปเดตสถานะงานติดตั้งพร้อมรูปหน้างาน',
      points: 40,
      frequency: 'daily',
    },
    {
      title: 'เช็คอินหน้างานตรงเวลา',
      description: 'เช็คอินก่อนเวลานัดอย่างน้อย 10 นาที',
      points: 25,
      frequency: 'daily',
    },
    {
      title: 'ผ่านอบรมสินค้าใหม่',
      description: 'ทำแบบทดสอบจบและผ่านเกณฑ์ 80%',
      points: 150,
      frequency: 'once',
    },
  ];

  const rewards = [
    { itemName: 'เสื้อช่าง Limited Edition', pointsCost: 200, stock: 20 },
    { itemName: 'บัตรเติมน้ำมัน 300 บาท', pointsCost: 350, stock: 15 },
    { itemName: 'เครื่องมือช่างพรีเมียม', pointsCost: 600, stock: 10 },
  ];

  const missionStmt = database.prepare(
    'INSERT INTO missions (title, description, points_reward, frequency) VALUES (?, ?, ?, ?)'
  );
  missions.forEach((mission) => {
    missionStmt.run(mission.title, mission.description, mission.points, mission.frequency);
  });
  missionStmt.finalize();

  const rewardStmt = database.prepare(
    'INSERT INTO reward_catalog (item_name, points_cost, stock) VALUES (?, ?, ?)'
  );
  rewards.forEach((reward) => {
    rewardStmt.run(reward.itemName, reward.pointsCost, reward.stock);
  });
  rewardStmt.finalize();
};

export const runQuery = (sql: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    getDatabase().all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const runQuerySingle = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    getDatabase().get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};


export const runExecute = (
  sql: string,
  params: any[] = []
): Promise<{ lastID: number; changes: number }> => {
  return new Promise((resolve, reject) => {
    getDatabase().run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};
