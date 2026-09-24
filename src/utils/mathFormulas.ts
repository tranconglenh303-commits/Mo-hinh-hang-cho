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
      Pw: 1,
    };
  }

  const P0 = 1 - rho;
  const L = rho / (1 - rho);
  const Lq = (rho * rho) / (1 - rho);
  const W = 1 / (mu - lambda);
  const Wq = lambda / (mu * (mu - lambda));
  const Pw = rho; // P(wait) = P(N >= 1) = 1 - P0 = rho

  return { rho, isStable: true, P0, L, Lq, W, Wq, Pw };
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
      Pw: 1,
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

  return { rho, isStable: true, P0, L, Lq, W, Wq, Pwait, Pw: Pwait };
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
  const Pw = 1 - P0;

  return { rho, isStable: true, P0, PK, lambdaEff, L, Lq, W, Wq, Pw };
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
      Pw: 1,
    };
  }

  const P0 = 1 - rho;
  // M/D/1: sigma = 0 in Pollaczek-Khinchine formula => Lq = rho^2 / (2 * (1 - rho))
  const Lq = (rho * rho) / (2 * (1 - rho));
  const Wq = Lq / lambda;
  const W = Wq + 1 / mu;
  const L = lambda * W; // or Lq + rho
  const Pw = rho; // PASTA: P(wait) = P(server busy) = rho

  return { rho, isStable: true, P0, L, Lq, W, Wq, Pw };
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
      Pw: 1,
    };
  }

  const P0 = 1 - rho;
  const varS = sigma * sigma;
  const Lq = (Math.pow(lambda, 2) * varS + Math.pow(rho, 2)) / (2 * (1 - rho));
  const Wq = Lq / lambda;
  const W = Wq + 1 / mu;
  const L = lambda * W;
  const Pw = rho; // PASTA: P(wait) = P(server busy) = rho

  return { rho, isStable: true, P0, L, Lq, W, Wq, Pw };
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
    if (!res.isStable) {
      return [
        {
          stepNumber: 1,
          stageName: 'Phép tính 1 (P₀): Xác suất quầy rảnh rỗi',
          description: 'Hệ số sử dụng ρ = λ/μ ≥ 1. Hệ thống không ổn định.',
          latexFormula: 'P_0 = 1 - \\rho = 0',
          numericalResult: `\\rho = \\frac{${lambda}}{${mu}} = ${res.rho.toFixed(3)} \\ge 1 \\implies P_0 = 0`,
          explanation: 'Hệ thống bùng nổ vô hạn vì tốc độ khách đến lớn hơn hoặc bằng tốc độ phục vụ.',
        },
        {
          stepNumber: 2,
          stageName: 'Phép tính 2 (Lq): Số lượng khách trung bình trong hàng chờ',
          description: 'Hàng chờ kéo dài vô hạn khi ρ ≥ 1.',
          latexFormula: 'L_q = \\frac{\\rho^2}{1 - \\rho} \\to \\infty',
          numericalResult: 'L_q = \\infty \\text{ (Vô hạn)}',
          explanation: 'Hàng chờ không bao giờ giải tỏa hết.',
        },
        {
          stepNumber: 3,
          stageName: 'Phép tính 3 (L): Số lượng khách trung bình trong toàn hệ thống',
          description: 'Tổng số khách trong hệ thống không bị chặn.',
          latexFormula: 'L = \\frac{\\rho}{1 - \\rho} \\to \\infty',
          numericalResult: 'L = \\infty \\text{ (Vô hạn)}',
          explanation: 'Toàn hệ thống tắc nghẽn vô hạn.',
        },
        {
          stepNumber: 4,
          stageName: 'Phép tính 4 (Wq): Thời gian chờ trung bình trong hàng chờ',
          description: 'Thời gian chờ vô hạn khi ρ ≥ 1.',
          latexFormula: 'W_q = \\frac{L_q}{\\lambda} \\to \\infty',
          numericalResult: 'W_q = \\infty \\text{ (Vô hạn)}',
          explanation: 'Khách hàng phải chờ vô hạn.',
        },
        {
          stepNumber: 5,
          stageName: 'Phép tính 5 (W): Thời gian lưu lại trung bình trong hệ thống',
          description: 'Tổng thời gian lưu lại không thể hội tụ.',
          latexFormula: 'W = W_q + \\frac{1}{\\mu} \\to \\infty',
          numericalResult: 'W = \\infty \\text{ (Vô hạn)}',
          explanation: 'Tổng thời gian lưu lại trong hệ thống là vô hạn.',
        },
        {
          stepNumber: 6,
          stageName: 'Phép tính 6 (Pw): Xác suất khách đến phải chờ',
          description: 'Xác suất phải chờ bằng 100% khi hệ thống quá tải.',
          latexFormula: 'P_w = 1',
          numericalResult: 'P_w = 100\\%',
          explanation: 'Mọi khách đến đều phải chờ do server luôn bận.',
        },
      ];
    }

    return [
      {
        stepNumber: 1,
        stageName: 'Phép tính 1 (P₀): Xác suất không có khách trong hệ thống (Hệ thống rảnh)',
        description: 'Mô hình M/M/1: Lượt đến Poisson (λ), thời gian phục vụ Mũ (μ), 1 server. Xác suất tại một thời điểm ngẫu nhiên server hoàn toàn rảnh rỗi.',
        latexFormula: 'P_0 = 1 - \\rho = 1 - \\frac{\\lambda}{\\mu}',
        numericalResult: `P_0 = 1 - \\frac{${lambda}}{${mu}} = 1 - ${res.rho.toFixed(3)} = ${res.P0.toFixed(4)} \\quad (${(res.P0 * 100).toFixed(2)}\\%)`,
        explanation: `Hệ số tải \\rho = ${(res.rho * 100).toFixed(1)}%. Server rảnh ${(res.P0 * 100).toFixed(2)}% thời gian và bận ${(res.rho * 100).toFixed(2)}% thời gian.`,
      },
      {
        stepNumber: 2,
        stageName: 'Phép tính 2 (Lq): Số lượng khách trung bình trong hàng chờ',
        description: 'Số lượng khách hàng trung bình đang đứng trong hàng đợi để chờ đến lượt phục vụ.',
        latexFormula: 'L_q = \\frac{\\lambda^2}{\\mu(\\mu - \\lambda)} = \\frac{\\rho^2}{1 - \\rho}',
        numericalResult: `L_q = \\frac{${res.rho.toFixed(3)}^2}{1 - ${res.rho.toFixed(3)}} = ${res.Lq.toFixed(4)} \\text{ khách}`,
        explanation: `Trung bình luôn có ${res.Lq.toFixed(2)} khách hàng đang chờ trong hàng đợi (chưa tính khách đang được phục vụ tại quầy).`,
      },
      {
        stepNumber: 3,
        stageName: 'Phép tính 3 (L): Số lượng khách trung bình trong toàn hệ thống',
        description: 'Tổng số khách hàng trung bình có mặt trong hệ thống (bao gồm cả khách đang chờ trong hàng và khách đang ở quầy phục vụ).',
        latexFormula: 'L = L_q + \\frac{\\lambda}{\\mu} = \\frac{\\lambda}{\\mu - \\lambda} = \\frac{\\rho}{1 - \\rho}',
        numericalResult: `L = ${res.Lq.toFixed(4)} + ${res.rho.toFixed(4)} = ${res.L.toFixed(4)} \\text{ khách}`,
        explanation: `Trung bình toàn bộ hệ thống có ${res.L.toFixed(2)} khách hàng (${res.Lq.toFixed(2)} khách xếp hàng + ${res.rho.toFixed(2)} khách đang được phục vụ).`,
      },
      {
        stepNumber: 4,
        stageName: 'Phép tính 4 (Wq): Thời gian chờ trung bình trong hàng chờ',
        description: 'Thời gian trung bình một khách hàng phải đứng trong hàng đợi trước khi bắt đầu được phục vụ (áp dụng Định luật Little: Wq = Lq / λ).',
        latexFormula: 'W_q = \\frac{L_q}{\\lambda} = \\frac{\\lambda}{\\mu(\\mu - \\lambda)} = \\frac{\\rho}{\\mu(1 - \\rho)}',
        numericalResult: `W_q = \\frac{${res.Lq.toFixed(4)}}{${lambda}} = ${res.Wq.toFixed(4)} \\text{ giờ} = ${(res.Wq * 60).toFixed(2)} \\text{ phút}`,
        explanation: `Mỗi khách hàng phải chờ đợi trung bình ${(res.Wq * 60).toFixed(2)} phút trong hàng trước khi tới lượt mình.`,
      },
      {
        stepNumber: 5,
        stageName: 'Phép tính 5 (W): Thời gian lưu lại trung bình trong toàn hệ thống',
        description: 'Tổng thời gian trung bình một khách hàng trải qua trong hệ thống từ lúc đến cho đến khi được phục vụ xong và rời đi.',
        latexFormula: 'W = W_q + \\frac{1}{\\mu} = \\frac{L}{\\lambda} = \\frac{1}{\\mu - \\lambda}',
        numericalResult: `W = ${res.Wq.toFixed(4)} + \\frac{1}{${mu}} = ${res.W.toFixed(4)} \\text{ giờ} = ${(res.W * 60).toFixed(2)} \\text{ phút}`,
        explanation: `Tổng thời gian lưu lại là ${(res.W * 60).toFixed(2)} phút (gồm ${(res.Wq * 60).toFixed(2)} phút xếp hàng chờ và ${((1 / mu) * 60).toFixed(2)} phút được phục vụ).`,
      },
      {
        stepNumber: 6,
        stageName: 'Phép tính 6 (Pw): Xác suất khách hàng khi đến phải chờ',
        description: 'Xác suất một khách hàng khi vừa bước vào hệ thống thấy quầy đang bận phục vụ người khác và buộc phải vào hàng chờ.',
        latexFormula: 'P_w = P(n \\ge 1) = 1 - P_0 = \\rho = \\frac{\\lambda}{\\mu}',
        numericalResult: `P_w = 1 - ${res.P0.toFixed(4)} = ${res.Pw.toFixed(4)} \\quad (${(res.Pw * 100).toFixed(2)}\\%)`,
        explanation: `Theo định lý PASTA (Poisson Arrivals See Time Averages), xác suất khách đến phải chờ đúng bằng tỷ lệ bận của server (${(res.Pw * 100).toFixed(2)}%).`,
      },
    ];
  } else if (model === 'M/M/k') {
    const res = calculateMMC(lambda, mu, k);
    const a = lambda / mu;

    if (!res.isStable) {
      return [
        {
          stepNumber: 1,
          stageName: 'Phép tính 1 (P₀): Xác suất không có khách trong hệ thống',
          description: `Hệ số tải mỗi server ρ = λ / (k·μ) ≥ 1 với k = ${k}.`,
          latexFormula: 'P_0 = 0',
          numericalResult: `\\rho = \\frac{${lambda}}{${k} \\times ${mu}} = ${res.rho.toFixed(3)} \\ge 1 \\implies P_0 = 0`,
          explanation: 'Hệ thống M/M/k quá tải nghiêm trọng, hàng chờ sẽ bùng nổ vô hạn.',
        },
        {
          stepNumber: 2,
          stageName: 'Phép tính 2 (Lq): Số lượng khách trung bình trong hàng chờ',
          description: 'Hàng chờ kéo dài vô hạn khi tổng năng lực phục vụ nhỏ hơn lưu lượng đến.',
          latexFormula: 'L_q \\to \\infty',
          numericalResult: 'L_q = \\infty \\text{ (Vô hạn)}',
          explanation: 'Số khách chờ tích lũy vô hạn theo thời gian.',
        },
        {
          stepNumber: 3,
          stageName: 'Phép tính 3 (L): Số lượng khách trung bình trong toàn hệ thống',
          description: 'Tổng số khách trong hệ thống không bị chặn.',
          latexFormula: 'L \\to \\infty',
          numericalResult: 'L = \\infty \\text{ (Vô hạn)}',
          explanation: 'Hệ thống đa server tắc nghẽn hoàn toàn.',
        },
        {
          stepNumber: 4,
          stageName: 'Phép tính 4 (Wq): Thời gian chờ trung bình trong hàng chờ',
          description: 'Thời gian chờ vô hạn khi ρ ≥ 1.',
          latexFormula: 'W_q \\to \\infty',
          numericalResult: 'W_q = \\infty \\text{ (Vô hạn)}',
          explanation: 'Khách đến không thể được phục vụ kịp thời.',
        },
        {
          stepNumber: 5,
          stageName: 'Phép tính 5 (W): Thời gian lưu lại trung bình trong hệ thống',
          description: 'Tổng thời gian lưu lại không thể hội tụ.',
          latexFormula: 'W \\to \\infty',
          numericalResult: 'W = \\infty \\text{ (Vô hạn)}',
          explanation: 'Thời gian lưu lại trong hệ thống tiến tới vô hạn.',
        },
        {
          stepNumber: 6,
          stageName: 'Phép tính 6 (Pw): Xác suất khách đến phải chờ (Erlang C)',
          description: 'Tất cả các server luôn trong tình trạng bận rộn 100%.',
          latexFormula: 'P_w = 1',
          numericalResult: 'P_w = 100\\%',
          explanation: 'Mọi khách đến đều phải chờ đợi vì cả k server đều bận.',
        },
      ];
    }

    let sumTerms = 0;
    for (let n = 0; n < k; n++) {
      sumTerms += Math.pow(a, n) / factorial(n);
    }
    const lastTerm = Math.pow(a, k) / (factorial(k) * (1 - res.rho));

    return [
      {
        stepNumber: 1,
        stageName: 'Phép tính 1 (P₀): Xác suất không có khách trong hệ thống (Tất cả k server đều rảnh)',
        description: `Mô hình M/M/k với k = ${k} server song song, lượt đến Poisson, phục vụ Mũ. Xác suất không có khách nào trong hệ thống.`,
        latexFormula: 'P_0 = \\left[ \\sum_{n=0}^{k-1} \\frac{(\\lambda/\\mu)^n}{n!} + \\frac{(\\lambda/\\mu)^k}{k!(1 - \\rho)} \\right]^{-1} \\quad \\left(\\rho = \\frac{\\lambda}{k\\mu}\\right)',
        numericalResult: `P_0 = \\left[ ${sumTerms.toFixed(4)} + ${lastTerm.toFixed(4)} \\right]^{-1} = ${res.P0.toFixed(4)} \\quad (${(res.P0 * 100).toFixed(2)}\\%)`,
        explanation: `Cường độ lưu lượng a = λ/μ = ${a.toFixed(3)}, hệ số tải mỗi server ρ = ${(res.rho * 100).toFixed(1)}%. Xác suất cả ${k} server đều rảnh là ${(res.P0 * 100).toFixed(2)}%.`,
      },
      {
        stepNumber: 2,
        stageName: 'Phép tính 2 (Lq): Số lượng khách trung bình trong hàng chờ',
        description: `Số khách hàng trung bình đứng đợi trong hàng chờ chung trước khi được bất kỳ server nào trong ${k} server tiếp nhận.`,
        latexFormula: 'L_q = \\frac{(\\lambda/\\mu)^k \\cdot \\rho}{k!(1 - \\rho)^2} \\cdot P_0 = \\frac{P_w \\cdot \\rho}{1 - \\rho}',
        numericalResult: `L_q = \\frac{(${a.toFixed(3)})^${k} \\times ${res.rho.toFixed(3)}}{${k}! \\times (1 - ${res.rho.toFixed(3)})^2} \\times ${res.P0.toFixed(4)} = ${res.Lq.toFixed(4)} \\text{ khách}`,
        explanation: `Nhờ chia tải qua ${k} server, số khách xếp hàng chờ trung bình chỉ còn ${res.Lq.toFixed(2)} khách.`,
      },
      {
        stepNumber: 3,
        stageName: 'Phép tính 3 (L): Số lượng khách trung bình trong toàn hệ thống',
        description: `Tổng số khách trong hệ thống (gồm khách trong hàng chờ Lq và số khách đang được phục vụ tại các server = λ/μ).`,
        latexFormula: 'L = L_q + \\frac{\\lambda}{\\mu} = L_q + k\\rho',
        numericalResult: `L = ${res.Lq.toFixed(4)} + ${a.toFixed(4)} = ${res.L.toFixed(4)} \\text{ khách}`,
        explanation: `Trung bình có ${res.L.toFixed(2)} khách trong toàn bộ hệ thống (${res.Lq.toFixed(2)} khách chờ + ${a.toFixed(2)} khách đang được phục vụ tại các server).`,
      },
      {
        stepNumber: 4,
        stageName: 'Phép tính 4 (Wq): Thời gian chờ trung bình trong hàng chờ',
        description: 'Thời gian một khách hàng phải chờ trong hàng đợi chung (áp dụng Định luật Little: Wq = Lq / λ).',
        latexFormula: 'W_q = \\frac{L_q}{\\lambda}',
        numericalResult: `W_q = \\frac{${res.Lq.toFixed(4)}}{${lambda}} = ${res.Wq.toFixed(4)} \\text{ giờ} = ${(res.Wq * 60).toFixed(2)} \\text{ phút}`,
        explanation: `Thời gian khách phải đợi trong hàng trung bình là ${(res.Wq * 60).toFixed(2)} phút trước khi có server trống.`,
      },
      {
        stepNumber: 5,
        stageName: 'Phép tính 5 (W): Thời gian lưu lại trung bình trong toàn hệ thống',
        description: 'Tổng thời gian một khách hàng trải qua trong hệ thống từ lúc vào hàng chờ đến khi được phục vụ xong.',
        latexFormula: 'W = W_q + \\frac{1}{\\mu} = \\frac{L}{\\lambda}',
        numericalResult: `W = ${res.Wq.toFixed(4)} + \\frac{1}{${mu}} = ${res.W.toFixed(4)} \\text{ giờ} = ${(res.W * 60).toFixed(2)} \\text{ phút}`,
        explanation: `Tổng thời gian lưu lại trung bình là ${(res.W * 60).toFixed(2)} phút (gồm ${(res.Wq * 60).toFixed(2)} phút chờ và ${((1 / mu) * 60).toFixed(2)} phút phục vụ).`,
      },
      {
        stepNumber: 6,
        stageName: 'Phép tính 6 (Pw): Xác suất khách hàng khi đến phải chờ (Công thức Erlang C)',
        description: `Xác suất một khách hàng khi đến thấy tất cả ${k} server đều đang bận và phải vào hàng chờ.`,
        latexFormula: 'P_w = C(k, \\lambda/\\mu) = \\frac{(\\lambda/\\mu)^k}{k!(1 - \\rho)} \\cdot P_0 = \\frac{L_q (1 - \\rho)}{\\rho}',
        numericalResult: `P_w = \\frac{(${a.toFixed(3)})^${k}}{${k}! \\times (1 - ${res.rho.toFixed(3)})} \\times ${res.P0.toFixed(4)} = ${res.Pw.toFixed(4)} \\quad (${(res.Pw * 100).toFixed(2)}\\%)`,
        explanation: `Theo công thức Erlang C, có ${(res.Pw * 100).toFixed(2)}% khách hàng khi đến sẽ thấy toàn bộ ${k} server đều bận và phải chờ đợi.`,
      },
    ];
  } else if (model === 'M/G/1') {
    const res = calculateMG1(lambda, mu, sigma);
    const varS = sigma * sigma;

    if (!res.isStable) {
      return [
        {
          stepNumber: 1,
          stageName: 'Phép tính 1 (P₀): Xác suất quầy rảnh rỗi',
          description: 'Hệ số sử dụng ρ = λ/μ ≥ 1. Hệ thống không ổn định.',
          latexFormula: 'P_0 = 1 - \\rho = 0',
          numericalResult: `\\rho = \\frac{${lambda}}{${mu}} = ${res.rho.toFixed(3)} \\ge 1 \\implies P_0 = 0`,
          explanation: 'Hệ thống M/G/1 quá tải, hàng chờ bùng nổ vô hạn.',
        },
        {
          stepNumber: 2,
          stageName: 'Phép tính 2 (Lq): Số lượng khách trung bình trong hàng chờ',
          description: 'Công thức Pollaczek-Khinchine phân kỳ khi ρ ≥ 1.',
          latexFormula: 'L_q = \\frac{\\lambda^2 \\sigma^2 + \\rho^2}{2(1 - \\rho)} \\to \\infty',
          numericalResult: 'L_q = \\infty \\text{ (Vô hạn)}',
          explanation: 'Hàng chờ không bao giờ ổn định.',
        },
        {
          stepNumber: 3,
          stageName: 'Phép tính 3 (L): Số lượng khách trung bình trong toàn hệ thống',
          description: 'Tổng số khách trong hệ thống không bị chặn.',
          latexFormula: 'L = L_q + \\rho \\to \\infty',
          numericalResult: 'L = \\infty \\text{ (Vô hạn)}',
          explanation: 'Hệ thống tắc nghẽn vô hạn.',
        },
        {
          stepNumber: 4,
          stageName: 'Phép tính 4 (Wq): Thời gian chờ trung bình trong hàng chờ',
          description: 'Thời gian chờ vô hạn khi ρ ≥ 1.',
          latexFormula: 'W_q = \\frac{L_q}{\\lambda} \\to \\infty',
          numericalResult: 'W_q = \\infty \\text{ (Vô hạn)}',
          explanation: 'Khách hàng phải chờ vô hạn.',
        },
        {
          stepNumber: 5,
          stageName: 'Phép tính 5 (W): Thời gian lưu lại trung bình trong hệ thống',
          description: 'Tổng thời gian lưu lại không thể hội tụ.',
          latexFormula: 'W = W_q + \\frac{1}{\\mu} \\to \\infty',
          numericalResult: 'W = \\infty \\text{ (Vô hạn)}',
          explanation: 'Thời gian lưu lại trong hệ thống tiến tới vô hạn.',
        },
        {
          stepNumber: 6,
          stageName: 'Phép tính 6 (Pw): Xác suất khách đến phải chờ',
          description: 'Xác suất phải chờ bằng 100% khi hệ thống quá tải.',
          latexFormula: 'P_w = 1',
          numericalResult: 'P_w = 100\\%',
          explanation: 'Mọi khách đến đều phải chờ do server luôn bận.',
        },
      ];
    }

    return [
      {
        stepNumber: 1,
        stageName: 'Phép tính 1 (P₀): Xác suất không có khách trong hệ thống (Hệ thống rảnh)',
        description: 'Mô hình M/G/1: Lượt đến Poisson, thời gian phục vụ tổng quát với độ lệch chuẩn σ, 1 server. Theo định lý PASTA, xác suất server rảnh rỗi phụ thuộc duy nhất vào hệ số tải ρ.',
        latexFormula: 'P_0 = 1 - \\rho = 1 - \\frac{\\lambda}{\\mu}',
        numericalResult: `P_0 = 1 - \\frac{${lambda}}{${mu}} = 1 - ${res.rho.toFixed(3)} = ${res.P0.toFixed(4)} \\quad (${(res.P0 * 100).toFixed(2)}\\%)`,
        explanation: `Hệ số tải \\rho = ${(res.rho * 100).toFixed(1)}%. Quầy phục vụ rảnh ${(res.P0 * 100).toFixed(2)}% thời gian và bận ${(res.rho * 100).toFixed(2)}% thời gian.`,
      },
      {
        stepNumber: 2,
        stageName: 'Phép tính 2 (Lq): Số lượng khách trung bình trong hàng chờ (Công thức Pollaczek-Khinchine)',
        description: 'Công thức Pollaczek-Khinchine (P-K Formula) kinh điển: Số khách chờ phụ thuộc vào cả tải trung bình ρ và phương sai thời gian phục vụ σ².',
        latexFormula: 'L_q = \\frac{\\lambda^2 \\sigma^2 + \\rho^2}{2(1 - \\rho)} \\quad \\left(\\sigma^2 = \\text{Var}(S) = ' + varS.toFixed(5) + '\\right)',
        numericalResult: `L_q = \\frac{${lambda}^2 \\times ${varS.toFixed(5)} + ${res.rho.toFixed(3)}^2}{2(1 - ${res.rho.toFixed(3)})} = ${res.Lq.toFixed(4)} \\text{ khách}`,
        explanation: `Phương sai \\sigma^2 = ${varS.toFixed(5)} thể hiện sự biến thiên trong thời gian phục vụ. Khi phương sai càng lớn, hàng chờ Lq càng dài.`,
      },
      {
        stepNumber: 3,
        stageName: 'Phép tính 3 (L): Số lượng khách trung bình trong toàn hệ thống',
        description: 'Tổng số khách hàng trung bình có mặt trong hệ thống M/G/1.',
        latexFormula: 'L = L_q + \\rho = L_q + \\frac{\\lambda}{\\mu}',
        numericalResult: `L = ${res.Lq.toFixed(4)} + ${res.rho.toFixed(4)} = ${res.L.toFixed(4)} \\text{ khách}`,
        explanation: `Tổng số khách có mặt trong hệ thống là ${res.L.toFixed(2)} khách (gồm ${res.Lq.toFixed(2)} khách trong hàng và ${res.rho.toFixed(2)} khách đang được phục vụ).`,
      },
      {
        stepNumber: 4,
        stageName: 'Phép tính 4 (Wq): Thời gian chờ trung bình trong hàng chờ',
        description: 'Thời gian chờ trung bình của khách trong hàng (theo Định luật Little: Wq = Lq / λ).',
        latexFormula: 'W_q = \\frac{L_q}{\\lambda} = \\frac{\\lambda^2 \\sigma^2 + \\rho^2}{2\\lambda(1 - \\rho)}',
        numericalResult: `W_q = \\frac{${res.Lq.toFixed(4)}}{${lambda}} = ${res.Wq.toFixed(4)} \\text{ giờ} = ${(res.Wq * 60).toFixed(2)} \\text{ phút}`,
        explanation: `Khách hàng phải chờ trung bình ${(res.Wq * 60).toFixed(2)} phút trong hàng trước khi được phục vụ.`,
      },
      {
        stepNumber: 5,
        stageName: 'Phép tính 5 (W): Thời gian lưu lại trung bình trong toàn hệ thống',
        description: 'Tổng thời gian trung bình khách hàng lưu lại trong hệ thống từ lúc vào đến khi hoàn tất dịch vụ.',
        latexFormula: 'W = W_q + \\frac{1}{\\mu} = \\frac{L}{\\lambda}',
        numericalResult: `W = ${res.Wq.toFixed(4)} + \\frac{1}{${mu}} = ${res.W.toFixed(4)} \\text{ giờ} = ${(res.W * 60).toFixed(2)} \\text{ phút}`,
        explanation: `Tổng thời gian lưu lại là ${(res.W * 60).toFixed(2)} phút (bao gồm ${(res.Wq * 60).toFixed(2)} phút chờ đợi và ${((1 / mu) * 60).toFixed(2)} phút được phục vụ).`,
      },
      {
        stepNumber: 6,
        stageName: 'Phép tính 6 (Pw): Xác suất khách hàng khi đến phải chờ',
        description: 'Xác suất một khách hàng khi đến thấy server đang bận phục vụ và buộc phải vào hàng chờ.',
        latexFormula: 'P_w = P(n \\ge 1) = 1 - P_0 = \\rho = \\frac{\\lambda}{\\mu}',
        numericalResult: `P_w = 1 - ${res.P0.toFixed(4)} = ${res.Pw.toFixed(4)} \\quad (${(res.Pw * 100).toFixed(2)}\\%)`,
        explanation: `Với lượt đến Poisson (PASTA), xác suất khách đến phải chờ đúng bằng tỷ lệ bận của server (${(res.Pw * 100).toFixed(2)}%).`,
      },
    ];
  } else {
    // M/D/1
    const res = calculateMD1(lambda, mu);

    if (!res.isStable) {
      return [
        {
          stepNumber: 1,
          stageName: 'Phép tính 1 (P₀): Xác suất quầy rảnh rỗi',
          description: 'Hệ số sử dụng ρ = λ/μ ≥ 1. Hệ thống không ổn định.',
          latexFormula: 'P_0 = 1 - \\rho = 0',
          numericalResult: `\\rho = \\frac{${lambda}}{${mu}} = ${res.rho.toFixed(3)} \\ge 1 \\implies P_0 = 0`,
          explanation: 'Hệ thống M/D/1 quá tải, hàng chờ bùng nổ vô hạn.',
        },
        {
          stepNumber: 2,
          stageName: 'Phép tính 2 (Lq): Số lượng khách trung bình trong hàng chờ',
          description: 'Hàng chờ kéo dài vô hạn khi ρ ≥ 1.',
          latexFormula: 'L_q = \\frac{\\rho^2}{2(1 - \\rho)} \\to \\infty',
          numericalResult: 'L_q = \\infty \\text{ (Vô hạn)}',
          explanation: 'Hàng chờ không bao giờ giải tỏa.',
        },
        {
          stepNumber: 3,
          stageName: 'Phép tính 3 (L): Số lượng khách trung bình trong toàn hệ thống',
          description: 'Tổng số khách trong hệ thống không bị chặn.',
          latexFormula: 'L \\to \\infty',
          numericalResult: 'L = \\infty \\text{ (Vô hạn)}',
          explanation: 'Hệ thống tắc nghẽn vô hạn.',
        },
        {
          stepNumber: 4,
          stageName: 'Phép tính 4 (Wq): Thời gian chờ trung bình trong hàng chờ',
          description: 'Thời gian chờ vô hạn khi ρ ≥ 1.',
          latexFormula: 'W_q = \\frac{L_q}{\\lambda} \\to \\infty',
          numericalResult: 'W_q = \\infty \\text{ (Vô hạn)}',
          explanation: 'Khách hàng phải chờ vô hạn.',
        },
        {
          stepNumber: 5,
          stageName: 'Phép tính 5 (W): Thời gian lưu lại trung bình trong hệ thống',
          description: 'Tổng thời gian lưu lại không thể hội tụ.',
          latexFormula: 'W = W_q + \\frac{1}{\\mu} \\to \\infty',
          numericalResult: 'W = \\infty \\text{ (Vô hạn)}',
          explanation: 'Thời gian lưu lại trong hệ thống tiến tới vô hạn.',
        },
        {
          stepNumber: 6,
          stageName: 'Phép tính 6 (Pw): Xác suất khách đến phải chờ',
          description: 'Xác suất phải chờ bằng 100% khi hệ thống quá tải.',
          latexFormula: 'P_w = 1',
          numericalResult: 'P_w = 100\\%',
          explanation: 'Mọi khách đến đều phải chờ do server luôn bận.',
        },
      ];
    }

    return [
      {
        stepNumber: 1,
        stageName: 'Phép tính 1 (P₀): Xác suất không có khách trong hệ thống (Hệ thống rảnh)',
        description: 'Mô hình M/D/1: Lượt đến Poisson, thời gian phục vụ cố định 1/μ (Deterministic, σ = 0), 1 server. Xác suất server hoàn toàn rảnh rỗi.',
        latexFormula: 'P_0 = 1 - \\rho = 1 - \\frac{\\lambda}{\\mu}',
        numericalResult: `P_0 = 1 - \\frac{${lambda}}{${mu}} = 1 - ${res.rho.toFixed(3)} = ${res.P0.toFixed(4)} \\quad (${(res.P0 * 100).toFixed(2)}\\%)`,
        explanation: `Thời gian phục vụ là hằng số cố định D = 1/μ = ${((1 / mu) * 60).toFixed(1)} phút. Xác suất server rảnh rỗi là ${(res.P0 * 100).toFixed(2)}%.`,
      },
      {
        stepNumber: 2,
        stageName: 'Phép tính 2 (Lq): Số lượng khách trung bình trong hàng chờ',
        description: 'Vì thời gian phục vụ cố định (σ² = 0), công thức Pollaczek-Khinchine rút gọn: Chiều dài hàng chờ Lq bằng chính xác 1/2 so với mô hình M/M/1!',
        latexFormula: 'L_q = \\frac{\\rho^2}{2(1 - \\rho)} = \\frac{\\lambda^2}{2\\mu(\\mu - \\lambda)} \\quad \\left( = \\frac{1}{2} L_{q(M/M/1)} \\right)',
        numericalResult: `L_q = \\frac{${res.rho.toFixed(3)}^2}{2(1 - ${res.rho.toFixed(3)})} = ${res.Lq.toFixed(4)} \\text{ khách}`,
        explanation: `Kết quả kinh điển: Do loại bỏ hoàn toàn sự biến thiên phục vụ (σ² = 0), hàng chờ chỉ còn ${res.Lq.toFixed(2)} khách (giảm đúng 50% so với M/M/1).`,
      },
      {
        stepNumber: 3,
        stageName: 'Phép tính 3 (L): Số lượng khách trung bình trong toàn hệ thống',
        description: 'Tổng số khách hàng trung bình có mặt trong hệ thống M/D/1.',
        latexFormula: 'L = L_q + \\rho = \\frac{\\rho^2}{2(1 - \\rho)} + \\rho = \\frac{\\rho(2 - \\rho)}{2(1 - \\rho)}',
        numericalResult: `L = ${res.Lq.toFixed(4)} + ${res.rho.toFixed(4)} = ${res.L.toFixed(4)} \\text{ khách}`,
        explanation: `Trung bình có ${res.L.toFixed(2)} khách trong toàn bộ hệ thống (${res.Lq.toFixed(2)} khách trong hàng + ${res.rho.toFixed(2)} khách đang được phục vụ).`,
      },
      {
        stepNumber: 4,
        stageName: 'Phép tính 4 (Wq): Thời gian chờ trung bình trong hàng chờ',
        description: 'Thời gian chờ trung bình trong hàng của khách (theo Định luật Little: Wq = Lq / λ).',
        latexFormula: 'W_q = \\frac{L_q}{\\lambda} = \\frac{\\rho}{2\\mu(1 - \\rho)} \\quad \\left( = \\frac{1}{2} W_{q(M/M/1)} \\right)',
        numericalResult: `W_q = \\frac{${res.Lq.toFixed(4)}}{${lambda}} = ${res.Wq.toFixed(4)} \\text{ giờ} = ${(res.Wq * 60).toFixed(2)} \\text{ phút}`,
        explanation: `Khách hàng chỉ phải chờ trung bình ${(res.Wq * 60).toFixed(2)} phút trong hàng (bằng 1/2 so với mô hình M/M/1 cùng thông số).`,
      },
      {
        stepNumber: 5,
        stageName: 'Phép tính 5 (W): Thời gian lưu lại trung bình trong toàn hệ thống',
        description: 'Tổng thời gian một khách hàng lưu lại từ khi đến cho tới khi kết thúc phục vụ rời đi.',
        latexFormula: 'W = W_q + \\frac{1}{\\mu} = \\frac{L}{\\lambda}',
        numericalResult: `W = ${res.Wq.toFixed(4)} + \\frac{1}{${mu}} = ${res.W.toFixed(4)} \\text{ giờ} = ${(res.W * 60).toFixed(2)} \\text{ phút}`,
        explanation: `Tổng thời gian lưu lại trung bình là ${(res.W * 60).toFixed(2)} phút (gồm ${(res.Wq * 60).toFixed(2)} phút chờ hàng và đúng ${((1 / mu) * 60).toFixed(2)} phút phục vụ cố định).`,
      },
      {
        stepNumber: 6,
        stageName: 'Phép tính 6 (Pw): Xác suất khách hàng khi đến phải chờ',
        description: 'Xác suất một khách hàng khi đến thấy server đang bận phục vụ và buộc phải vào hàng chờ.',
        latexFormula: 'P_w = P(n \\ge 1) = 1 - P_0 = \\rho = \\frac{\\lambda}{\\mu}',
        numericalResult: `P_w = 1 - ${res.P0.toFixed(4)} = ${res.Pw.toFixed(4)} \\quad (${(res.Pw * 100).toFixed(2)}\\%)`,
        explanation: `Dù thời gian phục vụ là hằng số, nhưng lượt đến Poisson ngẫu nhiên (PASTA) nên xác suất phải chờ vẫn bằng tỷ lệ bận server (${(res.Pw * 100).toFixed(2)}%).`,
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
