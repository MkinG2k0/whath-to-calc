import React from "react";
import { Card, Table, Statistic, Row, Col, Divider } from "antd";
import {
  MiningResult,
  MonthlyForecast,
  BlockTimeEstimate,
  FiatCurrency,
  CryptoCurrency,
} from "../types";

interface MiningResultsProps {
  result: MiningResult | null;
  blockTimeEstimates: BlockTimeEstimate[];
  loading: boolean;
  cryptoCurrency: CryptoCurrency;
  fiatCurrency: FiatCurrency;
}

const MiningResults: React.FC<MiningResultsProps> = ({
  result,
  blockTimeEstimates,
  loading,
  cryptoCurrency,
  fiatCurrency,
}) => {
  if (!result) {
    return null;
  }

  // Форматирование чисел
  const formatCrypto = (value: number) => {
    return value.toFixed(8);
  };

  const formatFiat = (value: number) => {
    return value.toFixed(2);
  };

  // Колонки для таблицы текущих показателей
  const currentColumns = [
    {
      title: "Период",
      dataIndex: "period",
      key: "period",
    },
    {
      title: cryptoCurrency,
      dataIndex: "crypto",
      key: "crypto",
      render: (text: number) => formatCrypto(text),
    },
    {
      title: fiatCurrency,
      dataIndex: "fiat",
      key: "fiat",
      render: (text: number) => formatFiat(text),
    },
  ];

  // Данные для таблицы текущих показателей
  const currentData = [
    {
      key: "hour",
      period: "В час",
      crypto: result.hourlyReward,
      fiat: result.hourlyReward * (cryptoCurrency === "BTC" ? 63321.8 : 0.15),
    },
    {
      key: "day",
      period: "В день",
      crypto: result.dailyReward,
      fiat: result.dailyReward * (cryptoCurrency === "BTC" ? 63321.8 : 0.15),
    },
  ];

  // Колонки для таблицы прогноза по месяцам
  const forecastColumns = [
    {
      title: "Месяц",
      dataIndex: "month",
      key: "month",
    },
    // {
    //   title: "Сложность",
    //   dataIndex: "difficulty",
    //   key: "difficulty",
    //   render: (text: number) => text.toLocaleString("ru-RU"),
    // },
    // {
    //   title: "Изменение сложности",
    //   dataIndex: "difficultyChange",
    //   key: "difficultyChange",
    //   render: (text: number) => `${text} %`,
    // },
    {
      title: `Доход ${cryptoCurrency}`,
      dataIndex: "rewardCrypto",
      key: "rewardCrypto",
      render: (text: number) => formatCrypto(text),
    },
    {
      title: `Чистый доход`,
      dataIndex: "rewardFiat",
      key: "rewardFiat",
      render: (text: number) => formatFiat(text),
    },
    {
      title: "ROI",
      dataIndex: "roi",
      key: "roi",
      render: (text: number) => `${formatFiat(text)} %`,
    },
  ];

  // Колонки для таблицы времени нахождения блока
  const blockTimeColumns = [
    {
      title: "Вероятность",
      dataIndex: "probability",
      key: "probability",
      render: (text: number) => (text === -1 ? "Среднее время:" : `${text}%`),
    },
    {
      title: "Время (дней)",
      dataIndex: "days",
      key: "days",
      render: (text: number) =>
        text.toLocaleString("ru-RU", { maximumFractionDigits: 0 }),
    },
  ];

  return (
    <div className="flex flex-col gap-2 flex-auto">
      <Card
        title="Заработок на майнинге в текущих показателях"
        loading={loading}
        size="small"
      >
        <div className="flex  gap-2">
          <Statistic
            title={`Окупаемость`}
            value={result.breakEvenDays.toFixed(0)}
            suffix="дней"
          />
          <Statistic
            title={`Доход в месяц`}
            value={formatFiat(result.monthlyProfit)}
            suffix={fiatCurrency}
            valueStyle={{
              color: result.hourlyProfit > 0 ? "#3f8600" : "#cf1322",
            }}
          />
          <Statistic
            title={`Доход в 6 месяцев`}
            value={formatFiat(result.monthlyProfit * 6)}
            suffix={fiatCurrency}
            valueStyle={{
              color: result.hourlyProfit > 0 ? "#3f8600" : "#cf1322",
            }}
          />
          <Statistic
            title={`Доход в месяц грязными`}
            value={formatFiat(result.monthlyRewardFiat)}
            suffix={fiatCurrency}
            valueStyle={{
              color: "#cf1322",
            }}
          />
        </div>
      </Card>

      <Card
        title="Заработок на майнинге в перспективе"
        loading={loading}
        size="small"
      >
        <Table
          dataSource={result.monthlyProfitForecast.map((item, index) => ({
            ...item,
            key: index,
          }))}
          columns={forecastColumns}
          scroll={{ x: true }}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default MiningResults;
