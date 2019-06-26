import Axios from 'axios';

import { WEATHER_API_KEY } from '../constants';
import { ForecastRequest, OpenWeatherItem, ForecastItem, WeatherCondition, Forecast } from '../models';

const getDate = (item: OpenWeatherItem) => {
  return new Date(item.dt * 1000);
}

const getForWeek = (items: OpenWeatherItem[]) => {
  const list: ForecastItem[] = [];

  for (const item of items) {
    const date = getDate(item);
    const hours = date.getHours();
    const dateStr = date.toLocaleDateString();
    const el: ForecastItem = list.find(e => e.date.toLocaleDateString() === dateStr) || {};

    if (el != null && el.nightTemp != null) continue;

    const temp = Math.round(item.main.temp);
    const weather = item.weather[0];

    if (el.dayTemp == null && hours >= 10) {
      list.push({
        dayTemp: temp,
        date,
        dayName: dateStr,
        description: weather.description,
        weather: weather.main.toLowerCase() as WeatherCondition,
      });
    }

    if (el.nightTemp == null && item.sys.pod === 'n') {
      el.nightTemp = temp;
    }
  }

  return list.sort((a, b) => <any>a.date - <any>b.date);
}

export const getWeather = async ({ city, lang, units }: ForecastRequest): Promise<Forecast> => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&lang=${lang}&units=${units}`;
  const { data } = await Axios.get(url);
  const items = getForWeek(data.list);

  return {
    today: items[0],
    week: items.splice(1),
  }
}