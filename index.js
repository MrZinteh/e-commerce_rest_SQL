const express = require('express');
const db = require('./db');
const app = express();
const port = 3000;

let auth = [{userName: 'admin', password: 'admin'}];
let is_authorized = true;

let db_response;
db.query('SELECT * FROM user_account', (err, res) => {
  db_response = res;
});

app.get('/', (req, res) => {
  res.send(db_response);
});

app.post('/login', (req, res, next) => {
  const userName = req.query.username;
  const password = req.query.password;
  let i;
  let exists = false;
  let authorized = false;
  for(i=0;i<auth.length;i++) {
    if (auth[i].userName === userName) {
      exists = true;
      if (auth[i].password === password) {
        authorized = true;
        is_authorized = true;
      }
    }
  }
  if (authorized) {
    res.status(200).send('Logged in!');
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.post('/register', (req, res, next) => {
  const userName = req.query.username;
  const password = req.query.password;
  const newUser = {userName: userName, password: password};
  let i;
  let exists = false;
  for(i=0;i<auth.length;i++) {
    if (auth[i].userName === userName) {
      exists = true;
    }
  }
  if (exists === false) {
    auth.push(newUser);
    res.status(200).send();
  }
  else {
    console.log('User already exists');
    res.status(403).send('User already exists');
  }
});

app.post('/api/products', (req, res, next) => {
  // Create product
  const price = req.query.price;
  const name = req.query.name;
  if (is_authorized) {
    db.query('INSERT INTO product (productprice, productname) VALUES($1, $2)', [price, name], (err, resp) => {
      if (err) {
        res.status(403).send(err);
      } else {
        res.status(200).send(resp);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.get('/api/products', (req, res, next) => {
  // Read all products
  if (is_authorized) {
    db.query('SELECT productname as name, productprice as price FROM product', (err, resp) => {
      if (err) {
        res.status(403).send(err);
      }
      else {
        res.status(200).send(resp.rows);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.get('/api/products/:productName', (req, res, next) => {
  // Read product by name
  if (is_authorized) {
    db.query('SELECT productname as name, productprice as price FROM product WHERE productname=$1', [req.params.productName], (err, resp) => {
      if (err) {
        res.status(403).send(err);
      }
      else {
        res.status(200).send(resp.rows);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.put('/api/products/:productName', (req, res, next) => {
  // Update product
  if (is_authorized) {
    if (req.query.price) {
      db.query('UPDATE product SET productprice = $1 WHERE productname = $2', [req.query.price, req.params.productName], (err, resp) => {
        if (err) {
          res.status(403).send(err);
        }
        else {
          res.status(200).send(resp);
        }
      });
    }
    else {
      res.status(400).send("Please include price in request.");
    }
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.delete('/api/products/:productName', (req, res, next) => {
  // Delete product
  if (is_authorized) {
    db.query('DELETE FROM product WHERE productname = $1', [req.params.productName], (err, resp) => {
      if (err) {
        res.status(403).send(err);
      }
      else {
        res.status(200).send(resp);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.post('/api/user_accounts', (req, res, next) => {
  // Create user accounts
  if (is_authorized) {
    const userName = req.query.username;
    const userZip = req.query.userzip;
    db.query('INSERT INTO user_account (username, userzip) VALUES($1, $2)', [userName, userZip], (err, resp) => {
      if (err) {
        if (err.constraint) {
          if (err.constraint === 'unique_name') {
            res.status(403).send('User already exists');
          }
        }
      } else {
        res.status(200).send(resp);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.get('/api/user_accounts', (req, res, next) => {
  // Read user accounts
  if (is_authorized) {
    db.query('SELECT username as name, userzip as zip FROM user_account', (err, resp) => {
      if (err) {
        res.status(403).send(err);
      }
      else {
        res.status(200).send(resp.rows);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.get('/api/user_accounts/:userId', (req, res, next) => {
  // Read user accounts
  if (is_authorized) {
    db.query('SELECT username as name, userzip as zip FROM user_account WHERE userid = $1', [req.params.userId], (err, resp) => {
      if (err) {
        res.status(403).send(err);
      }
      else {
        res.status(200).send(resp.rows);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.put('/api/user_accounts/:userId', (req, res, next) => {
  // Update user accounts
  if (is_authorized) {
    if (req.query.name) {
      db.query('UPDATE user_account SET username = $1 WHERE userid = $2', [req.query.name, req.params.userId], (err, resp) => {
        if (err) {
          res.status(403).send(err);
        }
        else {
          res.status(200).send(resp);
        }
      });
    }
    else if (req.query.zip) {
      db.query('UPDATE user_account SET userzip = $1 WHERE userid = $2', [req.query.zip, req.params.userId], (err, resp) => {
        if (err) {
          res.status(403).send(err);
        }
        else {
          res.status(200).send(resp);
        }
      });
    }
    else {
      res.status(400).send("Please include something in request.");
    }
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.delete('/api/user_accounts/:userId', (req, res, next) => {
  // Delete user accounts
  if (is_authorized) {
    db.query('DELETE FROM user_accounts WHERE username = $1', [req.params.userId], (err, resp) => {
      if (err) {
        res.status(403).send(err);
      }
      else {
        res.status(200).send(resp);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.post('/api/user_carts', (req, res, next) => {
  // Create user carts
  if (is_authorized) {
    if (req.query.productId && req.query.userId)
      db.query('INSERT INTO user_cart (productid, userid) VALUES($1, $2)', [req.query.productId, req.query.userId], (err, resp) => {
        if (err) {
          res.status(403).send(err);
        } else {
          res.status(200).send(resp);
        }
      });
    else {
      res.status(400).send("Please include something in request.");
    }
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.post('/api/user_carts/:cartId', (req, res, next) => {
  // Create user carts
  if (is_authorized) {
    if (req.query.productId && req.query.userId)
      db.query('INSERT INTO user_cart (cartid, productid, userid) VALUES($1, $2, $3)', [req.params.cartId, req.query.productId, req.query.userId], (err, resp) => {
        if (err) {
          res.status(403).send(err);
        } else {
          res.status(200).send(resp);
        }
      });
    else {
      res.status(400).send("Please include something in request.");
    }
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.get('/api/user_carts/:cartId', (req, res, next) => {
  // Read user carts
  if (is_authorized) {
    db.query('SELECT cartid as id, productid, userid FROM user_cart WHERE cartid = $1', [req.params.cartId], (err, resp) => {
      if (err) {
        res.status(403).send(err);
      }
      else {
        res.status(200).send(resp.rows);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.delete('/api/user_carts/:cartId', (req, res, next) => {
  // Delete user carts
  if (is_authorized) {
    db.query('DELETE FROM user_cart WHERE cartid = $1', [req.params.cartId], (err, resp) => {
      if (err) {
        res.status(403).send(err);
      }
      else {
        res.status(200).send(resp);
      }
    });
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.post('/api/orders', (req, res, next) => {
  // Create orders
  if (is_authorized) {
    
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.get('/api/orders', (req, res, next) => {
  // Read orders
  if (is_authorized) {
    
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.put('/api/orders', (req, res, next) => {
  // Update orders
  if (is_authorized) {
    
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.delete('/api/orders', (req, res, next) => {
  // Delete orders
  if (is_authorized) {
    
  }
  else {
    res.status(401).send('Unauthorized');  
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});