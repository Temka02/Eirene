import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterBtn from '../RegisterBtn';

const renderWithRouter = (ui: React.ReactElement, route = '/login') => {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
};

describe('RegisterBtn', () => {
  it('renders with correct text and styling', () => {
    renderWithRouter(<RegisterBtn />);

    const link = screen.getByRole('link', { name: 'Зарегистрироваться' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/register');
    expect(link).toHaveClass('bg-[#8CA693]', 'text-white', 'rounded-[0.3125rem]');
  });

  it('navigates to register page on click', () => {
    renderWithRouter(<RegisterBtn />);

    const link = screen.getByRole('link', { name: 'Зарегистрироваться' });

    expect(link).toHaveAttribute('href', '/register');
  });
});
