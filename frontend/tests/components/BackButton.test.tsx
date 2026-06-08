import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, test } from 'vitest';

import BackButton from '../../src/components/BackButton';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="pathname">{location.pathname}</div>;
}

function renderAt(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route
          path="/settings"
          element={
            <>
              <BackButton fallback="/explore" />
              <LocationProbe />
            </>
          }
        />
        <Route path="/explore" element={<LocationProbe />} />
        <Route path="/my-visuals" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('BackButton', () => {
  test('renders an accessible back control', () => {
    renderAt(['/settings']);

    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  test('navigates to the previous entry when history exists', () => {
    renderAt(['/my-visuals', '/settings']);

    fireEvent.click(screen.getByRole('button', { name: /go back/i }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/my-visuals');
  });

  test('navigates to the fallback when there is no in-app history', () => {
    renderAt(['/settings']);

    fireEvent.click(screen.getByRole('button', { name: /go back/i }));

    expect(screen.getByTestId('pathname')).toHaveTextContent('/explore');
  });
});
