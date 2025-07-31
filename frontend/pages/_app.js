import '../styles/globals.css';
import '../utils/suppressResizeObserverErrors';
import ErrorBoundary from '../components/ErrorBoundary';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}