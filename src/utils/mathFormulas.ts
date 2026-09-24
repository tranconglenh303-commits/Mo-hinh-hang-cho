import { KendallModelType } from '../types/queue';

export function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function calculateMM1(lambda: number, mu: number) {
  const rho = lambda / mu;
  const isStable = rho < 1;

  if (!isStable) {
    return {
      rho,
      isStable: false,
      P0: 0,
      L: Infinity,
      Lq: Infinity,
      W: Infinity,
      Wq: Infinity,
    };
  }

  const P0 = 1 - rho;
  const L = rho / (1 - rho);
  const Lq = (rho * rho) / (1 - rho);
  const W = 1 / (mu - lambda);
  const Wq = lambda / (mu * (mu - lambda));

  return { rho, isStable: true, P0, L, Lq, W, Wq };
}

export function calculateMMC(lambda: number, mu: number, c: number) {
  const rho = lambda / (c * mu);
  const isStable = rho < 1;
  const a = lambda / mu;

  if (!isStable) {
    return {
      rho,
      isStable: false,
      P0: 0,
      L: Infinity,
      Lq: Infinity,
      W: Infinity,
      Wq: Infinity,
      Pwait: 1,
    };
  }

  let sum = 0;
  for (let n = 0; n < c; n++) {
    sum += Math.pow(a, n) / factorial(n);
  }
  const lastTerm = Math.pow(a, c) / (factorial(c) * (1 - rho));
  const P0 = 1 / (sum + lastTerm);

  const Pwait = (Math.pow(a, c) / (factorial(c) * (1 - rho))) * P0;
  const Lq = (Pwait * rho) / (1 - rho);
  const Wq = Lq / lambda;
  const W = Wq + 1 / mu;
  const L = lambda * W;

  return { rho, isStable: true, P0, L, Lq, W, Wq, Pwait };
}

export function calculateMM1K(lambda: number, mu: number, K: number) {
  const rho = lambda / mu;
  let P0: number;
  let PK: number;

  if (Math.abs(rho - 1) < 0.0001) {
    P0 = 1 / (K + 1);
    PK = 1 / (K + 1);
  } else {
    P0 = (1 - rho) / (1 - Math.pow(rho, K + 1));
    PK = (Math.pow(rho, K) * (1 - rho)) / (1 - Math.pow(rho, K + 1));
  }

  const lambdaEff = lambda * (1 - PK);

  let L = 0;
  if (Math.abs(rho - 1) < 0.0001) {
    L = K / 2;
  } else {
    L = (rho / (1 - rho)) - (((K + 1) * Math.pow(rho, K + 1)) / (1 - Math.pow(rho, K + 1)));
  }

  const W = L / lambdaEff;
  const Wq = W - 1 / mu;
  const Lq = lambdaEff * Wq;

  return { rho, isStable: true, P0, PK, lambdaEff, L, Lq, W, Wq };
}

export function calculateMG1(lambda: number, mu: number, sigma: number) {
  const rho = lambda / mu;
  const isStable = rho < 1;

  if (!isStable) {
    return {
      rho,
      isStable: false,
      P0: 0,
      L: Infinity,
      Lq: Infinity,
      W: Infinity,
      Wq: Infinity,
    };
  }

  const P0 = 1 - rho;
  const varS = sigma * sigma;
  const Lq = (Math.pow(lambda, 2) * varS + Math.pow(rho, 2)) / (2 * (1 - rho));
  const Wq = Lq / lambda;
  const W = Wq + 1 / mu;
  const L = lambda * W;

  return { rho, isStable: true, P0, L, Lq, W, Wq };
}

export interface CalculationStep {
  stepNumber: number;
  stageName: string;
  description: string;
  latexFormula: string;
  numericalResult: string;
  explanation: string;
}

