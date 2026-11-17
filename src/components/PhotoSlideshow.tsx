import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-campaign.jpg";
import s1 from "@/assets/slide-brown.jpg";
import s2 from "@/assets/slide-yellow.jpg";
import s3 from "@/assets/slide-3.jpg";
import s4 from "@/assets/slide-4.jpg";

const photos = [s1, s2, s3, s4];

export function PhotoSlideshow() {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => { api.off("select", update); api.off("reInit", update); };
  }, [api]);

  useEffect(() => {
    if (!api || interacting || reducedMotion) return;
    const timer = window.setInterval(() => { if (!document.hidden) api.scrollNext(); }, 4500);
    return () => window.clearInterval(timer);
  }, [api, interacting, reducedMotion, selected]);

  return (
    <>
      <section className="hero-full bg-campaign text-campaign-foreground" aria-label="CHVMPBUZZ campaign">
        <h1 className="sr-only">CHVMPBUZZ — Vague Vibes Everyday</h1>
        <img src={hero} alt="CHVMPBUZZ campaign: model in a hooded outfit, More than fashion" className="hero-full-img" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-3 px-4 pb-6">
          <Button asChild className="h-11 px-6 text-xs font-bold uppercase"><Link to="/shop" search={{ g: "all" }}>Shop now <ArrowRight /></Link></Button>
          <Button asChild variant="secondary" className="h-11 px-6 text-xs font-bold uppercase"><Link to="/shop" search={{ g: "new" }}>Explore new in</Link></Button>
        </div>
      </section>
      <Carousel
        setApi={setApi}
        opts={{ loop: true, duration: reducedMotion ? 0 : 35 }}
        className="campaign-gallery bg-campaign text-campaign-foreground"
        aria-label="Collection photos"
        onPointerDown={() => setInteracting(true)}
        onPointerUp={() => setInteracting(false)}
        onPointerCancel={() => setInteracting(false)}
        onMouseLeave={() => setInteracting(false)}
      >
        <CarouselContent className="ml-0 cursor-grab active:cursor-grabbing">
          {photos.map((src, i) => (
            <CarouselItem key={src} className="pl-0 md:basis-1/2 lg:basis-1/3" aria-label={`Photo ${i + 1} of 4`}>
              <img src={src} alt={`CHVMPBUZZ hoodie look ${i + 1}`} className="campaign-photo" draggable={false} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <p className="campaign-slogan pointer-events-none font-serif italic">More than fashion.<br />Vague Vibes Everyday.</p>
        <span className="pointer-events-none absolute bottom-4 right-4 text-xs font-bold tabular-nums">0{selected + 1} <span className="mx-2 text-brand">/</span> 04</span>
      </Carousel>
    </>
  );
}
