import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchFinance } from '../api/api';
import './FinanceStatus.css';

const defaultFinanceData = {
  assets: {
    cash: 0,
    fixedDeposits: 0,
    mutualFunds: 0,
    stocks: 0,
    crypto: 0,
    realEstate: 0,
    gold: 0,
  },
  liabilities: {
    homeLoan: 0,
    educationLoan: 0,
    personalLoan: 0,
    creditCardDues: 0,
  },
};

const toNumber = (value) => Number(value) || 0;

const sumValues = (obj) => Object.values(obj || {}).reduce((sum, current) => sum + toNumber(current), 0);

const formatLabel = (label) => label.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(toNumber(value));

const escapePdfText = (text) =>
  String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const createPdfBlob = (lines) => {
  const contentStream = lines
    .map((line, index) => {
      const size = index === 0 ? 16 : 11;
      const y = 810 - index * 18;
      return `BT /F1 ${size} Tf 42 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join('\n');

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n',
    `4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((objectText) => {
    offsets.push(pdf.length);
    pdf += objectText;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

const FinanceStatus = () => {
  const [finance, setFinance] = useState(defaultFinanceData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState('');

  const loadFinance = useCallback(
    async (silent = false) => {
      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await fetchFinance();
        const payload = response?.data || {};
        setFinance({
          assets: { ...defaultFinanceData.assets, ...(payload.assets || {}) },
          liabilities: { ...defaultFinanceData.liabilities, ...(payload.liabilities || {}) },
        });
        setLastSyncAt(payload.updatedAt || new Date().toISOString());
        setError('');
      } catch {
        setError('Could not load finance status right now.');
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadFinance();
    const intervalId = setInterval(() => loadFinance(true), 10000);

    const onFinanceUpdated = () => {
      loadFinance(true);
    };

    window.addEventListener('finance-updated', onFinanceUpdated);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('finance-updated', onFinanceUpdated);
    };
  }, [loadFinance]);

  const assetEntries = useMemo(
    () =>
      Object.entries(finance.assets).map(([key, value]) => ({
        key,
        label: formatLabel(key),
        value: toNumber(value),
      })),
    [finance.assets],
  );

  const liabilityEntries = useMemo(
    () =>
      Object.entries(finance.liabilities).map(([key, value]) => ({
        key,
        label: formatLabel(key),
        value: toNumber(value),
      })),
    [finance.liabilities],
  );

  const totalAssets = sumValues(finance.assets);
  const totalLiabilities = sumValues(finance.liabilities);
  const netWorth = totalAssets - totalLiabilities;
  const totalBalance = Math.max(totalAssets + totalLiabilities, 1);
  const assetShare = Math.round((totalAssets / totalBalance) * 100);

  const downloadPdf = () => {
    const now = new Date();
    const reportLines = [
      'FinGrow Finance Status Report',
      `Generated: ${now.toLocaleString('en-IN')}`,
      ' ',
      'Summary',
      `Total Assets: INR ${Math.round(totalAssets).toLocaleString('en-IN')}`,
      `Total Liabilities: INR ${Math.round(totalLiabilities).toLocaleString('en-IN')}`,
      `Net Worth: INR ${Math.round(netWorth).toLocaleString('en-IN')}`,
      ' ',
      'Assets',
      ...assetEntries.map((item) => `${item.label}: INR ${Math.round(item.value).toLocaleString('en-IN')}`),
      ' ',
      'Liabilities',
      ...liabilityEntries.map((item) => `${item.label}: INR ${Math.round(item.value).toLocaleString('en-IN')}`),
    ];

    const blob = createPdfBlob(reportLines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-status-${now.toISOString().slice(0, 10)}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="finance-status-page">
      <div className="finance-status-header">
        <div>
          <h1>Finance Status</h1>
          <p>Analyzed financial breakdown with live updates from your wealth entries.</p>
        </div>
        <div className="finance-status-actions">
          <button type="button" onClick={() => loadFinance()}>
            Refresh
          </button>
          <button type="button" className="download-btn" onClick={downloadPdf}>
            Download PDF
          </button>
        </div>
      </div>

      {lastSyncAt ? (
        <p className="status-meta">Last synced: {new Date(lastSyncAt).toLocaleString('en-IN')}</p>
      ) : null}
      {loading ? <p className="status-meta">Loading finance analysis...</p> : null}
      {error ? <p className="status-meta status-error">{error}</p> : null}

      <div className="finance-summary-grid">
        <article className="summary-card">
          <h3>Total Assets</h3>
          <p>{formatCurrency(totalAssets)}</p>
        </article>
        <article className="summary-card">
          <h3>Total Liabilities</h3>
          <p>{formatCurrency(totalLiabilities)}</p>
        </article>
        <article className="summary-card">
          <h3>Net Worth</h3>
          <p>{formatCurrency(netWorth)}</p>
        </article>
      </div>

      <div className="charts-grid">
        <section className="chart-card">
          <h3>Assets Allocation</h3>
          <div className="bar-list">
            {assetEntries.map((item) => {
              const percent = totalAssets > 0 ? Math.round((item.value / totalAssets) * 100) : 0;
              return (
                <div key={item.key} className="bar-row">
                  <div className="bar-head">
                    <span>{item.label}</span>
                    <strong>{formatCurrency(item.value)}</strong>
                  </div>
                  <div className="bar-track">
                    <span className="bar-fill assets" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="chart-card">
          <h3>Liability Mix</h3>
          <div className="bar-list">
            {liabilityEntries.map((item) => {
              const percent = totalLiabilities > 0 ? Math.round((item.value / totalLiabilities) * 100) : 0;
              return (
                <div key={item.key} className="bar-row">
                  <div className="bar-head">
                    <span>{item.label}</span>
                    <strong>{formatCurrency(item.value)}</strong>
                  </div>
                  <div className="bar-track">
                    <span className="bar-fill liabilities" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="chart-card gauge-card">
          <h3>Assets vs Liabilities</h3>
          <div
            className="ratio-gauge"
            style={{ '--assetShare': `${assetShare}%` }}
            aria-label="Assets and liabilities ratio"
          />
          <div className="gauge-legend">
            <span>
              <i className="dot assets-dot" />
              Assets {assetShare}%
            </span>
            <span>
              <i className="dot liabilities-dot" />
              Liabilities {100 - assetShare}%
            </span>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinanceStatus;