export function getStepByStepCalculation(
  model: KendallModelType,
  lambda: number,
  mu: number,
  c: number = 1,
  K: number = 10,
  sigma: number = 0.05
): CalculationStep[] {
  if (model === 'M/M/1') {
    const res = calculateMM1(lambda, mu);
    return [
      {
        stepNumber: 1,
        stageName: 'Giai đoạn 1: Tính Hệ số sử dụng kênh (Traffic Intensity)',
        description: 'Đánh giá tỷ lệ giữa tốc độ khách đến và năng lực phục vụ của 1 quầy.',
        latexFormula: '\\rho = \\frac{\\lambda}{\\mu}',
        numericalResult: `\\rho = \\frac{${lambda}}{${mu}} = ${res.rho.toFixed(3)} \\quad (${(res.rho * 100).toFixed(1)}\\%)`,
        explanation: res.isStable
          ? 'Vì ρ < 1 (100%), hệ thống đạt trạng thái cân bằng dừng (Steady-State).'
          : 'CẢNH BÁO: Vì ρ ≥ 1, tốc độ đến lớn hơn tốc độ phục vụ, hàng chờ sẽ bùng nổ vô hạn!',
      },
      {
        stepNumber: 2,
        stageName: 'Giai đoạn 2: Tính Xác suất quầy rảnh rỗi (Idle Probability)',
        description: 'Xác suất tại thời điểm ngẫu nhiên không có bất kỳ khách hàng nào trong hệ thống.',
        latexFormula: 'P_0 = 1 - \\rho',
        numericalResult: `P_0 = 1 - ${res.rho.toFixed(3)} = ${res.P0.toFixed(3)} \\quad (${(res.P0 * 100).toFixed(1)}\\%)`,
        explanation: `Quầy phục vụ sẽ rảnh ${(res.P0 * 100).toFixed(1)}% thời gian và bận rộn ${(res.rho * 100).toFixed(1)}% thời gian.`,
      },
      {
        stepNumber: 3,
        stageName: 'Giai đoạn 3: Tính Số lượng khách trung bình (Lq và L)',
        description: 'Độ dài hàng chờ và tổng số khách có mặt trong hệ thống.',
        latexFormula: 'L_q = \\frac{\\rho^2}{1 - \\rho}, \\quad L = \\frac{\\rho}{1 - \\rho}',
        numericalResult: `L_q = ${res.Lq.toFixed(3)} \\text{ khách}, \\quad L = ${res.L.toFixed(3)} \\text{ khách}`,
        explanation: `Trung bình có ${res.Lq.toFixed(2)} khách đứng xếp hàng chờ và ${res.L.toFixed(2)} khách trong toàn bộ hệ thống.`,
      },
      {
        stepNumber: 4,
        stageName: "Giai đoạn 4: Tính Thời gian chờ trung bình (Định luật Little)",
        description: 'Thời gian một khách hàng phải chờ trong hàng và tổng thời gian lưu lại.',
        latexFormula: 'W_q = \\frac{L_q}{\\lambda} = \\frac{\\rho}{\\mu (1 - \\rho)}, \\quad W = W_q + \\frac{1}{\\mu}',
        numericalResult: `W_q = ${res.Wq.toFixed(3)} \\text{ đv thời gian}, \\quad W = ${res.W.toFixed(3)} \\text{ đv thời gian}`,
        explanation: `Khách chờ trung bình ${(res.Wq * 60).toFixed(1)} phút trong hàng và ở lại tổng cộng ${(res.W * 60).toFixed(1)} phút.`,
      },
    ];
  } else if (model === 'M/M/c') {
    const res = calculateMMC(lambda, mu, c);
    return [
      {
        stepNumber: 1,
        stageName: 'Giai đoạn 1: Tính Hệ số sử dụng trung bình mỗi quầy',
        description: `Tỷ lệ tải chia đều cho ${c} quầy phục vụ song song.`,
        latexFormula: '\\rho = \\frac{\\lambda}{c \\cdot \\mu}',
        numericalResult: `\\rho = \\frac{${lambda}}{${c} \\times ${mu}} = ${res.rho.toFixed(3)} \\quad (${(res.rho * 100).toFixed(1)}\\%)`,
        explanation: res.isStable ? 'Hệ thống cân bằng an toàn.' : 'Quá tải: Tất cả các quầy đều nghẽn!',
      },
      {
        stepNumber: 2,
        stageName: 'Giai đoạn 2: Tính Xác suất không có khách (P0)',
        description: 'Tổng xác suất trạng thái dừng cho hệ thống đa kênh.',
        latexFormula: 'P_0 = \\left[ \\sum_{n=0}^{c-1} \\frac{(\\lambda/\\mu)^n}{n!} + \\frac{(\\lambda/\\mu)^c}{c!(1 - \\rho)} \\right]^{-1}',
        numericalResult: `P_0 = ${res.P0.toFixed(4)} \\quad (${(res.P0 * 100).toFixed(2)}\\%)`,
        explanation: `Xác suất cả ${c} quầy cùng rảnh rỗi là ${(res.P0 * 100).toFixed(1)}%.`,
      },
      {
        stepNumber: 3,
        stageName: 'Giai đoạn 3: Công thức Erlang C (Xác suất phải chờ)',
        description: 'Xác suất một khách hàng đến thấy tất cả các quầy đều đang bận.',
        latexFormula: 'C(c, a) = P(W_q > 0) = \\frac{\\frac{(\\lambda/\\mu)^c}{c!(1 - \\rho)} P_0}{1}',
        numericalResult: `P(W_q > 0) = ${res.Pwait.toFixed(4)} \\quad (${(res.Pwait * 100).toFixed(1)}\\%)`,
        explanation: `Có ${(res.Pwait * 100).toFixed(1)}% khách hàng khi đến sẽ phải vào hàng chờ đợi.`,
      },
      {
        stepNumber: 4,
        stageName: 'Giai đoạn 4: Tính Thời gian và Số lượng khách',
        description: 'Áp dụng công thức Erlang C và Định luật Little.',
        latexFormula: 'L_q = \\frac{P(W_q > 0) \\cdot \\rho}{1 - \\rho}, \\quad W_q = \\frac{L_q}{\\lambda}, \\quad W = W_q + \\frac{1}{\\mu}',
        numericalResult: `L_q = ${res.Lq.toFixed(3)}, \\quad W_q = ${res.Wq.toFixed(3)}, \\quad L = ${res.L.toFixed(3)}, \\quad W = ${res.W.toFixed(3)}`,
        explanation: `Mô hình ${c} quầy giúp giảm mạnh thời gian chờ xuống còn ${(res.Wq * 60).toFixed(1)} phút.`,
      },
    ];
  } else if (model === 'M/M/1/K') {
    const res = calculateMM1K(lambda, mu, K);
    return [
      {
        stepNumber: 1,
        stageName: 'Giai đoạn 1: Xác suất hệ thống đầy dung lượng (Xác suất mất khách PK)',
        description: `Khi có K = ${K} khách (1 đang phục vụ + ${K - 1} đang chờ), khách mới đến sẽ bị từ chối.`,
        latexFormula: 'P_K = \\frac{\\rho^K (1 - \\rho)}{1 - \\rho^{K+1}}',
        numericalResult: `P_K = ${res.PK.toFixed(4)} \\quad (${(res.PK * 100).toFixed(2)}\\%)`,
        explanation: `Tỷ lệ khách bị từ chối (Drop/Balk rate) là ${(res.PK * 100).toFixed(2)}%.`,
      },
      {
        stepNumber: 2,
        stageName: 'Giai đoạn 2: Tính Tốc độ đến hiệu dụng (Effective Arrival Rate)',
        description: 'Chỉ những khách được nhận vào hệ thống mới tạo ra tải thực tế.',
        latexFormula: '\\lambda_{\\text{eff}} = \\lambda (1 - P_K)',
        numericalResult: `\\lambda_{\\text{eff}} = ${lambda} \\times (1 - ${res.PK.toFixed(3)}) = ${res.lambdaEff.toFixed(3)} \\text{ khách/giờ}`,
        explanation: 'Nhờ có giới hạn K, hệ thống không bao giờ bị nổ vô hạn ngay cả khi λ > μ.',
      },
      {
        stepNumber: 3,
        stageName: 'Giai đoạn 3: Tính Số lượng khách và Thời gian lưu thông thực tế',
        description: 'Áp dụng Định luật Little với tốc độ hiệu dụng λ_eff.',
        latexFormula: 'W = \\frac{L}{\\lambda_{\\text{eff}}}, \\quad W_q = W - \\frac{1}{\\mu}, \\quad L_q = \\lambda_{\\text{eff}} W_q',
        numericalResult: `L = ${res.L.toFixed(2)}, \\quad L_q = ${res.Lq.toFixed(2)}, \\quad W_q = ${res.Wq.toFixed(3)}`,
        explanation: `Hàng chờ tối đa không bao giờ vượt quá ${K - 1} khách.`,
      },
    ];
  } else {
    const res = calculateMG1(lambda, mu, sigma);
    return [
      {
        stepNumber: 1,
        stageName: 'Giai đoạn 1: Tính Hệ số sử dụng và Phương sai phục vụ',
        description: 'Mô hình M/G/1 với thời gian phục vụ có độ lệch chuẩn σ.',
        latexFormula: '\\rho = \\frac{\\lambda}{\\mu}, \\quad \\sigma^2 = \\text{Var}(S)',
        numericalResult: `\\rho = ${res.rho.toFixed(3)}, \\quad \\sigma^2 = ${(sigma * sigma).toFixed(5)}`,
        explanation: sigma === 0 ? 'Khi σ = 0: Trở thành mô hình M/D/1 (thời gian cố định tuyệt đối).' : 'Thời gian phục vụ có tính dao động ngẫu nhiên.',
      },
      {
        stepNumber: 2,
        stageName: 'Giai đoạn 2: Công thức Pollaczek-Khinchine (P-K Formula)',
        description: 'Công thức toán học kinh điển cho hàng chờ M/G/1.',
        latexFormula: 'L_q = \\frac{\\lambda^2 \\sigma^2 + \\rho^2}{2(1 - \\rho)}',
        numericalResult: `L_q = \\frac{${lambda}^2 \\times ${(sigma * sigma).toFixed(5)} + ${res.rho.toFixed(3)}^2}{2(1 - ${res.rho.toFixed(3)})} = ${res.Lq.toFixed(3)}`,
        explanation: 'Chứng minh: Giảm độ biến động σ sẽ lập tức làm giảm độ dài hàng chờ Lq!',
      },
      {
        stepNumber: 3,
        stageName: 'Giai đoạn 3: Thời gian chờ trung bình Wq và W',
        description: 'Định luật Little cho hệ thống M/G/1.',
        latexFormula: 'W_q = \\frac{L_q}{\\lambda}, \\quad W = W_q + \\frac{1}{\\mu}',
        numericalResult: `W_q = ${res.Wq.toFixed(3)}, \\quad W = ${res.W.toFixed(3)}`,
        explanation: `Thời gian chờ trong hàng trung bình là ${(res.Wq * 60).toFixed(1)} phút.`,
      },
    ];
  }
}

export function calculateOptimalServers(
  lambda: number,
  mu: number,
  costService: number,
  costWaiting: number,
  maxServers: number = 8
) {
  const minServers = Math.max(1, Math.ceil(lambda / mu));
  const results = [];

  for (let c = minServers; c <= maxServers; c++) {
    const metrics = calculateMMC(lambda, mu, c);
    if (!metrics.isStable) continue;

    const costS = costService * c;
    const costW = costWaiting * metrics.L;
    const totalCost = costS + costW;

    results.push({
      servers: c,
      utilization: metrics.rho,
      L: metrics.L,
      Lq: metrics.Lq,
      W: metrics.W,
      Wq: metrics.Wq,
      costService: costS,
      costWaiting: costW,
      totalCost,
      isOptimal: false,
    });
  }

  if (results.length > 0) {
    let minCost = Infinity;
    let minIdx = 0;
    results.forEach((r, idx) => {
      if (r.totalCost < minCost) {
        minCost = r.totalCost;
        minIdx = idx;
      }
    });
    results[minIdx].isOptimal = true;
  }

  return results;
}
