import { render, screen } from '@testing-library/react';
import App from './App';

test('renders logistics home page', () => {
  render(<App />);
  const linkElement = screen.getByText(/a logistics company/i);
  expect(linkElement).toBeInTheDocument();
});
