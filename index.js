import express from 'express';
import fs from 'fs';

const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => res.send(process.env.MY_VAR));

app.get('/sync-error', (req, res) => {
  throw new Error('BROKEN');
});

app.get('/async-error', (req, res, next) => {
  fs.readFile('/file-does-not-exist', (err, data) => {
    if (err) {
      next(err); // Pass errors to Express.
    } else {
      res.send(data);
    }
  });
});

app.get('/try-catch', (req, res, next) => {
  setTimeout(() => {
    try {
      throw new Error('BROKEN');
    } catch (err) {
      next(err);
    }
  }, 0);
});

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

app.get(
  '/promises',
  asyncHandler(async () => {
    throw Error('BROKEN but async');
  })
);

//  Starting Express v5

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
