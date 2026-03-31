import React from "react";

export type GalleryStyle =
  | "filmstrip"
  | "blueprint-grid"
  | "panoramic"
  | "timeline-strip"
  | "depth-cards";

export type GalleryItem = {
  id: string;
  caption: string;
  imagePath?: string;
  gradient: string;
};

export type Hobby = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  icon: React.ElementType;
  gradient: string;
  accentColor: string; // hex — used in inline styles only, never in dynamic Tailwind classes
  galleryStyle: GalleryStyle;
  gallery: GalleryItem[];
  featured?: boolean;
};
