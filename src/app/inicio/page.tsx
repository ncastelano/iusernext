import React from "react";

type FeatureCardProps = {
  title: string;
  description: string;
  image: string;
};

export default function Inicio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white p-6">
      <header className="text-center py-10">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-white">
          iUser: Sua rede social com poder de loja
        </h1>
        <p className="mt-4 text-lg text-gray-300 max-w-xl mx-auto">
          Uma nova forma de se conectar, vender e mostrar ao mundo o que você
          pode oferecer.
        </p>
      </header>

      {/* Section: Download */}
      <section className="flex justify-center gap-6 mt-8">
        <button className="backdrop-blur-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-2xl px-6 py-3 text-lg transition">
          📱 Baixar para Android
        </button>
        <button
          disabled
          className="bg-white/5 border border-white/10 text-white rounded-2xl px-6 py-3 text-lg cursor-not-allowed"
        >
          ⏳ iOS em breve
        </button>
      </section>

      {/* Section: Funcionalidades */}
      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-20">
        <FeatureCard
          title="Crie sua Página Pessoal"
          image="https://source.unsplash.com/featured/?profile,person"
          description="Mostre quem você é, o que faz, o que vende, ou simplesmente compartilhe seu estilo de vida."
        />
        <FeatureCard
          title="Venda com sua Loja"
          image="https://source.unsplash.com/featured/?ecommerce,store"
          description="Transforme sua página em uma vitrine. Adicione produtos, receba pedidos e comece a vender agora."
        />
        <FeatureCard
          title="Conecte Locais e Pessoas"
          image="https://source.unsplash.com/featured/?city,map"
          description="Descubra lojas, locais mais visitados, eventos e tudo o que está ao seu redor."
        />
        <FeatureCard
          title="Ofereça Seus Serviços"
          image="https://source.unsplash.com/featured/?freelancer,work"
          description="Você é bom em algo? Mostre o que pode fazer no dia a dia e conecte-se com quem precisa."
        />
        <FeatureCard
          title="Explore com Estilo"
          image="https://source.unsplash.com/featured/?explore,modern"
          description="Uma experiência visual e interativa de navegar entre perfis, produtos e lugares."
        />
        <FeatureCard
          title="Tudo em Um Só Lugar"
          image="https://source.unsplash.com/featured/?app,technology"
          description="Rede social, loja, mapa, perfil e muito mais. Simples, elegante e poderoso."
        />
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-500 mt-20 mb-10 text-sm">
        &copy; 2025 iUser. Todos os direitos reservados.
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, image }: FeatureCardProps) {
  return (
    <div className="rounded-2xl backdrop-blur-md bg-white/10 border border-white/10 p-4 hover:scale-105 transform transition duration-300">
      <img
        src={image}
        alt={title}
        className="w-full h-40 object-cover rounded-xl mb-4"
      />
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  );
}
