import dynamic from 'next/dynamic';
import { Provider as JotaiProvider } from "jotai"

const MainStage = dynamic(() => import('@/components/canvas/MainStage'), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="w-full">
      <JotaiProvider>
        <MainStage className='w-full' />
      </JotaiProvider>
    </div>
  );
}
