import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import React from 'react';
import Sidebar from '../Sidebar';

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useLocation: jest.fn(),
  };
});

const renderWithRouter = (ui: React.ReactElement, { route = '/dashboard' } = {}) => {
  (useLocation as jest.Mock).mockReturnValue({ pathname: route });
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
};

describe('Sidebar Component', () => {
  it('отображает логотип и основные пункты меню', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByAltText('Eirene')).toBeInTheDocument();
    expect(screen.getByText('Дашборд')).toBeInTheDocument();
    expect(screen.getByText('Задачи')).toBeInTheDocument();
    expect(screen.getByText('Проекты')).toBeInTheDocument();
    expect(screen.getByText('Календарь')).toBeInTheDocument();
  });

  it('подсвечивает активный пункт меню', () => {
    renderWithRouter(<Sidebar />, { route: '/tasks' });
    const tasksLink = screen.getByText('Задачи').closest('a');
    expect(tasksLink).toHaveClass('bg-[#F0F3ED]');
  });

  it('сворачивает и разворачивает меню при клике', () => {
    renderWithRouter(<Sidebar />);
    expect(screen.getByText('Свернуть меню')).toBeInTheDocument();

    const collapseButton = screen.getByRole('button', { name: /свернуть меню/i });
    fireEvent.click(collapseButton);

    expect(screen.queryByText('Свернуть меню')).not.toBeInTheDocument();

    fireEvent.click(collapseButton);
    expect(screen.getByText('Свернуть меню')).toBeInTheDocument();
  });

  it('отображает промо-блок только в развернутом состоянии', () => {
    renderWithRouter(<Sidebar />);

    expect(screen.getByText(/фокус на важном/i)).toBeInTheDocument();

    const collapseButton = screen.getByRole('button', { name: /свернуть меню/i });
    fireEvent.click(collapseButton);

    expect(screen.queryByText(/фокус на важном/i)).not.toBeInTheDocument();
  });
});
