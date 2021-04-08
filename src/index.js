import {makeAugmentedSchema} from "neo4j-graphql-js";
import neo4j from 'neo4j-driver';
import {ApolloServer} from "apollo-server";

const typeDefs = `
type Organization {
    name: String
    address: Address @relation(name: "HASADDRESS", direction: OUT)
    loans: [Loan] @relation(name:"HASLOAN", direction: OUT)
    rm: Person @relation(name: "MANAGEDBY", direction: OUT)
    currencyLimits: [HasCurrencyLimit]
    clg: CustomerLendingGroup @relation(name: "ISMEMBEROF", direction: OUT)
    persons: [Person] @relation(name:"HOLDSPOSITIONIN", direction: IN)
}

type Address {
    address: String
    city: String
    country: String
    lat: Float
    long: Float
}

type Loan {
    name: String
    baseAmt: Float
    amount: Float
    currency: Currency @relation(name:"ISINCURRENCY", direction: OUT)
    product: LoanProduct @relation(name:"ISOFPRODUCT", direction: OUT)
    industry: Industry @relation(name:"ASSIGNEDTOINDUSTRY", direction: OUT)
    org: Organization @relation(name:"HASLOAN", direction: IN)
}

type Person {
    name: String
    firstName: String
    lastName: String
}

type Currency {
    name: String,
    loans: [Loan] @relation(name:"ISINCURRENCY", direction: IN)
}
type HasCurrencyLimit @relation(name: "HASCURRENCYLIMIT") {
    from: Organization
    to: Currency
    value: Float
 }
 
 type LoanProduct {
    name: String
    loans: Loan @relation(name:"ISOFPRODUCT", direction: IN)
}

type Industry {
    name: String
    industryGroup: IndustryGroup @relation(name:"HASINDUSTRY", direction: IN)
    children: [Loan]  @relation(name:"ASSIGNEDTOINDUSTRY", direction: IN)
}

type IndustryGroup {
    name: String
    sector: Sector @relation(name:"HASINDUSTRYGROUP", direction: IN)
    children: [Industry] @relation(name:"HASINDUSTRY", direction: OUT)
}

type Sector {
    name: String
    children: [IndustryGroup] @relation(name:"HASINDUSTRYGROUP", direction: OUT)
}

type CustomerLendingGroup {
    name: String
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


// type Loan {
//   durationInMonths: Float
//   baseAmt: Float
//   startDate: String
// }
