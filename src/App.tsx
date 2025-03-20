import React  from "react";
import { Layout,   } from "antd";
import MiningForm from "./components/MiningForm";
import MiningResults from "./components/MiningResults";
import { MiningParams } from "./types";
import { useMiningCalculator } from "./hooks/useMiningCalculator";
import "./App.css";

const { Header, Content, Footer } = Layout;

const App: React.FC = () => {
  const { params, results, error, setParams,  loading } =
    useMiningCalculator();

  const handleParamsChange = (newParams: MiningParams) => {
    if (newParams && newParams.cryptoCurrency) {
      setParams(newParams);
    } else {
      console.error("Неполные параметры майнинга:", newParams);
    }
  };

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center">
        <div className="text-white text-xl font-bold">
          Калькулятор майнинга криптовалют
        </div>
      </Header>
      <Content className="p-2">
        <div className="flex gap-2">
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <MiningForm onParamsChange={handleParamsChange} />

          {params && (
            <MiningResults
              result={results}
              loading={loading}
              cryptoCurrency={params.cryptoCurrency}
              fiatCurrency={params.fiatCurrency}
            />
          )}
        </div>
      </Content>
      <Footer className="text-center">
        Калькулятор майнинга криптовалют ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default App;
