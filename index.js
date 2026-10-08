const mongoose = require('mongoose');
const createApp = require('./src/app');

async function startServer() {
  const port = process.env.PORT || 3000;

  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error('Confira as variáveis MONGODB_URI e JWT_SECRET no arquivo .env.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const { app } = await createApp();

  app.listen(port, () => {
    console.log(`Aplicação disponível em http://localhost:${port}`);
    console.log(`GraphQL disponível em http://localhost:${port}/graphql`);
  });
}

startServer().catch((error) => console.log(error.message));
