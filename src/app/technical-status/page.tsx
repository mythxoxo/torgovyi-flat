import { TechnicalStatusView } from '../../components/technical-status-view';
import { getTechnicalStatusView } from '../../lib/server/technical-status';

export default async function TechnicalStatusPage() {
  const locale = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE === 'ru' ? 'ru' : 'en') as 'ru' | 'en';
  const data = await getTechnicalStatusView(locale);
  return <TechnicalStatusView locale={locale} data={data} />;
}
