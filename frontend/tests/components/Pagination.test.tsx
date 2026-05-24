import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Pagination from '../../src/components/Pagination';

describe('Pagination', () => {
  it('renders all pages when totalPages is four or fewer', () => {
    render(<Pagination page={2} totalPages={4} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 4' })).toBeInTheDocument();
    expect(screen.queryByText('...')).not.toBeInTheDocument();
  });

  it('marks the current page with aria-current', () => {
    render(<Pagination page={3} totalPages={4} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Page 2' })).not.toHaveAttribute('aria-current');
  });

  it('shows ellipsis near the start and end of long page ranges', () => {
    const { rerender } = render(<Pagination page={1} totalPages={10} onPageChange={vi.fn()} />);
    expect(screen.getAllByText('...')).toHaveLength(1);

    rerender(<Pagination page={9} totalPages={10} onPageChange={vi.fn()} />);
    expect(screen.getAllByText('...')).toHaveLength(1);

    rerender(<Pagination page={5} totalPages={10} onPageChange={vi.fn()} />);
    expect(screen.getAllByText('...')).toHaveLength(2);
  });

  it('disables previous and next buttons at boundaries', () => {
    const { rerender } = render(<Pagination page={1} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).not.toBeDisabled();

    rerender(<Pagination page={5} totalPages={5} onPageChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('calls onPageChange when a page or arrow is clicked', () => {
    const onPageChange = vi.fn();

    render(<Pagination page={3} totalPages={5} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Page 4' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
    expect(onPageChange).toHaveBeenNthCalledWith(3, 4);
  });
});
