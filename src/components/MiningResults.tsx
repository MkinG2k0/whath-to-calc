import React from 'react'
import { Card, Table, Statistic, Tooltip } from 'antd'
import { parsePrice } from '../config'
import {
	MiningResult,
	FiatCurrency,
	CryptoCurrency,
} from '../types'

interface MiningResultsProps {
	result: MiningResult | null;
	loading: boolean;
	cryptoCurrency: CryptoCurrency;
	fiatCurrency: FiatCurrency;
}

const MiningResults: React.FC<MiningResultsProps> = ({
	result,
	loading,
	cryptoCurrency,
	fiatCurrency,
}) => {

	if (!result) {
		return null
	}

	// Форматирование чисел
	const formatCrypto = (value: number) => {
		return value.toFixed(8)
	}

	const formatFiat = (value: number) => {
		return parsePrice.format(value)
	}

	// Колонки для таблицы прогноза по месяцам
	const forecastColumns = [
		{
			title: 'Месяц',
			dataIndex: 'month',
			key: 'month',
			width: 80,
		},
		{
			title: 'Сложность',
			dataIndex: 'difficulty',
			key: 'difficulty',
			width: 190,
			render: (text: number) => text.toLocaleString('ru-RU'),
		},
		// {
		// 	title: 'Изменение сложности',
		// 	dataIndex: 'difficultyChange',
		// 	key: 'difficultyChange',
		// 	render: (text: number) => `${text} %`,
		// },
		{
			title: `Доход ${cryptoCurrency}`,
			dataIndex: 'rewardCrypto',
			key: 'rewardCrypto',
			render: (text: number) => formatCrypto(text),
		},
		{
			title: `Чистый доход`,
			dataIndex: 'rewardFiat',
			key: 'rewardFiat',
			render: (text: number) => formatFiat(text),
		},
		{
			title: 'Окупаемость',
			dataIndex: 'roi',
			key: 'roi',
			render: (text: number) => `${formatFiat(text)} %`,
		},
	]

	return (
		<div className="flex flex-col gap-2 flex-auto h-full overflow-hidden">
			<Card
				title="Заработок на майнинге в текущих показателях"
				loading={loading}
				size="small"
			>
				<div className="flex gap-4 flex-wrap">
					<Statistic
						title={`Окупаемость`}
						valueRender={
							() => <Tooltip title={`${result.breakEvenDays.toFixed(0)} Дней`}>{
								(result.breakEvenDays / 30).toFixed(0)
							} М
							</Tooltip>
						}
					/>
					<Statistic
						title={`Доход в месяц`}
						value={formatFiat(result.monthlyProfit)}
						suffix={fiatCurrency}
						valueStyle={{
							color: result.hourlyProfit > 0 ? '#3f8600' : '#cf1322',
						}}
					/>
					<Statistic
						title={`Доход в 6 месяцев`}
						value={formatFiat(result.monthlyProfit * 6)}
						suffix={fiatCurrency}
						valueStyle={{
							color: result.hourlyProfit > 0 ? '#3f8600' : '#cf1322',
						}}
					/>
					<Statistic
						title={`Доход в месяц грязными`}
						value={formatFiat(result.monthlyRewardFiat)}
						suffix={fiatCurrency}
						valueStyle={{
							color: '#cf1322',
						}}
					/>
					<Statistic
						title={`Окупаемость грязными`}
						valueRender={
							() => <Tooltip title={`${result.breakEvenDaysDirty.toFixed(0)} Дней`}>{
								(result.breakEvenDaysDirty / 30).toFixed(0)
							} М
							</Tooltip>
						}
					/>
				</div>
			</Card>

			<Card title="Заработок на майнинге в перспективе" loading={loading} size="small">
				<Table
					dataSource={result.monthlyProfitForecast.map((item, index) => ({
						...item,
						key: index,
					}))}
					columns={forecastColumns}
					scroll={{y: 'calc(100vh - 310px)'}} // Настрой значение под свой макет
					size="small"
					pagination={false}
					// className={'scroll-antd-table'}
					style={{flexGrow: 1}} // Занимает всё пространство внутри контейнера
				/>
			</Card>
		</div>
	)
}

export default MiningResults
