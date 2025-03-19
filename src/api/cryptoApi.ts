import axios from "axios";
import {
  CryptoCurrency,
  FiatCurrency,
  CryptoRates,
  NetworkInfo,
} from "../types";

// Кэш для хранения данных о курсах валют
let ratesCache: any = null;
let ratesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут в миллисекундах

// Резервные данные на случай, если API недоступен
const FALLBACK_RATES = {
  BTC: { USD: 83859, RUB: 6999940 },
  DOGE: { USD: 0.170867, RUB: 14.26 },
};

// Резервные данные о сети
const FALLBACK_NETWORK_INFO = {
  BTC: { difficulty: 112149504190349, blockReward: 3.125 },
  DOGE: { difficulty: 15234567, blockReward: 10000 },
};

// Добавьте эту переменную для отслеживания запросов в процессе
let isRequestInProgress = false;

// API для получения курсов криптовалют
export const fetchCryptoRates = async (): Promise<CryptoRates> => {
  // Если запрос уже выполняется, возвращаем кэш или резервные данные
  if (isRequestInProgress) {
    return ratesCache || FALLBACK_RATES;
  }

  try {
    // Проверяем, есть ли актуальные данные в кэше
    const now = Date.now();
    if (ratesCache && now - ratesCacheTime < CACHE_DURATION) {
      return ratesCache;
    }

    // Отмечаем, что запрос начался
    isRequestInProgress = true;

    // Если кэш устарел или отсутствует, делаем запрос к API
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,dogecoin&vs_currencies=usd,rub",
      { timeout: 5000 } // Устанавливаем таймаут в 5 секунд
    );

    // Преобразуем данные в нужный формат
    const rates = {
      BTC: {
        USD: response.data.bitcoin.usd,
        RUB: response.data.bitcoin.rub,
      },
      DOGE: {
        USD: response.data.dogecoin.usd,
        RUB: response.data.dogecoin.rub,
      },
    };

    // Обновляем кэш
    ratesCache = rates;
    ratesCacheTime = now;

    // Сбрасываем флаг запроса
    isRequestInProgress = false;

    return rates;
  } catch (error) {
    // Сбрасываем флаг запроса при ошибке
    isRequestInProgress = false;

    console.error("Ошибка при получении курсов валют:", error);

    // Если есть кэшированные данные, используем их даже если они устарели
    if (ratesCache) {
      console.log("Используем устаревшие кэшированные данные");
      return ratesCache;
    }

    // В крайнем случае используем резервные данные
    console.log("Используем резервные данные о курсах валют");
    return FALLBACK_RATES;
  }
};

// API для получения информации о сети (сложность и награда за блок)
export const fetchNetworkInfo = async (): Promise<NetworkInfo> => {
  try {
    // Здесь можно добавить запрос к API для получения актуальной информации о сети
    // Но для простоты пока используем статические данные
    return FALLBACK_NETWORK_INFO;
  } catch (error) {
    console.error("Ошибка при получении информации о сети:", error);
    return FALLBACK_NETWORK_INFO;
  }
};
