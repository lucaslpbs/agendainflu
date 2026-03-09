import { Instagram, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  caption: string;
}

// Mock data — substituir futuramente pela API do Instagram (Meta Graph API)
const mockPosts: InstagramPost[] = [
  { id: "1", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop", likes: 1243, comments: 87, caption: "Novo look do dia ✨ #fashion #style" },
  { id: "2", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", likes: 892, comments: 45, caption: "Parceria incrível com @marca 🤩" },
  { id: "3", imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop", likes: 2105, comments: 132, caption: "Lançamento exclusivo! Link na bio 🔥" },
  { id: "4", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", likes: 756, comments: 29, caption: "Rotina de skincare da manhã 🌿" },
  { id: "5", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", likes: 1678, comments: 94, caption: "Unboxing dos presentes que recebi 🎁" },
  { id: "6", imageUrl: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop", likes: 934, comments: 51, caption: "Behind the scenes do ensaio 📸" },
];

const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

interface InstagramFeedProps {
  instagramUrl?: string | null;
  instagramHandle?: string | null;
}

const InstagramFeed = ({ instagramUrl, instagramHandle }: InstagramFeedProps) => {
  // TODO: Futuramente, buscar posts reais via Meta Graph API
  // usando o token do Instagram Basic Display API ou Instagram Graph API
  const posts = mockPosts;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Instagram size={22} className="text-primary" />
          <h2 className="text-xl md:text-2xl font-bold font-display">Feed do Instagram</h2>
        </div>
        {instagramUrl && (
          <a
            href={instagramUrl.startsWith("http") ? instagramUrl : `https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <ExternalLink size={14} />
              Ver no Instagram
            </Button>
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {posts.map((post) => (
          <div key={post.id} className="group relative aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer">
            <img
              src={post.imageUrl}
              alt={post.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-5">
              <span className="flex items-center gap-1.5 text-background font-semibold text-sm">
                <Heart size={18} className="fill-background" /> {formatNumber(post.likes)}
              </span>
              <span className="flex items-center gap-1.5 text-background font-semibold text-sm">
                <MessageCircle size={18} className="fill-background" /> {formatNumber(post.comments)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        * Prévia do conteúdo. Visite o perfil no Instagram para ver todos os posts.
      </p>
    </div>
  );
};

export default InstagramFeed;
