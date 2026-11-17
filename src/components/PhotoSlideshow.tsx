import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import black from "@/assets/hoodie-black.jpg.asset.json";
import yellow from "@/assets/hoodie-yellow.jpg.asset.json";
import white from "@/assets/hoodie-white.jpg.asset.json";
import brown from "@/assets/hoodie-brown.jpg.asset.json";

const photos = [
  { image: black.url, color: "black" },
  { image: yellow.url, color: "yellow" },
  { image: white.url, color: "white" },
  { image: brown.url, color: "brown" },
];

export function PhotoSlideshow() {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(true);
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
    if (!api || !playing || interacting || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) api.scrollNext();
    }, 4500);
    return () => window.clearInterval(timer);
  }, [api, playing, interacting, reducedMotion, selected]);

  return (
    <section className="campaign bg-muted" aria-label="CHVMPBUZZ collection">
      <div className="campaign-heading">
        <h1><span className="sr-only">CHVMPBUZZ</span><Logo className="text-3xl md:text-5xl" /></h1>
        <p className="mt-3 font-serif text-sm italic">Est. 2024 · Cairo</p>
      </div>
      <Carousel
        setApi={setApi}
        opts={{ loop: true, duration: reducedMotion ? 0 : 35 }}
        className="campaign-gallery bg-campaign text-campaign-foreground"
        aria-label="Hoodie collection photos"
        onMouseEnter={() => setInteracting(true)}
        onMouseLeave={() => setInteracting(false)}
        onPointerDown={() => setInteracting(true)}
        onPointerUp={() => setInteracting(false)}
        onPointerCancel={() => setInteracting(false)}
        onFocusCapture={() => setInteracting(true)}
        onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setInteracting(false); }}
      >
        <CarouselContent className="ml-0">
          {photos.map((photo, index) => (
            <CarouselItem key={photo.color} className="pl-0" aria-label={`Photo ${index + 1} of 4`}>
              <img src={photo.image} alt={`CHVMPBUZZ model wearing a ${photo.color} oversized zip hoodie, black cap and baggy jeans`} className="campaign-photo" draggable={false} loading={index === 0 ? "eager" : "lazy"} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <p className="campaign-slogan pointer-events-none font-serif italic">More than fashion.<br />Vague Vibes Everyday.<span className="mx-auto mt-4 block h-px w-16 bg-campaign-foreground/60" /></p>
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-4 md:px-8">
          <div className="flex gap-1">
            <Button variant="secondary" size="icon" aria-label="Previous photo" title="Previous photo" onClick={() => api?.scrollPrev()}><ArrowLeft /></Button>
            <Button variant="secondary" size="icon" aria-label="Next photo" title="Next photo" onClick={() => api?.scrollNext()}><ArrowRight /></Button>
            {!reducedMotion && <Button variant="secondary" size="icon" aria-label={playing ? "Pause slideshow" : "Play slideshow"} title={playing ? "Pause slideshow" : "Play slideshow"} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button>}
          </div>
          <span className="text-xs font-bold tabular-nums" aria-live="off">0{selected + 1} <span className="mx-2 text-brand">/</span> 04</span>
        </div>
      </Carousel>
      <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-5">
        <Button asChild className="h-11 px-6 text-xs font-bold uppercase"><Link to="/shop" search={{ g: "all" }}>Shop now <ArrowRight /></Link></Button>
        <Button asChild variant="outline" className="h-11 px-6 text-xs font-bold uppercase"><Link to="/shop" search={{ g: "new" }}>Explore new in</Link></Button>
      </div>
    </section>
  );
}