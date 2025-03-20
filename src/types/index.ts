export type CryptoCurrency = "BTC" | "DOGE";
export type FiatCurrency = "USD" | "RUB";

export interface MiningParams {
  cryptoCurrency: CryptoCurrency;
  fiatCurrency: FiatCurrency;
  networkDifficulty: number;
  hashRate: number;
  blockReward: number;
  poolFee: number;
  farmCost: number;
  powerConsumption: number;
  electricityRate: number;
  miningPeriod: number;
  includeDepreciation: boolean;
  depreciationRate: number;
  startDate: Date;
  difficultyChangePerMonth: number;
  priceChangePerMonth: number;
}

export interface MiningResult {
  hourlyReward: number;
  dailyReward: number;
  monthlyReward: number;
  yearlyReward: number;
  hourlyCost: number;
  dailyCost: number;
  monthlyCost: number;
  yearlyCost: number;
  hourlyProfit: number;
  dailyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
  roi: number;
  breakEvenDays: number;
  hourlyRewardFiat: number;
  dailyRewardFiat: number;
  monthlyRewardFiat: number;
  yearlyRewardFiat: number;
  monthlyProfitForecast: MonthlyForecast[];
}

export interface MonthlyForecast {
  month: string;
  difficulty: number;
  difficultyChange: number;
  rewardCrypto: number;
  rewardFiat: number;
  roi: number;
}


export interface CryptoRates {
  [key: string]: {
    USD: number;
    RUB: number;
  };
}

export interface NetworkInfo {
  [key: string]: {
    difficulty: number;
    blockReward: number;
  };
}
