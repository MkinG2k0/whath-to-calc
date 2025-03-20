import React from 'react'
import { Layout } from 'antd'
import MiningForm from './components/MiningForm'
import MiningResults from './components/MiningResults'
import { MiningParams } from './types'
import { useMiningCalculator } from './hooks/useMiningCalculator'
import './App.css'

const {Content} = Layout

const App: React.FC = () => {
	const {params, results, error, setParams, loading} =
		useMiningCalculator()

	const handleParamsChange = (newParams: MiningParams) => {
		if (newParams && newParams.cryptoCurrency) {
			setParams(newParams)
		} else {
			console.error('Неполные параметры майнинга:', newParams)
		}
	}

	return (
		<Layout className="min-h-screen">
			{/*<Header className="flex items-center">*/}
			{/*	<div className="text-white text-xl font-bold">*/}
			{/*		Калькулятор майнинга криптовалют*/}
			{/*	</div>*/}
			{/*</Header>*/}
			{error && (
				<div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
					{error}
				</div>
			)}
			<Content className="p-2 flex gap-2 h-[100vh]">
				<MiningForm onParamsChange={handleParamsChange}/>
				{params && (
					<MiningResults
						result={results}
						loading={loading}
						cryptoCurrency={params.cryptoCurrency}
						fiatCurrency={params.fiatCurrency}
					/>
				)}
			</Content>
		</Layout>
	)
}

export default App
