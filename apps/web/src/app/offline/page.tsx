import Link from 'next/link';
import Image from 'next/image';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FCF9F8] flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <Image
          src="/logo-01.png"
          alt="Os Melhores da Cidade"
          width={180}
          height={60}
          className="mx-auto"
        />
      </div>

      <div className="w-16 h-16 rounded-full bg-red-100 text-[#FF3B4F] flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-[#171717] mb-2 tracking-tight">
        Você está sem conexão
      </h1>
      <p className="text-xs sm:text-sm text-[#777777] max-w-sm mb-6">
        Parece que você está offline no momento. Verifique sua conexão com a internet para explorar os melhores locais da cidade.
      </p>

      <Link href="/">
        <Button variant="primary" size="md" icon={<RefreshCw className="w-4 h-4" />}>
          Tentar Novamente
        </Button>
      </Link>
    </div>
  );
}

