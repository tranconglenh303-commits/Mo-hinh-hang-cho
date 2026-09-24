import React, { useState, useMemo } from 'react';
import { Star, TrendingDown, DollarSign } from 'lucide-react';

export interface CostDataPoint {
  c: number;
  serviceCost: number; // e.g. 300000
  waitingCost: number; // e.g. 902000
  totalCost: number;   // e.g. 1202000
  utilization: number; // e.g. 0.833
  Lq: number;          // e.g. 3.51
  Wq: number;          // in minutes or hours
  isOptimal: boolean;
}

interface CostMultiLineChartProps {
  data: CostDataPoint[];
  activeServer?: number;
  onSelectServer?: (c: number) => void;
}

export const CostMultiLineChart: React.FC<CostMultiLineChartProps> = ({
  data,
  activeServer,
  onSelectServer,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<CostDataPoint | null>(null);

  // Chart dimensions in SVG coordinates
  const svgWidth = 720;
  const svgHeight = 360;
  const padding = { top: 40, right: 40, bottom: 50, left: 85 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Find min and max for scaling
  const { minCost, maxCost, minC, maxC, optimalPoint } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minCost: 0, maxCost: 1500000, minC: 3, maxC: 8, optimalPoint: null };
    }
    const allCosts = data.flatMap((d) => [d.serviceCost, d.waitingCost, d.totalCost]);
    const maxVal = Math.max(...allCosts);
    const roundedMax = Math.ceil(maxVal / 300000) * 300000 || 1500000;
    const optimal = data.find((d) => d.isOptimal) || data[1] || data[0];

    return {
      minCost: 0,
      maxCost: Math.max(roundedMax, 1300000),
      minC: data[0].c,
      maxC: data[data.length - 1].c,
      optimalPoint: optimal,
    };
  }, [data]);

  // Coordinate mappers
  const getX = (c: number) => {
    if (maxC === minC) return padding.left + innerWidth / 2;
    return padding.left + ((c - minC) / (maxC - minC)) * innerWidth;
  };

  const getY = (val: number) => {
    return padding.top + innerHeight - ((val - minCost) / (maxCost - minCost)) * innerHeight;
  };

  // Generate SVG path for a line
  const makeLinePath = (getValue: (d: CostDataPoint) => number) => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => {
        const x = getX(d.c);
        const y = getY(getValue(d));
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Generate smooth curve for Total Cost & Waiting Cost
  const makeSmoothPath = (getValue: (d: CostDataPoint) => number) => {
    if (data.length === 0) return '';
    if (data.length === 1) return `M ${getX(data[0].c)} ${getY(getValue(data[0]))}`;

    const points = data.map((d) => ({ x: getX(d.c), y: getY(getValue(d)) }));
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + ' đ/h';
  };

  const yTicks = useMemo(() => {
    const ticksCount = 5;
    const step = maxCost / ticksCount;
    return Array.from({ length: ticksCount + 1 }, (_, i) => Math.round(i * step));
  }, [maxCost]);

  const currentHover = hoveredPoint || (activeServer ? data.find((d) => d.c === activeServer) : null) || optimalPoint;

  return (
    <div className="relative w-full select-none">
      {/* Chart Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          {/* Service Cost */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded bg-[#9C27B0] inline-block shadow-sm shadow-purple-500/50" />
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#9C27B0] bg-slate-950 inline-block -ml-3" />
            <span className="text-slate-300 font-medium">Chi phí dịch vụ (Cs · c)</span>
          </div>

          {/* Waiting Cost */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded bg-[#FF9800] inline-block shadow-sm shadow-amber-500/50" />
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#FF9800] bg-slate-950 inline-block -ml-3" />
            <span className="text-slate-300 font-medium">Chi phí chờ đợi (Cw · L)</span>
          </div>

          {/* Total Cost */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 rounded bg-[#00BCD4] inline-block shadow-sm shadow-cyan-400/60" />
            <span className="w-3 h-3 rounded-full border-2 border-[#00BCD4] bg-cyan-400 inline-block -ml-3.5 shadow-sm shadow-cyan-400/50" />
            <span className="text-cyan-300 font-bold">Tổng chi phí (TC)</span>
          </div>
        </div>

        {optimalPoint && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
            <Star className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Điểm tối ưu: c = {optimalPoint.c} ({formatVND(optimalPoint.totalCost)})</span>
          </div>
        )}
      </div>

      {/* SVG Multi-Line Chart Canvas */}
      <div className="relative bg-slate-950/90 rounded-xl border border-slate-800/80 p-2 sm:p-4 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          style={{ maxHeight: '420px' }}
        >
          <defs>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="markerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="totalCostFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00BCD4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#00BCD4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeOpacity="0.35"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 12}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="11"
                  fontFamily="'JetBrains Mono', monospace"
                  textAnchor="end"
                >
                  {tick === 0 ? '0 đ' : `${(tick / 1000).toLocaleString('vi-VN')}.000 đ`}
                </text>
              </g>
            );
          })}

          {/* Y Axis line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={svgHeight - padding.bottom}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* X Axis line */}
          <line
            x1={padding.left}
            y1={svgHeight - padding.bottom}
            x2={svgWidth - padding.right}
            y2={svgHeight - padding.bottom}
            stroke="#475569"
            strokeWidth="1.5"
          />

          {/* Y-Axis Label */}
          <text
            x={-(svgHeight / 2)}
            y={22}
            transform="rotate(-90)"
            fill="#94a3b8"
            fontSize="11"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="500"
            textAnchor="middle"
          >
            Chi phí (VNĐ / giờ)
          </text>

          {/* X-Axis labels & Ticks */}
          {data.map((d) => {
            const x = getX(d.c);
            const y = svgHeight - padding.bottom;
            const isHover = currentHover?.c === d.c;
            const isOptimal = d.isOptimal;

            return (
              <g key={d.c}>
                <line x1={x} y1={y} x2={x} y2={y + 6} stroke="#475569" strokeWidth="1.5" />
                <text
                  x={x}
                  y={y + 22}
                  fill={isOptimal ? '#34d399' : isHover ? '#38bdf8' : '#94a3b8'}
                  fontSize={isOptimal || isHover ? '13' : '12'}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={isOptimal || isHover ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  c = {d.c}
                </text>
                {isOptimal && (
                  <text
                    x={x}
                    y={y + 36}
                    fill="#10b981"
                    fontSize="9"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ★ TỐI ƯU
                  </text>
                )}
              </g>
            );
          })}

          {/* X-Axis Label */}
          <text
            x={padding.left + innerWidth / 2}
            y={svgHeight - 6}
            fill="#94a3b8"
            fontSize="12"
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontWeight="500"
            textAnchor="middle"
          >
            Số lượng quầy phục vụ (c)
          </text>

          {/* Vertical guideline for active/hovered point */}
          {currentHover && (
            <g>
              <line
                x1={getX(currentHover.c)}
                y1={padding.top}
                x2={getX(currentHover.c)}
                y2={svgHeight - padding.bottom}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.6"
              />
              <circle
                cx={getX(currentHover.c)}
                y={svgHeight - padding.bottom}
                r="3"
                fill="#38bdf8"
              />
            </g>
          )}

          {/* 1. LINE 1: Service Cost (Purple #9C27B0) */}
          <path
            d={makeLinePath((d) => d.serviceCost)}
            fill="none"
            stroke="#9C27B0"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 2. LINE 2: Waiting Cost (Orange #FF9800) */}
          <path
            d={makeSmoothPath((d) => d.waitingCost)}
            fill="none"
            stroke="#FF9800"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 3. LINE 3: Total Cost (Cyan #00BCD4) */}
          <path
            d={makeSmoothPath((d) => d.totalCost)}
            fill="none"
            stroke="#00BCD4"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cyanGlow)"
          />

          {/* Area fill under Total Cost curve */}
          {data.length > 1 && (
            <path
              d={`${makeSmoothPath((d) => d.totalCost)} L ${getX(data[data.length - 1].c)} ${svgHeight - padding.bottom} L ${getX(data[0].c)} ${svgHeight - padding.bottom} Z`}
              fill="url(#totalCostFill)"
            />
          )}

          {/* Circles for Service Cost */}
          {data.map((d) => {
            const x = getX(d.c);
            const y = getY(d.serviceCost);
            const isHover = currentHover?.c === d.c;
            return (
              <circle
                key={`sc-${d.c}`}
                cx={x}
                cy={y}
                r={isHover ? 5.5 : 3.5}
                fill="#0f172a"
                stroke="#9C27B0"
                strokeWidth={isHover ? 3 : 2}
                className="transition-all duration-150"
              />
            );
          })}

          {/* Circles for Waiting Cost */}
          {data.map((d) => {
            const x = getX(d.c);
            const y = getY(d.waitingCost);
            const isHover = currentHover?.c === d.c;
            return (
              <circle
                key={`wc-${d.c}`}
                cx={x}
                cy={y}
                r={isHover ? 5.5 : 3.5}
                fill="#0f172a"
                stroke="#FF9800"
                strokeWidth={isHover ? 3 : 2}
                className="transition-all duration-150"
              />
            );
          })}

          {/* Circles for Total Cost */}
          {data.map((d) => {
            const x = getX(d.c);
            const y = getY(d.totalCost);
            const isHover = currentHover?.c === d.c;
            const isOpt = d.isOptimal;

            return (
              <g key={`tc-${d.c}`}>
                {isOpt && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="#10b981"
                    fillOpacity="0.25"
                    filter="url(#markerGlow)"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isHover ? 6.5 : isOpt ? 5.5 : 4}
                  fill={isOpt ? '#10b981' : '#00BCD4'}
                  stroke="#ffffff"
                  strokeWidth={isOpt ? 2.5 : 2}
                  className="transition-all duration-150 cursor-pointer"
                />
              </g>
            );
          })}

          {/* SPECIAL VISUAL ANCHOR BADGE AT SWEET SPOT */}
          {optimalPoint && (
            <g
              transform={`translate(${getX(optimalPoint.c)}, ${getY(optimalPoint.totalCost) - 22})`}
              className="pointer-events-none"
            >
              <line x1="0" y1="12" x2="0" y2="20" stroke="#10b981" strokeWidth="1.5" />
              <rect
                x="-64"
                y="-14"
                width="128"
                height="24"
                rx="6"
                fill="#064e3b"
                stroke="#34d399"
                strokeWidth="1.5"
                filter="url(#markerGlow)"
              />
              <text
                x="0"
                y="2"
                fill="#ecfdf5"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                ★ TỐI ƯU: {formatVND(optimalPoint.totalCost).replace(' đ/h', 'k')}
              </text>
            </g>
          )}

          {/* Interactive invisible hover rectangles */}
          {data.map((d) => {
            const x = getX(d.c);
            const colWidth = innerWidth / (data.length || 1);
            return (
              <rect
                key={`hover-${d.c}`}
                x={x - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => onSelectServer && onSelectServer(d.c)}
              />
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {currentHover && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-800 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="font-mono font-bold text-sm text-white">
                  Quầy phục vụ: c = {currentHover.c}
                </span>
                {currentHover.isOptimal && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                    ★ ĐIỂM TỐI ƯU NHẤT (SWEET SPOT)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>Tải: <strong className="text-cyan-300">{(currentHover.utilization * 100).toFixed(1)}%</strong></span>
                <span>·</span>
                <span>Lq: <strong className="text-purple-300">{currentHover.Lq.toFixed(2)} khách</strong></span>
                <span>·</span>
                <span>Wq: <strong className="text-amber-300">{(currentHover.Wq * 60).toFixed(1)} phút</strong></span>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-purple-300">
                  <span className="w-2 h-2 rounded bg-[#9C27B0]" />
                  <span>Chi phí Dịch vụ (Cs · c):</span>
                </div>
                <strong className="text-purple-200">{formatVND(currentHover.serviceCost)}</strong>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-2 h-2 rounded bg-[#FF9800]" />
                  <span>Chi phí Chờ đợi (Cw · L):</span>
                </div>
                <strong className="text-amber-200">{formatVND(currentHover.waitingCost)}</strong>
              </div>

              <div className={`p-2 rounded-lg bg-slate-950 border flex items-center justify-between ${
                currentHover.isOptimal ? 'border-emerald-500/80 ring-1 ring-emerald-500/40' : 'border-cyan-500/30'
              }`}>
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <span className="w-2 h-2 rounded bg-[#00BCD4]" />
                  <span>Tổng chi phí (TC):</span>
                </div>
                <strong className={currentHover.isOptimal ? 'text-emerald-300 text-sm' : 'text-cyan-200'}>
                  {formatVND(currentHover.totalCost)}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analytical Insight */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-400">
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center gap-1 text-purple-400 font-semibold mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Đường 1: Chi phí Dịch vụ</span>
          </div>
          <span>Tuyến tính tăng dần theo số quầy: mở thêm 1 quầy tốn thêm cố định chi phí lương và mặt bằng.</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center gap-1 text-amber-400 font-semibold mb-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Đường 2: Chi phí Chờ đợi</span>
          </div>
          <span>Đường cong giảm dốc đứng khi c tăng từ 3 lên 4 do hiệu ứng giải tỏa tắc nghẽn hàng chờ.</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center gap-1 text-cyan-400 font-semibold mb-1">
            <Star className="w-3.5 h-3.5" />
            <span>Đường 3: Tổng Chi Phí (U-Shape)</span>
          </div>
          <span>Hợp lực của 2 lực lượng ngược chiều tạo thành đáy chữ U tại <strong>c = 4 quầy</strong>.</span>
        </div>
      </div>
    </div>
  );
};
