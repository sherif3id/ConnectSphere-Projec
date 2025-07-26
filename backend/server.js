const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1122',
  database: 'connectsphere_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/users', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/users.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please complete all fields' });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (results.length > 0) {
      return res.status(400).json({ error: 'This email is already registered' });
    }

    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], (err) => {
      if (err) {
        console.error('Error adding user:', err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.status(200).json({ message: 'Account created successfully!' });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const user = results[0];
    res.status(200).json({ message: 'Login successful!', user: { id: user.id, name: user.name, email: user.email } });
  });
});

app.get('/api/users', (req, res) => {
  db.query('SELECT id, name, email FROM users', (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to load users' });
    }
    res.json(results);
  });
});

app.delete('/api/deleteUser/:id', (req, res) => {
  const userId = parseInt(req.params.id);

  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
});

app.delete('/api/clearUsers', (req, res) => {
  db.query('TRUNCATE TABLE users', (err) => {
    if (err) {
      console.error('Error clearing users:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.status(200).json({ message: 'All users cleared successfully' });
  });
});

app.use((req, res) => {
  res.status(404).send('Sorry, this page does not exist');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});