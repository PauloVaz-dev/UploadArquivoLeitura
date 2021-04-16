import express from 'express';
import multer from 'multer';
import fs from 'fs';
import csvParse from 'csv-parser';

const upload = multer({
  dest: './tmp',
});

const app = express();

interface Upload {
  name: string;
  description: string;
}

function loadCategories(file: Express.Multer.File): Promise<Upload[]> {
  return new Promise((resolver, reject) => {
    const stream = fs.createReadStream(file.path);

    const parseFile = csvParse();

    stream.pipe(parseFile);

    const categories: Upload[] = [];

    parseFile
      .on('data', async line => {
        console.log(line);
        const { name, description } = line;
        categories.push({ description, name });
      })
      .on('end', () => {
        resolver(categories);
      })
      .on('error', err => {
        reject(err);
      });
  });
}

app.post('/uploadCSV', upload.single('file'), async (request, response) => {
  const { file } = request;
  const categories = await loadCategories(file);
  response.send(categories);
});

app.post('/upload', upload.single('file'), async (request, response) => {
  const { file } = request;
  response.send(file);
});

app.listen(3000, () => {
  console.log('🏃 Running Server');
});
