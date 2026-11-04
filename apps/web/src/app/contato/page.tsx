'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ContatoPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Caldas Novas');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Header currentCitySlug="caldas-novas" />

      <main className="flex-1 flex flex-col bg-[#FCF9F8] pb-16 sm:pb-0">
        <section className="py-12 sm:py-16 px-6 bg-white border-b border-[#E5E7EB] text-center">
          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF3B4F] bg-[#FFF1F2] px-3.5 py-1 rounded-full inline-block mb-3">
              Fale Conosco
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Entre em Contato com a Nossa Equipe
            </h1>
            <p className="text-xs sm:text-sm text-[#777777] mt-2">
              Dúvidas sobre o portal, sugestões editoriais ou parcerias comerciais.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6 py-12 w-full grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Informações */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-card space-y-6">
              <h2 className="font-bold text-lg text-[#171717]">Canais Oficiais</h2>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#FF3B4F] flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#171717] block">E-mail Comercial</span>
                    <span className="text-[#777777]">contato@osmelhoresdacidade.com.br</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#171717] block">Atendimento WhatsApp</span>
                    <span className="text-[#777777]">(64) 99999-0000</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#171717] block">Sede Operacional</span>
                    <span className="text-[#777777]">Caldas Novas, Goiás — Brasil</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="md:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E7EB] shadow-card">
              {submitted ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#171717]">Mensagem Enviada!</h3>
                  <p className="text-xs text-[#777777] max-w-sm mx-auto">
                    Obrigado por nos contatar. Responderemos em até 24 horas úteis.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome e sobrenome"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                        Telefone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(64) 99999-9999"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                      Cidade de Interesse
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#171717] uppercase tracking-wider mb-1">
                      Mensagem *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Como podemos te ajudar?"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#171717] focus:ring-2 focus:ring-[#FF3B4F] outline-none"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full">
                    Enviar Mensagem
                  </Button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer currentCitySlug="caldas-novas" />
      <MobileNav currentCitySlug="caldas-novas" />
    </>
  );
}

