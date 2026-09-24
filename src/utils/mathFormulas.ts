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

export function calculateMD1(lambda: number, mu: number) {
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
  // M/D/1: sigma = 0 in Pollaczek-Khinchine formula => Lq = rho^2 / (2 * (1 - rho))
  const Lq = (rho * rho) / (2 * (1 - rho));
  const Wq = Lq / lambda;
  const W = Wq + 1 / mu;
  const L = lambda * W;

  return { rho, isStable: true, P0, L, Lq, W, Wq };
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
  k: number = 2,
  sigma: number = 0.05
): CalculationStep[] {
  if (model === 'M/M/1') {
    const res = calculateMM1(lambda, mu);
    return [
      {
        stepNumber: 1,
        stageName: 'Giai đoạn 1: Tính Hệ số sử dụng kênh (Traffic Intensity)',
        description: 'Mô hình M/M/1 (Lượt đến Poisson, thời gian phục vụ Mũ, 1 server). Đánh giá tỷ lệ giữa tốc độ khách đến và năng lực phục vụ.',
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
        explanation: `Server phục vụ sẽ rảnh ${(res.P0 * 100).toFixed(1)}% thời gian và bận rộn ${(res.rho * 100).toFixed(1)}% thời gian.`,
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
  } else if (model === 'M/M/k') {
    const res = calculateMMC(lambda, mu, k);
    return [
      {
        stepNumber: 1,
        stageName: `Giai đoạn 1: Tính Hệ số sử dụng trung bình mỗi server (với k = ${k})`,
        description: `Mô hình M/M/k (Lượt đến Poisson, thời gian phục vụ Mũ, ${k} server song song). Tỷ lệ tải chia đều cho k server.`,
        latexFormula: '\\rho = \\frac{\\lambda}{k \\cdot \\mu}',
        numericalResult: `\\rho = \\frac{${lambda}}{${k} \\times ${mu}} = ${res.rho.toFixed(3)} \\quad (${(res.rho * 100).toFixed(1)}\\%)`,
        explanation: res.isStable ? `Hệ thống ổn định: Năng lực phục vụ tổng ${k} server (${(k * mu).toFixed(1)}) > Tốc độ đến (${lambda}).` : 'Quá tải: Tất cả các server đều nghẽn!',
      },
      {
        stepNumber: 2,
        stageName: 'Giai đoạn 2: Tính Xác suất không có khách trong hệ thống (P0)',
        description: 'Tổng xác suất trạng thái dừng cho hệ thống đa server.',
        latexFormula: 'P_0 = \\left[ \\sum_{n=0}^{k-1} \\frac{(\\lambda/\\mu)^n}{n!} + \\frac{(\\lambda/\\mu)^k}{k!(1 - \\rho)} \\right]^{-1}',
        numericalResult: `P_0 = ${res.P0.toFixed(4)} \\quad (${(res.P0 * 100).toFixed(2)}\\%)`,
        explanation: `Xác suất cả ${k} server cùng rảnh rỗi là ${(res.P0 * 100).toFixed(1)}%.`,
      },
      {
        stepNumber: 3,
        stageName: 'Giai đoạn 3: Công thức Erlang C (Xác suất phải chờ)',
        description: 'Xác suất một khách hàng đến thấy tất cả k server đều đang bận phục vụ.',
        latexFormula: 'C(k, a) = P(W_q > 0) = \\frac{\\frac{(\\lambda/\\mu)^k}{k!(1 - \\rho)} P_0}{1}',
        numericalResult: `P(W_q > 0) = ${res.Pwait.toFixed(4)} \\quad (${(res.Pwait * 100).toFixed(1)}\\%)`,
        explanation: `Có ${(res.Pwait * 100).toFixed(1)}% khách hàng khi đến sẽ phải vào hàng đợi.`,
      },
      {
        stepNumber: 4,
        stageName: 'Giai đoạn 4: Tính Độ dài hàng chờ và Thời gian chờ',
        description: 'Áp dụng công thức Erlang C và Định luật Little cho hệ thống M/M/k.',
        latexFormula: 'L_q = \\frac{P(W_q > 0) \\cdot \\rho}{1 - \\rho}, \\quad W_q = \\frac{L_q}{\\lambda}, \\quad W = W_q + \\frac{1}{\\mu}, \\quad L = L_q + \\frac{\\lambda}{\\mu}',
        numericalResult: `L_q = ${res.Lq.toFixed(3)}, \\quad W_q = ${res.Wq.toFixed(3)}, \\quad L = ${res.L.toFixed(3)}, \\quad W = ${res.W.toFixed(3)}`,
        explanation: `Mô hình ${k} server giúp giảm mạnh thời gian chờ xuống còn ${(res.Wq * 60).toFixed(1)} phút.`,
      },
    ];
  } else if (model === 'M/G/1') {
    const res = calculateMG1(lambda, mu, sigma);
    return [
      {
        stepNumber: 1,
        stageName: 'Giai đoạn 1: Tính Hệ số sử dụng và Phương sai thời gian phục vụ',
        description: 'Mô hình M/G/1 (Lượt đến Poisson, thời gian phục vụ Tổng quát với độ lệch chuẩn σ, 1 server).',
        latexFormula: '\\rho = \\frac{\\lambda}{\\mu}, \\quad \\sigma^2 = \\text{Var}(S)',
        numericalResult: `\\rho = \\frac{${lambda}}{${mu}} = ${res.rho.toFixed(3)} \\quad (${(res.rho * 100).toFixed(1)}\\%), \\quad \\sigma^2 = ${(sigma * sigma).toFixed(5)}`,
        explanation: res.isStable ? 'Hệ thống cân bằng ổn định (ρ < 1).' : 'Hệ thống mất cân bằng vì ρ ≥ 1!',
      },
      {
        stepNumber: 2,
        stageName: 'Giai đoạn 2: Công thức Pollaczek-Khinchine (P-K Formula) cho Lq',
        description: 'Công thức toán học kinh điển tính số khách chờ trung bình cho phân phối tổng quát.',
        latexFormula: 'L_q = \\frac{\\lambda^2 \\sigma^2 + \\rho^2}{2(1 - \\rho)}',
        numericalResult: `L_q = \\frac{${lambda}^2 \\times ${(sigma * sigma).toFixed(5)} + ${res.rho.toFixed(3)}^2}{2(1 - ${res.rho.toFixed(3)})} = ${res.Lq.toFixed(3)} \\text{ khách}`,
        explanation: 'Ý nghĩa: Khi độ biến động phương sai σ² càng lớn thì hàng chờ Lq càng dài, và ngược lại.',
      },
      {
        stepNumber: 3,
        stageName: 'Giai đoạn 3: Tính Thời gian chờ Wq, W và Tổng số khách L (Little)',
        description: 'Áp dụng Định luật Little cho hệ thống M/G/1.',
        latexFormula: 'W_q = \\frac{L_q}{\\lambda}, \\quad W = W_q + \\frac{1}{\\mu}, \\quad L = \\lambda W',
        numericalResult: `W_q = ${res.Wq.toFixed(3)}, \\quad W = ${res.W.toFixed(3)}, \\quad L = ${res.L.toFixed(3)}`,
        explanation: `Thời gian chờ trong hàng trung bình là ${(res.Wq * 60).toFixed(1)} phút và tổng thời gian trong hệ thống là ${(res.W * 60).toFixed(1)} phút.`,
      },
    ];
  } else {
    // M/D/1
    const res = calculateMD1(lambda, mu);
    return [
      {
        stepNumber: 1,
        stageName: 'Giai đoạn 1: Tính Hệ số sử dụng server (M/D/1)',
        description: 'Mô hình M/D/1 (Lượt đến Poisson, thời gian phục vụ Cố định Deterministic 1/μ, 1 server).',
        latexFormula: '\\rho = \\frac{\\lambda}{\\mu}, \\quad \\sigma^2 = 0 \\text{ (Phương sai bằng 0 tuyệt đối)}',
        numericalResult: `\\rho = \\frac{${lambda}}{${mu}} = ${res.rho.toFixed(3)} \\quad (${(res.rho * 100).toFixed(1)}\\%)`,
        explanation: res.isStable ? 'Hệ thống đạt trạng thái dừng ổn định (ρ < 1).' : 'Hệ thống quá tải vì ρ ≥ 1!',
      },
      {
        stepNumber: 2,
        stageName: 'Giai đoạn 2: Công thức Pollaczek-Khinchine rút gọn cho M/D/1',
        description: 'Vì thời gian phục vụ là hằng số cố định, độ lệch chuẩn σ = 0. Thay σ = 0 vào công thức P-K.',
        latexFormula: 'L_q = \\frac{\\rho^2}{2(1 - \\rho)} \\quad \\left( = \\frac{1}{2} L_{q(M/M/1)} \\right)',
        numericalResult: `L_q = \\frac{${res.rho.toFixed(3)}^2}{2(1 - ${res.rho.toFixed(3)})} = ${res.Lq.toFixed(3)} \\text{ khách}`,
        explanation: 'Kết quả kinh điển: Chiều dài hàng chờ của M/D/1 giảm đúng 50% (một nửa) so với M/M/1 do loại bỏ hoàn toàn sự biến thiên phục vụ!',
      },
      {
        stepNumber: 3,
        stageName: 'Giai đoạn 3: Tính Thời gian chờ Wq, W và Tổng số khách L (Định luật Little)',
        description: 'Thời gian chờ và tổng số khách trong hệ thống M/D/1.',
        latexFormula: 'W_q = \\frac{L_q}{\\lambda} = \\frac{\\rho}{2\\mu(1 - \\rho)}, \\quad W = W_q + \\frac{1}{\\mu}, \\quad L = L_q + \\rho',
        numericalResult: `W_q = ${res.Wq.toFixed(3)}, \\quad W = ${res.W.toFixed(3)}, \\quad L = ${res.L.toFixed(3)}`,
        explanation: `Khách chỉ phải chờ trung bình ${(res.Wq * 60).toFixed(1)} phút trong hàng (bằng 1/2 so với mô hình M/M/1 cùng thông số).`,
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
