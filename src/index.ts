import server from './server';

declare global {
  interface Error {
    status?: number;
  }
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Listen on port ${PORT}`);
});
