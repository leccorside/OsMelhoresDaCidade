import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-6">
        <Image
          src="/logo-01.png"
          alt="Os Melhores da Cidade"
          width={180}
          height={60}
          className="mx-auto"
        />
      </div>
      <h1 className="text-6xl font-extrabold text-[#171717] mb-2 tracking-tight">404</h1>
      <h2 className="text-2xl font-bold text-[#171717] mb-4">Página não encontrada</h2>
      <p className="text-[#777777] max-w-md mb-8">
        O endereço que você procurou não existe, foi alterado ou não possui conteúdo indexável.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-[#FF3B4F] text-white font-medium hover:bg-[#D91F35] transition shadow-card"
      >
        Voltar para a página inicial
      </Link>
    </div>
  );
}

