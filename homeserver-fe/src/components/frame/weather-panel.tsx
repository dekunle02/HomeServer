import { useCallback, useEffect, useState } from 'react'
import { IoUmbrellaOutline } from 'react-icons/io5'
import { fetchWeatherApi } from 'openmeteo'
import WeatherForecastView, {
  getWeatherIcon,
  makeForeCastArr,
  type Forecast,
} from './weather-forecast-view'

const WEATHER_REFRESH_INTERVAL = 30 * 60 * 1000 // 30 minutes

export default function WeatherPanel() {
  const [weatherData, setWeatherData] =
    useState<WeatherData>(defaultWeatherData)

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    determineOrientation(),
  )

  screen.orientation.addEventListener('change', () => {
    setOrientation(determineOrientation())
  })

  // refresh callback
  const refreshWeather = useCallback(() => {
    fetchWeather().then((data) => {
      setWeatherData(data)
    })
  }, [])

  // Refresh weather data effect
  useEffect(() => {
    refreshWeather()
    const interval = setInterval(() => {
      refreshWeather()
    }, WEATHER_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [WEATHER_REFRESH_INTERVAL])

  return (
    <div className="mt-5 flex flex-col">
      <div className="flex flex-row items-center justify-between">
        {/* current temperature and feels like */}
        <div className="flex flex-col">
          <div className="flex flex-row items-center gap-1 text-3xl">
            <span className="text-3xl md:text-6xl">
              {weatherData?.currentTemperature ?? 0}°
            </span>
            {getWeatherIcon(
              weatherData?.currentWeatherCode ?? 0,
              weatherData?.sunriseHour,
              weatherData?.sunsetHour,
            )}
          </div>

          <span className="text-lg md:text-2xl">
            Feels like: {weatherData?.apparentTemperature}°
          </span>
        </div>

        {/* weather icon and forecast */}
        {orientation === 'landscape' && (
          <WeatherForecastView forecasts={weatherData?.forecasts ?? []} />
        )}

        {/* Chance of rain */}
        <div className="flex flex-row items-center gap-2">
          <IoUmbrellaOutline className="text-5xl" />
          <div className="flex flex-col">
            <span className="text-xl md:text-3xl">
              {weatherData?.rainPrediction ?? '0%'}
            </span>
            <span className="text-lg md:text-xl ml-auto">
              {weatherData?.rainPredictionDescription ?? 'in next 0 hours'}
            </span>
          </div>
        </div>
      </div>

      {/* weather icon and forecast */}

      {orientation === 'portrait' && (
        <WeatherForecastView forecasts={weatherData?.forecasts ?? []} />
      )}
    </div>
  )
}

function determineOrientation(): 'portrait' | 'landscape' {
  const orientation = screen.orientation.type
  return orientation.startsWith('portrait') ? 'portrait' : 'landscape'
}

async function fetchWeather(): Promise<WeatherData> {
  const params = {
    latitude: 52.4927,
    longitude: -1.9674,
    daily: ['sunrise', 'sunset'],
    hourly: ['temperature_2m', 'weather_code', 'precipitation_probability'],
    current: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation',
      'weather_code',
    ],
    timezone: 'Europe/London',
    forecast_days: 1,
  }
  const url = 'https://api.open-meteo.com/v1/forecast'
  const responses = await fetchWeatherApi(url, params)

  // Process first location. In this case, we only requested one location, Sandwell
  const response = responses[0]
  const utcOffsetSeconds = response.utcOffsetSeconds()
  const current = response.current()!
  const hourly = response.hourly()!
  const daily = response.daily()!

  // Define Int64 variables so they can be processed accordingly
  const sunrise = daily.variables(0)!
  const sunset = daily.variables(1)!

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature_2m: current.variables(0)!.value(),
      apparent_temperature: current.variables(1)!.value(),
      precipitation: current.variables(2)!.value(),
      weather_code: current.variables(3)!.value(),
    },
    hourly: {
      time: Array.from(
        {
          length:
            (Number(hourly.timeEnd()) - Number(hourly.time())) /
            hourly.interval(),
        },
        (_, i) =>
          new Date(
            (Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) *
              1000,
          ),
      ),
      temperature_2m: hourly.variables(0)!.valuesArray(),
      weather_code: hourly.variables(1)!.valuesArray(),
      precipitation_probability: hourly.variables(2)!.valuesArray(),
    },
    daily: {
      time: Array.from(
        {
          length:
            (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval(),
        },
        (_, i) =>
          new Date(
            (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
              1000,
          ),
      ),
      // Map Int64 values to according structure
      sunrise: [...Array(sunrise.valuesInt64Length())].map(
        (_, i) =>
          new Date((Number(sunrise.valuesInt64(i)) + utcOffsetSeconds) * 1000),
      ),
      // Map Int64 values to according structure
      sunset: [...Array(sunset.valuesInt64Length())].map(
        (_, i) =>
          new Date((Number(sunset.valuesInt64(i)) + utcOffsetSeconds) * 1000),
      ),
    },
  }

  const currentTemperature = Math.round(weatherData.current.temperature_2m)
  const apparentTemperature = Math.round(
    weatherData.current.apparent_temperature,
  )
  const currentWeatherCode = weatherData.current.weather_code
  const currentHour = new Date().getHours()
  const { index: rainHr, value: rainProb } = calcPrecProb(
    currentHour,
    8,
    mapFloat32ArrToNumArr(weatherData.hourly.precipitation_probability),
  )

  const nextNPrecHrs = rainHr - currentHour
  const rainPrediction = pluralize('hour', 'hours', nextNPrecHrs)
  const rainPredictionStr = 'in next ' + nextNPrecHrs + ' ' + rainPrediction

  return {
    currentTemperature,
    apparentTemperature,
    currentWeatherCode,
    rainPrediction: rainProb + '%',
    rainPredictionDescription: rainPredictionStr,
    forecasts: makeForeCastArr(
      8,
      mapFloat32ArrToNumArr(weatherData.hourly.temperature_2m),
      mapFloat32ArrToNumArr(weatherData.hourly.weather_code),
      weatherData.daily.sunrise[0].getHours(),
      weatherData.daily.sunset[0].getHours(),
    ),
    sunriseHour: weatherData.daily.sunrise[0].getHours(),
    sunsetHour: weatherData.daily.sunset[0].getHours(),
  }
}

type WeatherData = {
  currentTemperature: number
  apparentTemperature: number
  currentWeatherCode: number
  rainPrediction: string
  rainPredictionDescription: string
  forecasts: Forecast[]
  sunriseHour: number
  sunsetHour: number
}

const defaultWeatherData: WeatherData = {
  currentTemperature: 0,
  apparentTemperature: 0,
  currentWeatherCode: 0,
  rainPrediction: '0%',
  rainPredictionDescription: 'in next 0 hours',
  forecasts: [],
  sunriseHour: 6,
  sunsetHour: 18,
}

function mapFloat32ArrToNumArr(
  arr: Float32Array<ArrayBufferLike> | null,
): number[] {
  if (!arr) return []
  return Array.from(arr, (val) => Number(val))
}

function calcPrecProb(
  start: number,
  n: number,
  arr: number[],
): { index: number; value: number } {
  const slice = arr.slice(start, start + n)
  if (slice.length === 0) return { index: 0, value: 0 }
  const maxValue = slice.find((val) => val === Math.max(...slice)) || 0

  return { index: slice.indexOf(maxValue) + start, value: maxValue }
}

function pluralize(word: string, pluralWord: string, count: number): string {
  return count === 1 ? word : pluralWord
}

// https://open-meteo.com/
