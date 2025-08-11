import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, afterEach, vi, expect } from 'vitest';
import App from './App';

// TaskBoard stubben, damit keine extra Buttons/Text ins App-Testszenario kommen
vi.mock('./components/TaskBoard', () => ({
  default: () => <div data-testid="taskboard" />,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe('App', () => {
  it('zeigt erfolgreiche Ping-Antwort', async () => {
    const fetchMock = vi.fn(async () => ({
      json: async () => ({ message: 'pong' }),
    })) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    const { findByText } = render(<App />);
    const line = await findByText(/Backend Ping Response:/i);

    expect(line.textContent).toContain('"message":"pong"');
    // robust: egal ob ENV bereits "/api" enthält – nur auf Suffix prüfen
    expect((fetchMock as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][0]).toMatch(/\/api\/ping$/);
  });

  it('zeigt Fehlertext bei fehlgeschlagenem Ping', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('boom')) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    const { findByText } = render(<App />);
    const line = await findByText(/Backend Ping Response:/i);

    expect(line.textContent).toContain('Error: boom');
  });

  it('erhöht den Counter beim Klick', () => {
    // fetch stubben, damit kein echter Call passiert
    const fetchMock = vi.fn(async () => ({ json: async () => ({}) })) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchMock);

    const { getByRole } = render(<App />);
    const btn = getByRole('button', { name: /count is/i });

    fireEvent.click(btn);
    expect(btn).toHaveTextContent(/count is 1/i);
  });
});
