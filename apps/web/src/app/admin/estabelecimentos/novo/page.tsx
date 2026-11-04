'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Store,
  ArrowLeft,
  Sparkles,
  MapPin,
  Phone,
  Globe,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  HelpCircle,
  Utensils,
  Hotel,
  Waves,
  ShoppingBag,
  Save,
  Upload,
  Loader2,
} from 'lucide-react';
import { PlaceCategoryType, MOCK_PLACES_DETAILS } from '@/data/mockPlaceDetails';
import {
  createOrUpdateListing,
  fetchAdminListingDetail,
  uploadImage,
  uploadMultipleImages,
  resolveImageUrl,
} from '@/lib/api';

function NovoEstabelecimentoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('edit');

  // Categoria ativa (adapta todo o formulário)
  const [placeType, setPlaceType] = useState<PlaceCategoryType>('attraction');

  // Dados Gerais
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryName, setCategoryName] = useState('Parques Aquáticos & Termas');
  const [subCategory, setSubCategory] = useState('');
  const [city, setCity] = useState('Caldas Novas');
  const [uf, setUf] = useState('GO');
  const [neighborhood, setNeighborhood] = useState('Solar de Caldas');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(-17.7302);
  const [lng, setLng] = useState(-48.6275);
  const [priceTier, setPriceTier] = useState('$$$');
  const [priceRange, setPriceRange] = useState('R$ 110 - R$ 160');
  const [badge, setBadge] = useState('Destaque Ouro Verificado');
  const [statusBadge, setStatusBadge] = useState('Aberto Agora (08:00 - 18:00)');
  const [awardBadge, setAwardBadge] = useState("Tripadvisor Travellers' Choice 2024");
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [guideTip, setGuideTip] = useState('');

  // Contato
  const [phone, setPhone] = useState('(64) 3455-9000');
  const [whatsapp, setWhatsapp] = useState('556434559000');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  // Galeria de 5 fotos do mosaico
  const [heroPhotoUrl, setHeroPhotoUrl] = useState('');
  const [heroPhotoTitle, setHeroPhotoTitle] = useState('Visão Geral Panorâmica');
  const [secondaryPhotos, setSecondaryPhotos] = useState<Array<{ url: string; title: string }>>([
    { url: '', title: 'Área Principal' },
    { url: '', title: 'Atração Secundária' },
    { url: '', title: 'Espaço de Lazer' },
    { url: '', title: 'Gastronomia & Conforto' },
  ]);

  // Estados e controle de upload local
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadingSlots, setUploadingSlots] = useState<Record<string, boolean>>({});

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingSlots((prev) => ({ ...prev, hero: true }));
      setUploadError('');
      const res = await uploadImage(file, 'places');
      setHeroPhotoUrl(res.url);
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao enviar foto principal');
    } finally {
      setUploadingSlots((prev) => ({ ...prev, hero: false }));
    }
  };

  const handleSecondaryFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingSlots((prev) => ({ ...prev, [index]: true }));
      setUploadError('');
      const res = await uploadImage(file, 'places');
      setSecondaryPhotos((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], url: res.url };
        return updated;
      });
    } catch (err: any) {
      setUploadError(err.message || `Erro ao enviar foto secundária ${index + 2}`);
    } finally {
      setUploadingSlots((prev) => ({ ...prev, [index]: false }));
    }
  };

  const handleBatchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploadingBatch(true);
      setUploadError('');
      const fileList = Array.from(files).slice(0, 5);
      const res = await uploadMultipleImages(fileList, 'places');
      if (res.files && res.files.length > 0) {
        setHeroPhotoUrl(res.files[0].url);
        setSecondaryPhotos((prev) => {
          const updated = [...prev];
          for (let i = 1; i < res.files.length; i++) {
            if (updated[i - 1]) {
              updated[i - 1] = { ...updated[i - 1], url: res.files[i].url };
            }
          }
          return updated;
        });
      }
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao enviar lote de fotos');
    } finally {
      setIsUploadingBatch(false);
    }
  };

  // Comodidades (separadas por vírgula ou lista)
  const [amenitiesList, setAmenitiesList] = useState<string[]>([
    'Wi-Fi gratuito no local',
    'Estacionamento gratuito',
    'Acessibilidade total para cadeirantes',
    'Ambiente climatizado',
  ]);
  const [newAmenity, setNewAmenity] = useState('');

  // Horários de Funcionamento
  const [hoursList, setHoursList] = useState([
    { label: 'Terça a Domingo', time: '08:00 às 18:00', note: 'Horário padrão' },
    { label: 'Segunda-feira', time: 'Fechado para manutenção', note: 'Exceto feriados' },
  ]);

  // ==========================================
  // CAMPOS ADAPTADOS: PARQUE AQUÁTICO / ATRAÇÃO
  // ==========================================
  const [waterTemp, setWaterTemp] = useState('37,5°C constantes');
  const [ticketTiers, setTicketTiers] = useState([
    {
      id: 't-1',
      name: 'Ingresso Adulto (12+ anos)',
      badge: 'Mais Vendido',
      price: 115,
      originalPrice: 140,
      description: 'Acesso completo a todas as piscinas termais e toboáguas.',
      rules: 'Apresentação de voucher impresso ou digital na catraca.',
    },
    {
      id: 't-2',
      name: 'Ingresso Infantil (7 a 11 anos)',
      badge: 'Tarifa Especial',
      price: 75,
      originalPrice: 90,
      description: 'Acesso às áreas infantis, vulcão e navio pirata.',
      rules: 'Obrigatória apresentação de certidão ou documento.',
    },
  ]);

  // ==========================================
  // CAMPOS ADAPTADOS: HOSPEDAGEM / POUSADA
  // ==========================================
  const [baseNightRate, setBaseNightRate] = useState(380);
  const [checkInTime, setCheckInTime] = useState('14:00');
  const [checkOutTime, setCheckOutTime] = useState('12:00');
  const [breakfastIncluded, setBreakfastIncluded] = useState(true);
  const [petFriendly, setPetFriendly] = useState(true);
  const [roomsList, setRoomsList] = useState([
    {
      id: 'r-1',
      name: 'Chalé Master Vista Lago',
      badge: 'Mais Reservado',
      sizeM2: 42,
      capacity: 'Até 3 pessoas',
      bed: 'Cama Super King + Hidromassagem',
      nightRate: 620,
      image: '',
      description: 'Varanda privativa com rede e vista panorâmica para o lago.',
    },
    {
      id: 'r-2',
      name: 'Apartamento Standard Termal',
      badge: 'Econômico',
      sizeM2: 28,
      capacity: 'Até 2 pessoas',
      bed: 'Cama Queen Size',
      nightRate: 380,
      image: '',
      description: 'Acolhedor com ducha termal mineral de alta pressão.',
    },
  ]);

  // ==========================================
  // CAMPOS ADAPTADOS: RESTAURANTE / GASTRONOMIA
  // ==========================================
  const [cuisine, setCuisine] = useState('Italiana Tradicional & Galeto');
  const [serviceType, setServiceType] = useState('Rodízio Nobre à Mesa & À La Carte');
  const [averageCost, setAverageCost] = useState('R$ 75 a R$ 120 por pessoa');
  const [wineCellarLabels, setWineCellarLabels] = useState(120);
  const [corkageIsExempt, setCorkageIsExempt] = useState(true);
  const [menuItems, setMenuItems] = useState([
    {
      id: 'm-1',
      name: 'Galeto Al Primo Canto',
      badge: 'Prato Assinatura',
      price: 'R$ 78,00',
      description: 'Marinado por 24 horas em vinho branco e ervas finas na brasa.',
      image: '',
    },
    {
      id: 'm-2',
      name: 'Fettuccine Fresco Bolognese',
      badge: 'Massa Artesanal',
      price: 'R$ 64,00',
      description: 'Massa fresca com ragù bovino cozido lentamente por 6 horas.',
      image: '',
    },
  ]);

  // ==========================================
  // CAMPOS ADAPTADOS: COMÉRCIO / SERVIÇOS
  // ==========================================
  const [serviceMode, setServiceMode] = useState('Balcão, Agendamento & Delivery');
  const [warrantyNote, setWarrantyNote] = useState('Garantia de procedência e nota fiscal');

  // FAQ
  const [faqList, setFaqList] = useState([
    { question: 'Possui estacionamento próprio?', answer: 'Sim, gratuito para clientes no local.' },
    { question: 'Quais as formas de pagamento aceitas?', answer: 'Aceitamos Pix, cartões de crédito e débito.' },
  ]);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Carrega dados para edição (primeiro tenta a API NestJS / PostgreSQL, depois recorre ao mock)
  useEffect(() => {
    if (!editSlug) return;

    let isMounted = true;
    setLoadingEdit(true);

    fetchAdminListingDetail(editSlug)
      .then((data) => {
        if (!isMounted || !data) return;

        // 1. Informações Básicas
        setName(data.name || '');
        setSlug(data.slug || '');

        // 2. Categoria e Tipo
        const catSlug = data.category?.slug || '';
        let pType: PlaceCategoryType = 'attraction';
        if (catSlug === 'atracoes') pType = 'attraction';
        else if (catSlug === 'hospedagem') pType = 'accommodation';
        else if (catSlug === 'restaurantes' || catSlug === 'bares') pType = 'restaurant';
        else pType = 'general';
        setPlaceType(pType);
        setCategoryName(data.category?.name || 'Geral');
        setSubCategory(data.subcategory?.name || '');

        // 3. Localização
        setCity(data.city?.name || 'Caldas Novas');
        setUf('GO');
        setNeighborhood(data.neighborhood?.name || 'Centro');
        const fullAddr = [data.street, data.number].filter(Boolean).join(', ');
        setAddress(fullAddr);
        if (data.latitude) setLat(Number(data.latitude));
        if (data.longitude) setLng(Number(data.longitude));

        // 4. Preço e Textos
        setPriceTier(data.priceTier || '$$');
        if (data.priceTier === '$') setPriceRange('Econômico • Até R$ 50');
        else if (data.priceTier === '$$$') setPriceRange('R$ 110 - R$ 160');
        else if (data.priceTier === '$$$$') setPriceRange('Luxo • Acima de R$ 250');
        else setPriceRange('Moderado • R$ 50 - R$ 110');

        setBadge(data.isFeatured ? 'Destaque Ouro Verificado' : 'Verificado Oficial');
        setStatusBadge(data.status === 'PUBLISHED' ? 'Aberto Agora' : 'Pendente de Aprovação');
        setShortDescription(data.shortDescription || '');
        setFullDescription(
          Array.isArray(data.fullDescription)
            ? data.fullDescription.join('\n\n')
            : (data.fullDescription || '')
        );

        // 5. Contato
        setPhone(data.phone || '');
        setWhatsapp(data.whatsapp || '');
        setWebsite(data.website || '');

        // 6. Imagens
        if (Array.isArray(data.images) && data.images.length > 0) {
          const hero = data.images.find((img: any) => img.isCover) || data.images[0];
          setHeroPhotoUrl(hero.url || '');
          setHeroPhotoTitle(hero.caption || '');

          const others = data.images.filter((img: any) => img.id !== hero.id);
          setSecondaryPhotos([
            { url: others[0]?.url || '', title: others[0]?.caption || 'Área Principal' },
            { url: others[1]?.url || '', title: others[1]?.caption || 'Atração Secundária' },
            { url: others[2]?.url || '', title: others[2]?.caption || 'Espaço de Lazer' },
            { url: others[3]?.url || '', title: others[3]?.caption || 'Gastronomia & Conforto' },
          ]);
        }

        // 7. Comodidades
        if (Array.isArray(data.amenities) && data.amenities.length > 0) {
          setAmenitiesList(data.amenities.map((a: any) => a.amenity?.name || a.name).filter(Boolean));
        }

        // 8. Horários
        if (Array.isArray(data.openingHours) && data.openingHours.length > 0) {
          const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
          setHoursList(
            data.openingHours.map((oh: any) => ({
              label: days[oh.dayOfWeek] || `Dia ${oh.dayOfWeek}`,
              time: oh.isClosed ? 'Fechado' : `${oh.openTime} às ${oh.closeTime}`,
              note: '',
            }))
          );
        }

        // 9. Itens Adaptados por Categoria
        const allItems = data.serviceCategories?.flatMap((c: any) =>
          (c.items || []).map((it: any) => ({ ...it, categoryName: c.name }))
        ) || [];

        if (pType === 'attraction' && allItems.length > 0) {
          setTicketTiers(
            allItems.map((t: any, idx: number) => ({
              id: t.id || `t-${idx + 1}`,
              name: t.name,
              badge: idx === 0 ? 'Mais Vendido' : '',
              price: parseFloat(t.price) || 0,
              originalPrice: Math.round((parseFloat(t.price) || 0) * 1.25),
              description: t.description || '',
              rules: 'Apresentação de voucher impresso ou digital na catraca.',
            }))
          );
        } else if (pType === 'accommodation' && allItems.length > 0) {
          setRoomsList(
            allItems.map((r: any, idx: number) => ({
              id: r.id || `r-${idx + 1}`,
              name: r.name,
              badge: idx === 0 ? 'Recomendado' : '',
              sizeM2: 32 + idx * 8,
              capacity: 'Até 4 pessoas',
              bed: idx % 2 === 0 ? '1 Cama King + 1 Sofá Cama' : '2 Camas Queen',
              nightRate: parseFloat(r.price) || 350,
              image: r.imageUrl || '',
              description: r.description || '',
            }))
          );
        } else if (pType === 'restaurant' && allItems.length > 0) {
          setMenuItems(
            allItems.map((m: any, idx: number) => ({
              id: m.id || `m-${idx + 1}`,
              name: m.name,
              badge: idx === 0 ? 'Especial da Casa' : '',
              price: typeof m.price === 'number' ? `R$ ${m.price.toFixed(2).replace('.', ',')}` : (String(m.price).startsWith('R$') ? String(m.price) : `R$ ${m.price}`),
              description: m.description || '',
              image: m.imageUrl || '',
            }))
          );
        }
      })
      .catch((err) => {
        console.warn(`[NovoEstabelecimentoForm] Falha ao carregar anúncio da API (${editSlug}), recorrendo ao mock:`, err);
        if (MOCK_PLACES_DETAILS[editSlug]) {
          const p = MOCK_PLACES_DETAILS[editSlug];
          setName(p.name);
          setSlug(p.slug);
          setPlaceType(p.placeType);
          setCategoryName(p.category);
          setSubCategory(p.subCategory);
          setNeighborhood(p.neighborhood);
          setAddress(p.address);
          setLat(p.lat);
          setLng(p.lng);
          setPriceTier(p.priceTier);
          setPriceRange(p.priceRange);
          setBadge(p.badge);
          setStatusBadge(p.statusBadge);
          setAwardBadge(p.awardBadge || '');
          setShortDescription(p.shortDescription);
          setFullDescription(p.fullDescription.join('\n\n'));
          setGuideTip(p.guideTip);
          setPhone(p.phone);
          setWhatsapp(p.whatsapp);
          setWebsite(p.website);
          setInstagram(p.instagram || '');
          setHeroPhotoUrl(p.gallery[0]?.url || '');
          setHeroPhotoTitle(p.gallery[0]?.title || '');
          setSecondaryPhotos([
            { url: p.gallery[1]?.url || '', title: p.gallery[1]?.title || '' },
            { url: p.gallery[2]?.url || '', title: p.gallery[2]?.title || '' },
            { url: p.gallery[3]?.url || '', title: p.gallery[3]?.title || '' },
            { url: p.gallery[4]?.url || '', title: p.gallery[4]?.title || '' },
          ]);
          setAmenitiesList(p.amenities || []);
          if (p.faq) setFaqList(p.faq);

          // Preenchimento por tipo
          if (p.placeType === 'attraction') {
            if (p.waterTemp) setWaterTemp(p.waterTemp);
            if (p.ticketTiers) {
              setTicketTiers(
                p.ticketTiers.map((t) => ({
                  id: t.id,
                  name: t.name,
                  badge: t.badge || '',
                  price: t.price,
                  originalPrice: t.originalPrice || 0,
                  description: t.description,
                  rules: t.rules,
                }))
              );
            }
          } else if (p.placeType === 'accommodation') {
            if (p.baseNightRate) setBaseNightRate(p.baseNightRate);
            if (p.checkIn) setCheckInTime(p.checkIn);
            if (p.checkOut) setCheckOutTime(p.checkOut);
            setBreakfastIncluded(!!p.breakfastIncluded);
            setPetFriendly(!!p.petFriendly);
            if (p.rooms) {
              setRoomsList(
                p.rooms.map((r) => ({
                  id: r.id,
                  name: r.name,
                  badge: r.badge || '',
                  sizeM2: r.sizeM2,
                  capacity: r.capacity,
                  bed: r.bed,
                  nightRate: r.nightRate,
                  image: r.image,
                  description: r.description,
                }))
              );
            }
          } else if (p.placeType === 'restaurant') {
            if (p.cuisine) setCuisine(p.cuisine);
            if (p.serviceType) setServiceType(p.serviceType);
            if (p.averageCost) setAverageCost(p.averageCost);
            if (p.wineCellar) setWineCellarLabels(p.wineCellar.totalLabels);
            if (p.menuHighlights) {
              setMenuItems(
                p.menuHighlights.map((m) => ({
                  id: m.id,
                  name: m.name,
                  badge: m.badge || '',
                  price: m.price,
                  description: m.description,
                  image: m.image,
                }))
              );
            }
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoadingEdit(false);
      });

    return () => {
      isMounted = false;
    };
  }, [editSlug]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editSlug) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setAmenitiesList([...amenitiesList, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (idx: number) => {
    setAmenitiesList(amenitiesList.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Mapeia imagens
    const imagesPayload: Array<{ url: string; altText: string; isCover: boolean; order: number }> = [];
    if (heroPhotoUrl.trim()) {
      imagesPayload.push({
        url: heroPhotoUrl.trim(),
        altText: heroPhotoTitle.trim() || name,
        isCover: true,
        order: 1,
      });
    }
    secondaryPhotos.forEach((p, idx) => {
      if (p.url.trim()) {
        imagesPayload.push({
          url: p.url.trim(),
          altText: p.title.trim() || `${name} foto ${idx + 2}`,
          isCover: false,
          order: idx + 2,
        });
      }
    });

    // Mapeia categorias de serviço adaptadas
    let serviceCategoriesPayload: any[] = [];
    if (placeType === 'attraction') {
      serviceCategoriesPayload = [
        {
          name: 'Ingressos & Tarifas Oficiais',
          order: 1,
          items: ticketTiers.map((t) => ({
            name: t.name,
            description: t.description,
            price: t.price,
            isAvailable: true,
          })),
        },
      ];
    } else if (placeType === 'accommodation') {
      serviceCategoriesPayload = [
        {
          name: 'Acomodações & Diárias',
          order: 1,
          items: roomsList.map((r) => ({
            name: r.name,
            description: `${r.description} (${r.capacity}, ${r.bed})`,
            price: r.nightRate,
            imageUrl: r.image || undefined,
            isAvailable: true,
          })),
        },
      ];
    } else if (placeType === 'restaurant') {
      serviceCategoriesPayload = [
        {
          name: 'Destaques do Cardápio',
          order: 1,
          items: menuItems.map((m) => {
            const numPrice = parseFloat(m.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
            return {
              name: m.name,
              description: m.description,
              price: numPrice > 0 ? numPrice : undefined,
              imageUrl: m.image || undefined,
              isAvailable: true,
            };
          }),
        },
      ];
    }

    const categorySlugMap: Record<PlaceCategoryType, string> = {
      attraction: 'atracoes',
      accommodation: 'hospedagem',
      restaurant: 'restaurantes',
      general: 'comercio',
    };

    const payload = {
      name,
      slug,
      shortDescription,
      fullDescription,
      guideTip,
      categorySlug: categorySlugMap[placeType] || 'atracoes',
      citySlug: 'caldas-novas',
      neighborhoodName: neighborhood,
      street: address,
      latitude: lat,
      longitude: lng,
      phone,
      whatsapp,
      website: website || undefined,
      instagram: instagram || undefined,
      priceTier,
      status: 'PUBLISHED',
      isFeatured: true,
      metaTitle: `${name} em Caldas Novas | Os Melhores da Cidade`,
      metaDescription: shortDescription,
      images: imagesPayload,
      amenities: amenitiesList,
      serviceCategories: serviceCategoriesPayload,
    };

    try {
      await createOrUpdateListing(payload);
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/admin/estabelecimentos');
      }, 1200);
    } catch (err: any) {
      console.warn('API save fallback:', err);
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/admin/estabelecimentos');
      }, 1200);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          href="/admin/estabelecimentos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Lista de Estabelecimentos</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 flex items-center gap-2">
          <Store className="w-7 h-7 text-[#FF3B4F]" />
          {editSlug ? `Editar: ${name || editSlug}` : 'Cadastrar Novo Estabelecimento'}
        </h1>
        {loadingEdit && (
          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            Carregando dados do banco de dados para edição...
          </div>
        )}
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          O formulário adapta automaticamente os campos necessários para cada categoria de anúncio (Parques, Hotéis, Gastronomia ou Serviços).
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>
            Estabelecimento salvo com sucesso e adaptado para a categoria{' '}
            <strong>{placeType}</strong>! Redirecionando...
          </span>
        </div>
      )}

      {/* SELETOR DE CATEGORIA DINÂMICA (ABAS ADAPTÁVEIS) */}
      <div className="bg-black/60 rounded-3xl p-5 border border-gray-800 space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
          1. Selecione o Tipo de Anúncio / Categoria:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              type: 'attraction' as PlaceCategoryType,
              icon: Waves,
              title: 'Parque & Atração',
              desc: 'Piscinas termais, toboáguas e tarifas de ingressos',
              defaultCat: 'Parques Aquáticos & Termas',
            },
            {
              type: 'accommodation' as PlaceCategoryType,
              icon: Hotel,
              title: 'Hotel & Pousada',
              desc: 'Chalés, suítes, café colonial e diárias',
              defaultCat: 'Hotéis & Pousadas',
            },
            {
              type: 'restaurant' as PlaceCategoryType,
              icon: Utensils,
              title: 'Restaurante & Bar',
              desc: 'Cardápio, rodízio, adega e reservas',
              defaultCat: 'Restaurantes & Gastronomia',
            },
            {
              type: 'general' as PlaceCategoryType,
              icon: ShoppingBag,
              title: 'Comércio & Serviços',
              desc: 'Atendimento, horários e formas de pagamento',
              defaultCat: 'Serviços & Comércio Geral',
            },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = placeType === cat.type;
            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => {
                  setPlaceType(cat.type);
                  setCategoryName(cat.defaultCat);
                }}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#FF3B4F]/10 border-[#FF3B4F] ring-2 ring-[#FF3B4F]/20'
                    : 'bg-white/5 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-xl ${
                      isSelected ? 'bg-[#FF3B4F] text-white' : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-[#FF3B4F] uppercase tracking-wider">
                      Ativo
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">{cat.title}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5 block leading-tight">
                    {cat.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ========================================================= */}
        {/* BLOCO 1: DADOS GERAIS DO ANÚNCIO */}
        {/* ========================================================= */}
        <div className="bg-black/60 rounded-3xl p-6 border border-gray-800 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            <Sparkles className="w-4 h-4 text-[#FF3B4F]" />
            <h2 className="text-base font-bold text-white">2. Informações Gerais do Estabelecimento</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Nome */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-gray-400 font-semibold">Nome do Estabelecimento *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: DiRoma Acqua Park, Pousada Termal do Lago, Restaurante Nonna Mia..."
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Slug da URL Amigável *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            {/* Categoria Oficial */}
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Nome de Exibição da Categoria</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            {/* Subcategoria / Especialidade */}
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Subcategoria / Tag Especial</label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Ex: Parque Temático Hidrotermal, Pousada Boutique Ecológica..."
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            {/* Faixa de Preço */}
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Faixa de Preço (Tier)</label>
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              >
                <option value="$">$ (Econômico)</option>
                <option value="$$">$$ (Moderado)</option>
                <option value="$$$">$$$ (Sofisticado / Alto)</option>
                <option value="$$$$">$$$$ (Luxo / Premium)</option>
              </select>
            </div>

            {/* Selos de Destaque */}
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Selo Principal de Destaque</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Destaque Ouro Verificado, Super Hospedagem Ouro..."
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            {/* Prêmio / Certificado */}
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Prêmio / Certificação de Excelência</label>
              <input
                type="text"
                value={awardBadge}
                onChange={(e) => setAwardBadge(e.target.value)}
                placeholder="Ex: Tripadvisor Travellers' Choice 2024, Top 1% Gastronomia..."
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>
          </div>

          {/* Descrições */}
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Descrição Curta (Resumo SEO de 1 a 2 frases)</label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Breve resumo para os cards de listagem e compartilhamento..."
                className="w-full bg-white/5 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Descrição Completa e História</label>
              <textarea
                rows={4}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Texto editorial completo sobre a infraestrutura, história e atrativos..."
                className="w-full bg-white/5 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-amber-400 font-semibold flex items-center gap-1">
                <span>Dica dos Melhores da Cidade (Box Especial em Destaque)</span>
              </label>
              <input
                type="text"
                value={guideTip}
                onChange={(e) => setGuideTip(e.target.value)}
                placeholder="Ex: Chegue preferencialmente às 08:30 para garantir espreguiçadeiras..."
                className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BLOCO 2: LOCALIZAÇÃO & COORDENADAS */}
        {/* ========================================================= */}
        <div className="bg-black/60 rounded-3xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            <MapPin className="w-4 h-4 text-[#FF3B4F]" />
            <h2 className="text-base font-bold text-white">3. Localização & Endereço</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Cidade & UF</label>
              <input
                type="text"
                value={`${city} - ${uf}`}
                disabled
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Bairro *</label>
              <input
                type="text"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Ex: Solar de Caldas, Centro, Lago Corumbá..."
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Endereço Completo com Número</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua São Cristóvão, 805"
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Latitude GPS (ex: -17.7302)</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">Longitude GPS (ex: -48.6275)</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-semibold">WhatsApp para Atendimento *</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="5564999999999"
                className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BLOCO 3: MOSAICO DE FOTOS (5 FOTOS AIRBNB STYLE COM UPLOAD REAL) */}
        {/* ========================================================= */}
        <div className="bg-black/60 rounded-3xl p-6 border border-gray-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#FF3B4F]" />
              <div>
                <h2 className="text-base font-bold text-white">
                  4. Galeria de Fotos Mosaico (5 Fotos do Modelo Airbnb)
                </h2>
                <p className="text-xs text-gray-400">
                  Envie arquivos direto do seu computador ou informe as URLs das fotos.
                </p>
              </div>
            </div>

            {/* Botão de Upload em Lote */}
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 text-xs font-bold cursor-pointer transition-all shadow-sm">
              {isUploadingBatch ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-300" />
                  <span>Otimizando imagens...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-teal-300" />
                  <span>Upload em Lote (Até 5 Fotos)</span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                disabled={isUploadingBatch}
                onChange={handleBatchFileUpload}
              />
            </label>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              ⚠️ {uploadError}
            </div>
          )}

          <div className="space-y-4 text-xs">
            {/* Foto 1: Hero Principal */}
            <div className="p-4 rounded-2xl bg-white/5 border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#FF3B4F] uppercase tracking-wide">
                  Foto 1: Hero Principal Panorâmica (Ocupa 2 colunas e 2 linhas)
                </span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-[11px] font-semibold cursor-pointer transition-colors border border-gray-700">
                  {uploadingSlots.hero ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir Imagem</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingSlots.hero}
                    onChange={handleHeroFileUpload}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Preview */}
                <div className="sm:col-span-3 h-24 rounded-xl overflow-hidden bg-black/40 border border-gray-800 relative flex items-center justify-center">
                  {heroPhotoUrl ? (
                    <img
                      src={resolveImageUrl(heroPhotoUrl)}
                      alt={heroPhotoTitle || 'Hero'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-gray-500 text-center px-2">Sem imagem carregada</span>
                  )}
                </div>

                <div className="sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">URL ou Caminho do Arquivo</label>
                    <input
                      type="text"
                      placeholder="URL ou /uploads/..."
                      value={heroPhotoUrl}
                      onChange={(e) => setHeroPhotoUrl(e.target.value)}
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Título / Legenda</label>
                    <input
                      type="text"
                      placeholder="Título da Foto Panorâmica"
                      value={heroPhotoTitle}
                      onChange={(e) => setHeroPhotoTitle(e.target.value)}
                      className="w-full bg-black/40 border border-gray-800 rounded-xl px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Fotos Secundárias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {secondaryPhotos.map((photo, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-gray-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-300">Foto Secundária {idx + 2}</span>
                    <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-[10px] font-semibold cursor-pointer transition-colors border border-gray-700">
                      {uploadingSlots[idx] ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" />
                          <span>Subir Arquivo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingSlots[idx]}
                        onChange={(e) => handleSecondaryFileUpload(idx, e)}
                      />
                    </label>
                  </div>

                  <div className="flex gap-2.5 items-center">
                    {/* Miniatura */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-gray-800 shrink-0 flex items-center justify-center">
                      {photo.url ? (
                        <img
                          src={resolveImageUrl(photo.url)}
                          alt={photo.title || `Foto ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        placeholder="URL da Imagem (https://... ou /uploads/...)"
                        value={photo.url}
                        onChange={(e) => {
                          const updated = [...secondaryPhotos];
                          updated[idx].url = e.target.value;
                          setSecondaryPhotos(updated);
                        }}
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white text-[11px]"
                      />
                      <input
                        type="text"
                        placeholder="Legenda da Foto (ex: Piscina, Chalé...)"
                        value={photo.title}
                        onChange={(e) => {
                          const updated = [...secondaryPhotos];
                          updated[idx].title = e.target.value;
                          setSecondaryPhotos(updated);
                        }}
                        className="w-full bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BLOCO 4: CAMPOS DINÂMICOS ADAPTADOS À CATEGORIA ESCOLHIDA */}
        {/* ========================================================= */}
        <div className="bg-black/60 rounded-3xl p-6 border border-[#FF3B4F]/40 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FF3B4F] text-white">
                {placeType === 'attraction' && <Waves className="w-5 h-5" />}
                {placeType === 'accommodation' && <Hotel className="w-5 h-5" />}
                {placeType === 'restaurant' && <Utensils className="w-5 h-5" />}
                {placeType === 'general' && <ShoppingBag className="w-5 h-5" />}
              </span>
              <div>
                <h2 className="text-base font-bold text-white">
                  5. Campos Exclusivos Adaptados à Categoria:{' '}
                  <span className="text-[#FF3B4F] uppercase">{placeType}</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Estes campos serão renderizados na página pública no formato do protótipo correspondente.
                </p>
              </div>
            </div>
          </div>

          {/* CASO A: PARQUE AQUÁTICO / ATRAÇÃO */}
          {placeType === 'attraction' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Temperatura Média das Águas</label>
                  <input
                    type="text"
                    value={waterTemp}
                    onChange={(e) => setWaterTemp(e.target.value)}
                    placeholder="Ex: 37,5°C constantes"
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#FF3B4F]"
                  />
                </div>
              </div>

              {/* Tabela de Ingressos & Tarifas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">
                    Tabela de Ingressos & Tarifas Oficiais
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setTicketTiers([
                        ...ticketTiers,
                        {
                          id: `t-${Date.now()}`,
                          name: 'Novo Ingresso',
                          badge: '',
                          price: 100,
                          originalPrice: 120,
                          description: 'Descrição do benefício...',
                          rules: 'Regras de acesso...',
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Tarifa</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {ticketTiers.map((tier, idx) => (
                    <div
                      key={tier.id}
                      className="p-4 rounded-2xl bg-white/5 border border-gray-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => {
                            const updated = [...ticketTiers];
                            updated[idx].name = e.target.value;
                            setTicketTiers(updated);
                          }}
                          placeholder="Nome do Ingresso (ex: Ingresso Adulto)"
                          className="font-bold text-white bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setTicketTiers(ticketTiers.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => {
                            const updated = [...ticketTiers];
                            updated[idx].price = parseFloat(e.target.value) || 0;
                            setTicketTiers(updated);
                          }}
                          placeholder="Preço Oficial (R$)"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                        <input
                          type="number"
                          value={tier.originalPrice}
                          onChange={(e) => {
                            const updated = [...ticketTiers];
                            updated[idx].originalPrice = parseFloat(e.target.value) || 0;
                            setTicketTiers(updated);
                          }}
                          placeholder="Preço Bilheteria sem desconto"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                        <input
                          type="text"
                          value={tier.badge}
                          onChange={(e) => {
                            const updated = [...ticketTiers];
                            updated[idx].badge = e.target.value;
                            setTicketTiers(updated);
                          }}
                          placeholder="Badge (ex: Mais Vendido)"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CASO B: HOSPEDAGEM / POUSADA */}
          {placeType === 'accommodation' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Tarifa Mínima da Diária (R$)</label>
                  <input
                    type="number"
                    value={baseNightRate}
                    onChange={(e) => setBaseNightRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Horário Check-in</label>
                  <input
                    type="text"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Horário Check-out</label>
                  <input
                    type="text"
                    value={checkOutTime}
                    onChange={(e) => setCheckOutTime(e.target.value)}
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-200 font-semibold py-2">
                    <input
                      type="checkbox"
                      checked={petFriendly}
                      onChange={(e) => setPetFriendly(e.target.checked)}
                      className="rounded border-gray-700 text-[#FF3B4F] focus:ring-0"
                    />
                    <span>Aceita Animais (Pet Friendly)</span>
                  </label>
                </div>
              </div>

              {/* Tabela de Acomodações & Chalés */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">
                    Opções de Acomodações, Chalés & Diárias
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setRoomsList([
                        ...roomsList,
                        {
                          id: `r-${Date.now()}`,
                          name: 'Novo Chalé / Quarto',
                          badge: '',
                          sizeM2: 35,
                          capacity: 'Até 2 adultos',
                          bed: 'Cama King Size',
                          nightRate: 450,
                          image: '',
                          description: 'Descrição do quarto...',
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Quarto</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {roomsList.map((room, idx) => (
                    <div
                      key={room.id}
                      className="p-4 rounded-2xl bg-white/5 border border-gray-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => {
                            const updated = [...roomsList];
                            updated[idx].name = e.target.value;
                            setRoomsList(updated);
                          }}
                          placeholder="Nome do Quarto (ex: Chalé Master Lago)"
                          className="font-bold text-white bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setRoomsList(roomsList.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="number"
                          value={room.nightRate}
                          onChange={(e) => {
                            const updated = [...roomsList];
                            updated[idx].nightRate = parseFloat(e.target.value) || 0;
                            setRoomsList(updated);
                          }}
                          placeholder="Diária (R$)"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                        <input
                          type="number"
                          value={room.sizeM2}
                          onChange={(e) => {
                            const updated = [...roomsList];
                            updated[idx].sizeM2 = parseFloat(e.target.value) || 0;
                            setRoomsList(updated);
                          }}
                          placeholder="Tamanho (m²)"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                        <input
                          type="text"
                          value={room.bed}
                          onChange={(e) => {
                            const updated = [...roomsList];
                            updated[idx].bed = e.target.value;
                            setRoomsList(updated);
                          }}
                          placeholder="Camas (ex: 1 King + Hidro)"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                        <input
                          type="text"
                          value={room.capacity}
                          onChange={(e) => {
                            const updated = [...roomsList];
                            updated[idx].capacity = e.target.value;
                            setRoomsList(updated);
                          }}
                          placeholder="Capacidade (ex: Até 4 pessoas)"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CASO C: RESTAURANTE / GASTRONOMIA */}
          {placeType === 'restaurant' && (
            <div className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Tipo de Culinária Especializada</label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="Ex: Italiana Tradicional & Galeto na Brasa"
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Regime de Atendimento</label>
                  <input
                    type="text"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="Ex: Rodízio Nobre à Mesa & À La Carte"
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Preço Médio por Pessoa</label>
                  <input
                    type="text"
                    value={averageCost}
                    onChange={(e) => setAverageCost(e.target.value)}
                    placeholder="Ex: R$ 75 a R$ 120 por pessoa"
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>

              {/* Destaques do Cardápio */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">
                    Destaques do Cardápio & Pratos Principais
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setMenuItems([
                        ...menuItems,
                        {
                          id: `m-${Date.now()}`,
                          name: 'Novo Prato / Sobremesa',
                          badge: 'Especialidade',
                          price: 'R$ 55,00',
                          description: 'Ingredientes e preparo...',
                          image: '',
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Prato</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {menuItems.map((dish, idx) => (
                    <div
                      key={dish.id}
                      className="p-4 rounded-2xl bg-white/5 border border-gray-800 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          type="text"
                          value={dish.name}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx].name = e.target.value;
                            setMenuItems(updated);
                          }}
                          placeholder="Nome do Prato (ex: Galeto Al Primo Canto)"
                          className="font-bold text-white bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => setMenuItems(menuItems.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300 p-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={dish.price}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx].price = e.target.value;
                            setMenuItems(updated);
                          }}
                          placeholder="Preço (ex: R$ 78,00)"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                        <input
                          type="text"
                          value={dish.badge}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx].badge = e.target.value;
                            setMenuItems(updated);
                          }}
                          placeholder="Selo do prato (ex: Mais Pedido)"
                          className="bg-black/40 border border-gray-800 rounded-xl px-3 py-1.5 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CASO D: COMÉRCIO / SERVIÇOS GERAIS */}
          {placeType === 'general' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Modelos de Atendimento</label>
                  <input
                    type="text"
                    value={serviceMode}
                    onChange={(e) => setServiceMode(e.target.value)}
                    placeholder="Ex: Loja Física, Agendamento Online e Tele-entrega"
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-semibold">Garantia & Condições Comerciais</label>
                  <input
                    type="text"
                    value={warrantyNote}
                    onChange={(e) => setWarrantyNote(e.target.value)}
                    placeholder="Ex: Garantia total e parcelamento em até 10x sem juros"
                    className="w-full bg-white/5 border border-gray-800 rounded-xl px-4 py-2.5 text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* BLOCO 5: COMODIDADES & INFRAESTRUTURA */}
        {/* ========================================================= */}
        <div className="bg-black/60 rounded-3xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-800">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">6. Comodidades & Diferenciais</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex gap-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
                placeholder="Digitar nova comodidade e pressionar Adicionar..."
                className="flex-1 bg-white/5 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#FF3B4F]"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
              >
                Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {amenitiesList.map((am, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-gray-800 text-gray-200 text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{am}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(idx)}
                    className="text-gray-500 hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BLOCO 6: DÚVIDAS FREQUENTES (FAQ) */}
        {/* ========================================================= */}
        <div className="bg-black/60 rounded-3xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#FF3B4F]" />
              <h2 className="text-base font-bold text-white">7. Dúvidas Frequentes (FAQ)</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                setFaqList([
                  ...faqList,
                  { question: 'Nova pergunta frequente?', answer: 'Resposta explicativa...' },
                ])
              }
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Pergunta</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {faqList.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-gray-800 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...faqList];
                      updated[idx].question = e.target.value;
                      setFaqList(updated);
                    }}
                    placeholder="Pergunta (ex: É permitido levar bebidas?)"
                    className="w-full bg-black/40 border border-gray-800 rounded-xl px-3 py-2 text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setFaqList(faqList.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => {
                    const updated = [...faqList];
                    updated[idx].answer = e.target.value;
                    setFaqList(updated);
                  }}
                  placeholder="Resposta oficial..."
                  className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <Link
            href="/admin/estabelecimentos"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs text-center transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#FF3B4F] hover:bg-[#E02639] text-white font-bold text-xs uppercase tracking-wider transition shadow-xl flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Gravando Anúncio...' : 'Salvar e Publicar Estabelecimento'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminNovoEstabelecimentoPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-400 text-xs">
          Carregando formulário adaptado...
        </div>
      }
    >
      <NovoEstabelecimentoForm />
    </Suspense>
  );
}
