import http from 'http';
import { parse } from 'url';

let students = []; 
let nextId = 1;    

const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  if (method === 'GET' && path === '/students') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(students));

  } else if (method === 'POST' && path === '/students') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.name) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }
        const newStudent = { id: nextId++, name: data.name };
        students.push(newStudent);
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(newStudent));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

  } else if (method === 'PUT' && path.startsWith('/students/')) {
    const id = parseInt(path.split('/')[2]);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const student = students.find(s => s.id === id);
        if (!student) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Student not found' }));
          return;
        }
        student.name = data.name || student.name;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(student));
      } catch {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });

  } else if (method === 'DELETE' && path.startsWith('/students/')) {
    const id = parseInt(path.split('/')[2]);
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Student not found' }));
    } else {
      students.splice(index, 1);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ message: `Student ${id} deleted` }));
    }

  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(4000, () => {
  console.log('Student REST API server running on http://localhost:4000');
});
