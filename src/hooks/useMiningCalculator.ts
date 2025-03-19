import { useState, useEffect } from "react";
import {
  MiningParams,
  MiningResult,
  MonthlyForecast,
  BlockTimeEstimate,
} from "../types";
import { fetchCryptoRates, fetchNetworkInfo } from "../api/cryptoApi";

export const useMiningCalculator = () => {
  const [params, setParams] = useState<MiningParams | null>(null);
  const [results, setResults] = useState<MiningResult | null>(null);
  const [blockTimeEstimates, setBlockTimeEstimates] = useState<
    BlockTimeEstimate[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateMining = async () => {
      if (!params) return;

      try {
        setLoading(true);
        setError(null);

        // Получаем актуальные курсы и информацию о сети
        const rates = await fetchCryptoRates();
        const networkInfo = await fetchNetworkInfo();
        // Получаем курс выбранной криптовалюты в выбранной фиатной валюте
        const cryptoRate = rates[params.cryptoCurrency][params.fiatCurrency];

        // Расчет вознаграждения в криптовалюте (в час)
        const hourlyRewardCrypto = calculateHourlyReward(
          params.hashRate,
          networkInfo[params.cryptoCurrency].difficulty,
          networkInfo[params.cryptoCurrency].blockReward,
          params.poolFee
        );

        // Расчет вознаграждения в фиатной валюте
        const hourlyRewardFiat = hourlyRewardCrypto * cryptoRate;
        const dailyRewardFiat = hourlyRewardFiat * 24;
        const monthlyRewardFiat = dailyRewardFiat * 30;
        const yearlyRewardFiat = monthlyRewardFiat * 12;

        // Расчет затрат
        const hourlyElectricityCost =
          (params.powerConsumption / 1000) * params.electricityRate;

        const dailyElectricityCost = hourlyElectricityCost * 24;
        const monthlyElectricityCost = dailyElectricityCost * 30;
        const yearlyElectricityCost = monthlyElectricityCost * 12;

        // Расчет прибыли
        const hourlyProfit = hourlyRewardFiat - hourlyElectricityCost;
        const dailyProfit = dailyRewardFiat - dailyElectricityCost;
        const monthlyProfit = monthlyRewardFiat - monthlyElectricityCost;
        const yearlyProfit = yearlyRewardFiat - yearlyElectricityCost;
        // console.log(monthlyElectricityCost);
        // Расчет ROI (в процентах)
        let roi = 0;
        if (monthlyProfit > 0) {
          // Годовой ROI в процентах
          roi = ((monthlyProfit * 12) / params.farmCost) * 100;
        } else if (monthlyProfit < 0) {
          // Если прибыль отрицательная, ROI отрицательный
          roi = ((monthlyProfit * 12) / params.farmCost) * 100;
        }

        // Расчет времени окупаемости (в днях)
        let breakEvenDays = 0;
        if (dailyProfit > 0) {
          breakEvenDays = params.farmCost / dailyProfit;
        } else {
          // Если прибыль отрицательная или нулевая, окупаемости нет
          breakEvenDays = Infinity; // или можно использовать -1 как маркер невозможности окупаемости
        }

        // Прогноз по месяцам
        const monthlyForecast = calculateMonthlyForecast(
          params,
          networkInfo[params.cryptoCurrency].difficulty,
          cryptoRate,
          hourlyElectricityCost * 24 * 30
        );

        // Расчет вероятности нахождения блока
        const blockTimeEstimates = calculateBlockTimeEstimates(
          params.hashRate,
          networkInfo[params.cryptoCurrency].difficulty
        );

        setBlockTimeEstimates(blockTimeEstimates);

        setResults({
          hourlyReward: hourlyRewardCrypto,
          dailyReward: hourlyRewardCrypto * 24,
          monthlyReward: hourlyRewardCrypto * 24 * 30,
          yearlyReward: hourlyRewardCrypto * 24 * 365,
          hourlyCost: hourlyElectricityCost,
          dailyCost: dailyElectricityCost,
          monthlyCost: monthlyElectricityCost,
          yearlyCost: yearlyElectricityCost,
          hourlyProfit,
          dailyProfit,
          monthlyProfit,
          yearlyProfit,
          hourlyRewardFiat,
          dailyRewardFiat,
          monthlyRewardFiat,
          yearlyRewardFiat,
          roi,
          breakEvenDays,
          monthlyProfitForecast: monthlyForecast,
        });

        setLoading(false);
      } catch (err) {
        console.error("Ошибка при расчете майнинга:", err);
        setError("Произошла ошибка при расчете. Пожалуйста, попробуйте позже.");
        setLoading(false);
      }
    };

    calculateMining();
  }, [params]);

  return { params, results, blockTimeEstimates, loading, error, setParams };
};

