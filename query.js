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
        token0: "0x0000000000000000000000000000000000000000"
      }, 
      orderBy: totalValueLockedUSD,
      orderDirection: desc
      ) {
      token0 {
        name,
        symbol
      }
      token1 {
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
