import {makeAugmentedSchema} from "neo4j-graphql-js";
import neo4j from 'neo4j-driver';
import {ApolloServer} from "apollo-server";

const typeDefs = `
type Organization {
    hasPermId: String
    headquartersAddress: String
}
`;

const schema = makeAugmentedSchema({ typeDefs });
const driver = neo4j.driver(
  'bolt://localhost:7687'
);

const server = new ApolloServer({
  schema: schema,
  // inject the request object into the context to support middleware
  // inject the Neo4j driver instance to handle database call
  context: ({ req }) => {
    return {
      driver,
      req
    };
  }
});

server
  .listen(process.env.GRAPHQL_LISTEN_PORT || 3000, '0.0.0.0')
  .then(({ url }) => {
    console.log(`GraphQL API ready at ${url}`);
  });
