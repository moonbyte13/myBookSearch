const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');

const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

server.start().then(() => {
  server.applyMiddleware({ app });
  
  app.listen(PORT, () => {
    console.log(`🌍 API server on localhost:${PORT}! 🚀`);
    console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    db.once('open', () => {
      console.log('MongoDB database connection established successfully');
    });
  });
});