'use client'

/**
 * Stock Line Chart Component
 *
 * Adapted from the production chart component — UI/behavior structure is
 * unchanged (price area chart, volume histogram, MA20, insider trade
 * markers, hover tooltip). The data source is now plain props fed by a
 * mock fixture instead of a live RPC-backed data layer.
 */

import { useEffect, useRef, useState } from 'react'
import { createChart, LineStyle, ColorType } from 'lightweight-charts'
import type { IChartApi } from 'lightweight-charts'
import type { StockHistoryPoint, InsiderTrade } from '@radar/shared/types/insider-trade'
import { getInsiderMarkerSize } from '@radar/shared/utils/insider-trade'

interface StockLineChartProps {
  history: StockHistoryPoint[]
  insiderTrades?: InsiderTrade[]
  height?: number
  onTradeHover?: (trade: InsiderTrade | null) => void
  onOHLCHover?: (ohlc: StockHistoryPoint | null) => void
  currentPrice?: number | null
}

export function StockLineChart({
  history,
  insiderTrades = [],
  height = 320,
  onTradeHover,
  onOHLCHover,
  currentPrice,
}: StockLineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const allAggregatedTradesRef = useRef<Map<string, InsiderTrade[]>>(new Map())
  const onTradeHoverRef = useRef(onTradeHover)
  onTradeHoverRef.current = onTradeHover
  const onOHLCHoverRef = useRef(onOHLCHover)
  onOHLCHoverRef.current = onOHLCHover
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!chartContainerRef.current || history.length === 0) return

    const isMobile = chartContainerRef.current.clientWidth < 640
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
        fontSize: isMobile ? 10 : 11,
      },
      grid: {
        vertLines: { color: 'rgba(51,65,85,0.12)' },
        horzLines: { color: 'rgba(51,65,85,0.12)' },
      },
      crosshair: { mode: 1 },
      timeScale: {
        borderColor: 'rgba(51,65,85,0.3)',
        timeVisible: false,
        rightOffset: 0,
        fixLeftEdge: true,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
      },
      handleScroll: false,
      handleScale: false,
      rightPriceScale: {
        borderColor: 'rgba(51,65,85,0.3)',
        autoScale: true,
        scaleMargins: { top: isMobile ? 0.1 : 0.01, bottom: 0.12 },
      },
      watermark: { visible: false },
    })
    chartRef.current = chart

    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
    const closePriceByDate = new Map(sorted.map((p) => [p.date, p.close]))

    const priceData = sorted.map((p) => ({ time: p.date, value: p.close }))
    const volumeData = sorted.map((p) => ({ time: p.date, value: p.volume, color: 'rgba(59,130,246,0.6)' }))

    const areaSeries = (chart as any).addAreaSeries({
      topColor: 'rgba(59,130,246,0.25)',
      bottomColor: 'rgba(59,130,246,0.01)',
      lineColor: '#3b82f6',
      lineWidth: 2,
      priceScaleId: 'right',
    })
    areaSeries.setData(priceData)

    if (currentPrice != null) {
      areaSeries.createPriceLine({
        price: currentPrice,
        color: 'rgba(59,130,246,0.7)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '',
      })
    }

    areaSeries.priceScale().applyOptions({
      scaleMargins: { top: isMobile ? 0.1 : 0.01, bottom: 0.12 },
    })

    const volumeSeries = (chart as any).addHistogramSeries({
      color: 'rgba(59,130,246,0.6)',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })
    volumeSeries.setData(volumeData)
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.88, bottom: 0 } })

    if (history.length >= 20) {
      const ma20Data = calculateMA(priceData, 20)
      const ma20Series = (chart as any).addLineSeries({
        color: 'rgba(245,158,11,0.5)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
      })
      ma20Series.setData(ma20Data)
    }

    if (insiderTrades.length > 0) {
      allAggregatedTradesRef.current = new Map()

      const aggregate = (trades: InsiderTrade[]) => {
        const byDate = new Map<string, InsiderTrade[]>()
        trades.forEach((t) => {
          const arr = byDate.get(t.date) || []
          arr.push(t)
          byDate.set(t.date, arr)
        })
        return Array.from(byDate.entries()).map(([date, dayTrades]) => {
          allAggregatedTradesRef.current.set(date, dayTrades)
          const totalValue = dayTrades.reduce((s, t) => s + t.totalValue, 0)
          const highest = dayTrades.reduce((h, t) => (t.isTenPercentOwner || t.isDirector || t.isOfficer ? t : h), dayTrades[0]!)
          return { date, totalValue, markerSize: getInsiderMarkerSize(highest) }
        })
      }

      const buyTrades = insiderTrades.filter((t) => t.type === 'Buy')
      const sellTrades = insiderTrades.filter((t) => t.type === 'Sell')

      if (buyTrades.length > 0) {
        const aggBuys = aggregate(buyTrades)
        const buyData = aggBuys.map((t) => ({ time: t.date, value: closePriceByDate.get(t.date) ?? 0 }))
        const buyMarkers = aggBuys.map((t) => ({
          time: t.date, position: 'inBar' as any, color: '#22c55e', shape: 'arrowUp' as const, size: t.markerSize,
        }))
        const buySeries = (chart as any).addLineSeries({ color: 'transparent', lineWidth: 0 })
        buySeries.setData(buyData)
        buySeries.setMarkers(buyMarkers)
      }

      if (sellTrades.length > 0) {
        const aggSells = aggregate(sellTrades)
        const sellData = aggSells.map((t) => ({ time: t.date, value: closePriceByDate.get(t.date) ?? 0 }))
        const sellMarkers = aggSells.map((t) => ({
          time: t.date, position: 'inBar' as any, color: '#ef4444', shape: 'arrowDown' as const, size: t.markerSize,
        }))
        const sellSeries = (chart as any).addLineSeries({ color: 'transparent', lineWidth: 0 })
        sellSeries.setData(sellData)
        sellSeries.setMarkers(sellMarkers)
      }
    }

    if (sorted.length > 0) {
      chart.timeScale().setVisibleLogicalRange({ from: -0.5, to: sorted.length - 0.5 })
    } else {
      chart.timeScale().fitContent()
    }

    setIsReady(true)

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        onOHLCHoverRef.current?.(null)
        onTradeHoverRef.current?.(null)
        return
      }
      const dateStr = param.time as string
      const dayTrades = allAggregatedTradesRef.current.get(dateStr)
      onTradeHoverRef.current?.(dayTrades?.[0] ?? null)
    })

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chartContainerRef.current) return
      const { width } = entries[0]!.contentRect
      chart.applyOptions({ width })
      if (sorted.length > 0) {
        chart.timeScale().setVisibleLogicalRange({ from: -0.5, to: sorted.length - 0.5 })
      }
    })
    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartRef.current = null
    }
  }, [history, insiderTrades, height, currentPrice])

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700" style={{ height }}>
        <p className="text-gray-400">No price data available</p>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden" style={{ height }} />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50" style={{ height }}>
          <div className="text-gray-400">Loading chart...</div>
        </div>
      )}
    </div>
  )
}

function calculateMA(data: Array<{ time: string; value: number }>, period: number) {
  const result: Array<{ time: string; value: number }> = []
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0
    for (let j = 0; j < period; j++) sum += data[i - j]!.value
    result.push({ time: data[i]!.time, value: sum / period })
  }
  return result
}
