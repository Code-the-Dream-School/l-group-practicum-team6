import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import VisualInfoCard from '../../src/components/player/VisualInfoCard';

describe('VisualInfoCard', () => {
  it('uses delayed show and faster hide opacity transitions', () => {
    const { rerender } = render(<VisualInfoCard name="Aurora Wave" tags={['abstract']} visible />);

    expect(screen.getByTestId('visual-info-card')).toHaveClass('delay-200', 'duration-300');

    rerender(<VisualInfoCard name="Aurora Wave" tags={['abstract']} visible={false} />);

    expect(screen.getByTestId('visual-info-card')).toHaveClass(
      'duration-150',
      'delay-0',
      'opacity-0'
    );
  });

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
