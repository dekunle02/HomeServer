import type { JSX } from 'react'
import {
  IoCloudyOutline,
  IoPartlySunnyOutline,
  IoSnowOutline,
  IoSunny,
} from 'react-icons/io5'
import { PiCloudMoon } from 'react-icons/pi'
import { WiMoonFull } from 'react-icons/wi'
import { RiMoonFoggyLine, RiFoggyLine, RiDrizzleLine } from 'react-icons/ri'
import { BsCloudRain } from 'react-icons/bs'
import { MdOutlineThunderstorm } from 'react-icons/md'

type props = {
  forecasts: Forecast[]
}

export default function WeatherForecastView({ forecasts }: props) {
  return (
    <div className={'flex flex-row justify-around md:mx-5 md:gap-10 mt-4'}>
      {forecasts.map((forecast) => (
        <div
          key={forecast.hour}
          className="flex flex-col items-center gap-2 text-3xl"
        >
          <span className="text-base md:text-lg">
            {convertHourTo12HourFormat(forecast.hour)}
          </span>
          {forecast.icon}
          <span className="text-lg md:text-2xl">{forecast.temperature}°</span>
        </div>
      ))}
    </div>
  )
}

export type Forecast = {
  hour: number
  icon: JSX.Element
  temperature: number
}

function nextNItems<T>(start: number, n: number, arr: T[]): T[] {
  const slice = arr.slice(start, start + n)
  if (slice.length < n) {
    return arr.slice(arr.length - n, arr.length)
  }
  return slice
}

export function makeForeCastArr(
  n: number,
  tempArr: number[],
  weatherCodeArr: number[],
  sunriseHour: number,
  sunsetHour: number,
) {
  const currentHour = new Date().getHours()
  const nextTemps = nextNItems(currentHour, n, tempArr)
  const nextWeatherCodes = nextNItems(currentHour, n, weatherCodeArr)

  const startHour = currentHour < 24 - n ? currentHour : 24 - n

  const forecastArr: Forecast[] = []
  for (let i = 0; i < n; i++) {
    const weatherCode = nextWeatherCodes[i]
    const weatherIcon = getWeatherIcon(weatherCode, sunriseHour, sunsetHour)
    forecastArr.push({
      hour: i + startHour,
      icon: weatherIcon,
      temperature: Math.round(nextTemps[i]),
    })
  }

  return forecastArr
}

function convertHourTo12HourFormat(hour: number): string {
  const adjustedHour = hour % 24
  const period = adjustedHour >= 12 ? 'pm' : 'am'
  const hour12 = adjustedHour % 12 === 0 ? 12 : adjustedHour % 12
  return `${hour12}${period}`
}

const defaultWeatherIcon = <IoCloudyOutline />

export function getWeatherIcon(
  weatherCode: number,
  sunriseHour: number,
  sunsetHour: number,
): JSX.Element {
  const currentHour = new Date().getHours()
  const isDayTime = currentHour >= sunriseHour && currentHour < sunsetHour

  let weatherIcon = isDayTime
    ? WeatherIconDayMap[weatherCode]
    : WeatherIconNightMap[weatherCode]
  if (!weatherIcon) {
    weatherIcon = defaultWeatherIcon
  }
  return weatherIcon
}
const WeatherIconDayMap: Record<number, JSX.Element> = {
  0: <IoSunny className="text-yellow-500" />,
  1: <IoSunny className="text-yellow-500" />,
  2: <IoPartlySunnyOutline />,
  3: <IoCloudyOutline />,
  45: <RiFoggyLine />,
  48: <RiFoggyLine />,
  51: <RiDrizzleLine />,
  53: <RiDrizzleLine />,
  55: <RiDrizzleLine />,
  56: <RiDrizzleLine />,
  57: <RiDrizzleLine />,
  61: <BsCloudRain />,
  63: <BsCloudRain />,
  65: <BsCloudRain />,
  66: <BsCloudRain />,
  67: <BsCloudRain />,
  71: <IoSnowOutline />,
  73: <IoSnowOutline />,
  75: <IoSnowOutline />,
  77: <IoSnowOutline />,
  80: <RiDrizzleLine />,
  81: <RiDrizzleLine />,
  82: <RiDrizzleLine />,
  85: <IoSnowOutline />,
  86: <IoSnowOutline />,
  95: <MdOutlineThunderstorm />,
  96: <MdOutlineThunderstorm />,
  99: <MdOutlineThunderstorm />,
}

const WeatherIconNightMap: Record<number, JSX.Element> = {
  0: <WiMoonFull />,
  1: <WiMoonFull />,
  2: <PiCloudMoon />,
  3: <PiCloudMoon />,
  45: <RiMoonFoggyLine />,
  48: <RiMoonFoggyLine />,
  51: <RiDrizzleLine />,
  53: <RiDrizzleLine />,
  55: <RiDrizzleLine />,
  56: <RiDrizzleLine />,
  57: <RiDrizzleLine />,
  61: <BsCloudRain />,
  63: <BsCloudRain />,
  65: <BsCloudRain />,
  66: <BsCloudRain />,
  67: <BsCloudRain />,
  71: <IoSnowOutline />,
  73: <IoSnowOutline />,
  75: <IoSnowOutline />,
  77: <IoSnowOutline />,
  80: <RiDrizzleLine />,
  81: <RiDrizzleLine />,
  82: <RiDrizzleLine />,
  85: <IoSnowOutline />,
  86: <IoSnowOutline />,
  95: <MdOutlineThunderstorm />,
  96: <MdOutlineThunderstorm />,
  99: <MdOutlineThunderstorm />,
}
