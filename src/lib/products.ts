import hoodie from "@/assets/p-hoodie.jpg";
import tee from "@/assets/p-tee.jpg";
import jeans from "@/assets/p-jeans.jpg";
import cap from "@/assets/p-cap.jpg";

export type Gender = "men" | "women";
export type Product = {
  id: string; name: string; price: number; image: string; gender: Gender[];
  colors: { name: string; hex: string }[]; sizes: string[]; isNew?: boolean;
};
const BW = [{ name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" }];
const CL = [{ name: "Black", hex: "#000000" }, { name: "Grey", hex: "#E6E5E2" }];
const S = ["S", "M", "L", "XL"];
export const products: Product[] = [
  { id: "vague-hoodie", name: "Vague Oversized Hoodie", price: 1450, image: hoodie, gender: ["men", "women"], colors: CL, sizes: S, isNew: true },
  { id: "become-tee", name: "Become Boxy Tee", price: 650, image: tee, gender: ["men", "women"], colors: BW, sizes: S },
  { id: "build-jeans", name: "Build Baggy Jeans", price: 1250, image: jeans, gender: ["men"], colors: [{ name: "Washed black", hex: "#2a2a2a" }], sizes: ["30", "32", "34", "36"], isNew: true },
  { id: "asterisk-cap", name: "Asterisk Cap", price: 450, image: cap, gender: ["men", "women"], colors: CL, sizes: ["One size"] },
  { id: "believe-hoodie-w", name: "Believe Cropped Hoodie", price: 1350, image: hoodie, gender: ["women"], colors: CL, sizes: ["XS", "S", "M", "L"], isNew: true },
  { id: "everyday-tee-w", name: "Everyday Baby Tee", price: 550, image: tee, gender: ["women"], colors: BW, sizes: ["XS", "S", "M", "L"] },
  { id: "wide-jeans-w", name: "Wide Leg Jeans", price: 1200, image: jeans, gender: ["women"], colors: [{ name: "Washed black", hex: "#2a2a2a" }], sizes: ["26", "28", "30", "32"] },
  { id: "buzz-tee", name: "Buzz Logo Tee", price: 700, image: tee, gender: ["men"], colors: BW, sizes: S, isNew: true },
];
export const egp = (n: number) => `EGP ${n.toLocaleString("en-US")}`;
export const WHATSAPP = "201553829354";
