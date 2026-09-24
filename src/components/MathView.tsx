import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ formula, displayMode = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return formula;
    }
  }, [formula, displayMode]);

  return (
    <span
      className={`inline-block align-middle font-normal ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
