import '../styles/globals.css';
import '../utils/suppressResizeObserverErrors';
import ErrorBoundary from '../components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}