import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import VisualInfoCard from '../../src/components/player/VisualInfoCard';

describe('VisualInfoCard', () => {
  it('shows visual name and first tag pill', () => {
    render(<VisualInfoCard name="Aurora Wave" tags={['abstract']} />);

    expect(screen.getByText('Aurora Wave')).toBeInTheDocument();
    expect(screen.getByText('Abstract')).toBeInTheDocument();
    expect(screen.getByText('Abstract visualizer')).toBeInTheDocument();
  });

  it('uses fallback labels when tags are empty', () => {
    render(<VisualInfoCard name="Untitled" tags={[]} />);

    expect(screen.getByText('Visualizer')).toBeInTheDocument();
    expect(screen.getByText('Reactive visualizer')).toBeInTheDocument();
  });
});
