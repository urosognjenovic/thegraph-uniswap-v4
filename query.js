const graphClient = require("./.graphclient");

const queryTop5PoolsByTotalUSDLocked = `
  query {
    pools(first: 5, orderBy: totalValueLockedUSD, orderDirection: desc) {
      id
      token0 {
        name
        symbol
      }
      token1 {
        name
        symbol
      }
      totalValueLockedUSD
    }
  }
`;

const queryTop3ETHUSDCPoolByTotalUSDLocked = `
  query {
    pools(
      first: 3, 
      where: {
        token0: "0x0000000000000000000000000000000000000000",
        token1: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
      }, 
      orderBy: totalValueLockedUSD,
      orderDirection: desc
      ) {
      token0 {
        id,
        name,
        symbol
      }
      token1 {
        id,
        name,
        symbol
      }
      totalValueLockedUSD
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }
`;

async function getQueryData() {
  const result = await graphClient.execute(
    queryTop3ETHUSDCPoolByTotalUSDLocked,
    {}
  );
  console.log(result["data"]["pools"]);
}

getQueryData();