export default useMiningCalculator;

// Расчет вознаграждения в час
const calculateHourlyReward = (
  hashRate: number, // TH/s
  difficulty: number,
  blockReward: number,
  poolFee: number
): number => {
  const second = 3600;
  const reward =
    ((hashRate * Math.pow(10, 12) * second * blockReward) /
      (difficulty * Math.pow(2, 32))) *
    (1 - poolFee / 100);

  return reward;
};

// Расчет прогноза по месяцам
const calculateMonthlyForecast = (
  params: MiningParams,
  initialDifficulty: number,
  initialRate: number,
  monthlyCost: number
): MonthlyForecast[] => {
  const forecast: MonthlyForecast[] = [];
  let currentDifficulty = initialDifficulty;
  let currentRate = initialRate;
  let cumulativeInvestment = params.farmCost;

  const startDate = new Date(params.startDate);

  for (let i = 0; i < params.miningPeriod; i++) {
    const currentDate = new Date(startDate);
    currentDate.setMonth(startDate.getMonth() + i);

    // Увеличиваем сложность каждый месяц
    if (i > 0) {
      currentDifficulty *= 1 + params.difficultyChangePerMonth / 100;
    }

    // Изменяем курс каждый месяц
    if (i > 0) {
      currentRate *= 1 + params.priceChangePerMonth / 100;
    }

    // Расчет вознаграждения в криптовалюте
    const rewardCrypto =
      calculateHourlyReward(
        params.hashRate,
        currentDifficulty,
        params.cryptoCurrency === "BTC" ? 3.125 : 10000,
        params.poolFee
      ) *
      24 *
      30;

    // Расчет вознаграждения в фиатной валюте
    const rewardFiat = rewardCrypto * currentRate;

    // Расчет прибыли
    const profit = rewardFiat - monthlyCost;

    // Расчет ROI
    cumulativeInvestment -= profit;

    const roi =
      profit > 0
        ? Math.abs(
            (Math.abs(cumulativeInvestment) / params.farmCost) * 100 - 100
          )
        : 0;

    // Если прибыль отрицательная, ROI равен 0

    const month = `${currentDate.getFullYear()} ${currentDate.toLocaleString(
      "ru-RU",
      { month: "long" }
    )}`;

    forecast.push({
      month,
      difficulty: currentDifficulty,
      difficultyChange: params.difficultyChangePerMonth,
      rewardCrypto,
      rewardFiat: profit,
      roi,
    });
  }

  return forecast;
};

// Расчет вероятности нахождения блока
const calculateBlockTimeEstimates = (
  hashRate: number, // TH/s
  difficulty: number
): BlockTimeEstimate[] => {
  const estimates: BlockTimeEstimate[] = [];
  const probabilities = [50, 65, 90, 95];

  // Среднее время нахождения блока в секундах
  const averageBlockTimeSeconds =
    (difficulty * Math.pow(2, 32)) / (hashRate * 1e12);
  const averageBlockTimeDays = averageBlockTimeSeconds / 86400;

  for (const probability of probabilities) {
    // Используем экспоненциальное распределение для расчета времени с заданной вероятностью
    // P = 1 - e^(-t/mean), решаем для t: t = -mean * ln(1 - P/100)
    const days = -averageBlockTimeDays * Math.log(1 - probability / 100);

    estimates.push({
      probability,
      days,
    });
  }

  // Добавляем среднее время
  estimates.push({
    probability: -1, // Маркер для среднего времени
    days: averageBlockTimeDays,
  });

  return estimates;
};
