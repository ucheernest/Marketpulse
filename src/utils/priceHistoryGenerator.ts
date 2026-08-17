import { Product, PriceTrendPoint } from '../types';

export interface DailyPriceDataPoint {
  day: number;
  date: string;
  shortDate: string;
  fullDate: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  volume: number;
  confidence: number;
  isPeak?: boolean;
  isTrough?: boolean;
}

export interface HistoricalStats {
  startPrice: number;
  endPrice: number;
  netChange: number;
  netChangePercent: number;
  minPrice: number;
  minPriceDate: string;
  maxPrice: number;
  maxPriceDate: string;
  avg30DayPrice: number;
  volatilityPercent: number;
  volatilityLevel: 'Low' | 'Moderate' | 'High';
  totalObservations: number;
}

/**
 * Deterministically generates a 30-day realistic historical price progression
 * grounded in the product's actual price bounds, current average, and change percent.
 */
export function generate30DayPriceHistory(product: Product): {
  data: DailyPriceDataPoint[];
  stats: HistoricalStats;
} {
  const currentPrice = product.currentAvgPrice;
  const spread = Math.max(150, (product.priceHigh - product.priceLow) * 0.45);
  const changePercent = product.priceChangePercent || 3.5;
  const isUp = product.priceChangeDirection === 'up';

  // Calculate 30 days ago starting baseline price
  const factor = isUp ? (1 + Math.abs(changePercent) / 100) : (1 - Math.abs(changePercent) / 100);
  const startBaseline = Math.round(currentPrice / factor);

  // Deterministic seed based on product ID
  let seed = 0;
  for (let i = 0; i < product.id.length; i++) {
    seed = (seed * 31 + product.id.charCodeAt(i)) & 0xffffffff;
  }

  const random = () => {
    seed = (seed * 16807 + 11) % 2147483647;
    return (seed & 0x7fffffff) / 2147483647;
  };

  const today = new Date();
  const data: DailyPriceDataPoint[] = [];

  let runningAvg = startBaseline;
  let minRecorded = Infinity;
  let minRecordedDate = '';
  let maxRecorded = -Infinity;
  let maxRecordedDate = '';
  let sumAvg = 0;
  let totalVolume = 0;

  for (let day = 30; day >= 1; day--) {
    const dateObj = new Date(today);
    dateObj.setDate(today.getDate() - (day - 1));

    const shortDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const fullDate = dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Interpolation progress from day 30 (start) to day 1 (today)
    const progress = (31 - day) / 30;
    
    // Wave motion + gradual trend towards current price
    const wave = Math.sin(progress * Math.PI * 3 + (seed % 5)) * (spread * 0.4);
    const noise = (random() - 0.48) * (spread * 0.35);

    let calculatedAvg: number;
    if (day === 1) {
      calculatedAvg = currentPrice;
    } else if (day === 30) {
      calculatedAvg = startBaseline;
    } else {
      calculatedAvg = Math.round(startBaseline + (currentPrice - startBaseline) * progress + wave + noise);
    }

    // Clamp within sane boundaries relative to product bounds
    const floorBound = Math.min(product.priceLow * 0.95, currentPrice * 0.85);
    const ceilBound = Math.max(product.priceHigh * 1.05, currentPrice * 1.15);
    calculatedAvg = Math.max(floorBound, Math.min(ceilBound, calculatedAvg));

    const daySpread = spread * (0.6 + random() * 0.8);
    const dayMin = Math.round(Math.max(floorBound, calculatedAvg - daySpread * 0.5));
    const dayMax = Math.round(Math.min(ceilBound, calculatedAvg + daySpread * 0.5));
    const volume = Math.floor(3 + random() * 7);
    const confidence = Math.min(99, Math.round(88 + random() * 11));

    if (calculatedAvg < minRecorded) {
      minRecorded = calculatedAvg;
      minRecordedDate = shortDate;
    }
    if (calculatedAvg > maxRecorded) {
      maxRecorded = calculatedAvg;
      maxRecordedDate = shortDate;
    }

    sumAvg += calculatedAvg;
    totalVolume += volume;

    data.push({
      day: 31 - day,
      date: shortDate,
      shortDate,
      fullDate,
      avgPrice: calculatedAvg,
      minPrice: dayMin,
      maxPrice: dayMax,
      volume,
      confidence,
    });
  }

  // Mark peaks and troughs
  data.forEach((pt) => {
    if (pt.avgPrice === maxRecorded) pt.isPeak = true;
    if (pt.avgPrice === minRecorded) pt.isTrough = true;
  });

  const startPrice = data[0].avgPrice;
  const endPrice = data[data.length - 1].avgPrice;
  const netChange = endPrice - startPrice;
  const netChangePercent = Number(((netChange / startPrice) * 100).toFixed(1));
  const avg30DayPrice = Math.round(sumAvg / data.length);

  // Volatility calculation (standard deviation / average)
  const varianceSum = data.reduce((acc, pt) => acc + Math.pow(pt.avgPrice - avg30DayPrice, 2), 0);
  const stdDev = Math.sqrt(varianceSum / data.length);
  const volatilityPercent = Number(((stdDev / avg30DayPrice) * 100).toFixed(1));

  let volatilityLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (volatilityPercent > 5) volatilityLevel = 'High';
  else if (volatilityPercent >= 2.5) volatilityLevel = 'Moderate';

  return {
    data,
    stats: {
      startPrice,
      endPrice,
      netChange,
      netChangePercent,
      minPrice: minRecorded,
      minPriceDate: minRecordedDate,
      maxPrice: maxRecorded,
      maxPriceDate: maxRecordedDate,
      avg30DayPrice,
      volatilityPercent,
      volatilityLevel,
      totalObservations: totalVolume,
    },
  };
}

/**
 * Returns generic timeframe data points (7d, 30d, 90d, today)
 */
export function getTimeframeData(product: Product, timeframe: 'today' | '7d' | '30d' | '3m') {
  const thirtyDay = generate30DayPriceHistory(product);
  
  if (timeframe === '30d') {
    return thirtyDay.data;
  }

  if (timeframe === '7d') {
    return thirtyDay.data.slice(-7);
  }

  if (timeframe === 'today') {
    // 6 intraday hourly points
    const times = ['06:00 AM', '09:00 AM', '12:00 PM', '02:30 PM', '04:45 PM', '06:30 PM'];
    const current = product.currentAvgPrice;
    return times.map((t, idx) => {
      const offset = (idx - 3) * (current * 0.004);
      const price = Math.round(current + offset);
      return {
        day: idx + 1,
        date: t,
        shortDate: t,
        fullDate: `Today at ${t}`,
        avgPrice: price,
        minPrice: Math.round(price * 0.985),
        maxPrice: Math.round(price * 1.015),
        volume: 4 + (idx % 3),
        confidence: 94,
      };
    });
  }

  if (timeframe === '3m') {
    // Sample every 3rd day or 12 weekly points
    const weeks: DailyPriceDataPoint[] = [];
    const base = product.currentAvgPrice * 0.92;
    for (let w = 12; w >= 1; w--) {
      const d = new Date();
      d.setDate(d.getDate() - w * 7);
      const price = Math.round(base + (product.currentAvgPrice - base) * ((13 - w) / 12));
      weeks.push({
        day: 13 - w,
        date: `Wk ${13 - w}`,
        shortDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: `Week of ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        avgPrice: price,
        minPrice: Math.round(price * 0.96),
        maxPrice: Math.round(price * 1.04),
        volume: 24,
        confidence: 95,
      });
    }
    return weeks;
  }

  return thirtyDay.data;
}
