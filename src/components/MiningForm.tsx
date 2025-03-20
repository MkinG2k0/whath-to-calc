import React, { useState, useEffect } from 'react'
import {
	Form,
	Select,
	InputNumber,
	Card,
	Tooltip,
} from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { CryptoCurrency, FiatCurrency, MiningParams } from '../types'
import { fetchCryptoRates, fetchNetworkInfo } from '../api/cryptoApi'
import dayjs from 'dayjs'

const {Option} = Select

interface MiningFormProps {
	onParamsChange: (params: MiningParams) => void;
}

// Добавьте эту переменную на уровне модуля (вне компонента)
let isDataFetched = false

const MiningForm: React.FC<MiningFormProps> = ({onParamsChange}) => {
	const [form] = Form.useForm()
	const [cryptoRates, setCryptoRates] = useState<any>(null)
	const [networkInfo, setNetworkInfo] = useState<any>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const cryptoCurrency = Form.useWatch('cryptoCurrency', form) || 'BTC'

	useEffect(() => {
		const fetchData = async () => {
			// Проверяем, были ли уже загружены данные
			if (isDataFetched) {
				return
			}

			try {
				setLoading(true)
				const [rates, info] = await Promise.all([
					fetchCryptoRates(),
					fetchNetworkInfo(),
				])

				// Проверяем, что данные получены успешно
				if (!rates || !info) {
					console.error('Не удалось получить данные о курсах или сети')
					setLoading(false)
					return
				}

				setCryptoRates(rates)
				setNetworkInfo(info)
				isDataFetched = true // Отмечаем, что данные загружены

				const savedValues = JSON.parse(
					localStorage.getItem('formValues') || '{}',
				)
				// Устанавливаем начальные значения формы
				const initialValues = {
					cryptoCurrency: 'BTC',
					fiatCurrency: 'RUB',
					hashRate: 100,
					poolFee: 1,
					farmCost: 35000,
					powerConsumption: 3500,
					electricityRate: 3.5,
					miningPeriod: 12,
					includeDepreciation: false,
					depreciationRate: 3.33,
					difficultyChangePerMonth: 5,
					priceChangePerMonth: 5,
					...savedValues,
					blockReward: info.BTC.blockReward,
					networkDifficulty: info.BTC.difficulty,
					startDate: dayjs(),
				}

				form.setFieldsValue(initialValues)

				// Вызываем обработчик изменения параметров с начальными значениями
				// Используем setTimeout, чтобы дать форме время на обновление
				setLoading(false)
			} catch (error) {
				console.error('Ошибка при загрузке данных:', error)
				setLoading(false)
			}
		}

		fetchData()
	}, [])

	useEffect(() => {
		if (networkInfo) {
			handleFormChange(form.getFieldsValue())
		}
	}, [networkInfo])

	const handleFormChange = (values: any) => {
		localStorage.setItem('formValues', JSON.stringify(values))

		// Проверяем, что values и networkInfo не null и не undefined
		if (!values || !networkInfo || !values.cryptoCurrency) {
			console.log('Недостаточно данных для расчета', {values, networkInfo})
			return
		}

		try {
			const params: MiningParams = {
				...values,
				startDate: values.startDate?.toDate() || new Date(),
				networkDifficulty:
					values.networkDifficulty ||
					networkInfo[values.cryptoCurrency].difficulty,
				blockReward:
					values.blockReward || networkInfo[values.cryptoCurrency].blockReward,
			}

			onParamsChange(params)
		} catch (error) {
			console.error('Ошибка при формировании параметров майнинга:', error)
		}
	}

	const handleCryptoChange = (value: CryptoCurrency) => {
		if (!networkInfo) {
			console.log('Информация о сети еще не загружена')
			return
		}

		try {
			form.setFieldsValue({
				networkDifficulty: networkInfo[value].difficulty,
				blockReward: networkInfo[value].blockReward,
			})

			handleFormChange(form.getFieldsValue())
		} catch (error) {
			console.error('Ошибка при изменении криптовалюты:', error)
		}
	}

	const handleFiatChange = (value: FiatCurrency) => {
		if (!cryptoRates) return

		const currentValues = form.getFieldsValue()
		if (!currentValues) return

		const prevCurrency = currentValues.fiatCurrency
		const farmCost = currentValues.farmCost
		const electricityRate = currentValues.electricityRate

		// Получаем актуальный курс обмена напрямую
		const USDtoRUB = cryptoRates.BTC.RUB / cryptoRates.BTC.USD
		const RUBtoUSD = 1 / USDtoRUB

		// Конвертируем значения в зависимости от выбранной валюты
		if (prevCurrency === 'USD' && value === 'RUB') {
			// Конвертация из USD в RUB
			form.setFieldsValue({
				farmCost: farmCost ? Math.round(farmCost * USDtoRUB) : farmCost,
				electricityRate: electricityRate
					? +(electricityRate * USDtoRUB).toFixed(2)
					: electricityRate,
				fiatCurrency: value, // Важно обновить значение валюты
			})
		} else if (prevCurrency === 'RUB' && value === 'USD') {
			// Конвертация из RUB в USD
			form.setFieldsValue({
				farmCost: farmCost ? Math.round(farmCost * RUBtoUSD) : farmCost,
				electricityRate: electricityRate
					? +(electricityRate * RUBtoUSD).toFixed(2)
					: electricityRate,
				fiatCurrency: value, // Важно обновить значение валюты
			})
		}

		// Вызываем обработчик изменения формы для обновления всех зависимых значений
		handleFormChange(form.getFieldsValue())
	}

	return (
		<Card
			title="Параметры майнинга"
			loading={loading}
			size="small"
		>
			<div className={'min-w-[400px] h-[calc(100vh-70px)] overflow-auto pr-1'}>
				{cryptoRates && (
					<div className="mb-3 p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg text-sm shadow-sm">
						<p className="font-semibold mb-2 text-gray-700 border-b pb-1">
							Текущий курс:
						</p>
						<div className="flex flex-col gap-2">
							<div className="flex items-center">
								<div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-2">
									<span className="text-white font-bold">₿</span>
								</div>
								<div>
									<p className="font-medium">{cryptoCurrency}</p>
									<p>
										{cryptoRates[cryptoCurrency].USD.toLocaleString()} USD /{' '}
										{cryptoRates[cryptoCurrency].RUB.toLocaleString()} RUB
									</p>
								</div>
							</div>
						</div>
					</div>
				)}
				<Form
					form={form}
					layout="horizontal"
					onValuesChange={(_, data) => handleFormChange(data)}
					labelCol={{span: 14}}
					size="small"
					className="text-sm"
				>
					{/* Блок выбора валют */}
					<div className="mb-3 p-2 bg-gray-100 rounded-lg">
						<h3 className="text-base font-medium mb-2">Валюты</h3>
						<Form.Item label="Криптовалюта" name="cryptoCurrency">
							<Select onChange={handleCryptoChange} size="small">
								<Option value="BTC">Bitcoin (BTC)</Option>
								{/*<Option value="DOGE">Dogecoin (DOGE)</Option>*/}
							</Select>
						</Form.Item>

						<Form.Item label="Валюта" name="fiatCurrency">
							<Select onChange={handleFiatChange} size="small">
								{/*<Option value="USD">USD</Option>*/}
								<Option value="RUB">RUB</Option>
							</Select>
						</Form.Item>
					</div>

					{/* Блок параметров майнинга */}
					<div className="mb-3 p-2 bg-gray-100 rounded-lg">
						<h3 className="text-base font-medium mb-2">Параметры майнинга</h3>
						<Form.Item
							label={
								<span>
                Сложность сети{' '}
									<Tooltip title="Текущая сложность сети для выбранной криптовалюты">
                  <QuestionCircleOutlined/>
                </Tooltip>
              </span>
							}
							name="networkDifficulty"
						>
							<InputNumber style={{width: '100%'}} size="small"/>
						</Form.Item>

						<Form.Item
							label={
								<span>
                Скорость майнера{' '}
									<Tooltip title="Хешрейт вашего оборудования в TH/s">
                  <QuestionCircleOutlined/>
                </Tooltip>
              </span>
							}
							name="hashRate"
						>
							<InputNumber
								style={{width: '100%'}}
								addonAfter="TH/s"
								min={0}
								size="small"
							/>
						</Form.Item>

						{/*<Form.Item*/}
						{/*	label={*/}
						{/*		<span>*/}
						{/*    Награда за блок{' '}*/}
						{/*			<Tooltip title="Текущая награда за найденный блок">*/}
						{/*      <QuestionCircleOutlined/>*/}
						{/*    </Tooltip>*/}
						{/*  </span>*/}
						{/*	}*/}
						{/*	name="blockReward"*/}
						{/*>*/}
						{/*	<InputNumber style={{width: '100%'}} min={0} size="small"/>*/}
						{/*</Form.Item>*/}

						<Form.Item
							label={
								<span>
                Комиссия пула{' '}
									<Tooltip title="Комиссия майнинг-пула в процентах">
                  <QuestionCircleOutlined/>
                </Tooltip>
              </span>
							}
							name="poolFee"
						>
							<InputNumber
								style={{width: '100%'}}
								addonAfter="%"
								min={0}
								max={100}
								size="small"
							/>
						</Form.Item>
					</div>

					{/* Блок оборудования и электроэнергии */}
					<div className="mb-3 p-2 bg-gray-100 rounded-lg">
						<h3 className="text-base font-medium mb-2">
							Оборудование и электроэнергия
						</h3>
						<Form.Item label="Стоимость фермы" name="farmCost">
							<InputNumber
								style={{width: '100%'}}
								min={0}
								size="small"
								addonAfter={form.getFieldValue('fiatCurrency') || 'USD'}
							/>
						</Form.Item>

						<Form.Item label="Потребляемая мощность" name="powerConsumption">
							<InputNumber
								style={{width: '100%'}}
								addonAfter="Ватт"
								min={0}
								size="small"
							/>
						</Form.Item>

						<Form.Item label="Тариф" name="electricityRate">
							<InputNumber
								style={{width: '100%'}}
								addonAfter={
									(form.getFieldValue('fiatCurrency') || 'USD') === 'USD'
										? 'USD/кВт·ч'
										: 'RUB/кВт·ч'
								}
								min={0}
								step={0.01}
								size="small"
							/>
						</Form.Item>

						{/*<Form.Item*/}
						{/*	label="Учитывать амортизацию"*/}
						{/*	name="includeDepreciation"*/}
						{/*	valuePropName="checked"*/}
						{/*>*/}
						{/*	<Switch size="small"/>*/}
						{/*</Form.Item>*/}

						{/*<Form.Item label="Ставка амортизации" name="depreciationRate">*/}
						{/*	<InputNumber*/}
						{/*		style={{width: '100%'}}*/}
						{/*		addonAfter="% (в месяц)"*/}
						{/*		min={0}*/}
						{/*		max={100}*/}
						{/*		step={0.01}*/}
						{/*		size="small"*/}
						{/*	/>*/}
						{/*</Form.Item>*/}
					</div>

					{/* Блок временных параметров и прогнозов */}
					<div className="mb-3 p-2 bg-gray-100 rounded-lg">
						<h3 className="text-base font-medium mb-2">
							Временные параметры и прогнозы
						</h3>
						<Form.Item label="Период работы" name="miningPeriod">
							<InputNumber
								style={{width: '100%'}}
								addonAfter="месяцев"
								min={1}
								max={60}
								size="small"
							/>
						</Form.Item>

						{/*<Form.Item label="Месяц начала работы" name="startDate">*/}
						{/*	<DatePicker*/}
						{/*		style={{width: '100%'}}*/}
						{/*		picker="month"*/}
						{/*		locale={locale}*/}
						{/*		size="small"*/}
						{/*	/>*/}
						{/*</Form.Item>*/}

						<Form.Item
							label="Изменение сложности"
							name="difficultyChangePerMonth"
						>
							<InputNumber
								style={{width: '100%'}}
								addonAfter="%"
								min={-50}
								max={100}
								size="small"
							/>
						</Form.Item>

						<Form.Item label="Изменение курса" name="priceChangePerMonth">
							<InputNumber
								style={{width: '100%'}}
								addonAfter="%"
								min={-50}
								max={100}
								size="small"
							/>
						</Form.Item>
					</div>
				</Form>
			</div>

		</Card>
	)
}

export default MiningForm
